import { AlertTriangle, CheckCircle2, GitBranch, Play, Radio } from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

export function RepositoryContextBar() {
  const { data, error, status, openAnalyzeModal } = useRepositoryAnalysis()

  const statusLabel = status === 'analyzing'
    ? 'Analysis running'
    : error
      ? 'Analysis failed'
      : data
        ? 'Analysis current'
        : 'No repository connected'

  const StatusIcon = error ? AlertTriangle : status === 'analyzing' ? Radio : CheckCircle2
  const statusClass = error
    ? 'text-red-400'
    : status === 'analyzing'
      ? 'text-amber-400'
      : data
        ? 'text-emerald-400'
        : 'text-zinc-500'

  return (
    <section
      aria-label="Repository context"
      className="neo-flat mb-5 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="neo-pressed grid size-9 shrink-0 place-items-center" aria-hidden="true">
          <GitBranch className="size-4 text-violet-400" />
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
              {data ? `${data.repository.owner}/${data.repository.name}` : 'Connect a repository'}
            </span>
            {data && (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500">
                <GitBranch className="size-3" aria-hidden="true" />
                {data.repository.branch || 'default'}
              </span>
            )}
          </div>
          <div className={`mt-1 flex items-center gap-1.5 text-xs ${statusClass}`} role="status" aria-live="polite">
            <StatusIcon className={`size-3.5 ${status === 'analyzing' ? 'animate-pulse' : ''}`} aria-hidden="true" />
            <span>{statusLabel}</span>
            {error && <span className="truncate text-zinc-500">{error}</span>}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={openAnalyzeModal}
        className="neo-convex inline-flex h-8 shrink-0 items-center justify-center gap-2 px-3 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <Play className="size-3.5" aria-hidden="true" />
        {data ? 'Analyze latest' : 'Connect repository'}
      </button>
    </section>
  )
}