"""
rag_engine.py — CodeScope AI backend
Clones a GitHub repo, parses with AST-level chunking (Python via stdlib ast,
all other languages via Tree-sitter), embeds with all-MiniLM-L6-v2,
stores in ChromaDB, and returns a streaming-ready LangChain RAG chain.
"""

import os
# Silences Hugging Face Transformers module warning messages on start
os.environ["TRANSFORMERS_VERBOSITY"] = "error"
os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "1"

import ast
import re
import stat
import shutil
import tempfile
import logging
import warnings
from collections import defaultdict
from dataclasses import dataclass
from typing import Callable, Optional

os.environ.setdefault("TRANSFORMERS_NO_ADVISORY_WARNINGS", "1")
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings(
    "ignore",
    message=r".*Accessing `__path__` from `.models\..*",
)
logging.getLogger("transformers").setLevel(logging.ERROR)

import git
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint, ChatHuggingFace
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser


# ── Tree-sitter optional import (graceful fallback if incompatible) ──────────
try:
    from tree_sitter_languages import get_parser as _ts_get_parser
    _TS_AVAILABLE = True
except Exception:
    _TS_AVAILABLE = False


# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx",
    ".java", ".cpp", ".c", ".h",
    ".go", ".rs", ".rb", ".php", ".cs",
}

SKIP_DIRS = {
    "node_modules", ".git", "__pycache__", ".venv", "venv",
    "dist", "build", ".idea", ".vscode", "coverage", ".pytest_cache",
    "eggs", ".eggs", "site-packages", "migrations", "vendor",
}

MAX_CHUNKS   = 400
WINDOW_LINES = 60
WINDOW_OVERLAP = 30

# Maps file extension → (tree-sitter language id, human label)
_EXT_TO_TS_LANG = {
    ".js":   ("javascript", "JavaScript"),
    ".jsx":  ("javascript", "JavaScript"),
    ".ts":   ("typescript", "TypeScript"),
    ".tsx":  ("tsx",        "TypeScript"),
    ".java": ("java",       "Java"),
    ".cpp":  ("cpp",        "C++"),
    ".c":    ("c",          "C"),
    ".h":    ("cpp",        "C/C++"),
    ".go":   ("go",         "Go"),
    ".rs":   ("rust",       "Rust"),
    ".rb":   ("ruby",       "Ruby"),
    ".php":  ("php",        "PHP"),
    ".cs":   ("c_sharp",    "C#"),
}

# Tree-sitter node types that mark meaningful code boundaries per language
_TS_BOUNDARY_NODES: dict[str, set[str]] = {
    "javascript": {
        "function_declaration", "function_expression", "arrow_function",
        "method_definition", "class_declaration", "generator_function_declaration",
    },
    "typescript": {
        "function_declaration", "function_expression", "arrow_function",
        "method_definition", "class_declaration", "interface_declaration",
        "type_alias_declaration", "generator_function_declaration",
    },
    "tsx": {
        "function_declaration", "function_expression", "arrow_function",
        "method_definition", "class_declaration", "interface_declaration",
    },
    "java": {
        "method_declaration", "constructor_declaration",
        "class_declaration", "interface_declaration", "enum_declaration",
    },
    "cpp": {
        "function_definition", "class_specifier",
        "struct_specifier", "namespace_definition",
    },
    "c": {"function_definition"},
    "go": {"function_declaration", "method_declaration"},
    "rust": {
        "function_item", "impl_item", "struct_item",
        "enum_item", "trait_item", "mod_item",
    },
    "ruby": {"method", "singleton_method", "class", "module"},
    "php": {"function_definition", "method_declaration", "class_declaration"},
    "c_sharp": {
        "method_declaration", "constructor_declaration",
        "class_declaration", "interface_declaration",
        "property_declaration", "namespace_declaration",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# Utility helpers
# ─────────────────────────────────────────────────────────────────────────────

# Supported LLM providers and their display names
LLM_PROVIDERS = {
    "groq":        "Groq (Free — Llama 3.3-70B)",
    "gemini":      "Google Gemini",
    "huggingface": "HuggingFace Inference API",
}

# Groq model options
GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
]

# HuggingFace model options
HF_MODELS = [
    "Qwen/Qwen2.5-7B-Instruct",
    "meta-llama/Llama-3.2-3B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "microsoft/Phi-3-mini-4k-instruct",
]

GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

PROVIDER_MODELS = {
    "groq": GROQ_MODELS,
    "gemini": GEMINI_MODELS,
    "huggingface": HF_MODELS,
}


@dataclass(frozen=True)
class LLMConfig:
    provider: str
    model: str
    api_key_present: bool


class DebugRagChain:
    def __init__(self, chain, config: LLMConfig):
        self._chain = chain
        self.config = config

    def _log_llm_call(self) -> None:
        print("[CodeScope AI] LLM call")
        print(f"Provider: {self.config.provider}")
        print(f"Selected Model: {self.config.model}")
        print(f"API Key Present: {self.config.api_key_present}")
        print(f"Final Model Sent To LLM: {self.config.model}")

    def stream(self, question: str):
        self._log_llm_call()
        return self._chain.stream(question)

    def invoke(self, question: str):
        self._log_llm_call()
        return self._chain.invoke(question)


def validate_llm_config(provider: str, api_key: str, model: str) -> LLMConfig:
    provider = (provider or "").strip()
    model = (model or "").strip()

    if provider not in LLM_PROVIDERS:
        raise ValueError(f"Unsupported provider: {provider!r}")
    if not api_key or not api_key.strip():
        raise ValueError(f"Missing API key for provider: {provider}")
    if not model:
        raise ValueError(f"No model selected for provider: {provider}")

    allowed_models = PROVIDER_MODELS[provider]
    if model not in allowed_models:
        raise ValueError(
            f"Unsupported model {model!r} for provider {provider!r}. "
            f"Allowed models: {', '.join(allowed_models)}"
        )

    return LLMConfig(provider=provider, model=model, api_key_present=True)


def build_llm(provider: str, api_key: str, model: str = ""):
    """Factory — returns the right LangChain chat model for the chosen provider."""
    config = validate_llm_config(provider, api_key, model)

    if config.provider == "groq":
        return ChatGroq(
            model=config.model,
            api_key=api_key,
            temperature=0.15,
        )
    elif config.provider == "gemini":
        os.environ["GOOGLE_API_KEY"] = api_key
        return ChatGoogleGenerativeAI(
            model=config.model,
            temperature=0.15,
            api_key=api_key,
            request_timeout=60,
            retries=2,
        )
    elif config.provider == "huggingface":
        # Ensure the token is set in the environment for underlying HF utilities
        os.environ["HUGGINGFACEHUB_API_TOKEN"] = api_key
        
        endpoint = HuggingFaceEndpoint(
            repo_id=config.model,
            huggingfacehub_api_token=api_key,
            task="text-generation",  # Explicitly set task to avoid auto-detect issues
            temperature=0.15,
            max_new_tokens=1024,
        )
        # ChatHuggingFace wraps the text-LLM into a chat model
        return ChatHuggingFace(llm=endpoint, huggingfacehub_api_token=api_key)
    else:
        raise ValueError(f"Unknown provider: {config.provider}")


def clean_markdown(text: str) -> str:
    """Fix excessive newlines in markdown responses."""
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _force_remove_readonly(func, path, _excinfo):
    """Windows shutil.rmtree error handler — strips read-only bit then retries."""
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except Exception:
        pass


def _clone_repo(repo_url: str, target_dir: str) -> None:
    """Shallow-clone a GitHub repo into target_dir (ultrafast mode)."""
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir, onerror=_force_remove_readonly)
    
    # single_branch=True + no_tags=True + depth=1 is the fastest possible clone
    git.Repo.clone_from(
        repo_url, 
        target_dir, 
        depth=1, 
        single_branch=True, 
        no_tags=True
    )


# ─────────────────────────────────────────────────────────────────────────────
# Tree-sitter AST chunking for non-Python languages
# ─────────────────────────────────────────────────────────────────────────────

def _ts_node_name(node, code_bytes: bytes) -> str:
    """Best-effort: return the identifier child of a node as its name."""
    for child in node.children:
        if child.type in ("identifier", "name", "field_identifier", "type_identifier"):
            return code_bytes[child.start_byte:child.end_byte].decode("utf-8", errors="ignore")
    return "anonymous"


def _ts_collect(node, target_types: set[str], code_bytes: bytes,
                code_lines: list[str], file_path: str, lang_label: str) -> list[Document]:
    """Recursively collect boundary nodes from a Tree-sitter parse tree."""
    docs: list[Document] = []

    if node.type in target_types:
        start_line = node.start_point[0]
        end_line   = node.end_point[0]
        snippet    = "\n".join(code_lines[start_line : end_line + 1])
        if snippet.strip():
            docs.append(Document(
                page_content=snippet,
                metadata={
                    "file":     file_path,
                    "language": lang_label,
                    "type":     node.type,
                    "name":     _ts_node_name(node, code_bytes),
                },
            ))

    for child in node.children:
        docs.extend(_ts_collect(child, target_types, code_bytes, code_lines, file_path, lang_label))

    return docs


def _extract_ts_chunks(code: str, ts_lang: str, lang_label: str, file_path: str) -> list[Document]:
    """Parse *code* with Tree-sitter and extract function/class-level chunks."""
    if not _TS_AVAILABLE:
        return []
    try:
        parser     = _ts_get_parser(ts_lang)
        code_bytes = code.encode("utf-8")
        tree       = parser.parse(code_bytes)
        code_lines = code.splitlines()
        target     = _TS_BOUNDARY_NODES.get(ts_lang, set())
        return _ts_collect(tree.root_node, target, code_bytes, code_lines, file_path, lang_label)
    except Exception:
        return []


def _sliding_window_chunks(code: str, file_path: str, lang_label: str) -> list[Document]:
    """Fallback: 60-line sliding window with 30-line overlap."""
    docs  = []
    lines = code.splitlines()
    for i in range(0, max(1, len(lines) - WINDOW_LINES + 1), WINDOW_OVERLAP):
        chunk = "\n".join(lines[i : i + WINDOW_LINES])
        if chunk.strip():
            docs.append(Document(
                page_content=chunk,
                metadata={
                    "file":     file_path,
                    "language": lang_label,
                    "type":     "snippet",
                    "name":     f"lines_{i+1}-{i+WINDOW_LINES}",
                },
            ))
    return docs


# ─────────────────────────────────────────────────────────────────────────────
# Main extraction pipeline
# ─────────────────────────────────────────────────────────────────────────────

def _extract_chunks(repo_path: str) -> tuple[list[Document], dict]:
    """
    Walk the repo and return (docs, language_stats).

    Strategy:
      • Python  → Python stdlib `ast`  (FunctionDef / AsyncFunctionDef / ClassDef)
                  with fallback to sliding window on syntax error or no functions found.
      • Others  → Tree-sitter AST      (language-specific boundary nodes)
                  with fallback to sliding window if Tree-sitter failed/unavailable.
      • Configs → Sliding window (e.g. package.json, requirements.txt, Dockerfile).
    """
    docs:  list[Document]    = []
    stats: dict[str, int]    = defaultdict(int)

    config_extensions = {
        ".json", ".yaml", ".yml", ".toml", ".md", ".txt",
        ".ini", ".cfg", ".conf", ".sh", ".bat", ".ps1"
    }
    config_filenames = {
        "Dockerfile", "Makefile", "Jenkinsfile", "Procfile"
    }

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            file_path = os.path.join(root, filename)
            rel_path  = os.path.relpath(file_path, repo_path).replace("\\", "/")

            is_supported_code = ext in SUPPORTED_EXTENSIONS
            is_config_file    = (ext in config_extensions) or (filename in config_filenames)

            if not (is_supported_code or is_config_file):
                continue

            # ── Python: stdlib ast with sliding-window fallback ───────────────────────────
            if ext == ".py":
                try:
                    code  = open(file_path, "r", encoding="utf-8", errors="ignore").read()
                    tree  = ast.parse(code)
                    lines = code.splitlines()
                    file_docs = []
                    for node in ast.walk(tree):
                        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                            snippet = "\n".join(lines[node.lineno - 1 : node.end_lineno])
                            if snippet.strip():
                                file_docs.append(Document(
                                    page_content=snippet,
                                    metadata={
                                        "file":     rel_path,
                                        "language": "Python",
                                        "type":     type(node).__name__,
                                        "name":     node.name,
                                    },
                                ))
                    if file_docs:
                        docs.extend(file_docs)
                        stats["Python"] += len(file_docs)
                    else:
                        # Fallback: no functions/classes found in Python file
                        fb = _sliding_window_chunks(code, rel_path, "Python")
                        docs.extend(fb)
                        stats["Python"] += len(fb)
                except Exception:
                    # Fallback on syntax error
                    try:
                        code = open(file_path, "r", encoding="utf-8", errors="ignore").read()
                        fb = _sliding_window_chunks(code, rel_path, "Python")
                        docs.extend(fb)
                        stats["Python"] += len(fb)
                    except Exception:
                        pass

            # ── All other supported code languages: Tree-sitter AST ─────────────────────────
            elif is_supported_code and ext in _EXT_TO_TS_LANG:
                ts_lang, lang_label = _EXT_TO_TS_LANG[ext]
                try:
                    code   = open(file_path, "r", encoding="utf-8", errors="ignore").read()
                    chunks = _extract_ts_chunks(code, ts_lang, lang_label, rel_path)

                    if chunks:
                        docs.extend(chunks)
                        stats[lang_label] += len(chunks)
                    else:
                        # Fallback: sliding window (Tree-sitter failed or returned no boundary chunks)
                        fb = _sliding_window_chunks(code, rel_path, lang_label)
                        docs.extend(fb)
                        stats[lang_label] += len(fb)
                except Exception:
                    pass

            # ── Configuration & Text files: Sliding window or full file chunking ───────────
            elif is_config_file:
                try:
                    code = open(file_path, "r", encoding="utf-8", errors="ignore").read()
                    lines = code.splitlines()
                    lang_label = ext[1:].upper() if ext else "Config"
                    if not lang_label or lang_label == "MD":
                        lang_label = "Markdown"
                    elif lang_label == "TXT":
                        lang_label = "Text"

                    # If the file is relatively short, index it as a single chunk to preserve full context
                    if len(lines) <= WINDOW_LINES:
                        if code.strip():
                            docs.append(Document(
                                page_content=code,
                                metadata={
                                    "file":     rel_path,
                                    "language": lang_label,
                                    "type":     "config",
                                    "name":     filename,
                                },
                            ))
                            stats[lang_label] += 1
                    else:
                        fb = _sliding_window_chunks(code, rel_path, lang_label)
                        docs.extend(fb)
                        stats[lang_label] += len(fb)
                except Exception:
                    pass

    # Prioritise Python AST chunks, then cap total
    python_docs = [d for d in docs if d.metadata.get("language") == "Python"]
    other_docs  = [d for d in docs if d.metadata.get("language") != "Python"]
    docs = (python_docs + other_docs)[:MAX_CHUNKS]

    return docs, dict(stats)


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def build_rag_chain(
    repo_url:   str,
    api_key:    str,
    provider:   str = "groq",
    model:      str = "",
    progress_cb: Optional[Callable[[str, int], None]] = None,
) -> tuple:
    """
    Clone *repo_url*, index it with AST chunking + Tree-sitter, embed locally,
    and wire the chosen LLM provider into a streaming RAG chain.

    Returns: (rag_chain, retriever, repo_name, doc_count, lang_stats)
    """
    def _p(msg: str, pct: int):
        if progress_cb:
            progress_cb(msg, pct)

    llm_config = validate_llm_config(provider, api_key, model)

    # Only set Google env var when actually using Gemini
    if llm_config.provider == "gemini":
        os.environ["GOOGLE_API_KEY"] = api_key

    # ── 1. Shallow clone ──────────────────────────────────────────────────────
    _p("📥 Cloning repository (shallow)…", 5)
    # Create a unique base directory
    base_temp = tempfile.mkdtemp(prefix="codescope_")
    # Clone into a subfolder so target_dir definitely doesn't exist yet
    repo_path = os.path.join(base_temp, "repo")
    _clone_repo(repo_url, repo_path)
    repo_name = repo_url.rstrip("/").split("/")[-1]

    # ── 2. AST extraction (Python + Tree-sitter) ──────────────────────────────
    mode = "Python AST + Tree-sitter" if _TS_AVAILABLE else "Python AST + sliding-window"
    _p(f"🔍 Parsing codebase ({mode})…", 25)
    try:
        docs, lang_stats = _extract_chunks(repo_path)
    finally:
        # Clean up the cloned directory immediately to save disk space
        if os.path.exists(base_temp):
            shutil.rmtree(base_temp, onerror=_force_remove_readonly)

    if not docs:
        raise ValueError(
            "No indexable source files were found in the repository. "
            f"Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    # ── 3. Local embeddings (all-MiniLM-L6-v2 — 22 MB, CPU-fast) ────────────
    _p(f"🧠 Embedding {len(docs)} AST chunks locally…", 50)
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True, "batch_size": 64},
    )

    # ── 4. ChromaDB (In-Memory for speed and fresh starts) ───────────────────
    _p("🗄️  Building ephemeral vector store…", 75)
    # No persist_directory means it lives only in RAM for this session
    vectorstore = Chroma.from_documents(
        documents=docs, 
        embedding=embeddings
    )
    retriever   = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4},
    )

    # ── 5. LLM (provider-agnostic) ─────────────────────────────────────────────
    _p(f"⚙️  Connecting to {LLM_PROVIDERS.get(llm_config.provider, llm_config.provider)}…", 90)
    llm = build_llm(llm_config.provider, api_key, llm_config.model)

    prompt = ChatPromptTemplate.from_template(
        """You are CodeScope AI — an expert software engineer analysing a GitHub codebase.

Retrieved code context (AST-extracted):
{context}

Developer question: {question}

Format your response as follows:
If the question is about specific code, functions, or implementation details, respond with:
**File:** <filename(s)>
**Symbol:** <function or class name>
**Code Snippet:**
```
<relevant snippet>
```
**Explanation:**
<clear, concise explanation referencing the actual code>

If the question is a high-level summary, architectural query, or general question, you can respond with a direct markdown explanation without using the structured File/Symbol/Snippet format.

Be specific, accurate, and developer-focused.
"""
    )

    rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    _p("✅ Ready!", 100)
    return DebugRagChain(rag_chain, llm_config), retriever, repo_name, len(docs), lang_stats


def rebuild_rag_chain(retriever, provider: str, api_key: str, model: str) -> DebugRagChain:
    """Rebuild the RAG chain using the existing retriever and new LLM settings."""
    llm_config = validate_llm_config(provider, api_key, model)

    if llm_config.provider == "gemini":
        os.environ["GOOGLE_API_KEY"] = api_key
    elif llm_config.provider == "huggingface":
        os.environ["HUGGINGFACEHUB_API_TOKEN"] = api_key

    llm = build_llm(llm_config.provider, api_key, llm_config.model)

    prompt = ChatPromptTemplate.from_template(
        """You are CodeScope AI — an expert software engineer analysing a GitHub codebase.

Retrieved code context (AST-extracted):
{context}

Developer question: {question}

Format your response as follows:
If the question is about specific code, functions, or implementation details, respond with:
**File:** <filename(s)>
**Symbol:** <function or class name>
**Code Snippet:**
```
<relevant snippet>
```
**Explanation:**
<clear, concise explanation referencing the actual code>

If the question is a high-level summary, architectural query, or general question, you can respond with a direct markdown explanation without using the structured File/Symbol/Snippet format.

Be specific, accurate, and developer-focused.
"""
    )

    rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return DebugRagChain(rag_chain, llm_config)


def stream_answer(rag_chain, question: str):
    """Yield RAG chain response tokens. Falls back to invoke if streaming unsupported."""
    try:
        yielded = False
        for chunk in rag_chain.stream(question):
            yielded = True
            yield chunk
        if not yielded:
            answer = rag_chain.invoke(question)
            if answer:
                yield answer
    except NotImplementedError:
        # Non-streaming providers: yield the full response as one chunk
        answer = rag_chain.invoke(question)
        if answer:
            yield answer
