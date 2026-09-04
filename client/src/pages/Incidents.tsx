import { useState, useMemo } from 'react'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
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
  History,
  Layers,
  Network,
  RotateCcw,
  Rocket,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Waypoints,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

interface IncidentCase {
  id: string
  title: string
  severity: 'P1' | 'P2' | 'P3'
  status: 'ACTIVE' | 'MITIGATING' | 'RESOLVED'
  startedAt: string
  duration: string
  serviceTree: {
    name: string
    role: string
    status: 'impacted' | 'degraded' | 'healthy'
  }[]
  timeline: {
    time: string
    label: string
    type: 'deploy' | 'metric' | 'spike' | 'alert'
    detail: string
  }[]
  evidence: {
    category: 'Runtime' | 'Deployment' | 'Source' | 'History'
    summary: string
    detail: string
  }[]
  hypotheses: {
    rank: number
    title: string
    confidence: 'High' | 'Medium' | 'Low'
    reasoning: string
  }[]
  codeTrace: {
    stackTrace: string
    symbol: string
    service: string
    deployment: string
    commit: string
  }
  priorIncidents: {
    title: string
    date: string
    rootCause: string
    resolution: string
  }[]
}

const SAMPLE_INCIDENTS: IncidentCase[] = [
  {
    id: 'inc-402',
    title: 'Checkout Gateway Timeout & 504 Gateway Error Surge',
    severity: 'P2',
    status: 'ACTIVE',
    startedAt: '14 minutes ago',
    duration: '14m',
    serviceTree: [
      { name: 'checkout-frontend (BFF)', role: 'Consumer entrypoint', status: 'impacted' },
      { name: 'payment-service', role: 'Payment authorization worker', status: 'degraded' },
      { name: 'order-service', role: 'Settlement state transition', status: 'healthy' },
    ],
    timeline: [
      { time: '14:22:00', label: 'Deployment #284 Completed', type: 'deploy', detail: 'Commit 9f31a2b pushed to production k8s cluster' },
      { time: '14:24:15', label: 'P95 Latency Drift Detected', type: 'metric', detail: 'Payment authorization p95 shifted from 180ms to 410ms' },
      { time: '14:27:30', label: 'HTTP 504 Timeout Spike', type: 'spike', detail: 'Checkout API error rate exceeded 1.2% threshold' },
      { time: '14:29:00', label: 'PagerDuty P2 Alert Fired', type: 'alert', detail: 'Triggered alert rule: checkout-slo-error-budget' },
    ],
    evidence: [
      { category: 'Runtime', summary: 'HTTP 504 surges on /v2/payments/charge', detail: 'APM spans show 8000ms socket timeouts against external billing partner' },
      { category: 'Deployment', summary: 'Deploy #284 introduced timeout extension', detail: 'Modified PaymentClient.ts configuration parameters' },
      { category: 'Source', summary: 'PaymentClient.authorize() missing backoff', detail: 'Immediate retry loop exhausts pool connections without delay' },
      { category: 'History', summary: 'Similar regression in Release 1.4 (INC-188)', detail: 'Previous socket exhaustion caused by unbuffered connection pool' },
    ],
    hypotheses: [
      {
        rank: 1,
        title: 'Payment Partner Upstream Latency with Aggressive Retry',
        confidence: 'High',
        reasoning: 'Spike in 8s socket waits matches external provider maintenance window combined with zero-jitter retry loop.',
      },
      {
        rank: 2,
        title: 'PostgreSQL Worker Connection Pool Saturation',
        confidence: 'Medium',
        reasoning: 'Active transactions hold idle connections while waiting for 3DS response timeout.',
      },
      {
        rank: 3,
        title: 'Kubernetes Ingress Proxy Timeout Mismatch',
        confidence: 'Low',
        reasoning: 'Ingress timeout configured at 5s drops connection before 8s backend response returns.',
      },
    ],
    codeTrace: {
      stackTrace: 'Error: GatewayTimeout at PaymentClient.authorize (src/clients/payment.client.ts:48:11)',
      symbol: 'PaymentClient.authorize()',
      service: 'payment-service',
      deployment: 'Deploy #284',
      commit: '9f31a2b',
    },
    priorIncidents: [
      {
        title: 'INC-188: Payment Gateway Outage During Black Friday',
        date: 'Nov 24, 2025',
        rootCause: 'Connection starvation due to long socket timeouts without circuit breaker',
        resolution: 'Configured circuit breaker threshold and reduced max timeout to 4s',
      },
    ],
  },
]

export function Incidents() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('inc-402')

  const activeIncident = SAMPLE_INCIDENTS.find((i) => i.id === selectedIncidentId) || SAMPLE_INCIDENTS[0]

  if (status === 'analyzing') {
    return <LoadingState title="Loading Incident Workspace" hint="Correlating stack traces, deployments, and root cause history..." />
  }

  return (
    <div className="space-y-6">
      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20 ring-1 ring-red-500/30">
              <AlertOctagon className="size-5 text-red-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Incident & Causality Workspace</h1>
                <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-red-300">
                  Root Cause Intelligence
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Trace active production incidents directly back through stack traces, AST symbols, commits, and historical regressions.
              </p>
            </div>
          </div>
        </div>

        {/* Severity Banner */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/40 px-3.5 py-1.5 text-xs font-bold text-red-300 shadow-md">
            <Flame className="size-3.5 text-red-400" />
            <span>1 ACTIVE INCIDENT ({activeIncident.severity})</span>
          </div>
        </div>
      </header>

      {/* Flagship Incident Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-zinc-900/90 to-zinc-950 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-red-300">
                {activeIncident.id.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-zinc-400">Started {activeIncident.startedAt}</span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-red-400 font-semibold">Duration: {activeIncident.duration}</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">{activeIncident.title}</h2>
          </div>

          {/* Quick Resolution Actions */}
          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <Link
              to={`/intelligence?q=Provide+root-cause+analysis+for+incident+${activeIncident.id}`}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
            >
              <Brain className="size-3.5" />
              Ask CodeScope AI
            </Link>
            <Link
              to="/impact"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <Waypoints className="size-3.5 text-sky-400" />
              Impact Blast Radius
            </Link>
            <Link
              to="/deployments"
              className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/30 px-3.5 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-900/40"
            >
              <RotateCcw className="size-3.5 text-red-400" />
              Rollback Deploy #284
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid: Impact Tree & Causality Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Impact Tree & Code Trace */}
        <div className="space-y-6">
          {/* Affected Services Hierarchy */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Network className="size-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Downstream Impact Tree</h3>
            </div>
            <div className="mt-4 space-y-2.5">
              {activeIncident.serviceTree.map((svc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-zinc-200">{svc.name}</span>
                    <p className="text-[11px] text-zinc-400">{svc.role}</p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      svc.status === 'impacted'
                        ? 'bg-red-500/20 text-red-300'
                        : svc.status === 'degraded'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Incident-to-Code Trace Path */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Terminal className="size-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Incident-to-Code Trace Pipeline</h3>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-red-400/90 overflow-x-auto">
              {activeIncident.codeTrace.stackTrace}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-2.5">
                <span className="text-[9px] font-semibold uppercase text-zinc-500">Target Symbol</span>
                <p className="mt-0.5 font-mono text-xs font-semibold text-violet-300 truncate">{activeIncident.codeTrace.symbol}</p>
              </div>
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-2.5">
                <span className="text-[9px] font-semibold uppercase text-zinc-500">Service</span>
                <p className="mt-0.5 font-mono text-xs font-semibold text-zinc-200">{activeIncident.codeTrace.service}</p>
              </div>
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-2.5">
                <span className="text-[9px] font-semibold uppercase text-zinc-500">Deployment</span>
                <p className="mt-0.5 font-mono text-xs font-semibold text-sky-400">{activeIncident.codeTrace.deployment}</p>
              </div>
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-2.5">
                <span className="text-[9px] font-semibold uppercase text-zinc-500">Commit</span>
                <p className="mt-0.5 font-mono text-xs font-semibold text-emerald-400">{activeIncident.codeTrace.commit}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Causality Timeline & Ranked Hypotheses */}
        <div className="space-y-6">
          {/* Causality Timeline */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Clock className="size-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Incident Causality Timeline</h3>
            </div>

            <div className="mt-4 relative pl-4">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-zinc-800" />
              <div className="space-y-3.5">
                {activeIncident.timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-3">
                    <div className="relative z-10 size-3 rounded-full border border-zinc-700 bg-zinc-900 shadow-sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500">{step.time}</span>
                        <span className="text-xs font-semibold text-zinc-200">{step.label}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-400">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Ranked Hypotheses */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Brain className="size-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Ranked Root Cause Hypotheses</h3>
            </div>

            <div className="mt-4 space-y-3">
              {activeIncident.hypotheses.map((hypo) => (
                <div key={hypo.rank} className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 font-mono text-[10px] font-bold text-white">
                        {hypo.rank}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-200">{hypo.title}</h4>
                    </div>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-semibold text-zinc-300">
                      {hypo.confidence} Confidence
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{hypo.reasoning}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Incident-to-History: Prior Precedents */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
          <History className="size-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Incident-to-History ("Has this happened before?")</h3>
            <p className="text-[11px] text-zinc-500">Historical precedents in the repository and resolution playbooks.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {activeIncident.priorIncidents.map((prior, idx) => (
            <div key={idx} className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-300">{prior.title}</h4>
                <span className="text-[10px] font-mono text-zinc-400">{prior.date}</span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-300">
                <strong>Root cause:</strong> {prior.rootCause}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                <strong>Resolution playbook:</strong> {prior.resolution}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
