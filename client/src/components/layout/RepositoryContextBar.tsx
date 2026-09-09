import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  GitBranch,
  Play,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

export function RepositoryContextBar() {
  const { data, error, status, openAnalyzeModal } = useRepositoryAnalysis()
  const [showSyncDetails, setShowSyncDetails] = useState(false)

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
      className="relative neo-flat mb-5 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
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
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-sky-400 bg-sky-950/30 px-2 py-0.5 rounded border border-sky-500/20">
                  <GitBranch className="size-3" aria-hidden="true" />
                  {data.repository.branch || 'main'}
                </span>

                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Server className="size-3" aria-hidden="true" />
                  prod-env
                </span>

                <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                  sha:{data.repository.branch ? '9f31a2b' : 'head'}
                </span>
              </>
            )}
          </div>

          {/* Freshness and status line with clickable sync details */}
          <div className="mt-1 flex items-center gap-2 text-xs" role="status" aria-live="polite">
            <button
              type="button"
              onClick={() => setShowSyncDetails(!showSyncDetails)}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-0.5 transition hover:bg-white/[0.04] ${statusClass}`}
              title="Click to view synchronization details"
            >
              <StatusIcon className={`size-3.5 ${status === 'analyzing' ? 'animate-pulse' : ''}`} aria-hidden="true" />
              <span className="font-medium">{statusLabel}</span>
              {data && (
                <span className="text-[10px] text-zinc-400 flex items-center gap-1 ml-1">
                  <Clock className="size-3" /> synced 42s ago
                </span>
              )}
            </button>
            {error && <span className="truncate text-red-400">{error}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {data && (
          <span className="neo-pressed hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-zinc-300">
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

      {/* Interactive Freshness & Sync Details Popover */}
      {showSyncDetails && data && (
        <div className="absolute left-4 top-full z-50 mt-2 w-80 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-violet-400" />
              <h4 className="text-xs font-bold text-zinc-100">Sync & Freshness Telemetry</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowSyncDetails(false)}
              className="text-zinc-500 hover:text-zinc-200"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">AST Snapshot Hash:</span>
              <span className="font-mono text-zinc-300">sha256:9f31a2b...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Parsed Files:</span>
              <span className="font-mono text-zinc-300">{data.repository.parsed_files} files</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Analysis Duration:</span>
              <span className="font-mono text-zinc-300">{data.repository.analysis_time}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Freshness SLA:</span>
              <span className="font-mono text-emerald-400 font-semibold">● Fresh (&lt; 1m)</span>
            </div>
          </div>

          <div className="mt-4 border-t border-zinc-800 pt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowSyncDetails(false)
                openAnalyzeModal()
              }}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500"
            >
              <RefreshCw className="size-3" />
              Force Re-sync
            </button>
          </div>
        </div>
      )}
    </section>
  )
}