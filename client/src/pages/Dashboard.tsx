import { useMemo } from 'react'
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
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Layers,
  Network,
  Play,
  Rocket,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube2,
  Waypoints,
  Workflow,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyDashboardState } from '../components/dashboard/EmptyDashboardState'
import { RepositoryHeader } from '../components/dashboard/RepositoryHeader'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { LoadingState, ErrorState } from '../components/shared/StatusPanels'

export function Dashboard() {
  const { data, error, status } = useRepositoryAnalysis()

  const criticalRisksCount = data?.risks.critical?.length ?? 0
  const warningsCount = data?.risks.warnings?.length ?? 0
  const totalRisks = criticalRisksCount + warningsCount

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
          { label: 'Architecture', href: '/architecture', count: `${data.architecture.layers?.length || 3} layers` },
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

  const prioritizedActions = useMemo(() => {
    if (!data) return []
    return [
      criticalRisksCount > 0
        ? {
            title: 'Remediate Critical Risk Hotspots',
            detail: `${criticalRisksCount} critical complexity and security findings identified in current snapshot`,
            href: '/reviews',
            icon: ShieldAlert,
            badge: 'Critical',
            badgeTone: 'text-red-300 border-red-500/40 bg-red-950/40',
            actionText: 'Review Findings',
          }
        : null,
      !data.repository.has_tests
        ? {
            title: 'Establish Targeted Test Harness',
            detail: 'No automated tests detected safeguarding critical execution paths',
            href: '/testing',
            icon: TestTube2,
            badge: 'Action Required',
            badgeTone: 'text-amber-300 border-amber-500/40 bg-amber-950/40',
            actionText: 'Generate Specs',
          }
        : null,
      {
        title: 'Review Change Blast Radius for PR #129',
        detail: 'Multi-hop impact detected across 3 services, public APIs, and settlement schema',
        href: '/impact',
        icon: Waypoints,
        badge: 'Blast Radius',
        badgeTone: 'text-violet-300 border-violet-500/40 bg-violet-950/40',
        actionText: 'Inspect Radius',
      },
      {
        title: 'Generate Architectural Refactoring Plan',
        detail: 'Convert layer boundary leaks into a prioritized 7-stage implementation roadmap',
        href: '/planning',
        icon: BookOpen,
        badge: 'Planning',
        badgeTone: 'text-sky-300 border-sky-500/40 bg-sky-950/40',
        actionText: 'Create Plan',
      },
    ].filter(Boolean) as {
      title: string
      detail: string
      href: string
      icon: any
      badge: string
      badgeTone: string
      actionText: string
    }[]
  }, [data, criticalRisksCount])

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

      {/* Repository Snapshot Header */}
      <RepositoryHeader repository={data.repository} />

      {/* Operational Incident & Telemetry Alert Ribbon */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-zinc-900/90 to-zinc-950 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
            <Flame className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-red-300">INCIDENT ACTIVE (P2)</span>
              <span className="text-xs text-zinc-500">·</span>
              <p className="text-xs font-semibold text-zinc-200">
                Checkout Gateway Timeout & 504 Surge correlated with Deploy #284
              </p>
            </div>
            <p className="text-[11px] text-zinc-400">
              Correlated to <code className="font-mono text-violet-300">PaymentClient.authorize()</code> in commit <code className="font-mono text-sky-400">9f31a2b</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            to="/incidents"
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-red-600/30 transition hover:bg-red-500"
          >
            <span>Diagnose Root Cause</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Cognitive Domains Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-violet-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
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
                className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md transition hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-300 uppercase">
                      {pillar.domain}
                    </span>
                    <div className={`flex size-7 items-center justify-center rounded-lg border bg-gradient-to-br ${pillar.color}`}>
                      <Icon className="size-3.5" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-zinc-100">{pillar.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{pillar.detail}</p>
                </div>

                {/* Sub-links */}
                <div className="mt-4 space-y-1.5 border-t border-zinc-800/60 pt-3">
                  {pillar.links.map((link, lIdx) => (
                    <Link
                      key={lIdx}
                      to={link.href}
                      className="group flex items-center justify-between rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-100"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                      <span className="rounded bg-zinc-800/80 px-1.5 py-0.2 font-mono text-[10px] text-zinc-500 group-hover:text-violet-400">
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

      {/* Prioritized AI Action Feed */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-400" />
            <h3 className="text-base font-bold text-zinc-100">Prioritized Engineering Actions</h3>
          </div>
          <span className="text-xs text-zinc-500">Ranked by risk reduction leverage</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {prioritizedActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-3 transition hover:border-violet-500/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${action.badgeTone}`}>
                      {action.badge}
                    </span>
                    <Icon className="size-4 text-zinc-500" />
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-zinc-100">{action.title}</h4>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{action.detail}</p>
                </div>

                <div className="border-t border-zinc-800/60 pt-2 flex justify-end">
                  <Link
                    to={action.href}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-400 transition hover:text-violet-300"
                  >
                    <span>{action.actionText}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
