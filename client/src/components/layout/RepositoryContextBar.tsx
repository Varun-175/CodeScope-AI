import { AlertTriangle, CheckCircle2, GitBranch, Play, Radio, Clock, ShieldCheck, Sparkles, Server } from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

export function RepositoryContextBar() {
  const { data, error, status, openAnalyzeModal } = useRepositoryAnalysis()

  const statusLabel =
    status === 'analyzing'
      ? 'Analyzing AST & Graph'
      : error
        ? 'Sync Error'
        : data
          ? 'Live · AST grounded'
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
      aria-label="Repository context hierarchy"
      className="neo-flat mb-5 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <div className="neo-pressed grid size-9 shrink-0 place-items-center" aria-hidden="true">
          <GitBranch className="size-4 text-violet-400" />
        </div>

        <div className="min-w-0">
          {/* Multi-tier breadcrumb context: Org / Project / Repo / Branch */}
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="text-zinc-500 font-mono">
              {data ? data.repository.owner : 'default-org'}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="font-semibold text-zinc-100">
              {data ? data.repository.name : 'Connect Repository'}
            </span>

            {data && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-sky-400 bg-sky-950/30 px-2 py-0.5 rounded">
                  <GitBranch className="size-3" aria-hidden="true" />
                  {data.repository.branch || 'main'}
                </span>

                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">
                  <Server className="size-3" aria-hidden="true" />
                  prod-env
                </span>

                <span className="font-mono text-[10px] text-zinc-500">
                  sha:{data.repository.branch ? '9f31a' : 'head'}
                </span>
              </>
            )}
          </div>

          {/* Freshness and status line */}
          <div className={`mt-1 flex items-center gap-2 text-xs ${statusClass}`} role="status" aria-live="polite">
            <StatusIcon className={`size-3.5 ${status === 'analyzing' ? 'animate-pulse' : ''}`} aria-hidden="true" />
            <span className="font-medium">{statusLabel}</span>
            {data && (
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Clock className="size-3" /> synced 42s ago
              </span>
            )}
            {error && <span className="truncate text-zinc-500">{error}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {data && (
          <span className="neo-pressed hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-zinc-400">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            Health {data.health.score}/100
          </span>
        )}
        <button
          type="button"
          onClick={openAnalyzeModal}
          className="neo-accent inline-flex h-8 items-center justify-center gap-1.5 px-3 text-xs font-semibold text-white transition"
        >
          <Play className="size-3.5" aria-hidden="true" />
          <span>{data ? 'Re-analyze' : 'Connect Repo'}</span>
        </button>
      </div>
    </section>
  )
}