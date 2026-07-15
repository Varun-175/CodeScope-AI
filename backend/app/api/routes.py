"""API routes for CodeScope AI."""

import git
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.analysis_service import analyze_repository

router = APIRouter(prefix="/api")


class AnalyzeRepositoryRequest(BaseModel):
    repo_url: str = Field(..., min_length=10)
    branch: str | None = None


@router.post("/analyze")
def analyze(request: AnalyzeRepositoryRequest) -> dict:
    """Analyze one GitHub repository and return dashboard JSON."""
    try:
        return analyze_repository(
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
