"""Service layer that connects the deterministic analysis flow with the RAG engine."""

from __future__ import annotations

import os
import tempfile
from typing import Any

from app.core.config import load_settings
from app.engines.rag_engine import build_rag_chain, rebuild_rag_chain, stream_answer

_RAG_STATE: dict[str, Any] = {
    "repo_url": None,
    "repo_name": None,
    "chain": None,
    "retriever": None,
    "indexed": False,
    "doc_count": 0,
    "last_error": None,
}


def get_rag_state() -> dict[str, Any]:
    return {
        **_RAG_STATE,
        "indexed": bool(_RAG_STATE.get("chain") and _RAG_STATE.get("retriever")),
    }


def index_repository(repo_url: str, branch: str | None = None) -> dict[str, Any]:
    settings = load_settings()
    provider = str(settings.get("llm_provider") or "groq").strip().lower()
    api_key = _resolve_api_key(provider, settings)
    model = _resolve_model(provider, settings)

    def _progress(message: str, pct: int) -> None:
        _RAG_STATE["last_error"] = None
        _RAG_STATE["progress_message"] = message
        _RAG_STATE["progress_pct"] = pct

    try:
        chain, retriever, repo_name, doc_count, _lang_stats = build_rag_chain(
            repo_url=repo_url,
            api_key=api_key,
            provider=provider,
            model=model,
            progress_cb=_progress,
        )
    except Exception as exc:  # pragma: no cover - runtime safety
        _RAG_STATE["indexed"] = False
        _RAG_STATE["last_error"] = str(exc)
        raise

    _RAG_STATE.update(
        {
            "repo_url": repo_url,
            "repo_name": repo_name,
            "chain": chain,
            "retriever": retriever,
            "indexed": True,
            "doc_count": doc_count,
            "last_error": None,
            "progress_message": "Repository indexed successfully",
            "progress_pct": 100,
        }
    )
    return get_rag_state()


def reindex_repository(repo_url: str | None = None) -> dict[str, Any]:
    target = repo_url or _RAG_STATE.get("repo_url")
    if not target:
        raise ValueError("No repository has been indexed yet")
    return index_repository(target)


def answer_question(question: str) -> str:
    if not _RAG_STATE.get("chain"):
        raise ValueError("Repository index is not available. Run analysis first.")
    chunks = []
    for chunk in stream_answer(_RAG_STATE["chain"], question):
        chunks.append(chunk)
    return "".join(chunks)


def reload_chain_from_settings() -> dict[str, Any]:
    settings = load_settings()
    provider = str(settings.get("llm_provider") or "groq").strip().lower()
    api_key = _resolve_api_key(provider, settings)
    model = _resolve_model(provider, settings)
    if not _RAG_STATE.get("retriever"):
        raise RuntimeError("No retriever available to rebuild the RAG chain")
    chain = rebuild_rag_chain(_RAG_STATE["retriever"], provider, api_key, model)
    _RAG_STATE["chain"] = chain
    return get_rag_state()


def _resolve_api_key(provider: str, settings: dict[str, Any]) -> str:
    provider_map = {
        "gemini": settings.get("gemini_api_key", ""),
        "groq": settings.get("groq_api_key", ""),
        "huggingface": settings.get("huggingface_api_key", ""),
        "openai": settings.get("openai_api_key", ""),
        "anthropic": settings.get("anthropic_api_key", ""),
        "openrouter": settings.get("openrouter_api_key", ""),
        "ollama": "",
    }
    return str(provider_map.get(provider, "") or "")


def _resolve_model(provider: str, settings: dict[str, Any]) -> str:
    if provider == "groq":
        return "llama-3.3-70b-versatile"
    if provider == "gemini":
        return "gemini-2.5-flash"
    if provider == "huggingface":
        return settings.get("embedding_model") or "Qwen/Qwen2.5-7B-Instruct"
    if provider == "openai":
        return "gpt-4o-mini"
    if provider == "anthropic":
        return "claude-3-5-sonnet-latest"
    if provider == "openrouter":
        return "openai/gpt-4o-mini"
    if provider == "ollama":
        return settings.get("local_model") or "llama3.2"
    return settings.get("local_model") or ""
