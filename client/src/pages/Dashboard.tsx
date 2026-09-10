import { useMemo, useState } from 'react'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Boxes,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  FileCode2,
  Flame,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  History,
  Layers,
  Network,
  Play,
  RefreshCw,
  Rocket,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube2,
  Waypoints,
  Workflow,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyDashboardState } from '../components/dashboard/EmptyDashboardState'
import { RepositoryHeader } from '../components/dashboard/RepositoryHeader'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { LoadingState, ErrorState } from '../components/shared/StatusPanels'

export function Dashboard() {
  const { data, error, status, openAnalyzeModal } = useRepositoryAnalysis()
  const navigate = useNavigate()
  const [askQuery, setAskQuery] = useState('')

  const criticalRisksCount = data?.risks.critical?.length ?? 0
  const warningsCount = data?.risks.warnings?.length ?? 0
  const totalRisks = criticalRisksCount + warningsCount

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (askQuery.trim()) {
      navigate(`/intelligence?q=${encodeURIComponent(askQuery.trim())}`)
    }
  }

  const handleSuggestionClick = (query: string) => {
    navigate(`/intelligence?q=${encodeURIComponent(query)}`)
  }

  // System Pulse Dimensions (08_DASHBOARD_LAUNCHPAD.md)
  const systemPulseDimensions = useMemo(() => {
    if (!data) return []
    const health = data.health.score
    return [
      {
        name: 'Structure',
        score: Math.min(100, Math.max(50, health + 4)),
        status: 'Optimal',
        statusColor: 'text-emerald-400',
        detail: `${data.repository.files} files · ${data.architecture?.layers?.length || 3} architectural layers`,
        link: '/architecture',
      },
      {
        name: 'Dependencies',
        score: Math.min(100, Math.max(40, 100 - (data.dependency_health?.unknown?.length || 0) * 8)),
        status: (data.dependency_health?.unknown?.length || 0) > 0 ? 'Requires Audit' : 'Healthy',
        statusColor: (data.dependency_health?.unknown?.length || 0) > 0 ? 'text-amber-400' : 'text-emerald-400',
        detail: `${data.dependency_health?.total_dependencies || 0} packages indexed`,
        link: '/integrations',
      },
      {
        name: 'Test Protection',
        score: data.repository.has_tests ? 88 : 34,
        status: data.repository.has_tests ? 'Protected' : 'Missing Suite',
        statusColor: data.repository.has_tests ? 'text-emerald-400' : 'text-rose-400',
        detail: data.repository.has_tests ? 'Targeted test protection verified' : 'No automated tests detected',
        link: '/testing',
      },
      {
        name: 'Delivery Gates',
        score: 94,
        status: 'Passing',
        statusColor: 'text-emerald-400',
        detail: 'Canary SLA & rollback targets active',
        link: '/deployments',
      },
      {
        name: 'Runtime Telemetry',
        score: 78,
        status: 'Anomaly Detected',
        statusColor: 'text-amber-400',
        detail: 'HTTP 504 drift on payment worker',
        link: '/operations',
      },
      {
        name: 'Security & Risks',
        score: Math.max(30, 100 - criticalRisksCount * 25),
        status: criticalRisksCount > 0 ? 'Critical Risks' : 'Clear',
        statusColor: criticalRisksCount > 0 ? 'text-rose-400' : 'text-emerald-400',
        detail: `${criticalRisksCount} critical · ${warningsCount} warnings`,
        link: '/reviews',
      },
    ]
  }, [data, criticalRisksCount, warningsCount])

  // Attention Queue (Prioritized by Severity * Confidence * Recency * Affected Surface)
  const attentionQueue = useMemo(() => {
    if (!data) return []
    return [
      {
        id: 'att-1',
        title: 'Active Incident P2: Checkout Timeout & HTTP 504 Surge',
        severity: 'CRITICAL',
        surface: 'payment-service (3 downstreams)',
        reason: 'Correlated directly with Deploy #284 (PaymentClient.authorize)',
        link: '/incidents/inc-402',
        tag: 'Active Outage',
        tagColor: 'bg-rose-950/40 text-rose-300 border-rose-500/30',
      },
      {
        id: 'att-2',
        title: '3 High-Risk Complexity Hotspots Detected in Core',
        severity: 'HIGH',
        surface: `${data.repository.name} Core Subsystem`,
        reason: 'Cyclomatic complexity exceeds threshold without regression tests',
        link: '/reviews',
        tag: 'Risk Delta',
        tagColor: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
      },
      {
        id: 'att-3',
        title: 'Untested Settlement Hook in PR #129',
        severity: 'HIGH',
        surface: 'OrderService.processOrder()',
        reason: 'Public API mutation affects checkout BFF and order events topic',
        link: '/impact/pr-129',
        tag: 'Blast Radius',
        tagColor: 'bg-violet-950/40 text-violet-300 border-violet-500/30',
      },
      {
        id: 'att-4',
        title: '2 Unverified Dependency Packages',
        severity: 'MEDIUM',
        surface: 'NPM Manifest',
        reason: 'Unpinned dependency licenses require enterprise compliance audit',
        link: '/integrations',
        tag: 'Integrations',
        tagColor: 'bg-sky-950/40 text-sky-300 border-sky-500/30',
      },
    ]
  }, [data])

  // Software Evolution Stages
  const evolutionStages = [
    { name: 'Commit', meta: 'sha:9f31a2b', status: 'pushed', link: '/timeline' },
    { name: 'Review', meta: 'PR #129 Approved', status: 'verified', link: '/reviews' },
    { name: 'Build', meta: 'Artifact #284', status: 'passed', link: '/workflows' },
    { name: 'Deploy', meta: 'Canary (5%)', status: 'active', link: '/deployments' },
    { name: 'Runtime', meta: 'P95 Latency 410ms', status: 'drift', link: '/operations' },
    { name: 'Incident', meta: 'INC-402 (Active)', status: 'alert', link: '/incidents' },
  ]

  // Recent Intelligence Feed
  const recentIntelligence = [
    {
      type: 'PR #129 Impact Analysis',
      summary: 'Payment Settlement Pipeline refactor modifies 14 files across 3 services.',
      recommendation: 'Deploy with zero-downtime database migration & enable circuit breaker.',
      link: '/impact/pr-129',
      badge: 'High Blast Radius',
    },
    {
      type: 'Incident Root Cause Hypothesis',
      summary: 'Payment partner upstream latency matched with zero-jitter retry loop in worker.',
      recommendation: 'Configure exponential backoff and reduce socket timeout to 4000ms.',
      link: '/incidents/inc-402',
      badge: 'Causality Trace',
    },
  ]

  const domainPillars = useMemo(() => {
    if (!data) return []
    return [
      {
        domain: 'UNDERSTAND',
        title: 'Cognitive Software Model',
        detail: 'Explore semantic intelligence, AST graph topology, and domain bounded contexts.',
        icon: Brain,
        color: 'from-violet-500/20 to-indigo-500/20 text-violet-400 border-violet-500/30',
        links: [
          { label: 'AI Intelligence', href: '/intelligence', count: 'Grounded AI' },
          { label: 'Software Graph', href: '/graph', count: `${data.repository.files} nodes` },
          { label: 'Architecture', href: '/architecture', count: `${data.architecture?.layers?.length || 3} layers` },
          { label: 'Entity 360', href: '/entities', count: '360°' },
        ],
      },
      {
        domain: 'EVOLVE',
        title: 'Change Blast Radius',
        detail: 'Trace causality, commit evolutions, and multi-hop impact before merging.',
        icon: Waypoints,
        color: 'from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30',
        links: [
          { label: 'Change Impact', href: '/impact', count: `${totalRisks} hotspots` },
          { label: 'Evolution Stream', href: '/changes', count: 'Live' },
          { label: 'Unified Timeline', href: '/timeline', count: 'Events' },
        ],
      },
      {
        domain: 'ACT',
        title: 'Lifecycle Workspaces',
        detail: '7-stage architecture planning, system-level reviews, and deployment gates.',
        icon: Rocket,
        color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
        links: [
          { label: 'Architecture Planning', href: '/planning', count: '7-Stage' },
          { label: 'System Code Review', href: '/reviews', count: 'System' },
          { label: 'Test Intelligence', href: '/testing', count: data.repository.has_tests ? 'Verified' : 'Required' },
          { label: 'Deployment Gates', href: '/deployments', count: '4 Gates' },
        ],
      },
      {
        domain: 'OPERATE',
        title: 'Telemetry & Incident Correlation',
        detail: 'Correlate runtime error spikes, telemetry drift, and incidents back to AST code.',
        icon: Activity,
        color: 'from-red-500/20 to-amber-500/20 text-red-400 border-red-500/30',
        links: [
          { label: 'Runtime Observability', href: '/operations', count: 'Drift' },
          { label: 'Incident Workspace', href: '/incidents', count: '1 Active' },
        ],
      },
    ]
  }, [data, totalRisks])

  if (status === 'analyzing') {
    return (
      <LoadingState
        title="Analyzing Repository Snapshot"
        hint="Constructing software model, AST topology, dependency health, and risk vectors..."
      />
    )
  }

  if (!data) {
    return <EmptyDashboardState />
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Repository analysis warning" description={error} />}

      {/* 1. SYSTEM LAUNCHPAD CONTEXT & ASK BAR (08_DASHBOARD_LAUNCHPAD.md) */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold uppercase tracking-wider text-violet-400">
                {data.repository.owner} / {data.repository.name}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                ● Healthy
              </span>
              <span className="text-zinc-600">·</span>
              <span className="font-mono text-[11px] text-zinc-400">
                Snapshot sha:9f31a2b · synced 42s ago
              </span>
            </div>
            <h1 className="mt-1 font-mono text-xl font-bold tracking-tight text-white">
              System Mission Control & Launchpad
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/impact"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/[0.06]"
            >
              <Waypoints className="size-3.5 text-sky-400" />
              Compare
            </Link>
            <button
              type="button"
              onClick={openAnalyzeModal}
              className="neo-accent inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/20"
            >
              <Play className="size-3.5 fill-current" />
              Analyze
            </button>
          </div>
        </div>

        {/* Ask Bar with context-aware suggestions */}
        <div className="mt-4">
          <form onSubmit={handleAskSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-violet-400" />
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="Ask CodeScope anything about software architecture, blast radius, or root causes..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-28 py-2.5 text-xs text-white placeholder-zinc-500 transition focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500"
            >
              <span>Ask AI</span>
              <ArrowRight className="size-3" />
            </button>
          </form>

          {/* Context-aware suggestions */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Suggestions:
            </span>
            {[
              'What changed since yesterday?',
              'Why is checkout high risk?',
              'Show risky services.',
              'What will this PR affect?',
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-zinc-400 transition hover:border-violet-500/40 hover:text-zinc-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SYSTEM PULSE & ATTENTION QUEUE 2-COLUMN SPLIT (08_DASHBOARD_LAUNCHPAD.md) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SYSTEM PULSE */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-violet-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                System Pulse
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400">Non-collapsed dimension scores</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {systemPulseDimensions.map((dim) => (
              <Link
                key={dim.name}
                to={dim.link}
                className="group flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition hover:border-violet-500/40 hover:bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      {dim.name}
                    </span>
                    <span className="font-mono text-sm font-bold text-violet-300">
                      {dim.score}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400 leading-snug">{dim.detail}</p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2 text-[10px]">
                  <span className={`font-semibold ${dim.statusColor}`}>{dim.status}</span>
                  <span className="inline-flex items-center gap-1 text-zinc-500 group-hover:text-violet-400">
                    Evidence <ChevronRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ATTENTION QUEUE */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-rose-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Attention Queue
              </h2>
            </div>
            <span className="font-mono text-[10px] text-zinc-400">
              Ranked by severity × confidence × surface
            </span>
          </div>

          <div className="space-y-2.5">
            {attentionQueue.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-violet-500/40 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase border ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">{item.surface}</span>
                </div>
                <h4 className="mt-1 text-xs font-semibold text-zinc-200 group-hover:text-white">
                  {item.title}
                </h4>
                <p className="mt-0.5 text-[11px] text-zinc-400 leading-snug">{item.reason}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 3. SOFTWARE EVOLUTION STREAM PIPELINE (08_DASHBOARD_LAUNCHPAD.md) */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="size-4 text-sky-400" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              Software Evolution Pipeline
            </h2>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">
            commit → review → build → deploy → runtime → incident
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {evolutionStages.map((stage, idx) => (
            <Link
              key={stage.name}
              to={stage.link}
              className="group flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-violet-500/40 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-500">0{idx + 1}</span>
                <span
                  className={`size-2 rounded-full ${
                    stage.status === 'alert'
                      ? 'bg-rose-400 animate-pulse'
                      : stage.status === 'drift'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                  }`}
                />
              </div>
              <div className="mt-2">
                <span className="font-mono text-xs font-bold text-zinc-200 group-hover:text-violet-300">
                  {stage.name}
                </span>
                <p className="text-[10px] text-zinc-400 truncate">{stage.meta}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. RECENT INTELLIGENCE FEED & CONTINUITY (08_DASHBOARD_LAUNCHPAD.md) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* RECENT INTELLIGENCE */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Brain className="size-4 text-violet-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Recent Intelligence
              </h2>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">
              change → impact → evidence → recommendation
            </span>
          </div>

          <div className="space-y-3">
            {recentIntelligence.map((intel, idx) => (
              <Link
                key={idx}
                to={intel.link}
                className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition hover:border-violet-500/40 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-violet-300">
                    {intel.type}
                  </span>
                  <span className="rounded bg-violet-950/60 border border-violet-500/30 px-1.5 py-0.5 font-mono text-[9px] text-violet-300">
                    {intel.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-300 leading-snug">{intel.summary}</p>
                <p className="mt-1 text-[11px] text-zinc-400 italic">
                  <strong>Recommendation:</strong> {intel.recommendation}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* CONTINUE WHERE YOU LEFT OFF */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <History className="size-4 text-emerald-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Continue Where You Left Off
              </h2>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">Session continuity</span>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/entities"
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-violet-500/40 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="size-4 text-violet-400" />
                <div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">
                    Last Entity Inspected: {data.repository.name} Core Service
                  </span>
                  <p className="text-[10px] text-zinc-400">Entity 360 Workspace · 14 Grounded Evidence</p>
                </div>
              </div>
              <ArrowRight className="size-3.5 text-zinc-500" />
            </Link>

            <Link
              to="/impact/pr-129"
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-violet-500/40 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2.5">
                <Waypoints className="size-4 text-sky-400" />
                <div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">
                    Last Blast Radius: PR #129 Payment Pipeline
                  </span>
                  <p className="text-[10px] text-zinc-400">Multi-Hop Impact Graph · 3 Services</p>
                </div>
              </div>
              <ArrowRight className="size-3.5 text-zinc-500" />
            </Link>

            <Link
              to="/intelligence?q=Explain+cyclomatic+complexity+hotspots"
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-violet-500/40 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-4 text-amber-400" />
                <div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">
                    Last Investigation: Complexity Hotspots
                  </span>
                  <p className="text-[10px] text-zinc-400">AI Intelligence Console · AST Evidence Grounded</p>
                </div>
              </div>
              <ArrowRight className="size-3.5 text-zinc-500" />
            </Link>
          </div>
        </section>
      </div>

      {/* 5. 4 COGNITIVE DOMAINS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-violet-400" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-200">
              Cognitive Domain Workspaces
            </h2>
          </div>
          <span className="text-xs text-zinc-500">V3 Connected Architecture</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domainPillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.domain}
                className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-xl backdrop-blur-xl transition hover:border-violet-500/30"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-300 uppercase">
                      {pillar.domain}
                    </span>
                    <div className={`flex size-7 items-center justify-center rounded-lg border bg-gradient-to-br ${pillar.color}`}>
                      <Icon className="size-3.5" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-mono text-sm font-bold text-zinc-100">{pillar.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{pillar.detail}</p>
                </div>

                {/* Sub-links */}
                <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3">
                  {pillar.links.map((link, lIdx) => (
                    <Link
                      key={lIdx}
                      to={link.href}
                      className="group flex items-center justify-between rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-100"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                      <span className="rounded bg-white/[0.04] px-1.5 py-0.2 font-mono text-[10px] text-zinc-500 group-hover:text-violet-400">
                        {link.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
