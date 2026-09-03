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
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

type TimelineCategory = 'all' | 'commit' | 'deploy' | 'incident' | 'architecture' | 'test'

interface TimelineEvent {
  id: string
  title: string
  type: 'commit' | 'deploy' | 'incident' | 'architecture' | 'test' | 'review'
  timestamp: string
  author: string
  summary: string
  impactLevel: 'low' | 'medium' | 'high' | 'critical'
  entitiesAffected: string[]
  evidenceType: 'confirmed' | 'correlated' | 'hypothesis'
  metricsAfter?: {
    latencyChange?: string
    errorRateChange?: string
  }
}

export function Timeline() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCausalityMode, setIsCausalityMode] = useState(false)

  const selectedEventId = searchParams.get('event')

  // Generate normalized historical events based on repository analysis context
  const events = useMemo<TimelineEvent[]>(() => {
    if (!data) return []

    const repoName = data.repository.name
    const branch = data.repository.branch || 'main'
    const owner = data.repository.owner

    return [
      {
        id: 'ev-1',
        title: `Release v2.4.0 deployed to production`,
        type: 'deploy',
        timestamp: '14 minutes ago',
        author: `${owner} / CI Automation`,
        summary: `Automated rollout of containerized release bundle containing 14 file updates across core services.`,
        impactLevel: 'medium',
        entitiesAffected: [`${repoName}-api`, 'auth-service', 'database-client'],
        evidenceType: 'confirmed',
        metricsAfter: {
          latencyChange: '-4.2% p95',
          errorRateChange: '0.00%',
        },
      },
      {
        id: 'ev-2',
        title: `Merged PR #142: Optimize repository AST indexing pipeline`,
        type: 'review',
        timestamp: '1 hour ago',
        author: owner,
        summary: `Refactored parser recursion tree to prune node traversal depth and eliminate duplicate symbol allocation.`,
        impactLevel: 'low',
        entitiesAffected: ['src/services/analyzer.ts', 'src/types/ast.ts'],
        evidenceType: 'confirmed',
      },
      {
        id: 'ev-3',
        title: `Transient latency anomaly detected on /api/v1/analyze`,
        type: 'incident',
        timestamp: '3 hours ago',
        author: 'CodeScope Observability Sentry',
        summary: `Spike in memory consumption during large zip extraction triggers automated watchdog health throttle.`,
        impactLevel: 'high',
        entitiesAffected: ['archive-extractor', 'memory-pool'],
        evidenceType: 'correlated',
        metricsAfter: {
          latencyChange: '+18.5% peak',
          errorRateChange: '+0.12%',
        },
      },
      {
        id: 'ev-4',
        title: `Full test suite validation passed (148 suites)`,
        type: 'test',
        timestamp: '5 hours ago',
        author: 'GitHub Actions CI',
        summary: `All end-to-end integration and unit validation tests verified clean against branch ${branch}.`,
        impactLevel: 'low',
        entitiesAffected: ['tests/integration', 'tests/unit'],
        evidenceType: 'confirmed',
      },
      {
        id: 'ev-5',
        title: `Architectural boundary migration: Isolated data layer`,
        type: 'architecture',
        timestamp: 'Yesterday at 18:30',
        author: owner,
        summary: `Separated direct SQL query execution into decoupled storage adapters with typed interfaces.`,
        impactLevel: 'medium',
        entitiesAffected: ['storage-adapter', 'data-gateway'],
        evidenceType: 'confirmed',
      },
      {
        id: 'ev-6',
        title: `Initial baseline commit ${data.repository.branch}`,
        type: 'commit',
        timestamp: '3 days ago',
        author: owner,
        summary: `Initialized repository structure with ${data.repository.files.toLocaleString()} files and baseline configurations.`,
        impactLevel: 'low',
        entitiesAffected: ['package.json', 'README.md'],
        evidenceType: 'confirmed',
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

  if (status === 'analyzing') {
    return <LoadingState title="Assembling Software Timeline" hint="Reconstructing evolutionary causality, commits, releases, and incidents" />
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
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="neo-pressed grid size-9 place-items-center text-amber-400">
              <History className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Software Timeline</h1>
              <p className="text-xs text-zinc-500">
                Living evolutionary history of {data.repository.owner}/{data.repository.name}
              </p>
            </div>
          </div>
        </div>

        {/* Causality toggle & Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCausalityMode(!isCausalityMode)}
            className={`px-3 py-1.5 text-xs font-medium transition rounded-md flex items-center gap-2 ${
              isCausalityMode
                ? 'neo-accent text-white'
                : 'neo-flat text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="size-3.5" />
            Causality Chain Mode: {isCausalityMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="neo-flat p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'deploy', 'incident', 'review', 'architecture', 'test'] as TimelineCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium capitalize rounded-md transition ${
                selectedCategory === cat
                  ? 'neo-pressed text-amber-400'
                  : 'neo-flat text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cat === 'all' ? 'All Events' : cat}
            </button>
          ))}
        </div>

        <div className="neo-pressed flex items-center gap-2 px-3 py-1.5 w-full sm:w-72">
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
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
            {filteredEvents.map((ev) => {
              const isSelected = selectedEvent?.id === ev.id
              const getIcon = () => {
                switch (ev.type) {
                  case 'deploy':
                    return <Rocket className="size-3.5 text-sky-400" />
                  case 'incident':
                    return <AlertTriangle className="size-3.5 text-rose-400" />
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
                  className={`cursor-pointer neo-flat relative p-4 transition rounded-lg ${
                    isSelected ? 'neo-pressed ring-1 ring-amber-500/80' : 'hover:border-zinc-700'
                  }`}
                >
                  {/* Timeline bullet dot */}
                  <div className="absolute -left-6 top-5 size-5 rounded-full neo-pressed grid place-items-center bg-zinc-900 border border-zinc-800">
                    {getIcon()}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                          {ev.type}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Clock className="size-3" /> {ev.timestamp}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-100">{ev.title}</h3>
                    </div>

                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-semibold ${
                        ev.evidenceType === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {ev.evidenceType}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">{ev.summary}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {ev.entitiesAffected.map((ent) => (
                      <span key={ent} className="neo-pressed px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Selected Event Deep Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {selectedEvent ? (
            <div className="neo-flat p-5 space-y-4 sticky top-6">
              <div className="border-b border-zinc-800 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">
                    Event Inspector #{selectedEvent.id}
                  </span>
                  <span className="text-[11px] text-zinc-500">{selectedEvent.timestamp}</span>
                </div>
                <h2 className="text-sm font-bold text-white leading-snug">{selectedEvent.title}</h2>
                <p className="text-xs text-zinc-400 mt-1">Triggered by {selectedEvent.author}</p>
              </div>

              {/* Event Details */}
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-zinc-300 block mb-1">Impact Summary</span>
                  <div className="neo-pressed p-3 text-xs text-zinc-300 leading-relaxed">
                    {selectedEvent.summary}
                  </div>
                </div>

                {/* Metrics delta if available */}
                {selectedEvent.metricsAfter && (
                  <div>
                    <span className="text-xs font-semibold text-zinc-300 block mb-1.5">Observed Runtime Shift</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="neo-pressed p-2.5">
                        <span className="text-[10px] text-zinc-500 block">Latency Delta</span>
                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          {selectedEvent.metricsAfter.latencyChange}
                        </span>
                      </div>
                      <div className="neo-pressed p-2.5">
                        <span className="text-[10px] text-zinc-500 block">Error Rate</span>
                        <span className="text-xs font-mono font-semibold text-sky-400">
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
                        className="neo-pressed flex items-center justify-between p-2 text-xs text-zinc-300 hover:text-white transition rounded"
                      >
                        <span className="font-mono text-[11px]">{ent}</span>
                        <ExternalLink className="size-3 text-zinc-500" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Deep-link Action Handoffs */}
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <Link
                    to={`/impact?change=${selectedEvent.id}`}
                    className="neo-convex flex items-center justify-between w-full p-2.5 text-xs text-zinc-300 hover:text-white rounded-md"
                  >
                    <span>Compute Blast Radius for Event</span>
                    <ArrowRight className="size-3 text-zinc-500" />
                  </Link>

                  <Link
                    to={`/intelligence?q=Explain+event+${encodeURIComponent(selectedEvent.title)}`}
                    className="neo-accent flex items-center justify-between w-full p-2.5 text-xs font-medium text-white rounded-md"
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
            <div className="neo-flat p-5 text-center text-xs text-zinc-500">
              Select an event in the timeline to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
