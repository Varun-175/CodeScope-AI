import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Container,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Layers,
  Network,
  RotateCcw,
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
  XCircle,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

interface DeploymentGate {
  id: string
  title: string
  status: 'passed' | 'warning' | 'failed'
  detail: string
  category: 'tests' | 'dependencies' | 'impact' | 'rollback'
}

interface ReleaseLifecycle {
  releaseVersion: string
  commitHash: string
  commitAuthor: string
  buildNumber: string
  environment: 'Staging' | 'Canary (5%)' | 'Production'
  status: 'DEPLOYED' | 'ROLLING_OUT' | 'PENDING_APPROVAL'
  predictedVsObserved: {
    metric: string
    predicted: string
    observed: string
    status: 'nominal' | 'variance'
  }[]
  pipelineStages: {
    stage: string
    status: 'completed' | 'active' | 'upcoming'
    detail: string
  }[]
}

export function Deployment() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isPromoting, setIsPromoting] = useState(false)

  const activeRelease: ReleaseLifecycle = {
    releaseVersion: 'v1.8.4-rc2',
    commitHash: '9f31a2b',
    commitAuthor: 'alex-chen',
    buildNumber: 'Build #412',
    environment: 'Canary (5%)',
    status: 'ROLLING_OUT',
    predictedVsObserved: [
      { metric: 'P95 API Latency', predicted: '< 220ms', observed: '214ms', status: 'nominal' },
      { metric: 'Error Rate (5xx)', predicted: '< 0.05%', observed: '0.02%', status: 'nominal' },
      { metric: 'DB Connection Pool', predicted: '< 60%', observed: '52%', status: 'nominal' },
    ],
    pipelineStages: [
      { stage: '1. Commit & Source Audit', status: 'completed', detail: 'AST security and boundary verification passed' },
      { stage: '2. Container Build & SBOM', status: 'completed', detail: 'OCI image signed with Cosign (digest sha256:4e81c...)' },
      { stage: '3. Targeted Test Matrix', status: 'completed', detail: '14/14 targeted integration specs passed (203ms)' },
      { stage: '4. Staging Validation', status: 'completed', detail: 'Executed migration 0024 with zero table locks' },
      { stage: '5. Production Canary (5%)', status: 'active', detail: 'Observing SLO error budget for 30 minutes' },
      { stage: '6. Full 100% Rollout', status: 'upcoming', detail: 'Awaiting canary soak completion' },
    ],
  }

  const gates: DeploymentGate[] = [
    {
      id: 'g1',
      title: 'Targeted Test Protection',
      status: 'passed',
      detail: '14/14 automated targeted tests verified covering critical call paths',
      category: 'tests',
    },
    {
      id: 'g2',
      title: 'Dependency & CVE Vulnerability Gate',
      status: 'passed',
      detail: 'Zero critical or high security advisories detected in release container',
      category: 'dependencies',
    },
    {
      id: 'g3',
      title: 'Blast Radius Risk Preflight',
      status: 'passed',
      detail: 'Multi-hop impact reviewed; verified feature flag mitigation present',
      category: 'impact',
    },
    {
      id: 'g4',
      title: 'Instant Rollback Readiness',
      status: 'passed',
      detail: 'Previous stable release (v1.8.3 / Deploy #283) cached and ready for instant revert',
      category: 'rollback',
    },
  ]

  function handlePromote() {
    setIsPromoting(true)
    setTimeout(() => {
      setIsPromoting(false)
    }, 1500)
  }

  if (status === 'analyzing') {
    return <LoadingState title="Checking Deployment Readiness" hint="Auditing container builds, deployment gates, and rollback targets..." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to manage deployments"
        description="Deployment console connects releases, automated deployment gates, canary verification, and instant rollbacks."
        icon={Rocket}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Deployment telemetry warning" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 ring-1 ring-violet-500/30">
              <Rocket className="size-5 text-sky-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Release & Deployment Console</h1>
                <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
                  V3 Release Gates
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                End-to-end lifecycle continuity from commit to runtime SLO telemetry for {data.repository.owner}/{data.repository.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Global Release Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/operations"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <Activity className="size-3.5 text-sky-400" />
            Live SLO Telemetry
          </Link>
          <button
            type="button"
            onClick={handlePromote}
            disabled={isPromoting}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500 disabled:opacity-50"
          >
            <Rocket className="size-3.5" />
            <span>{isPromoting ? 'Promoting Release...' : 'Promote to 100% Prod'}</span>
          </button>
        </div>
      </header>

      {/* Active Release Overview Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-violet-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-300">
                {activeRelease.releaseVersion}
              </span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="font-mono text-xs text-sky-400">{activeRelease.commitHash}</span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-zinc-400">Authored by <strong className="text-zinc-200">{activeRelease.commitAuthor}</strong></span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="rounded bg-sky-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-300">
                {activeRelease.environment}
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">Release Promotion Pipeline</h2>
            <p className="max-w-2xl text-xs leading-relaxed text-zinc-400">
              Gated progression verified against targeted test harnesses, automated migration safety checks, and live canary telemetry.
            </p>
          </div>

          {/* Instant Rollback Target Info */}
          <div className="flex flex-col gap-2 border-t border-zinc-800/80 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Instant Rollback Target
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-amber-400">v1.8.3 (Deploy #283)</span>
              <button
                type="button"
                className="flex items-center gap-1 rounded bg-red-950/40 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-300 transition hover:bg-red-900/40"
              >
                <RotateCcw className="size-3" />
                Trigger Revert
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Deployment Gates Matrix */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <h3 className="text-base font-bold text-zinc-100">Deployment Gate Status</h3>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
            4 / 4 GATES PASSED
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gates.map((g) => (
            <div
              key={g.id}
              className="flex flex-col justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{g.category}</span>
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                </div>
                <h4 className="mt-2 text-xs font-bold text-zinc-200">{g.title}</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{g.detail}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">PASSED</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid: Pipeline Sequence vs Predicted vs Observed Telemetry */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Release Pipeline Stages */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <Layers className="size-4 text-violet-400" />
            <h3 className="text-sm font-bold text-zinc-100">Release Stage Sequence</h3>
          </div>

          <div className="space-y-3 relative pl-4">
            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-zinc-800" />
            {activeRelease.pipelineStages.map((stg, idx) => (
              <div key={idx} className="relative flex items-start gap-3">
                <div
                  className={`relative z-10 size-3 rounded-full border shadow-sm ${
                    stg.status === 'completed'
                      ? 'border-emerald-400 bg-emerald-500'
                      : stg.status === 'active'
                      ? 'border-sky-400 bg-sky-500 animate-pulse'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200">{stg.stage}</span>
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        stg.status === 'completed'
                          ? 'text-emerald-400'
                          : stg.status === 'active'
                          ? 'text-sky-400'
                          : 'text-zinc-600'
                      }`}
                    >
                      {stg.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">{stg.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predicted Impact vs Observed Results */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <Activity className="size-4 text-sky-400" />
            <h3 className="text-sm font-bold text-zinc-100">Predicted Impact vs Observed Results</h3>
          </div>

          <div className="space-y-3">
            {activeRelease.predictedVsObserved.map((row, idx) => (
              <div key={idx} className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-200">{row.metric}</h4>
                  <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                    <CheckCircle2 className="size-3" /> NOMINAL
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2">
                    <span className="text-[10px] text-zinc-500 uppercase">Pre-Deploy Predicted</span>
                    <p className="mt-0.5 font-mono font-semibold text-zinc-300">{row.predicted}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2">
                    <span className="text-[10px] text-zinc-500 uppercase">Live Observed</span>
                    <p className="mt-0.5 font-mono font-semibold text-emerald-300">{row.observed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Handoffs */}
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/80 pt-4">
            <Link
              to="/impact"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <Waypoints className="size-3.5 text-sky-400" />
              Change Blast Radius
            </Link>
            <Link
              to="/incidents"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <ShieldAlert className="size-3.5 text-amber-400" />
              Active Incident Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
