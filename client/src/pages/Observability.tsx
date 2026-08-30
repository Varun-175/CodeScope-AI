import { Activity, AlertTriangle, BarChart3, Container, Radio, TrendingUp, Zap } from 'lucide-react'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

export function Observability() {
  const { data, error, status } = useRepositoryAnalysis()

  if (status === 'analyzing') {
    return <LoadingState title="Preparing observability workspace" hint="Waiting for repository analysis signals" />
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {error ? <ErrorState title="Analysis failed" description={error} /> : null}
        <EmptyState
        title="Connect a repository to inspect observability"
        description="Runtime metrics, logs, and traces will appear here after an observability provider is configured."
        icon={Radio}
        />
      </div>
    )
  }

  const metrics = [
    {
      label: 'Source surface',
      value: data.repository.lines_of_code.toLocaleString(),
      detail: 'lines analyzed',
      icon: BarChart3,
      color: 'text-sky-400',
    },
    {
      label: 'Risk signals',
      value: `${data.risks.critical.length + data.risks.warnings.length}`,
      detail: 'current snapshot',
      icon: AlertTriangle,
      color: 'text-amber-400',
    },
    {
      label: 'Health',
      value: `${data.health.score}/100`,
      detail: data.health.status,
      icon: Activity,
      color: 'text-emerald-400',
    },
  ]

  const healthIndicators = [
    {
      label: 'Dependency health',
      value: `${data.dependency_health.healthy?.length ?? 0} healthy`,
      detail: `${data.dependency_health.unknown?.length ?? 0} unknown`,
      icon: Zap,
      tone: data.dependency_health.healthy && data.dependency_health.healthy.length > 0 ? 'emerald' : 'amber',
    },
    {
      label: 'Test coverage',
      value: data.repository.has_tests ? 'Detected' : 'Not detected',
      detail: data.repository.has_tests ? `${data.repository.parsed_files} parseable files` : 'Add test suite for runtime validation',
      icon: Container,
      tone: data.repository.has_tests ? 'emerald' : 'zinc',
    },
    {
      label: 'Documentation',
      value: data.repository.readme ? 'README found' : 'No README',
      detail: data.repository.readme ? 'Setup docs available' : 'Add repository documentation',
      icon: TrendingUp,
      tone: data.repository.readme ? 'emerald' : 'zinc',
    },
  ]

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-5">
      {error ? <ErrorState title="Latest analysis failed" description="Showing the last completed analysis. Run another analysis to refresh these signals." /> : null}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="size-5 text-sky-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Observability</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Runtime workspace for {data.repository.owner}/{data.repository.name}.</p>
        </div>
        <span className="neo-pressed px-3 py-2 text-[10px] text-zinc-500">Provider not configured</span>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map(({ label, value, detail, icon: Icon, color }) => (
          <div key={label} className="neo-flat p-4">
            <div className="flex items-center gap-2">
              <Icon className={`size-4 ${color}`} aria-hidden="true" />
              <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold text-zinc-200">{value}</p>
            <p className="mt-1 text-[10px] text-zinc-600">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {healthIndicators.map(({ label, value, detail, icon: Icon, tone }) => {
          const toneColor =
            tone === 'emerald'
              ? 'border-emerald-900/30 bg-emerald-950/20'
              : tone === 'amber'
                ? 'border-amber-900/30 bg-amber-950/20'
                : 'border-zinc-800/70 bg-zinc-900/40'
          return (
            <section key={label} className={`neo-flat border p-4 ${toneColor}`}>
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-zinc-500" aria-hidden="true" />
                <h3 className="text-sm font-medium text-zinc-200">{label}</h3>
              </div>
              <p className="mt-3 font-semibold text-zinc-100">{value}</p>
              <p className="mt-1 text-xs leading-4 text-zinc-500">{detail}</p>
            </section>
          )
        })}
      </div>

      <section className="neo-flat flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-zinc-800/70 p-4">
          <Radio className="size-4 text-zinc-500" aria-hidden="true" />
          <h2 className="text-sm font-medium text-zinc-200">Live telemetry</h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div>
            <Radio className="mx-auto size-7 text-zinc-700" aria-hidden="true" />
            <p className="mt-3 text-sm text-zinc-400">No runtime telemetry connected</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-600">
              Repository analysis can describe source risk, but it cannot prove production traffic, latency, logs, or service health.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
