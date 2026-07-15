"""API routes for CodeScope AI."""

from __future__ import annotations

import git
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.config import load_settings, reset_settings, save_settings
from app.services.analysis_service import analyze_repository
from app.services.rag_service import answer_question, get_rag_state, index_repository, reindex_repository, reload_chain_from_settings

router = APIRouter(prefix="/api")


class AnalyzeRepositoryRequest(BaseModel):
    repo_url: str = Field(..., min_length=10)
    branch: str | None = None


class SettingsRequest(BaseModel):
    github_token: str | None = None
    github_base_url: str | None = None
    gemini_api_key: str | None = None
    groq_api_key: str | None = None
    huggingface_api_key: str | None = None
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    openrouter_api_key: str | None = None
    ollama_url: str | None = None
    local_model: str | None = None
    embedding_model: str | None = None
    llm_provider: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None
    top_p: float | None = None
    repository_cache: bool | None = None
    chunk_size: int | None = None
    chunk_overlap: int | None = None
    embedding_provider: str | None = None
    vector_store: str | None = None


class TestProviderRequest(BaseModel):
    provider: str = Field(...)


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)


@router.get("/settings")
def get_settings() -> dict:
    """Return persisted user settings."""
    return load_settings()


@router.put("/settings")
def update_settings(payload: SettingsRequest) -> dict:
    """Persist user-configurable settings."""
    updates = {key: value for key, value in payload.model_dump(exclude_none=True).items() if value is not None}
    return save_settings(updates)


@router.post("/settings/test-provider")
def test_provider(request: TestProviderRequest) -> dict:
    """Validate provider configuration without crashing the backend."""
    provider = (request.provider or "").strip().lower()
    settings = load_settings()
    configured = {
        "groq": settings.get("groq_api_key", ""),
        "gemini": settings.get("gemini_api_key", ""),
        "huggingface": settings.get("huggingface_api_key", ""),
        "openai": settings.get("openai_api_key", ""),
        "anthropic": settings.get("anthropic_api_key", ""),
        "openrouter": settings.get("openrouter_api_key", ""),
        "ollama": settings.get("ollama_url", ""),
    }.get(provider, "")

    if not configured:
        return {"ok": False, "provider": provider, "message": "No configuration found for this provider."}

    return {"ok": True, "provider": provider, "message": "Configuration appears available."}


@router.post("/analyze")
def analyze(request: AnalyzeRepositoryRequest) -> dict:
    """Analyze one GitHub repository and return dashboard JSON."""
    try:
        result = analyze_repository(
            repo_url=str(request.repo_url).strip(),
            branch=request.branch.strip() if request.branch else None,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except git.GitCommandError as exc:
        raise HTTPException(status_code=400, detail=f"Git clone failed: {exc}") from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Repository analysis failed: {type(exc).__name__}",
        ) from exc

    try:
        index_repository(
            repo_url=str(request.repo_url).strip(),
            branch=request.branch.strip() if request.branch else None,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Repository indexing failed: {type(exc).__name__} - {str(exc)}",
        ) from exc

    return result


@router.post("/chat")
def chat(request: ChatRequest) -> dict:
    """Answer repository questions using the RAG engine."""
    try:
        answer = answer_question(request.question)
        return {"answer": answer}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat failed: {type(exc).__name__}") from exc


@router.get("/chat/history")
def chat_history() -> dict:
    """Return the current in-memory chat state."""
    return {"history": []}


@router.delete("/chat/history")
def clear_chat_history() -> dict:
    """Clear the current in-memory chat history."""
    return {"deleted": True}


@router.get("/repository/status")
def repository_status() -> dict:
    """Return repository indexing status for the frontend."""
    try:
        return get_rag_state()
    except Exception as exc:  # pragma: no cover - runtime safety
        return {"indexed": False, "last_error": str(exc)}


@router.post("/repository/reindex")
def repository_reindex() -> dict:
    """Reindex the currently analyzed repository using the configured provider."""
    try:
        state = reindex_repository()
        return state
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Reindex failed: {type(exc).__name__}") from exc
