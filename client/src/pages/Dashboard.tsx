import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Cpu, FileCode2, GitBranch, Layers, Rocket, ShieldAlert, Sparkles, TestTube, Waypoints, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyDashboardState } from '../components/dashboard/EmptyDashboardState'
import { RepositoryHeader } from '../components/dashboard/RepositoryHeader'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { LoadingState } from '../components/shared/StatusPanels'

export function Dashboard() {
  const { data, error, status } = useRepositoryAnalysis()

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing repository snapshot" hint="Extracting software model, architecture, risks, and dependency health" />
  }

  if (!data) {
    return <EmptyDashboardState />
  }

  const criticalRisksCount = data.risks.critical?.length ?? 0
  const warningsCount = data.risks.warnings?.length ?? 0
  const totalRisks = criticalRisksCount + warningsCount

  const lifecycleStages = [
    { label: 'Source Model', status: 'Indexed', detail: `${data.repository.files.toLocaleString()} files`, href: '/repository/explore', icon: FileCode2, ready: true },
    { label: 'Architecture', status: data.dna.architecture || 'Pattern Mapped', detail: `${data.architecture.layers?.length ?? 1} layers detected`, href: '/architecture', icon: Layers, ready: true },
    { label: 'Changes & Timeline', status: 'Baseline Active', detail: 'Snapshot baseline set', href: '/changes', icon: GitBranch, ready: true },
    { label: 'Impact Analysis', status: `${totalRisks} Risk Hotspots`, detail: 'Blast radius mapped', href: '/impact', icon: Waypoints, ready: true },
    { label: 'Reviews & Plans', status: 'Remediation Ready', detail: 'Acceptance checklist active', href: '/planning', icon: BookOpen, ready: true },
    { label: 'Delivery & Runtime', status: 'Preflight Verified', detail: 'Deployment contract ready', href: '/deployment', icon: Rocket, ready: true },
  ]

  const prioritizedActions = [
    criticalRisksCount > 0 ? {
      title: 'Review Critical Vulnerabilities',
      detail: `${criticalRisksCount} critical risk signals detected in analyzer run`,
      href: '/reviews',
      icon: ShieldAlert,
      badge: 'Critical',
      badgeTone: 'text-red-400 border-red-800/50 bg-red-950/40',
    } : null,
    !data.repository.has_tests ? {
      title: 'Configure Test Suite & Coverage',
      detail: 'No automated tests detected in repository structure',
      href: '/testing',
      icon: TestTube,
      badge: 'Action Required',
      badgeTone: 'text-amber-400 border-amber-800/50 bg-amber-950/40',
    } : null,
    {
      title: 'Inspect Architectural Complexity Hotspots',
      detail: `${data.risks.complexity_hotspots?.length ?? 0} complex modules identified`,
      href: '/architecture',
      icon: Layers,
      badge: 'Architecture',
      badgeTone: 'text-violet-400 border-violet-800/50 bg-violet-950/40',
    },
    {
      title: 'Create Engineering Delivery Plan',
      detail: 'Convert flagged repository issues into actionable plan steps',
      href: '/planning',
      icon: BookOpen,
      badge: 'Planning',
      badgeTone: 'text-sky-400 border-sky-800/50 bg-sky-950/40',
    },
  ].filter(Boolean)

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Repository Snapshot Header */}
      <RepositoryHeader repository={data.repository} />

      {/* Software Intelligence Lifecycle Chain */}
      <section className="neo-flat p-5">
        <div className="flex flex-col justify-between gap-2 border-b border-zinc-800/70 pb-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-violet-400">Software Model & Lifecycle Progression</p>
            <h2 className="mt-0.5 text-sm font-semibold text-zinc-200">Continuous Software Intelligence Flow</h2>
          </div>
          <span className="neo-pressed px-2.5 py-1 text-[10px] font-mono text-zinc-400">
            End-to-End Connected
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {lifecycleStages.map((stage) => {
            const Icon = stage.icon
            return (
              <Link
                key={stage.label}
                to={stage.href}
                className="neo-pressed flex flex-col justify-between p-3.5 transition hover:ring-1 hover:ring-violet-500/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Icon className="size-4 text-violet-400" />
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                  </div>
                  <h3 className="mt-3 text-xs font-semibold text-zinc-200">{stage.label}</h3>
                  <p className="mt-1 text-[10px] text-zinc-500">{stage.detail}</p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-800/50 pt-2 text-[10px]">
                  <span className="text-zinc-400">{stage.status}</span>
                  <ArrowRight className="size-3 text-zinc-600" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Core KPI Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="neo-flat p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Repository Health</span>
            <span className="neo-pressed px-2 py-0.5 text-[9px] font-mono text-emerald-400">Verified</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-emerald-400">{data.health.score}/100</p>
          <p className="mt-1 text-[11px] text-zinc-500">{data.health.status}</p>
        </div>

        <div className="neo-flat p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Analyzed Surface</span>
            <span className="neo-pressed px-2 py-0.5 text-[9px] font-mono text-sky-400">{data.repository.primary_language}</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-zinc-200">{data.repository.files.toLocaleString()} files</p>
          <p className="mt-1 text-[11px] text-zinc-500">{data.repository.lines_of_code.toLocaleString()} lines of code</p>
        </div>

        <div className="neo-flat p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Risk Signals</span>
            <span className={`neo-pressed px-2 py-0.5 text-[9px] font-mono ${criticalRisksCount > 0 ? 'text-red-400' : 'text-amber-400'}`}>
              {criticalRisksCount} Critical
            </span>
          </div>
          <p className={`mt-2 font-mono text-2xl font-bold ${totalRisks > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {totalRisks}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">{warningsCount} warnings flagged</p>
        </div>

        <div className="neo-flat p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Dependencies</span>
            <span className="neo-pressed px-2 py-0.5 text-[9px] font-mono text-violet-400">{data.dependency_health.package_manager || 'Managed'}</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-zinc-200">{data.dependency_health.total_dependencies}</p>
          <p className="mt-1 text-[11px] text-zinc-500">{data.dependency_health.healthy?.length ?? 0} healthy verified</p>
        </div>
      </div>

      {/* Prioritized Action Matrix & Quick Handoffs */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        {/* Action Matrix */}
        <section className="neo-flat p-5">
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-violet-400">Prioritized Action Items</p>
              <h2 className="mt-0.5 text-sm font-semibold text-zinc-200">Engineered Recommendations</h2>
            </div>
            <Link to="/planning" className="text-xs text-violet-400 hover:text-violet-300">
              View all plans →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {prioritizedActions.map((action) => {
              if (!action) return null
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="neo-pressed flex items-start justify-between gap-3 p-3.5 transition hover:ring-1 hover:ring-violet-500/50"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="neo-convex mt-0.5 grid size-7 shrink-0 place-items-center rounded-md">
                      <Icon className="size-3.5 text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider ${action.badgeTone}`}>
                          {action.badge}
                        </span>
                        <p className="truncate text-xs font-semibold text-zinc-200">{action.title}</p>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-500">{action.detail}</p>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 size-3.5 shrink-0 text-zinc-600" />
                </Link>
              )
            })}
          </div>
        </section>

        {/* Domain Navigation Matrix */}
        <section className="neo-flat flex flex-col justify-between p-5">
          <div>
            <div className="border-b border-zinc-800/70 pb-4">
              <p className="text-[10px] uppercase tracking-wider text-violet-400">Domain Hubs</p>
              <h2 className="mt-0.5 text-sm font-semibold text-zinc-200">Quick Navigation</h2>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <Link to="/repository/explore" className="neo-pressed flex items-center justify-between p-2.5 text-zinc-300 hover:text-white">
                <span className="flex items-center gap-2"><FileCode2 className="size-3.5 text-sky-400" />Source Explorer</span>
                <ArrowRight className="size-3 text-zinc-600" />
              </Link>
              <Link to="/architecture" className="neo-pressed flex items-center justify-between p-2.5 text-zinc-300 hover:text-white">
                <span className="flex items-center gap-2"><Layers className="size-3.5 text-violet-400" />Architecture & Constellation</span>
                <ArrowRight className="size-3 text-zinc-600" />
              </Link>
              <Link to="/impact" className="neo-pressed flex items-center justify-between p-2.5 text-zinc-300 hover:text-white">
                <span className="flex items-center gap-2"><Waypoints className="size-3.5 text-sky-400" />Blast Radius & Impact</span>
                <ArrowRight className="size-3 text-zinc-600" />
              </Link>
              <Link to="/reviews" className="neo-pressed flex items-center justify-between p-2.5 text-zinc-300 hover:text-white">
                <span className="flex items-center gap-2"><ShieldAlert className="size-3.5 text-amber-400" />Code Review Intelligence</span>
                <ArrowRight className="size-3 text-zinc-600" />
              </Link>
              <Link to="/workflows" className="neo-pressed flex items-center justify-between p-2.5 text-zinc-300 hover:text-white">
                <span className="flex items-center gap-2"><Workflow className="size-3.5 text-emerald-400" />Pipelines & CI/CD</span>
                <ArrowRight className="size-3 text-zinc-600" />
              </Link>
              <Link to="/deployment" className="neo-pressed flex items-center justify-between p-2.5 text-zinc-300 hover:text-white">
                <span className="flex items-center gap-2"><Rocket className="size-3.5 text-sky-400" />Deployment Readiness</span>
                <ArrowRight className="size-3 text-zinc-600" />
              </Link>
            </div>
          </div>

          <div className="mt-4 border-t border-zinc-800/70 pt-3">
            <Link to="/chat" className="neo-accent flex items-center justify-between p-2.5 text-xs font-medium text-white">
              <span className="flex items-center gap-2"><Sparkles className="size-3.5" />Ask CodeScope AI</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
