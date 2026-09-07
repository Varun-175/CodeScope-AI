import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  Flame,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Layers,
  Network,
  Rocket,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Waypoints,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

type ChangeCategory = 'all' | 'architecture' | 'risk' | 'dependency' | 'validation'

interface ChangeItem {
  id: string
  title: string
  detail: string
  category: 'architecture' | 'risk' | 'dependency' | 'validation'
  author: string
  timeAgo: string
  path?: string
  severity?: 'critical' | 'warning' | 'info'
  impactSummary: string
  blastRadiusCount: number
}

export function Changes() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<ChangeCategory>('all')
  const [selectedChangeId, setSelectedChangeId] = useState<string>('pr-129')

  const changeEvents = useMemo<ChangeItem[]>(() => {
    if (!data) return []

    const events: ChangeItem[] = [
      {
        id: 'pr-129',
        title: 'PR #129: Refactor Payment & Order Settlement Pipeline',
        detail: 'Modifies public Payment Gateway interfaces, transactional settlement hooks, and adds SQL migration.',
        category: 'architecture',
        author: 'alex-chen',
        timeAgo: '2 hours ago',
        path: 'src/clients/payment.client.ts',
        severity: 'critical',
        impactSummary: '14 files · 3 services · 2 APIs · 1 database path',
        blastRadiusCount: 14,
      },
      {
        id: 'commit-4e81',
        title: 'Commit 4e81c09: Add Redis Cache Normalization for Cart Sessions',
        detail: 'Implements cache key normalization to prevent read-amplification on PostgreSQL.',
        category: 'dependency',
        author: 'sarah-dev',
        timeAgo: '5 hours ago',
        path: 'src/cache/order.cache.ts',
        severity: 'warning',
        impactSummary: '3 files · 1 service · 1 cache layer',
        blastRadiusCount: 4,
      },
      {
        id: 'snapshot-baseline',
        title: `Snapshot Baseline: ${data.repository.name} (${data.repository.branch})`,
        detail: `${data.repository.files.toLocaleString()} files (${data.repository.lines_of_code.toLocaleString()} lines) parsed in ${data.repository.primary_language}.`,
        category: 'architecture',
        author: data.repository.owner,
        timeAgo: 'Current Snapshot',
        impactSummary: `${data.dependency_health.total_dependencies} dependencies · ${data.repository.supported_files} supported files`,
        blastRadiusCount: data.repository.files,
      },
    ]

    ;(data.risks.critical ?? []).forEach((risk, i) => {
      events.push({
        id: `crit-risk-${i}`,
        title: risk.reason || `Critical Complexity Hotspot: ${risk.path}`,
        detail: 'Analyzer flagged excessive branching and high afferent coupling.',
        category: 'risk',
        author: 'static-analyzer',
        timeAgo: 'Snapshot scan',
        path: risk.path,
        severity: 'critical',
        impactSummary: `${risk.lines || 100} lines in critical execution path`,
        blastRadiusCount: 6,
      })
    })

    return events
  }, [data])

  const filteredChanges = useMemo(() => {
    if (activeCategory === 'all') return changeEvents
    return changeEvents.filter((e) => e.category === activeCategory)
  }, [changeEvents, activeCategory])

  const selectedChange = changeEvents.find((e) => e.id === selectedChangeId) || changeEvents[0]

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing Repository Changes" hint="Computing AST deltas, change streams, and architectural progression..." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to view changes"
        description="Change timeline, commit diffs, and risk deltas will appear once a repository snapshot is analyzed."
        icon={GitCommitHorizontal}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Change tracking alert" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 ring-1 ring-violet-500/30">
              <GitCommitHorizontal className="size-5 text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">System Evolution & Changes</h1>
                <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-300">
                  V3 Change Stream
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Track code commits, pull requests, architectural shifts, and risk progression for {data.repository.owner}/{data.repository.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Handoff */}
        <div className="flex items-center gap-2">
          <Link
            to="/impact"
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
          >
            <Waypoints className="size-3.5" />
            Calculate Blast Radius
          </Link>
          <Link
            to="/timeline"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <Activity className="size-3.5 text-sky-400" />
            Unified Timeline
          </Link>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-1.5 backdrop-blur-md">
        {(
          [
            { key: 'all', label: 'All Changes', count: changeEvents.length },
            { key: 'architecture', label: 'Architecture Shifts', count: changeEvents.filter((c) => c.category === 'architecture').length },
            { key: 'risk', label: 'Risk Deltas', count: changeEvents.filter((c) => c.category === 'risk').length },
            { key: 'dependency', label: 'Dependencies', count: changeEvents.filter((c) => c.category === 'dependency').length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeCategory === tab.key
                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="rounded-full bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Changes Feed + Detailed Evolution Inspector */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,1fr)]">
        {/* Changes Feed */}
        <div className="space-y-3">
          {filteredChanges.map((change) => {
            const isSelected = selectedChange?.id === change.id
            return (
              <div
                key={change.id}
                onClick={() => setSelectedChangeId(change.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  isSelected
                    ? 'border-violet-500/60 bg-violet-950/20 shadow-lg ring-1 ring-violet-500/30'
                    : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.2 font-mono text-[9px] uppercase text-zinc-400">
                        {change.category}
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-200">{change.title}</span>
                    </div>
                    <p className="text-xs text-zinc-400">{change.detail}</p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <span>Authored by <strong>{change.author}</strong></span>
                      <span>·</span>
                      <span>{change.timeAgo}</span>
                    </div>
                  </div>
                  <ChevronRight className={`size-4 shrink-0 transition ${isSelected ? 'text-violet-400' : 'text-zinc-600'}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Change Deep-Dive Panel */}
        {selectedChange && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-md space-y-5 self-start">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                  Evolution Details
                </span>
                <h3 className="mt-1 text-sm font-bold text-zinc-100">{selectedChange.title}</h3>
              </div>
              <span className="font-mono text-xs text-zinc-500">{selectedChange.id}</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Impact Summary</span>
                <p className="font-mono text-xs text-zinc-200">{selectedChange.impactSummary}</p>
              </div>

              {selectedChange.path && (
                <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Primary Source Location</span>
                  <p className="font-mono text-xs text-violet-300">{selectedChange.path}</p>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/80 pt-4">
              <Link
                to="/impact"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
              >
                <Waypoints className="size-3.5 text-sky-400" />
                Blast Radius
              </Link>
              <Link
                to="/reviews"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
              >
                <ShieldCheck className="size-3.5" />
                Review Change
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
