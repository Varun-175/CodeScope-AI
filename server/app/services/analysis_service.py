"""Repository dashboard analysis orchestration for CodeScope AI."""

from __future__ import annotations

import ast
import json
import os
import re
import shutil
import tempfile
import time
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import git

from app.engines.rag_engine import SKIP_DIRS, SUPPORTED_EXTENSIONS, _force_remove_readonly


EXTENSION_LANGUAGE_MAP = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".java": "Java",
    ".cpp": "C++",
    ".c": "C",
    ".h": "C/C++",
    ".go": "Go",
    ".rs": "Rust",
    ".rb": "Ruby",
    ".php": "PHP",
    ".cs": "C#",
    ".css": "CSS",
    ".html": "HTML",
    ".md": "Markdown",
    ".json": "JSON",
    ".yml": "YAML",
    ".yaml": "YAML",
    ".toml": "TOML",
    ".xml": "XML",
}

TEXT_EXTENSIONS = SUPPORTED_EXTENSIONS | {
    ".css",
    ".html",
    ".md",
    ".json",
    ".yml",
    ".yaml",
    ".toml",
    ".txt",
    ".xml",
    ".gradle",
}


# ==========================================================
# Public API
# ==========================================================


def analyze_repository(repo_url: str, branch: str | None = None) -> dict[str, Any]:
    """Clone and analyze a repository, returning one dashboard JSON payload."""
    started_at = time.perf_counter()
    owner, name = _parse_github_repo(repo_url)
    base_temp = tempfile.mkdtemp(prefix="codescope_analysis_")
    repo_path = Path(base_temp) / "repo"

    try:
        _clone_repository(repo_url, repo_path, branch)
        metadata = extract_metadata(repo_path, owner, name, branch)
        metadata["analysis_time"] = round(time.perf_counter() - started_at, 2)

        return {
            "repository": metadata,
            "health": calculate_health(metadata),
            "summary": generate_repository_summary(metadata),
            "dna": generate_repository_dna(metadata),
            "architecture": analyze_architecture(metadata),
            "risks": generate_top_risks(metadata),
            "dependency_health": build_dependency_summary(repo_path),
        }
    finally:
        if os.path.exists(base_temp):
            shutil.rmtree(base_temp, onerror=_force_remove_readonly)


# ==========================================================
# Metadata Extraction
# ==========================================================


def extract_metadata(
    repo_path: Path,
    owner: str,
    name: str,
    branch: str | None,
) -> dict[str, Any]:
    """Extract deterministic repository metadata directly from the checkout."""
    files = 0
    directories: set[str] = set()
    extensions: Counter[str] = Counter()
    language_lines: defaultdict[str, int] = defaultdict(int)
    functions = 0
    classes = 0
    lines_of_code = 0
    supported_files = 0
    parsed_files = 0
    largest_file = {"path": "", "lines": 0}
    large_files: list[dict[str, Any]] = []
    import_counts: Counter[str] = Counter()
    folder_structure: list[dict[str, Any]] = []
    directory_metrics: defaultdict[str, dict[str, int]] = defaultdict(
        lambda: {"files": 0, "lines": 0}
    )

    for root, dirs, filenames in os.walk(repo_path):
        dirs[:] = [directory for directory in dirs if directory not in SKIP_DIRS]
        relative_root = Path(root).relative_to(repo_path)
        if str(relative_root) != ".":
            directories.add(relative_root.as_posix())

        folder_structure.append(
            {
                "path": "." if str(relative_root) == "." else relative_root.as_posix(),
                "files": len(filenames),
                "directories": len(dirs),
            }
        )

        for filename in filenames:
            path = Path(root) / filename
            relative_path = path.relative_to(repo_path).as_posix()
            extension = path.suffix.lower()

            if _is_binary_file(path):
                continue

            files += 1
            if extension:
                extensions[extension] += 1

            if extension in TEXT_EXTENSIONS or filename in {"Dockerfile", "Makefile"}:
                supported_files += 1
                text = _read_text(path)
                line_count = _count_code_lines(text)
                lines_of_code += line_count
                language = EXTENSION_LANGUAGE_MAP.get(extension, "Other")
                language_lines[language] += line_count

                if line_count > largest_file["lines"]:
                    largest_file = {"path": relative_path, "lines": line_count}
                large_files.append({"path": relative_path, "lines": line_count})
                top_directory = relative_path.split("/")[0] if "/" in relative_path else "."
                directory_metrics[top_directory]["files"] += 1
                directory_metrics[top_directory]["lines"] += line_count

                parsed_functions, parsed_classes = _count_symbols(extension, text)
                if parsed_functions or parsed_classes or line_count:
                    parsed_files += 1
                functions += parsed_functions
                classes += parsed_classes
                import_counts.update(_extract_imports(extension, text))

    detected_languages = [
        {"language": language, "lines": lines}
        for language, lines in sorted(
            language_lines.items(),
            key=lambda item: item[1],
            reverse=True,
        )
        if lines > 0
    ]
    primary_language = detected_languages[0]["language"] if detected_languages else ""

    return {
        "name": name,
        "owner": owner,
        "branch": branch or _current_branch(repo_path),
        "primary_language": primary_language,
        "languages": detected_languages,
        "framework": _detect_framework(repo_path),
        "files": files,
        "directories": len(directories),
        "extensions": dict(sorted(extensions.items())),
        "functions": functions,
        "classes": classes,
        "supported_files": supported_files,
        "parsed_files": parsed_files,
        "lines_of_code": lines_of_code,
        "readme": _find_first(repo_path, ["README.md", "README.rst", "README.txt"]),
        "license": _find_first(repo_path, ["LICENSE", "LICENSE.md", "COPYING"]),
        "entry_points": _detect_entry_points(repo_path),
        "largest_file": largest_file["path"],
        "largest_file_lines": largest_file["lines"],
        "large_files": sorted(
            large_files,
            key=lambda item: item["lines"],
            reverse=True,
        )[:10],
        "most_imported_module": import_counts.most_common(1)[0][0]
        if import_counts
        else "",
        "import_counts": [
            {"module": module, "count": count}
            for module, count in import_counts.most_common(10)
        ],
        "folder_structure": folder_structure[:50],
        "directory_metrics": [
            {"path": path, **values}
            for path, values in sorted(
                directory_metrics.items(),
                key=lambda item: item[1]["lines"],
                reverse=True,
            )[:10]
        ],
        "has_tests": any("test" in item["path"].lower() for item in folder_structure),
        "analysis_time": 0,
    }


# ==========================================================
# Repository Intelligence
# ==========================================================


def generate_repository_summary(metadata: dict[str, Any]) -> dict[str, Any]:
    """Generate a deterministic repository summary from metadata."""
    project_type = _infer_project_type(metadata)
    framework = metadata["framework"] or "no dominant framework detected"
    language = metadata["primary_language"] or "mixed/unknown language"
    complexity = _complexity_label(metadata)
    overview = (
        f"{metadata['owner']}/{metadata['name']} is a {project_type.lower()} "
        f"primarily written in {language}. CodeScope analyzed "
        f"{metadata['parsed_files']} of {metadata['supported_files']} supported files "
        f"across {metadata['directories']} directories, finding "
        f"{metadata['classes']} classes and {metadata['functions']} functions. "
        f"The detected framework is {framework}; estimated repository complexity is "
        f"{complexity.lower()}."
    )
    assessment = (
        _overall_assessment(metadata)
    )
    return {
        "overview": overview,
        "technologies": _summary_technologies(metadata),
        "purpose": project_type,
        "complexity": complexity,
        "assessment": assessment,
    }


def generate_repository_dna(metadata: dict[str, Any]) -> dict[str, Any]:
    """Return repository DNA using deterministic metadata."""
    architecture = _infer_architecture_pattern(metadata)
    return {
        "project_type": _infer_project_type(metadata),
        "framework": metadata["framework"],
        "architecture": architecture,
        "primary_language": metadata["primary_language"],
        "repository_size": f"{metadata['files']} files - {metadata['lines_of_code']} LOC",
        "maturity": _infer_maturity(metadata),
        "confidence": _calculate_confidence(metadata),
    }


def calculate_health(metadata: dict[str, Any]) -> dict[str, Any]:
    """Calculate explainable repository health from deterministic signals."""
    score = 100
    reasons: list[dict[str, Any]] = []

    def deduct(points: int, reason: str) -> None:
        nonlocal score
        score -= points
        reasons.append({"points": points, "reason": reason})

    if not metadata["readme"]:
        deduct(8, "Missing README")
    if not metadata["license"]:
        deduct(5, "Missing license")
    if metadata["largest_file_lines"] > 500:
        deduct(10, "Very large file detected")
    if metadata["files"] > 2000:
        deduct(8, "Large repository size")
    if metadata["functions"] == 0 and metadata["classes"] == 0:
        deduct(12, "Very few functions/classes detected")
    if not metadata["has_tests"]:
        deduct(10, "No test directories detected")

    score = max(score, 0)

    return {
        "score": score,
        "status": _health_status(score),
        "details": {
            "reasons": reasons,
            "largest_file_lines": metadata["largest_file_lines"],
            "files": metadata["files"],
            "functions": metadata["functions"],
            "classes": metadata["classes"],
            "source": "Initial deterministic heuristics",
        },
    }


def analyze_architecture(metadata: dict[str, Any]) -> dict[str, Any]:
    """Infer a simple architecture pattern from folder structure."""
    top_modules = [
        item["path"]
        for item in metadata["folder_structure"]
        if item["path"] != "."
    ][:12]
    pattern = _infer_architecture_pattern(metadata)
    return {
        "pattern": pattern,
        "layers": _infer_layers(metadata),
        "modules": top_modules,
        "entry_points": metadata["entry_points"],
    }


def generate_top_risks(metadata: dict[str, Any]) -> dict[str, Any]:
    """Return ranked deterministic risks from repository metadata."""
    health = calculate_health(metadata)
    largest_files = [
        {
            "path": item["path"],
            "lines": item["lines"],
            "severity": "critical" if item["lines"] > 1000 else "warning",
        }
        for item in metadata["large_files"]
        if item["lines"] > 300
    ][:7]
    critical = [item for item in largest_files if item["severity"] == "critical"]

    return {
        "critical": critical,
        "warnings": health["details"]["reasons"][:7],
        "largest_files": largest_files,
        "complexity_hotspots": largest_files[:5],
    }


# ==========================================================
# Dependency Analysis
# ==========================================================


def build_dependency_summary(repo_path: Path) -> dict[str, Any]:
    """Build a lightweight dependency summary from common manifest files."""
    detected = _detect_dependencies(repo_path)
    source = detected[0]["source"] if detected else ""
    return {
        "total_dependencies": len(detected),
        "package_manager": _package_manager_from_source(source),
        "dependency_source": source,
        "framework": _detect_framework(repo_path),
        "top_dependencies": detected[:10],
        "detected": detected,
        "healthy": detected[:10],
        "unknown": detected[10:],
    }


# ==========================================================
# Utility Functions
# ==========================================================


def _clone_repository(repo_url: str, target_dir: Path, branch: str | None) -> None:
    clone_kwargs: dict[str, Any] = {
        "depth": 1,
        "single_branch": True,
        "no_tags": True,
    }
    if branch:
        clone_kwargs["branch"] = branch
    git.Repo.clone_from(repo_url, target_dir.as_posix(), **clone_kwargs)


def _parse_github_repo(repo_url: str) -> tuple[str, str]:
    parsed = urlparse(repo_url)
    if parsed.scheme not in {"http", "https"} or parsed.netloc != "github.com":
        raise ValueError("repo_url must be a GitHub HTTPS URL.")

    parts = [part for part in parsed.path.strip("/").split("/") if part]
    if len(parts) < 2:
        raise ValueError("repo_url must include owner and repository name.")

    return parts[0], parts[1].removesuffix(".git")


def _current_branch(repo_path: Path) -> str:
    try:
        return git.Repo(repo_path).active_branch.name
    except Exception:
        return "main"


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def _is_binary_file(path: Path) -> bool:
    try:
        with path.open("rb") as file:
            chunk = file.read(1024)
        return b"\0" in chunk
    except OSError:
        return True


def _count_code_lines(text: str) -> int:
    return sum(1 for line in text.splitlines() if line.strip())


def _count_symbols(extension: str, text: str) -> tuple[int, int]:
    if extension == ".py":
        try:
            tree = ast.parse(text)
        except SyntaxError:
            return 0, 0
        functions = sum(
            isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
            for node in ast.walk(tree)
        )
        classes = sum(isinstance(node, ast.ClassDef) for node in ast.walk(tree))
        return functions, classes

    functions = len(
        re.findall(
            r"\b(function\s+\w+|def\s+\w+|\w+\s+\w+\s*\([^)]*\)\s*\{)",
            text,
        )
    )
    classes = len(re.findall(r"\b(class|interface|enum)\s+\w+", text))
    return functions, classes


def _extract_imports(extension: str, text: str) -> list[str]:
    if extension == ".py":
        imports = re.findall(r"^\s*(?:from\s+([\w.]+)|import\s+([\w.]+))", text, re.M)
        return [left or right for left, right in imports if left or right]

    if extension in {".js", ".jsx", ".ts", ".tsx"}:
        return re.findall(r"from\s+['\"]([^'\"]+)['\"]", text)

    if extension == ".java":
        return re.findall(r"^\s*import\s+([\w.]+);", text, re.M)

    return []


def _find_first(repo_path: Path, filenames: list[str]) -> str:
    for filename in filenames:
        if (repo_path / filename).exists():
            return filename
    return ""


def _detect_entry_points(repo_path: Path) -> list[str]:
    candidates = [
        "main.py",
        "app.py",
        "src/main.ts",
        "src/main.tsx",
        "src/main.js",
        "src/index.ts",
        "src/index.tsx",
        "src/index.js",
        "server.js",
        "package.json",
        "pom.xml",
        "build.gradle",
    ]
    return [candidate for candidate in candidates if (repo_path / candidate).exists()]


def _detect_framework(repo_path: Path) -> str:
    package_json = repo_path / "package.json"
    if package_json.exists():
        try:
            package_data = json.loads(_read_text(package_json))
            deps = {
                **package_data.get("dependencies", {}),
                **package_data.get("devDependencies", {}),
            }
            if "next" in deps:
                return "Next.js"
            if "react" in deps:
                return "React"
            if "vue" in deps:
                return "Vue"
            if "express" in deps:
                return "Express"
        except json.JSONDecodeError:
            pass

    if (repo_path / "requirements.txt").exists():
        requirements = _read_text(repo_path / "requirements.txt").lower()
        if "fastapi" in requirements:
            return "FastAPI"
        if "django" in requirements:
            return "Django"
        if "flask" in requirements:
            return "Flask"

    if (repo_path / "pom.xml").exists():
        pom = _read_text(repo_path / "pom.xml").lower()
        if "spring-boot" in pom:
            return "Spring Boot"
        if "springframework" in pom:
            return "Spring"
        return "Maven"

    if (repo_path / "build.gradle").exists() or (repo_path / "settings.gradle").exists():
        gradle_files = [
            path
            for path in [repo_path / "build.gradle", repo_path / "build.gradle.kts"]
            if path.exists()
        ]
        gradle_text = "\n".join(_read_text(path).lower() for path in gradle_files)
        if "spring-boot" in gradle_text or "org.springframework.boot" in gradle_text:
            return "Spring Boot"
        return "Gradle"

    return ""


def _detect_dependencies(repo_path: Path) -> list[dict[str, str]]:
    dependencies: list[dict[str, str]] = []

    package_json = repo_path / "package.json"
    if package_json.exists():
        try:
            data = json.loads(_read_text(package_json))
            for section in ("dependencies", "devDependencies"):
                for name, version in data.get(section, {}).items():
                    dependencies.append(
                        {"name": name, "version": str(version), "source": "package.json"}
                    )
        except json.JSONDecodeError:
            pass

    requirements = repo_path / "requirements.txt"
    if requirements.exists():
        for line in _read_text(requirements).splitlines():
            clean = line.strip()
            if clean and not clean.startswith("#"):
                dependencies.append(
                    {"name": clean, "version": "", "source": "requirements.txt"}
                )

    pom = repo_path / "pom.xml"
    if pom.exists():
        text = _read_text(pom)
        for artifact in re.findall(r"<artifactId>([^<]+)</artifactId>", text):
            dependencies.append({"name": artifact, "version": "", "source": "pom.xml"})

    for gradle_name in ("build.gradle", "build.gradle.kts"):
        gradle = repo_path / gradle_name
        if gradle.exists():
            for match in re.findall(r"['\"]([\w.-]+):([\w.-]+):([^'\"]+)['\"]", _read_text(gradle)):
                group, artifact, version = match
                dependencies.append(
                    {
                        "name": f"{group}:{artifact}",
                        "version": version,
                        "source": gradle_name,
                    }
                )

    return dependencies[:200]


def _infer_project_type(metadata: dict[str, Any]) -> str:
    framework = metadata["framework"].lower()
    if framework in {"react", "next.js", "vue"}:
        return "Web Application"
    if framework in {"fastapi", "django", "flask", "express", "spring boot"}:
        return "API Service"
    return "Repository"


def _infer_architecture_pattern(metadata: dict[str, Any]) -> str:
    paths = {item["path"].lower() for item in metadata["folder_structure"]}
    segments = {segment for path in paths for segment in path.split("/")}
    framework = metadata["framework"].lower()
    if framework in {"react", "next.js"} or {"components", "pages", "hooks"} & segments:
        return "React Component Architecture"
    if framework == "spring boot":
        return "Spring Layered Architecture"
    if {"controller", "controllers", "service", "services", "model", "models"} & segments:
        return "Layered Architecture"
    if {"routes", "middleware"} <= segments:
        return "Express Backend"
    if {"src", "app", "domain"} <= segments:
        return "Clean Architecture"
    return "Modular Repository"


def _infer_layers(metadata: dict[str, Any]) -> list[str]:
    known = [
        "components",
        "pages",
        "hooks",
        "controller",
        "controllers",
        "service",
        "services",
        "model",
        "models",
        "routes",
        "middleware",
        "domain",
        "app",
        "src",
    ]
    segments = {
        segment
        for item in metadata["folder_structure"]
        for segment in item["path"].lower().split("/")
    }
    return [layer for layer in known if layer in segments]


def _calculate_confidence(metadata: dict[str, Any]) -> int:
    score = 0
    if metadata["files"]:
        score += min(35, round((metadata["parsed_files"] / max(metadata["files"], 1)) * 35))
    if metadata["supported_files"]:
        score += 25
    if metadata["primary_language"]:
        score += 15
    if metadata["framework"]:
        score += 10
    if metadata["entry_points"]:
        score += 10
    if metadata["readme"]:
        score += 5
    return min(score, 100)


def _summary_technologies(metadata: dict[str, Any]) -> list[str]:
    technologies = [item["language"] for item in metadata["languages"][:5]]
    if metadata["framework"]:
        technologies.insert(0, metadata["framework"])
    return technologies


def _overall_assessment(metadata: dict[str, Any]) -> str:
    signals = []
    if metadata["readme"]:
        signals.append("documentation")
    if metadata["has_tests"]:
        signals.append("tests")
    if metadata["entry_points"]:
        signals.append("clear entry points")
    if metadata["largest_file_lines"] > 1000:
        return "The project is analyzable, but at least one very large file should be reviewed before deeper refactoring."
    if len(signals) >= 2:
        return f"The repository shows healthy structure with {', '.join(signals)} detected."
    if metadata["parsed_files"]:
        return "The repository is analyzable, but maturity signals are limited."
    return "The repository has limited analyzable source content."


def _package_manager_from_source(source: str) -> str:
    if source == "package.json":
        return "npm"
    if source == "requirements.txt":
        return "pip"
    if source == "pom.xml":
        return "Maven"
    if source in {"build.gradle", "build.gradle.kts"}:
        return "Gradle"
    return ""


def _infer_maturity(metadata: dict[str, Any]) -> str:
    structure = {item["path"] for item in metadata["folder_structure"]}
    score = 0
    if metadata["readme"]:
        score += 1
    if metadata["license"]:
        score += 1
    if any(path.startswith(".github") for path in structure):
        score += 1
    if any("test" in path.lower() for path in structure):
        score += 1
    if "Dockerfile" in metadata["entry_points"]:
        score += 1
    if score >= 4:
        return "Production"
    if score >= 2:
        return "Active"
    return "Prototype"


def _complexity_label(metadata: dict[str, Any]) -> str:
    if metadata["files"] > 2000 or metadata["lines_of_code"] > 150_000:
        return "High"
    if metadata["files"] > 300 or metadata["lines_of_code"] > 25_000:
        return "Moderate"
    return "Low"


def _health_status(score: int) -> str:
    if score >= 85:
        return "Excellent"
    if score >= 70:
        return "Good"
    if score >= 50:
        return "Needs Attention"
    return "High Risk"
