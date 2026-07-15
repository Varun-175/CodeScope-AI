"""Application configuration helpers for CodeScope AI."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

SETTINGS_FILE = Path(__file__).resolve().parent.parent / "data" / "settings.json"

DEFAULT_SETTINGS: dict[str, Any] = {
    "github_token": "",
    "github_base_url": "https://api.github.com",
    "gemini_api_key": "",
    "groq_api_key": "",
    "huggingface_api_key": "",
    "openai_api_key": "",
    "anthropic_api_key": "",
    "openrouter_api_key": "",
    "ollama_url": "http://localhost:11434",
    "local_model": "llama3.2",
    "embedding_model": "all-MiniLM-L6-v2",
    "llm_provider": "groq",
    "temperature": 0.2,
    "max_tokens": 1024,
    "top_p": 0.95,
    "repository_cache": True,
    "chunk_size": 800,
    "chunk_overlap": 120,
    "embedding_provider": "huggingface",
    "vector_store": "chromadb",
}

ENV_OVERRIDES = {
    "github_token": "CODESCOPE_GITHUB_TOKEN",
    "github_base_url": "CODESCOPE_GITHUB_BASE_URL",
    "gemini_api_key": "CODESCOPE_GEMINI_API_KEY",
    "groq_api_key": "CODESCOPE_GROQ_API_KEY",
    "huggingface_api_key": "CODESCOPE_HUGGINGFACE_API_KEY",
    "openai_api_key": "CODESCOPE_OPENAI_API_KEY",
    "anthropic_api_key": "CODESCOPE_ANTHROPIC_API_KEY",
    "openrouter_api_key": "CODESCOPE_OPENROUTER_API_KEY",
    "ollama_url": "CODESCOPE_OLLAMA_URL",
    "local_model": "CODESCOPE_LOCAL_MODEL",
    "embedding_model": "CODESCOPE_EMBEDDING_MODEL",
    "llm_provider": "CODESCOPE_LLM_PROVIDER",
    "temperature": "CODESCOPE_TEMPERATURE",
    "max_tokens": "CODESCOPE_MAX_TOKENS",
    "top_p": "CODESCOPE_TOP_P",
    "repository_cache": "CODESCOPE_REPOSITORY_CACHE",
    "chunk_size": "CODESCOPE_CHUNK_SIZE",
    "chunk_overlap": "CODESCOPE_CHUNK_OVERLAP",
    "embedding_provider": "CODESCOPE_EMBEDDING_PROVIDER",
    "vector_store": "CODESCOPE_VECTOR_STORE",
}


def _coerce_value(key: str, value: Any) -> Any:
    if key in {"temperature", "top_p"}:
        try:
            return float(value)
        except (TypeError, ValueError):
            return DEFAULT_SETTINGS[key]
    if key in {"max_tokens", "chunk_size", "chunk_overlap"}:
        try:
            return int(value)
        except (TypeError, ValueError):
            return DEFAULT_SETTINGS[key]
    if key == "repository_cache":
        if isinstance(value, bool):
            return value
        return str(value).lower() in {"1", "true", "yes"}
    return value


def _ensure_settings_file() -> None:
    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not SETTINGS_FILE.exists():
        SETTINGS_FILE.write_text("{}", encoding="utf-8")


def load_settings() -> dict[str, Any]:
    _ensure_settings_file()
    merged = dict(DEFAULT_SETTINGS)

    try:
        persisted = json.loads(SETTINGS_FILE.read_text(encoding="utf-8")) or {}
    except (json.JSONDecodeError, OSError):
        persisted = {}

    for key, value in persisted.items():
        if key in merged:
            merged[key] = _coerce_value(key, value)

    for key, env_name in ENV_OVERRIDES.items():
        env_value = os.getenv(env_name)
        if env_value is not None and env_value != "":
            merged[key] = _coerce_value(key, env_value)

    return merged


def save_settings(partial: dict[str, Any]) -> dict[str, Any]:
    _ensure_settings_file()
    current = load_settings()
    updated = {**current, **partial}
    SETTINGS_FILE.write_text(json.dumps(updated, indent=2), encoding="utf-8")
    return updated


def reset_settings() -> dict[str, Any]:
    SETTINGS_FILE.write_text("{}", encoding="utf-8")
    return dict(DEFAULT_SETTINGS)
