import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Database,
  ExternalLink,
  Flame,
  GitBranch,
  Layers,
  ListChecks,
  ListTodo,
  Network,
  Rocket,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube2,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

type PlanStatus = 'todo' | 'progress' | 'review' | 'done'
type PlanPriority = 'Critical' | 'High' | 'Medium'

interface ArchitecturalPlan {
  id: string
  title: string
  goal: string
  priority: PlanPriority
  status: PlanStatus
  riskReduction: string
  affectedEntities: {
    name: string
    type: 'service' | 'symbol' | 'schema' | 'api'
    path: string
    link: string
  }[]
  constraints: string[]
  implementationSteps: {
    id: string
    title: string
    detail: string
    completed: boolean
    assignedTo?: string
  }[]
  requiredTests: {
    name: string
    suite: string
    status: 'passing' | 'pending' | 'missing'
  }[]
  deploymentStrategy: {
    stage: string
    detail: string
  }[]
  observabilityChecklist: {
    metric: string
    threshold: string
    alertConfigured: boolean
  }[]
}

const SAMPLE_PLANS: ArchitecturalPlan[] = [
  {
    id: 'PLAN-001',
    title: 'Decouple Payment Gateway Direct Database Coupling',
    goal: 'Eliminate direct SQL mutations inside PaymentClient by introducing an asynchronous event-driven transactional outbox pattern.',
    priority: 'Critical',
    status: 'progress',
    riskReduction: 'Eliminates 3 architectural boundary violations and reduces lock contention by 65%',
    affectedEntities: [
      { name: 'PaymentClient.ts', type: 'symbol', path: 'src/clients/payment.client.ts', link: '/code' },
      { name: 'BillingService', type: 'service', path: 'src/services/billing', link: '/entities' },
      { name: '0024_outbox_events.sql', type: 'schema', path: 'db/migrations', link: '/code' },
    ],
    constraints: [
      'Zero downtime migration — existing payments must process without interruption',
      'API Backward Compatibility: Mobile clients continue using v1 signature until v2 deprecation window',
      'P95 latency overhead of outbox worker must not exceed 25ms',
    ],
    implementationSteps: [
      { id: 's1', title: 'Create transactional outbox PostgreSQL table', detail: 'Migration with CONCURRENTLY indexing', completed: true, assignedTo: 'alex-chen' },
      { id: 's2', title: 'Implement OutboxPublisher event dispatcher', detail: 'Publish payment.authorized events to Kafka / PubSub', completed: true, assignedTo: 'sarah-dev' },
      { id: 's3', title: 'Refactor PaymentClient to emit events instead of direct DB writes', detail: 'Wrap in feature flag `ff_outbox_v2`', completed: false, assignedTo: 'alex-chen' },
      { id: 's4', title: 'Deprecate legacy synchronous settlement hook', detail: 'Scheduled for release v1.9', completed: false },
    ],
    requiredTests: [
      { name: 'OutboxPublisherEventSpec', suite: 'Unit Tests', status: 'passing' },
      { name: 'PaymentGatewayTimeoutFailoverSpec', suite: 'Integration', status: 'passing' },
      { name: 'ConcurrentPurchaseHighLoadTest', suite: 'Stress / Perf', status: 'pending' },
    ],
    deploymentStrategy: [
      { stage: '1. Schema Rollout', detail: 'Run idempotent migration 0024 in staging then prod' },
      { stage: '2. 5% Canary Release', detail: 'Enable `ff_outbox_v2` for beta merchant traffic' },
      { stage: '3. Full 100% Ramp', detail: 'Promote after 24 hours of zero 5xx anomalies' },
    ],
    observabilityChecklist: [
      { metric: 'Payment Auth P95 Latency', threshold: '< 220ms', alertConfigured: true },
      { metric: 'Outbox Queue Lag', threshold: '< 500 records', alertConfigured: true },
      { metric: 'Database Connection Pool Utilization', threshold: '< 75%', alertConfigured: true },
    ],
  },
]

export function Planning() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activePlanId, setActivePlanId] = useState<string>('PLAN-001')
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({ s1: true, s2: true })

  const activePlan = SAMPLE_PLANS.find((p) => p.id === activePlanId) || SAMPLE_PLANS[0]

  function toggleStep(stepId: string) {
    setCompletedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }))
  }

  if (status === 'analyzing') {
    return <LoadingState title="Generating Architecture Plans" hint="Synthesizing risk hotspots, boundary violations, and execution roadmaps..." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to generate execution plans"
        description="Planning translates risk findings, dependency alerts, and architectural debt into structured 7-stage implementation plans."
        icon={Calendar}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Planning analysis warning" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 ring-1 ring-fuchsia-500/30">
              <Calendar className="size-5 text-fuchsia-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Architecture & Lifecycle Planning</h1>
                <span className="rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-fuchsia-300">
                  V3 Plan Engine
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Turn architectural drift, risk signals, and refactoring goals into prioritized 7-stage engineering plans for {data.repository.owner}/{data.repository.name}.
              </p>
            </div>
          </div>
        </div>

        {/* AI Plan Generation Trigger */}
        <div className="flex items-center gap-2">
          <Link
            to="/intelligence?q=Generate+an+actionable+refactoring+plan+for+hotspots"
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
          >
            <Brain className="size-3.5" />
            Generate Plan with AI
          </Link>
        </div>
      </header>

      {/* 7-Stage Architectural Plan Container */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-6">
        {/* Plan Header & Goal */}
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-800/80 pb-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded bg-fuchsia-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-fuchsia-300">
                {activePlan.id}
              </span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                {activePlan.priority} Priority
              </span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-emerald-400 font-semibold">{activePlan.riskReduction}</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">{activePlan.title}</h2>
            <p className="max-w-3xl text-xs leading-relaxed text-zinc-400">
              <strong className="text-zinc-200">1. GOAL:</strong> {activePlan.goal}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <Link
              to="/impact"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <Activity className="size-3.5 text-sky-400" />
              Preview Blast Radius
            </Link>
          </div>
        </div>

        {/* 2. AFFECTED ENTITIES & 3. CONSTRAINTS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Affected Entities */}
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Code2 className="size-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">2. Affected Entities</h3>
            </div>
            <div className="space-y-2">
              {activePlan.affectedEntities.map((ent, idx) => (
                <Link
                  key={idx}
                  to={ent.link}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs text-zinc-300 transition hover:border-violet-500/50 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 font-mono text-[9px] uppercase text-zinc-400">
                      {ent.type}
                    </span>
                    <span className="font-mono font-semibold">{ent.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500">{ent.path}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Architectural Constraints */}
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">3. Invariant Constraints</h3>
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              {activePlan.constraints.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2.5">
                  <ChevronRight className="mt-0.5 size-3.5 text-amber-400 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. IMPLEMENTATION STEPS (SEQUENCED CHECKLIST) */}
        <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">4. Implementation Sequence</h3>
            </div>
            <span className="text-[11px] text-zinc-500">
              {Object.values(completedSteps).filter(Boolean).length} of {activePlan.implementationSteps.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {activePlan.implementationSteps.map((step) => {
              const isDone = !!completedSteps[step.id]
              return (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`flex cursor-pointer items-start justify-between rounded-xl border p-3 transition ${
                    isDone
                      ? 'border-emerald-500/30 bg-emerald-950/10 text-zinc-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleStep(step.id)}
                      className="mt-1 size-4 rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <p className={`text-xs font-semibold ${isDone ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-400">{step.detail}</p>
                    </div>
                  </div>
                  {step.assignedTo && (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                      @{step.assignedTo}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 5. TESTS, 6. DEPLOYMENT & 7. OBSERVABILITY */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 5. Required Tests */}
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TestTube2 className="size-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">5. Required Tests</h3>
            </div>
            <div className="space-y-2">
              {activePlan.requiredTests.map((t, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-zinc-300">{t.name}</span>
                    <span
                      className={`text-[9px] font-bold uppercase ${
                        t.status === 'passing' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{t.suite}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Deployment Strategy */}
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="size-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">6. Deployment Strategy</h3>
            </div>
            <div className="space-y-2">
              {activePlan.deploymentStrategy.map((d, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5">
                  <p className="text-xs font-semibold text-zinc-300">{d.stage}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">{d.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Observability Checklist */}
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">7. Observability Checklist</h3>
            </div>
            <div className="space-y-2">
              {activePlan.observabilityChecklist.map((obs, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">{obs.metric}</span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">{obs.threshold}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-500">Alert configured & attached to on-call</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
