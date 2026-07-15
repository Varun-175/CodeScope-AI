# CodeScope AI

CodeScope AI is an AI-oriented software intelligence platform that analyzes public GitHub repositories and turns repository structure into a dashboard of actionable engineering signals.

The current implementation is a React + TypeScript frontend backed by a FastAPI service. The dashboard analysis endpoint is deterministic: it clones a repository, scans files, extracts metadata, applies explainable heuristics, and returns one JSON response used by the frontend dashboard.

## Project Overview

CodeScope AI helps developers and reviewers understand a repository quickly by surfacing:

- Repository metadata
- Language and file distribution
- Framework and architecture heuristics
- Repository health score
- Summary and DNA signals
- Top risks
- Dependency overview
- Import and structure intelligence
- Deterministic recommendations

## Vision

The long-term goal is to become a software intelligence layer for repositories: not an autocomplete tool, not a chatbot, and not an IDE assistant, but a system that explains how a codebase is structured, where risks exist, and what engineering actions are worth taking next.

## Key Features

- Modern SaaS dashboard shell with dark theme
- Repository analysis modal
- Analysis progress UI
- Single backend endpoint for dashboard data
- Deterministic repository metadata extraction
- Explainable health scoring
- Framework and architecture detection
- Dependency manifest parsing
- Typed frontend API integration

## Current Capabilities

Implemented today:

- Analyze public GitHub repositories by URL
- Optional branch input
- Shallow clone using GitPython
- Traverse repository files while skipping common generated/vendor folders
- Count files, directories, lines of code, extensions, classes, and functions
- Detect README, license, entry points, largest files, imports, and directory metrics
- Detect common frameworks from manifests
- Parse dependencies from `package.json`, `requirements.txt`, `pom.xml`, and Gradle files
- Return one consolidated dashboard JSON response
- Populate the dashboard from backend data

Not currently active in the dashboard endpoint:

- LLM generation
- Embedding generation
- ChromaDB indexing
- Tree-sitter parsing
- RAG chat

Those capabilities exist in `backend/app/engines/rag_engine.py`, but the current `/api/analyze` dashboard endpoint does not call that RAG pipeline.

## System Architecture

```text
React Frontend
  |
  | POST /api/analyze
  v
FastAPI Backend
  |
  v
analysis_service.analyze_repository()
  |
  |-- clone GitHub repository
  |-- traverse files
  |-- extract deterministic metadata
  |-- calculate health
  |-- infer summary, DNA, architecture, risks, dependencies
  v
Dashboard JSON Response
  |
  v
React Dashboard Cards
```

## Backend Architecture

Backend entrypoint:

- `backend/app/main.py`

Routes:

- `backend/app/api/routes.py`

Main analysis service:

- `backend/app/services/analysis_service.py`

Existing RAG engine:

- `backend/app/engines/rag_engine.py`

The FastAPI app registers CORS for the local Vite frontend and includes the API router under `/api`.

## Frontend Architecture

Frontend stack:

- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide icons

Important frontend paths:

- `frontend/src/layouts/AppLayout.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/TopNav.tsx`
- `frontend/src/components/analysis/AnalyzeRepositoryModal.tsx`
- `frontend/src/components/analysis/AnalysisProgress.tsx`
- `frontend/src/components/dashboard/*`
- `frontend/src/contexts/RepositoryAnalysisContext.tsx`
- `frontend/src/services/api/*`
- `frontend/src/types/analysis.ts`

## Repository Analysis Pipeline

1. User opens the dashboard.
2. User clicks **Analyze Repository**.
3. Modal validates that the URL is a GitHub URL.
4. Frontend calls `POST /api/analyze`.
5. Backend validates the request with Pydantic.
6. Backend shallow-clones the repository into a temporary folder.
7. Backend walks the repository with `os.walk`.
8. Common ignored folders are skipped, including `.git`, `node_modules`, `dist`, `build`, virtual environments, vendor folders, and caches.
9. Text/code files are read with UTF-8 fallback behavior.
10. Deterministic metrics are calculated.
11. Summary, DNA, health, architecture, risks, and dependency health are generated with heuristics.
12. Temporary clone folder is deleted.
13. One JSON object is returned to the frontend.
14. Dashboard cards render the returned values.

## Technologies Used

Frontend:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

Backend:

- FastAPI
- Pydantic
- GitPython
- Uvicorn
- Python standard library modules: `ast`, `os`, `re`, `json`, `tempfile`, `shutil`, `pathlib`, `collections`

Installed but not currently used by `/api/analyze`:

- LangChain
- ChromaDB
- sentence-transformers
- tree-sitter
- tree-sitter-languages
- Google Gemini integration
- Groq integration
- Hugging Face integration

## Folder Structure

```text
CodeScope_AI/
  backend/
    app/
      api/
        routes.py
      core/
        config.py
      engines/
        rag_engine.py
        architecture_engine.py
        dna_engine.py
        explorer_engine.py
        health_engine.py
        review_engine.py
      services/
        analysis_service.py
      main.py
    requirements.txt

  frontend/
    src/
      components/
        analysis/
        dashboard/
        layout/
      contexts/
      layouts/
      pages/
      router/
      services/
        api/
      types/
      App.tsx
      main.tsx
```

## API Endpoints

### `GET /health`

Returns backend health status.

```json
{
  "status": "ok"
}
```

### `POST /api/analyze`

Analyzes one GitHub repository and returns dashboard data.

Request:

```json
{
  "repo_url": "https://github.com/owner/repository",
  "branch": "main"
}
```

Response shape:

```json
{
  "repository": {},
  "health": {},
  "summary": {},
  "dna": {},
  "architecture": {},
  "risks": {},
  "dependency_health": {}
}
```

## Installation Guide

### Backend

```powershell
cd backend
python -m pip install -r requirements.txt
```

### Frontend

```powershell
cd frontend
npm install
```

## Running the Backend

From the project root:

```powershell
$env:PYTHONPATH='backend'
uvicorn app.main:app --reload
```

Backend runs by default at:

```text
http://127.0.0.1:8000
```

## Running the Frontend

```powershell
cd frontend
npm.cmd run dev -- --host 127.0.0.1
```

Frontend runs by default at:

```text
http://127.0.0.1:5173
```

Optional API override:

```text
VITE_API_URL=http://127.0.0.1:8000
```

## Example Workflow

1. Start the FastAPI backend.
2. Start the Vite frontend.
3. Open the dashboard in the browser.
4. Click **Analyze Repository**.
5. Enter a public GitHub repository URL.
6. Optionally enter a branch.
7. Click **Analyze**.
8. Wait for the progress modal while the backend analyzes the repository.
9. Review the populated dashboard.

## Screenshots

Screenshots will be added after the final demo UI pass.

- Dashboard empty state
- Repository analysis modal
- Analysis progress state
- Populated dashboard

## Current Limitations

- `/api/analyze` does not currently use embeddings, ChromaDB, Tree-sitter, or an LLM.
- The analysis is deterministic and heuristic-based.
- No vulnerability database or external dependency risk API is used.
- No historical scans, trends, deltas, or persistence are implemented.
- No authentication is implemented.
- Private repositories are not supported unless Git credentials are available in the environment.
- The analysis runs synchronously during the HTTP request.
- The frontend progress bar is visual and not streamed from backend progress events.

## Future Roadmap

- Connect the existing RAG engine to repository chat in the React frontend
- Add optional LLM-generated repository summaries
- Add Tree-sitter based symbol extraction to the dashboard endpoint
- Add persistent scan storage
- Add background jobs for large repositories
- Add real dependency vulnerability checks
- Add architecture graph visualization
- Add file-level drilldowns
- Add authentication and private repository support

## Contributing

Contributions are welcome. Keep changes scoped, typed, and consistent with the existing architecture. Avoid adding infrastructure unless it is necessary for the current feature.

## License

This project is licensed under the terms included in `LICENSE`.
