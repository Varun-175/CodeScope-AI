"""
rag_engine.py — CodeScope AI backend
Clones a GitHub repo, parses with AST-level chunking (Python via stdlib ast,
all other languages via Tree-sitter), embeds with all-MiniLM-L6-v2,
stores in ChromaDB, and returns a streaming-ready LangChain RAG chain.
"""

import os
import ast
import re
import stat
import shutil
import tempfile
from collections import defaultdict
from typing import Callable, Generator, Optional

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
    "meta-llama/Llama-3.2-3B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "microsoft/Phi-3-mini-4k-instruct",
]


def build_llm(provider: str, api_key: str, model: str = ""):
    """Factory — returns the right LangChain chat model for the chosen provider."""
    if provider == "groq":
        return ChatGroq(
            model=model or "llama-3.3-70b-versatile",
            api_key=api_key,
            temperature=0.15,
        )
    elif provider == "gemini":
        os.environ["GOOGLE_API_KEY"] = api_key
        return ChatGoogleGenerativeAI(
            model=model or "gemini-2.5-flash",
            temperature=0.15,
            google_api_key=api_key,
        )
    elif provider == "huggingface":
        # Ensure the token is set in the environment for underlying HF utilities
        os.environ["HUGGINGFACEHUB_API_TOKEN"] = api_key
        
        endpoint = HuggingFaceEndpoint(
            repo_id=model or "mistralai/Mistral-7B-Instruct-v0.3",
            huggingfacehub_api_token=api_key,
            task="text-generation",  # Explicitly set task to avoid auto-detect issues
            temperature=0.15,
            max_new_tokens=1024,
        )
        # ChatHuggingFace wraps the text-LLM into a chat model
        return ChatHuggingFace(llm=endpoint, huggingfacehub_api_token=api_key)
    else:
        raise ValueError(f"Unknown provider: {provider}")


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
      • Others  → Tree-sitter AST      (language-specific boundary nodes)
      • Fallback→ 60-line sliding window (if Tree-sitter unavailable / parse error)
    """
    docs:  list[Document]    = []
    stats: dict[str, int]    = defaultdict(int)

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for filename in files:
            ext      = os.path.splitext(filename)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue
            file_path = os.path.join(root, filename)

            # ── Python: stdlib ast ───────────────────────────────────────────
            if ext == ".py":
                try:
                    code  = open(file_path, "r", encoding="utf-8", errors="ignore").read()
                    tree  = ast.parse(code)
                    lines = code.splitlines()
                    for node in ast.walk(tree):
                        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                            snippet = "\n".join(lines[node.lineno - 1 : node.end_lineno])
                            if snippet.strip():
                                docs.append(Document(
                                    page_content=snippet,
                                    metadata={
                                        "file":     file_path,
                                        "language": "Python",
                                        "type":     type(node).__name__,
                                        "name":     node.name,
                                    },
                                ))
                                stats["Python"] += 1
                except Exception:
                    pass

            # ── All other languages: Tree-sitter AST ─────────────────────────
            elif ext in _EXT_TO_TS_LANG:
                ts_lang, lang_label = _EXT_TO_TS_LANG[ext]
                try:
                    code   = open(file_path, "r", encoding="utf-8", errors="ignore").read()
                    chunks = _extract_ts_chunks(code, ts_lang, lang_label, file_path)

                    if chunks:
                        docs.extend(chunks)
                        stats[lang_label] += len(chunks)
                    else:
                        # Fallback: sliding window (Tree-sitter failed or unavailable)
                        fb = _sliding_window_chunks(code, file_path, lang_label)
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

    Returns: (rag_chain, repo_name, doc_count, lang_stats)
    """
    def _p(msg: str, pct: int):
        if progress_cb:
            progress_cb(msg, pct)

    # Only set Google env var when actually using Gemini
    if provider == "gemini":
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
    mode = "Python ast + Tree-sitter" if _TS_AVAILABLE else "Python ast + sliding-window"
    _p(f"🔍 Parsing codebase ({mode})…", 25)
    docs, lang_stats = _extract_chunks(repo_path)

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
    _p(f"⚙️  Connecting to {LLM_PROVIDERS.get(provider, provider)}…", 90)
    llm = build_llm(provider, api_key, model)

    prompt = ChatPromptTemplate.from_template(
        """You are CodeScope AI — an expert software engineer analysing a GitHub codebase.

Retrieved code context (AST-extracted):
{context}

Developer question: {question}

Respond with:

**File:** <filename(s)>
**Symbol:** <function or class name>
**Code Snippet:**
```
<relevant snippet>
```
**Explanation:**
<clear, concise explanation referencing the actual code>

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
    return rag_chain, repo_name, len(docs), lang_stats


def stream_answer(rag_chain, question: str):
    """Yield RAG chain response tokens. Falls back to invoke if streaming unsupported."""
    try:
        for chunk in rag_chain.stream(question):
            yield chunk
    except Exception:
        # Non-streaming providers: yield the full response as one chunk
        yield rag_chain.invoke(question)
