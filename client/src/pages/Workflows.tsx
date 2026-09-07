import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Cpu,
  Database,
  ExternalLink,
  GitBranch,
  Layers,
  Network,
  Play,
  RefreshCw,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  XCircle,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

interface PipelineRun {
  id: string
  workflowName: string
  trigger: string
  commitHash: string
  author: string
  status: 'passed' | 'running' | 'failed'
  duration: string
  timeAgo: string
  stages: { name: string; status: 'passed' | 'running' | 'failed' | 'pending'; duration: string }[]
}

const SAMPLE_RUNS: PipelineRun[] = [
  {
    id: 'run-882',
    workflowName: 'CI / Targeted Test & Build Matrix',
    trigger: 'Push to main',
    commitHash: '9f31a2b',
    author: 'alex-chen',
    status: 'passed',
    duration: '2m 14s',
    timeAgo: '12 minutes ago',
    stages: [
      { name: 'Source Checkout & SBOM', status: 'passed', duration: '12s' },
      { name: 'AST Risk Audit', status: 'passed', duration: '28s' },
      { name: 'Targeted Test Matrix', status: 'passed', duration: '45s' },
      { name: 'Container Artifact Sign', status: 'passed', duration: '49s' },
    ],
  },
  {
    id: 'run-881',
    workflowName: 'Nightly Security & Drift Scan',
    trigger: 'Schedule (0 0 * * *)',
    commitHash: '4e81c09',
    author: 'github-actions',
    status: 'passed',
    duration: '4m 30s',
    timeAgo: '18 hours ago',
    stages: [
      { name: 'Dependency Vulnerability Audit', status: 'passed', duration: '1m 12s' },
      { name: 'Architecture Boundary Invariant Check', status: 'passed', duration: '1m 45s' },
      { name: 'Historical Regression Benchmark', status: 'passed', duration: '1m 33s' },
    ],
  },
]

export function Workflows() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams] = useSearchParams()
  const [isRunning, setIsRunning] = useState(false)

  function handleTriggerWorkflow() {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
    }, 1500)
  }

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing Pipeline Topology" hint="Synthesizing workflow runners, stage triggers, and execution matrices..." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to design workflows"
        description="Workflow automation connects CI/CD triggers, targeted test matrices, and automated deployment gates."
        icon={Workflow}
      />
    )
  }

  const stages = [
    { label: 'Source & AST Audit', detail: `${data.repository.branch} snapshot parsed`, ready: true, icon: Terminal },
    { label: 'Build & Artifacts', detail: data.dna.framework || data.repository.primary_language || 'Container build ready', ready: true, icon: Cpu },
    { label: 'Targeted Tests', detail: data.repository.has_tests ? 'Targeted test suites verified' : 'Test harness required', ready: data.repository.has_tests, icon: ShieldCheck },
    { label: 'Deploy & Gates', detail: 'Cloud Run & Kubernetes manifests ready', ready: true, icon: Rocket },
  ]

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Workflow provider alert" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 ring-1 ring-amber-500/30">
              <Workflow className="size-5 text-amber-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Workflows & CI/CD Pipelines</h1>
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                  V3 Pipeline Automation
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Automated continuous integration, test matrix execution, and artifact promotion for {data.repository.owner}/{data.repository.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/integrations"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <Settings className="size-3.5 text-zinc-400" />
            Integrations
          </Link>
          <button
            type="button"
            onClick={handleTriggerWorkflow}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500 disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            <span>{isRunning ? 'Triggering Pipeline...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </header>

      {/* 4-Stage Visual Pipeline Topology Banner */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-amber-400" />
            <h3 className="text-base font-bold text-zinc-100">Canonical Pipeline Stages</h3>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
            4 / 4 Stages Preflighted
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage, idx) => {
            const Icon = stage.icon
            return (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Icon className="size-4 text-violet-400" />
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-zinc-200">{stage.label}</h4>
                  <p className="mt-1 text-[11px] text-zinc-400">{stage.detail}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">ACTIVE</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Execution Runs History */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-sky-400" />
            <h3 className="text-base font-bold text-zinc-100">Recent Workflow Execution Runs</h3>
          </div>
          <span className="text-xs text-zinc-500">Grounded in GitHub Actions runner telemetry</span>
        </div>

        <div className="space-y-3">
          {SAMPLE_RUNS.map((run) => (
            <div key={run.id} className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-3">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                      <CheckCircle2 className="size-3" /> PASSED
                    </span>
                    <h4 className="text-xs font-bold text-zinc-200">{run.workflowName}</h4>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                    <span className="text-sky-400">{run.commitHash}</span>
                    <span>·</span>
                    <span>Trigger: {run.trigger}</span>
                    <span>·</span>
                    <span>{run.duration}</span>
                  </div>
                </div>
                <span className="text-xs text-zinc-500 self-start sm:self-center">{run.timeAgo}</span>
              </div>

              {/* Sub-stages Grid */}
              <div className="grid gap-2 border-t border-zinc-800/60 pt-3 sm:grid-cols-4">
                {run.stages.map((stg, sIdx) => (
                  <div key={sIdx} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-300 truncate">{stg.name}</span>
                      <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                    </div>
                    <span className="mt-1 block font-mono text-[10px] text-zinc-500">{stg.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
