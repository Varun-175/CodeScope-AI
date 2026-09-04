import { useState, useMemo } from 'react'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  GitCommitHorizontal,
  GitPullRequest,
  Layers,
  Network,
  Radio,
  RefreshCw,
  RotateCcw,
  Rocket,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Waypoints,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

interface TelemetryDriftItem {
  id: string
  title: string
  service: string
  changeIntent: string
  expectedOutcome: string
  observedOutcome: string
  driftSeverity: 'critical' | 'warning' | 'nominal'
  metric: string
  delta: string
  correlation: {
    deploymentId: string
    commitHash: string
    commitAuthor: string
    symbol: string
    filePath: string
  }
  hypotheses: string[]
}

const SAMPLE_DRIFTS: TelemetryDriftItem[] = [
  {
    id: 'drift-1',
    title: 'Payment Gateway Authorization Timeout & Latency Spike',
    service: 'payment-service (Billing)',
    changeIntent: 'Payment API timeout extended from 5s → 8s to accommodate 3DS failover',
    expectedOutcome: 'P95 latency stable (< 220ms), zero increase in socket timeouts',
    observedOutcome: 'P95 latency surged +41% (385ms), socket exhaustion on downstream worker pools',
    driftSeverity: 'critical',
    metric: 'P95 Latency',
    delta: '+41% (385ms)',
    correlation: {
      deploymentId: 'Deploy #284',
      commitHash: '9f31a2b',
      commitAuthor: 'alex-chen',
      symbol: 'PaymentClient.authorize()',
      filePath: 'src/clients/payment.client.ts',
    },
    hypotheses: [
      'Downstream payment partner experiencing upstream latency degradation',
      'Worker pool retry amplification without exponential backoff jitter',
      'PostgreSQL connection pool saturation during authorization wait states',
    ],
  },
  {
    id: 'drift-2',
    title: 'Order Status Query Read-Amplification',
    service: 'order-service (Commerce)',
    changeIntent: 'Added real-time settlement status polling for checkout frontend',
    expectedOutcome: 'Cache hit ratio > 95% on Redis layer',
    observedOutcome: 'Cache miss rate spiked +18%, increasing PostgreSQL read IOPs',
    driftSeverity: 'warning',
    metric: 'Cache Miss Rate',
    delta: '+18%',
    correlation: {
      deploymentId: 'Deploy #282',
      commitHash: '4e81c09',
      commitAuthor: 'sarah-dev',
      symbol: 'OrderCache.getStatus()',
      filePath: 'src/cache/order.cache.ts',
    },
    hypotheses: [
      'Missing cache key normalization for guest checkout sessions',
      'Redis TTL expiration race condition during high-concurrency windows',
    ],
  },
]

export function Observability() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDriftId, setSelectedDriftId] = useState<string>('drift-1')

  const selectedDrift = SAMPLE_DRIFTS.find((d) => d.id === selectedDriftId) || SAMPLE_DRIFTS[0]

  if (status === 'analyzing') {
    return <LoadingState title="Loading Operations Correlation" hint="Synthesizing telemetry baselines, deployment links, and drift vectors..." />
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Telemetry connection alert" description="Showing cached operational correlation and drift baselines." />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 ring-1 ring-sky-500/30">
              <Activity className="size-5 text-sky-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Operations & Runtime Correlation</h1>
                <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
                  V3 Correlation Layer
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Correlate live telemetry, error anomalies, and runtime regressions back to commits, AST symbols, and deployments.
              </p>
            </div>
          </div>
        </div>

        {/* Live System Health Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PRODUCTION: Nominal</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
            <Server className="size-3.5 text-sky-400" />
            <span>12 Healthy · 1 Degraded</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
            <AlertTriangle className="size-3.5 text-amber-400" />
            <span>2 Drifts Detected</span>
          </div>
        </div>
      </header>

      {/* High-Level Overview Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Service Mesh</span>
            <Server className="size-4 text-sky-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-zinc-100">13 Services</p>
          <p className="mt-1 text-[11px] text-zinc-400">1 degraded in checkout domain</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Deployments</span>
            <Rocket className="size-4 text-violet-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-zinc-100">3 Today</p>
          <p className="mt-1 text-[11px] text-zinc-400">Latest: Deploy #284 (2h ago)</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Active Incidents</span>
            <AlertOctagon className="size-4 text-red-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-red-300">1 Active</p>
          <p className="mt-1 text-[11px] text-zinc-400">P2: Checkout error rate spike</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Telemetry Health</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-emerald-300">99.92%</p>
          <p className="mt-1 text-[11px] text-zinc-400">SLO error budget: 78% remaining</p>
        </div>
      </div>

      {/* Flagship View: EXPECTED VS OBSERVED Drift Analysis */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/80 pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-400" />
              <h2 className="text-base font-bold text-zinc-100">Expected vs Observed Telemetry Drift</h2>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              Correlating intent of recent code changes with actual runtime telemetry variance.
            </p>
          </div>

          {/* Drift Scenario Selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
            {SAMPLE_DRIFTS.map((drift) => (
              <button
                key={drift.id}
                type="button"
                onClick={() => setSelectedDriftId(drift.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedDriftId === drift.id
                    ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{drift.service.split(' ')[0]}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                    drift.driftSeverity === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {drift.delta}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Drift Deep-Dive Card */}
        <div className="mt-5 space-y-6">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-zinc-200">{selectedDrift.title}</h3>
              <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300">
                {selectedDrift.service}
              </span>
            </div>

            {/* Comparison Columns: Intent vs Expected vs Observed */}
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">1. CHANGE INTENT</span>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">{selectedDrift.changeIntent}</p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">2. EXPECTED</span>
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-emerald-200/90">{selectedDrift.expectedOutcome}</p>
              </div>

              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">3. OBSERVED DRIFT</span>
                  <Flame className="size-3.5 text-red-400" />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-red-200/90">{selectedDrift.observedOutcome}</p>
              </div>
            </div>

            {/* Code Correlation Anchor */}
            <div className="mt-4 rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
              <div className="flex items-center gap-2">
                <GitCommitHorizontal className="size-4 text-sky-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Root Engineering Correlation
                </h4>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500">Trigger Deployment</span>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-zinc-200">{selectedDrift.correlation.deploymentId}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-zinc-500">Introducing Commit</span>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-sky-400">{selectedDrift.correlation.commitHash}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-zinc-500">Modified Symbol</span>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-violet-300">{selectedDrift.correlation.symbol}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-zinc-500">File Path</span>
                  <p className="mt-0.5 font-mono text-xs text-zinc-400 truncate">{selectedDrift.correlation.filePath}</p>
                </div>
              </div>
            </div>

            {/* Hypotheses Matrix */}
            <div className="mt-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Plausible Root-Cause Hypotheses (Ranked by AI)
              </span>
              <div className="space-y-1.5">
                {selectedDrift.hypotheses.map((hypo, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2.5 text-xs text-zinc-300">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-mono text-[9px] font-bold text-zinc-400">
                      {idx + 1}
                    </span>
                    <span>{hypo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Triggers */}
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-800/80 pt-4">
              <Link
                to={`/intelligence?q=Explain+telemetry+drift+in+${encodeURIComponent(selectedDrift.service)}`}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
              >
                <Brain className="size-3.5" />
                Investigate with AI
              </Link>
              <Link
                to="/impact"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
              >
                <Waypoints className="size-3.5 text-sky-400" />
                Calculate Blast Radius
              </Link>
              <Link
                to="/deployments"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
              >
                <RotateCcw className="size-3.5 text-amber-400" />
                Inspect Rollback Target
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
