import { useState, useMemo } from 'react'
import {
  History,
  GitCommit,
  Rocket,
  AlertTriangle,
  Layers,
  TestTube,
  Search,
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
  GitPullRequest,
  SlidersHorizontal,
  Activity,
  Calendar,
  CheckCircle2,
  FileCode2,
  GitBranch,
  ShieldAlert,
  Flame,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { useInspector } from '../contexts/InspectorContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

type TimelineCategory = 'all' | 'commit' | 'deploy' | 'incident' | 'architecture' | 'test' | 'review' | 'runtime'
type CertaintyLevel = 'direct evidence' | 'strong correlation' | 'temporal correlation' | 'hypothesis'

interface TimelineEvent {
  id: string
  title: string
  type: 'commit' | 'deploy' | 'incident' | 'architecture' | 'test' | 'review' | 'runtime'
  timestamp: string
  author: string
  summary: string
  impactLevel: 'low' | 'medium' | 'high' | 'critical'
  entitiesAffected: string[]
  certainty: CertaintyLevel
  commitHash?: string
  environment?: string
  duration?: string
  status?: string
  impactCounts?: {
    files: number
    services: number
    apis: number
  }
  metricsAfter?: {
    latencyChange?: string
    errorRateChange?: string
  }
}

export function Timeline() {
  const { data, error, status } = useRepositoryAnalysis()
  const { openInspector } = useInspector()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCausalityMode, setIsCausalityMode] = useState(false)
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [scrubPosition, setScrubPosition] = useState<number>(100) // 0 to 100%

  const selectedEventId = searchParams.get('event')

  // Generate normalized historical events based on repository analysis context (10_SOFTWARE_TIMELINE.md)
  const events = useMemo<TimelineEvent[]>(() => {
    if (!data) return []

    const repoName = data.repository.name
    const owner = data.repository.owner

    return [
      {
        id: 'ev-deploy-284',
        title: 'Deployment #284 (Release 1.8)',
        type: 'deploy',
        timestamp: '14 minutes ago',
        author: `${owner} / Release Automation`,
        summary: 'Pushed containerized release bundle containing 14 file updates to Production cluster.',
        impactLevel: 'high',
        entitiesAffected: [`${repoName}-api`, 'payment-service', 'database-client'],
        certainty: 'direct evidence',
        commitHash: '9f31a2b',
        environment: 'Production',
        duration: '6m 22s',
        status: 'Success',
        impactCounts: { files: 14, services: 3, apis: 1 },
        metricsAfter: {
          latencyChange: '+41% p95 surge',
          errorRateChange: '+0.70% (504s)',
        },
      },
      {
        id: 'ev-inc-402',
        title: 'Incident INC-402: Checkout 504 Timeout Surge',
        type: 'incident',
        timestamp: '11 minutes ago',
        author: 'CodeScope Telemetry Watchdog',
        summary: 'Triggered alert checkout-slo-error-budget due to socket exhaustion in PaymentClient.',
        impactLevel: 'critical',
        entitiesAffected: ['payment-service', 'checkout-bff'],
        certainty: 'strong correlation',
        commitHash: '9f31a2b',
        environment: 'Production',
        duration: 'Active (14m)',
        status: 'Active P2',
        impactCounts: { files: 2, services: 2, apis: 1 },
        metricsAfter: {
          latencyChange: 'p95 shifted from 180ms to 410ms',
          errorRateChange: '1.2% threshold exceeded',
        },
      },
      {
        id: 'ev-review-129',
        title: 'Merged PR #129: Refactor Payment & Settlement Pipeline',
        type: 'review',
        timestamp: '2 hours ago',
        author: 'alex-chen',
        summary: 'Modified public Payment Gateway interfaces, transactional settlement hooks, and SQL idempotency.',
        impactLevel: 'high',
        entitiesAffected: ['src/services/order.service.ts', 'src/clients/payment.client.ts'],
        certainty: 'direct evidence',
        commitHash: '9f31a2b',
        environment: 'Staging Verified',
        impactCounts: { files: 14, services: 3, apis: 2 },
      },
      {
        id: 'ev-arch-01',
        title: 'Architectural Drift: Direct SQL access bypass in worker',
        type: 'architecture',
        timestamp: 'Yesterday at 18:30',
        author: 'CodeScope Architecture Guard',
        summary: 'Detected layer violation where checkout worker initiates unpooled SQL transactions.',
        impactLevel: 'medium',
        entitiesAffected: ['payment-worker', 'prisma/schema.prisma'],
        certainty: 'direct evidence',
        impactCounts: { files: 4, services: 2, apis: 0 },
      },
      {
        id: 'ev-test-148',
        title: 'CI Test Suite Run (148 suites passed)',
        type: 'test',
        timestamp: 'Yesterday at 14:15',
        author: 'GitHub Actions CI',
        summary: 'Automated integration tests executed cleanly; payment timeout backoff test missing.',
        impactLevel: 'low',
        entitiesAffected: ['tests/integration', 'tests/unit'],
        certainty: 'direct evidence',
        impactCounts: { files: 32, services: 4, apis: 6 },
      },
      {
        id: 'ev-commit-base',
        title: `Baseline Release 1.7 Commit`,
        type: 'commit',
        timestamp: '3 days ago',
        author: owner,
        summary: `Established stable release baseline with ${data.repository.files.toLocaleString()} parsed files.`,
        impactLevel: 'low',
        entitiesAffected: ['package.json', 'src/index.ts'],
        certainty: 'direct evidence',
        commitHash: '4a87c1e',
        impactCounts: { files: data.repository.files, services: 1, apis: 2 },
      },
    ]
  }, [data])

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesCategory = selectedCategory === 'all' || ev.type === selectedCategory
      const matchesQuery =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.entitiesAffected.some((ent) => ent.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesQuery
    })
  }, [events, selectedCategory, searchQuery])

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0]
  }, [events, selectedEventId])

  // 6-Channel Multi-Track Lanes for Timeline visualization
  const channelLanes = [
    { id: 'commit', label: 'Commit', symbol: '●', color: 'text-zinc-400', events: events.filter((e) => e.type === 'commit') },
    { id: 'review', label: 'Review', symbol: '●', color: 'text-emerald-400', events: events.filter((e) => e.type === 'review') },
    { id: 'deploy', label: 'Deploy', symbol: '▲', color: 'text-sky-400', events: events.filter((e) => e.type === 'deploy') },
    { id: 'runtime', label: 'Runtime', symbol: '╱╲', color: 'text-amber-400', events: events.filter((e) => e.type === 'runtime' || e.metricsAfter) },
    { id: 'incident', label: 'Incident', symbol: '◆', color: 'text-rose-400', events: events.filter((e) => e.type === 'incident') },
    { id: 'architecture', label: 'Architecture', symbol: '▓', color: 'text-violet-400', events: events.filter((e) => e.type === 'architecture') },
  ]

  const getCertaintyBadge = (certainty: CertaintyLevel) => {
    switch (certainty) {
      case 'direct evidence':
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
      case 'strong correlation':
        return 'bg-violet-950/50 text-violet-300 border-violet-500/30'
      case 'temporal correlation':
        return 'bg-amber-950/50 text-amber-300 border-amber-500/30'
      case 'hypothesis':
        return 'bg-rose-950/50 text-rose-300 border-rose-500/30'
    }
  }

  if (status === 'analyzing') {
    return (
      <LoadingState
        title="Assembling Software Timeline"
        hint="Reconstructing evolutionary causality, commits, releases, and incidents..."
      />
    )
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {error ? <ErrorState title="Timeline reconstruction failed" description={error} /> : null}
        <EmptyState
          title="Analyze a repository to view Software Timeline"
          description="Software Timeline links commits, builds, tests, deployments, and runtime anomalies into a living evolutionary chain."
          icon={History}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header & Controls (10_SOFTWARE_TIMELINE.md) */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
              <History className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-lg font-bold text-white">Software Evolution Timeline</h1>
                <span className="rounded bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                  Living Temporal Model
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Living evolutionary history of {data.repository.owner}/{data.repository.name} · {events.length} causal events indexed
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Causality Toggle & Release Compare Mode */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              isCompareMode
                ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30'
                : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'
            }`}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Compare Snapshots</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCausalityMode(!isCausalityMode)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              isCausalityMode
                ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>Causality Mode: {isCausalityMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* 1. INTERACTIVE MULTI-TRACK 6-CHANNEL TIMELINE WITH TIME SCRUBBER (10_SOFTWARE_TIMELINE.md) */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-amber-400" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Multi-Channel Temporal Mesh
            </h2>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span>Scrubber: {scrubPosition === 100 ? 'Latest (Live)' : `${scrubPosition}% Historic`}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={scrubPosition}
              onChange={(e) => setScrubPosition(Number(e.target.value))}
              className="w-36 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 6-Channel Lanes Visual */}
        <div className="space-y-2.5 font-mono text-xs">
          {channelLanes.map((lane) => (
            <div key={lane.id} className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-3 text-[11px] font-semibold text-zinc-400 uppercase">
                {lane.label}
              </span>
              <div className="col-span-9 relative flex items-center h-6 rounded-lg bg-black/40 border border-white/[0.04] px-3">
                <div className="absolute inset-x-3 h-0.5 bg-white/[0.06]" />
                <div className="relative z-10 flex items-center justify-around w-full">
                  {lane.events.map((ev, idx) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        const next = new URLSearchParams(searchParams)
                        next.set('event', ev.id)
                        setSearchParams(next, { replace: true })
                      }}
                      className={`group flex items-center gap-1 px-1.5 py-0.5 rounded transition ${
                        selectedEvent?.id === ev.id
                          ? 'bg-amber-500/20 text-white font-bold ring-1 ring-amber-400'
                          : `${lane.color} hover:bg-white/[0.06]`
                      }`}
                      title={`${ev.title} (${ev.timestamp})`}
                    >
                      <span>{lane.symbol}</span>
                      <span className="text-[10px] hidden sm:inline">{ev.timestamp.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. SNAPSHOT COMPARISON DRAWER (10_SOFTWARE_TIMELINE.md) */}
      {isCompareMode && (
        <section className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/20 via-[#0a0d16]/90 to-zinc-950 p-5 shadow-2xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-sky-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Release Comparison Mode: Release 1.7 (Baseline) vs Release 1.8 (Target)
              </h3>
            </div>
            <span className="font-mono text-[10px] text-sky-400">sha:4a87c1e → sha:9f31a2b</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 text-xs">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="text-[10px] text-zinc-500 uppercase block">Files Changed</span>
              <span className="font-mono text-xs font-bold text-zinc-200">14 files (+380/-110)</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="text-[10px] text-zinc-500 uppercase block">Symbols Changed</span>
              <span className="font-mono text-xs font-bold text-violet-300">8 AST Symbols</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="text-[10px] text-zinc-500 uppercase block">Architecture Drift</span>
              <span className="font-mono text-xs font-bold text-amber-400">1 Boundary Leak</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="text-[10px] text-zinc-500 uppercase block">Dependency Delta</span>
              <span className="font-mono text-xs font-bold text-zinc-200">+2 Packages</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="text-[10px] text-zinc-500 uppercase block">Tests Coverage</span>
              <span className="font-mono text-xs font-bold text-emerald-400">+12 Test Assertions</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="text-[10px] text-zinc-500 uppercase block">Runtime Shift</span>
              <span className="font-mono text-xs font-bold text-rose-400">p95 +41% (Anomaly)</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="text-[10px] text-zinc-500 uppercase block">Incidents Linked</span>
              <span className="font-mono text-xs font-bold text-rose-400">INC-402 (P2)</span>
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'deploy', 'incident', 'review', 'architecture', 'test', 'commit'] as TimelineCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-semibold capitalize rounded-lg transition ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'border border-white/[0.04] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              }`}
            >
              {cat === 'all' ? 'All Events' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 w-full sm:w-72">
          <Search className="size-3.5 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search timeline events, entities, SHAs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Main Two-Column Layout: Event Stream + Event Inspector */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column: Timeline Stream */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
            {filteredEvents.map((ev) => {
              const isSelected = selectedEvent?.id === ev.id
              const getIcon = () => {
                switch (ev.type) {
                  case 'deploy':
                    return <Rocket className="size-3.5 text-sky-400" />
                  case 'incident':
                    return <Flame className="size-3.5 text-rose-400" />
                  case 'review':
                    return <GitPullRequest className="size-3.5 text-emerald-400" />
                  case 'architecture':
                    return <Layers className="size-3.5 text-violet-400" />
                  case 'test':
                    return <TestTube className="size-3.5 text-amber-400" />
                  default:
                    return <GitCommit className="size-3.5 text-zinc-400" />
                }
              }

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    next.set('event', ev.id)
                    setSearchParams(next, { replace: true })
                  }}
                  className={`cursor-pointer relative p-4 transition rounded-2xl border ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-500 text-white shadow-xl shadow-amber-500/10'
                      : 'border-white/[0.06] bg-[#0a0d16]/70 hover:border-amber-500/40 hover:bg-[#0a0d16]/90'
                  }`}
                >
                  {/* Timeline Bullet Dot */}
                  <div className="absolute -left-6 top-5 size-5 rounded-full grid place-items-center bg-[#0a0d16] border border-white/[0.1] shadow-lg">
                    {getIcon()}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400">
                          {ev.type}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Clock className="size-3" /> {ev.timestamp}
                        </span>
                        {ev.commitHash && (
                          <>
                            <span className="text-zinc-600">·</span>
                            <span className="font-mono text-[10px] text-sky-400 bg-sky-950/40 px-1.5 py-0.2 rounded border border-sky-500/20">
                              sha:{ev.commitHash}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-mono text-xs font-bold text-zinc-100">{ev.title}</h3>
                    </div>

                    <span
                      className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono font-semibold border ${getCertaintyBadge(
                        ev.certainty
                      )}`}
                    >
                      {ev.certainty}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{ev.summary}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {ev.entitiesAffected.map((ent) => (
                      <span
                        key={ent}
                        className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] text-zinc-300 font-mono"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Selected Event Deep Inspector (10_SOFTWARE_TIMELINE.md) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedEvent ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-2xl backdrop-blur-xl space-y-4 sticky top-6">
              <div className="border-b border-white/[0.06] pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400">
                    Event Inspector · {selectedEvent.id}
                  </span>
                  <span className="text-[11px] text-zinc-500">{selectedEvent.timestamp}</span>
                </div>
                <h2 className="font-mono text-sm font-bold text-white leading-snug">{selectedEvent.title}</h2>
                <p className="text-xs text-zinc-400 mt-1">Triggered by {selectedEvent.author}</p>
              </div>

              {/* Event Metadata Breakdown */}
              <div className="space-y-3 text-xs">
                {selectedEvent.impactCounts && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center">
                      <span className="text-[10px] text-zinc-500 uppercase block">Files</span>
                      <span className="font-mono text-xs font-bold text-zinc-200">
                        {selectedEvent.impactCounts.files}
                      </span>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center">
                      <span className="text-[10px] text-zinc-500 uppercase block">Services</span>
                      <span className="font-mono text-xs font-bold text-zinc-200">
                        {selectedEvent.impactCounts.services}
                      </span>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center">
                      <span className="text-[10px] text-zinc-500 uppercase block">APIs</span>
                      <span className="font-mono text-xs font-bold text-zinc-200">
                        {selectedEvent.impactCounts.apis}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold text-zinc-300 block mb-1">Impact Summary</span>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-zinc-300 leading-relaxed">
                    {selectedEvent.summary}
                  </div>
                </div>

                {/* Metrics Delta / After Event */}
                {selectedEvent.metricsAfter && (
                  <div>
                    <span className="text-xs font-semibold text-amber-300 block mb-1.5">
                      Observed Runtime Shift After Event
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <span className="text-[10px] text-zinc-500 block">Latency Delta</span>
                        <span className="text-xs font-mono font-bold text-rose-400">
                          {selectedEvent.metricsAfter.latencyChange}
                        </span>
                      </div>
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <span className="text-[10px] text-zinc-500 block">Error Rate</span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {selectedEvent.metricsAfter.errorRateChange}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Affected Entities */}
                <div>
                  <span className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Impacted Software Entities ({selectedEvent.entitiesAffected.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedEvent.entitiesAffected.map((ent) => (
                      <Link
                        key={ent}
                        to={`/entities?entity=${encodeURIComponent(ent)}`}
                        className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2 text-xs text-zinc-300 hover:bg-white/[0.04] hover:text-white transition"
                      >
                        <span className="font-mono text-[11px]">{ent}</span>
                        <ExternalLink className="size-3 text-zinc-500" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Deep-link Action Handoffs */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <Link
                    to={`/impact?change=${selectedEvent.id}`}
                    className="flex items-center justify-between w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs text-zinc-200 hover:border-violet-500/40 hover:bg-white/[0.04] transition"
                  >
                    <span>Open Impact Blast Radius</span>
                    <ArrowRight className="size-3.5 text-zinc-500" />
                  </Link>

                  <Link
                    to="/operations"
                    className="flex items-center justify-between w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs text-zinc-200 hover:border-violet-500/40 hover:bg-white/[0.04] transition"
                  >
                    <span>Compare Runtime Drift</span>
                    <ArrowRight className="size-3.5 text-zinc-500" />
                  </Link>

                  <Link
                    to={`/intelligence?q=Explain+causality+behind+event+${encodeURIComponent(selectedEvent.title)}`}
                    className="flex items-center justify-between w-full rounded-xl bg-violet-600 p-2.5 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="size-3.5" /> Ask AI to Reconstruct Causality
                    </span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 text-center text-xs text-zinc-500">
              Select an event in the timeline to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
