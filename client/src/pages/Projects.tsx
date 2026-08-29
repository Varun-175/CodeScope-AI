import { ArrowRight, Folder, GitBranch, Plus, Search, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

export function Projects() {
  const { data, error, status } = useRepositoryAnalysis()
  const [search, setSearch] = useState('')

  const filteredProject = useMemo(() => {
    if (!data) return null

    const query = search.trim().toLowerCase()
    if (!query) return data

    const projectName = `${data.repository.owner}/${data.repository.name}`.toLowerCase()
    const branchName = (data.repository.branch || '').toLowerCase()
    const language = (data.repository.primary_language || '').toLowerCase()

    if (projectName.includes(query) || branchName.includes(query) || language.includes(query)) {
      return data
    }

    return null
  }, [data, search])

  if (status === 'analyzing') {
    return <LoadingState title="Preparing project workspace" hint="Waiting for repository analysis" />
  }

  return (
    <div className="space-y-5">
      {error && <ErrorState title="Project context unavailable" description={error} />}

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <Folder className="size-5 text-amber-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Projects</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Group repositories into durable workspaces for health, planning, and delivery.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="neo-accent inline-flex items-center gap-2 px-3 py-2 text-xs opacity-40"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          New project
        </button>
      </header>

      <div className="neo-pressed flex items-center gap-2 px-3">
        <Search className="size-4 text-zinc-600" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search project workspace"
          className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
        />
        <span className="text-[10px] text-zinc-700">{search ? 'Local filter' : 'Workspace scope'}</span>
      </div>

      {!data && !error && (
        <EmptyState
          title="No project workspace yet"
          description="Analyze a repository to populate the project workspace and engineering signals."
          icon={Folder}
        />
      )}

      {filteredProject && (
        <section className="neo-flat p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-sky-400" aria-hidden="true" />
                <h2 className="text-sm font-medium text-zinc-200">Current repository workspace</h2>
              </div>

              <p className="mt-2 text-lg font-semibold text-zinc-100">
                {filteredProject.repository.owner}/{filteredProject.repository.name}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {filteredProject.repository.branch} · {filteredProject.repository.files.toLocaleString()} files ·{' '}
                {filteredProject.repository.lines_of_code.toLocaleString()} lines
              </p>
            </div>

            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="size-5" aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">
                Healthy workspace
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Detail label="Health" value={`${filteredProject.health.score}/100`} />
            <Detail label="Language" value={filteredProject.repository.primary_language || 'Not detected'} />
            <Detail
              label="Risks"
              value={`${filteredProject.risks.critical.length + filteredProject.risks.warnings.length} signals`}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/repository"
              className="inline-flex items-center gap-2 rounded-md border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 transition hover:border-violet-400 hover:bg-violet-500/20"
            >
              Open repository
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <Link
              to="/planning"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
            >
              View engineering plan
            </Link>
          </div>
        </section>
      )}

      {data && !filteredProject && (
        <EmptyState
          title="No project matches your search"
          description="Try a repository owner, project name, branch, or language to refine the workspace view."
          icon={Folder}
        />
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="neo-pressed p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-2 text-sm text-zinc-300">{value}</p>
    </div>
  )
}
