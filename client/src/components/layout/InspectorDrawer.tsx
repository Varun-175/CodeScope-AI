import {
  Activity,
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  FileCode,
  GitBranch,
  Layers,
  Network,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useInspector } from '../../contexts/InspectorContext'

export function InspectorDrawer() {
  const { isOpen, entity, activeTab, setActiveTab, closeInspector } = useInspector()

  if (!isOpen || !entity) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'service':
        return Server
      case 'symbol':
        return Code2
      case 'file':
        return FileCode
      case 'api':
        return Network
      case 'database':
        return Database
      case 'queue':
        return Workflow
      case 'deployment':
        return Activity
      case 'incident':
        return ShieldAlert
      case 'test':
        return ShieldCheck
      default:
        return Boxes
    }
  }

  const Icon = getIcon(entity.type)

  const statusColor =
    entity.status === 'danger'
      ? 'text-rose-400 bg-rose-950/40 border-rose-500/30'
      : entity.status === 'warning'
        ? 'text-amber-400 bg-amber-950/40 border-amber-500/30'
        : entity.status === 'stale'
          ? 'text-zinc-400 bg-zinc-900 border-zinc-700'
          : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'

  return (
    <aside
      aria-label="Contextual entity inspector"
      className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-white/[0.08] bg-[#090c14]/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 sm:w-[460px] lg:w-[480px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400">
                {entity.type}
              </span>
              {entity.layer && (
                <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-400">
                  {entity.layer}
                </span>
              )}
            </div>
            <h3 className="truncate font-mono text-sm font-bold text-white">
              {entity.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entity.status && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}
            >
              {entity.status}
            </span>
          )}
          <button
            type="button"
            onClick={closeInspector}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Close inspector"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] bg-black/20 px-4">
        {(
          [
            { id: 'overview', label: 'Overview' },
            { id: 'edges', label: `Edges (${entity.edges?.length || 0})` },
            { id: 'evidence', label: 'Evidence Graph' },
            { id: 'actions', label: 'Actions' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'text-violet-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            )}
          </button>
        ))}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Context Question & Intent */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-300 mb-1">
                <Sparkles className="size-3.5" />
                <span>Entity Purpose & Significance</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {entity.description ||
                  `Core ${entity.type} node within the active repository AST and topological graph.`}
              </p>
            </div>

            {/* Location & File */}
            {entity.file && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                  Source Declaration
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-300 truncate">
                    {entity.file}
                  </span>
                  <Link
                    to={`/code/${encodeURIComponent(entity.file)}`}
                    onClick={closeInspector}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 shrink-0 ml-2"
                  >
                    View Code <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Metrics */}
            {entity.metrics && Object.keys(entity.metrics).length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                  Telemetry & Operational Attributes
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(entity.metrics).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
                    >
                      <span className="text-[10px] text-zinc-400 capitalize block">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-100">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deep-link routing options */}
            <div className="pt-2">
              <Link
                to={`/entities/${entity.type}/${entity.id}`}
                onClick={closeInspector}
                className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition hover:border-violet-500/40 hover:bg-white/[0.06]"
              >
                <span>Open Entity 360 Full Workspace</span>
                <ArrowRight className="size-3.5 text-violet-400" />
              </Link>
            </div>
          </div>
        )}

        {/* EDGES TAB */}
        {activeTab === 'edges' && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">
              Correlated Software Knowledge Graph relationships for this node:
            </p>
            {entity.edges && entity.edges.length > 0 ? (
              <div className="space-y-2">
                {entity.edges.map((edge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded bg-violet-950/60 border border-violet-500/30 px-1.5 py-0.5 font-mono text-[10px] text-violet-300">
                        {edge.type}
                      </span>
                      <span className="font-mono text-zinc-200 truncate">
                        {edge.target}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-mono text-zinc-500 shrink-0 ml-2">
                      {edge.targetType}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.1] p-6 text-center text-xs text-zinc-500">
                No direct edges indexed for this entity in the active snapshot.
              </div>
            )}
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-emerald-300">
              <span className="font-semibold block mb-0.5">
                Calibrated Grounded Evidence
              </span>
              Multi-dimensional validation backed by AST, git commits, and runtime
              telemetry.
            </div>

            {entity.evidence ? (
              <div className="space-y-3 text-xs">
                {entity.evidence.structural && (
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="font-semibold text-zinc-300 block mb-1">
                      Structural AST Evidence
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                      {entity.evidence.structural.map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {entity.evidence.runtime && (
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="font-semibold text-sky-400 block mb-1">
                      Runtime Telemetry Evidence
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                      {entity.evidence.runtime.map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {entity.evidence.test && (
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="font-semibold text-emerald-400 block mb-1">
                      Test Suite Verification
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                      {entity.evidence.test.map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.1] p-6 text-center text-xs text-zinc-500">
                Grounded evidence is automatically generated during full repository
                analysis.
              </div>
            )}
          </div>
        )}

        {/* ACTIONS TAB */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
              Recommended Workflows
            </span>
            <div className="space-y-2">
              <Link
                to={`/impact?focus=${encodeURIComponent(entity.name)}`}
                onClick={closeInspector}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-white/[0.04] transition"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="size-4 text-amber-400" />
                  <span>Compute Multi-Hop Blast Radius</span>
                </div>
                <ArrowRight className="size-3.5 text-zinc-500" />
              </Link>

              <Link
                to={`/planning?entity=${encodeURIComponent(entity.name)}`}
                onClick={closeInspector}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-white/[0.04] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="size-4 text-violet-400" />
                  <span>Draft 7-Stage Implementation Plan</span>
                </div>
                <ArrowRight className="size-3.5 text-zinc-500" />
              </Link>

              <Link
                to={`/testing?target=${encodeURIComponent(entity.name)}`}
                onClick={closeInspector}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-white/[0.04] transition"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <span>Generate Test Protection Matrix</span>
                </div>
                <ArrowRight className="size-3.5 text-zinc-500" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
