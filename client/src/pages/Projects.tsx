import { ArrowRight, Folder, GitBranch, Plus, Search, Server, ShieldCheck, Sparkles } from 'lucide-react'
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
    return <LoadingState title="Loading Project Workspace" hint="Querying repository bindings and multi-repo architectures..." />
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Project context unavailable" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 ring-1 ring-amber-500/30">
              <Folder className="size-5 text-amber-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Project Workspaces</h1>
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                  Multi-Repository Scope
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Group microservices, frontend applications, and shared libraries into unified project boundaries.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
        >
          <Plus className="size-3.5" />
          <span>New Project</span>
        </button>
      </header>

      {/* Search Input Bar */}
      <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-1.5 shadow-md backdrop-blur-md">
        <Search className="absolute left-3.5 top-3.5 size-4 text-zinc-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter workspaces by repository name, language, or branch..."
          className="h-10 w-full rounded-xl bg-transparent pl-9 pr-3 text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
        />
      </div>

      {!data && !error && (
        <EmptyState
          title="No project workspace yet"
          description="Analyze a repository to populate the project workspace and engineering signals."
          icon={Folder}
        />
      )}

      {filteredProject && (
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-sky-400" aria-hidden="true" />
                <h2 className="text-sm font-bold text-zinc-200">Active Repository Workspace</h2>
              </div>

              <p className="mt-2 text-xl font-bold text-zinc-100">
                {filteredProject.repository.owner}/{filteredProject.repository.name}
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-400">
                Branch: <span className="text-violet-300">{filteredProject.repository.branch}</span> · {filteredProject.repository.files.toLocaleString()} files ·{' '}
                {filteredProject.repository.lines_of_code.toLocaleString()} lines of code
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
              <ShieldCheck className="size-4" aria-hidden="true" />
              <span>HEALTHY SCOPE</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3.5">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Health Score</span>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-300">{filteredProject.health.score}/100</p>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3.5">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Primary Ecosystem</span>
              <p className="mt-1 font-mono text-lg font-bold text-zinc-200">{filteredProject.repository.primary_language || 'TypeScript'}</p>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3.5">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Total Signals</span>
              <p className="mt-1 font-mono text-lg font-bold text-amber-300">
                {filteredProject.risks.critical.length + filteredProject.risks.warnings.length} Findings
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800/80 pt-4">
            <Link
              to="/repository"
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
            >
              <span>Explore Workspace</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              to="/planning"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <span>View Engineering Plan</span>
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
