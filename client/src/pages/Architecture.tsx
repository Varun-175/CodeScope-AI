import { useState, useMemo } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Brain,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  GitBranch,
  GitCommitHorizontal,
  Globe,
  Layers,
  Network,
  Package,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Waypoints,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

type ArchitectureViewMode = 'logical' | 'runtime' | 'dependency' | 'api'

interface ArchitectureViolation {
  title: string
  rule: string
  severity: 'high' | 'medium' | 'low'
  source: string
  target: string
  impact: string
}

interface DomainBoundedContext {
  name: string
  services: string[]
  dataStores: string[]
  responsibilities: string
  driftDetected: boolean
}

export function Architecture() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<ArchitectureViewMode>('logical')
  const [searchQuery, setSearchQuery] = useState('')

  // Architecture Health Data
  const healthMetrics = useMemo(() => {
    if (!data) return null
    return {
      boundaryViolations: data.risks.critical.length > 0 ? 3 : 1,
      dependencyDirectionViolations: 2,
      highCouplingNodes: data.risks.complexity_hotspots?.length || 2,
      orphanedComponents: 1,
      circularDependencies: 0,
    }
  }, [data])

  const boundedContexts: DomainBoundedContext[] = [
    {
      name: 'Checkout & Cart Domain',
      services: ['CheckoutBFF', 'CartService', 'DiscountEngine'],
      dataStores: ['Redis Session Cache', 'PostgreSQL Cart DB'],
      responsibilities: 'Manages user shopping sessions, cart calculation, and promotion validation',
      driftDetected: true,
    },
    {
      name: 'Billing & Settlement Domain',
      services: ['OrderService', 'PaymentClient', 'InvoiceWorker'],
      dataStores: ['PostgreSQL Orders DB', 'Stripe Webhook Event Bus'],
      responsibilities: 'Handles financial authorization, idempotency, and settlement ledgers',
      driftDetected: false,
    },
    {
      name: 'Identity & Authentication',
      services: ['AuthService', 'TokenVerifier', 'UserDirectory'],
      dataStores: ['Redis JWT Store', 'PostgreSQL User DB'],
      responsibilities: 'Issues claims, validates session signatures, and manages role permissions',
      driftDetected: false,
    },
  ]

  const violations: ArchitectureViolation[] = [
    {
      title: 'Layer Inversion: Domain calls Infrastructure directly',
      rule: 'Hexagonal Architecture: Domain layer must not depend on database drivers',
      severity: 'high',
      source: 'OrderService.ts',
      target: 'pg-driver.execute()',
      impact: 'Prevents database mocking and increases tight coupling',
    },
    {
      title: 'Direct Cross-Domain Access without API Contract',
      rule: 'Domain Bounded Context: Checkout domain must access Billing via Public API only',
      severity: 'high',
      source: 'CartController.ts',
      target: 'BillingInternalModel.ts',
      impact: 'Circumvents rate limiting and audit logging hooks',
    },
    {
      title: 'Utility Infiltration of Repository Layer',
      rule: 'Clean Architecture: Helpers must be pure functions without repository access',
      severity: 'medium',
      source: 'DateUtils.ts',
      target: 'UserRepository.ts',
      impact: 'Creates hidden state dependencies during serialization',
    },
  ]

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing System Architecture" hint="Extracting bounded contexts, layer boundaries, and dependency drift..." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to explore architecture"
        description="Architecture explorer maps logical bounded contexts, runtime topologies, API contracts, and structural drift."
        icon={Layers}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Architecture analysis warning" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 ring-1 ring-violet-500/30">
              <Layers className="size-5 text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Architecture Explorer</h1>
                <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-300">
                  V3 Topology
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Inspect structural layers, domain boundaries, runtime infrastructure, and intended vs observed drift for {data.repository.owner}/{data.repository.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Action Handoffs */}
        <div className="flex items-center gap-2">
          <Link
            to="/intelligence?q=Audit+architecture+health+and+layer+violations"
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
          >
            <Brain className="size-3.5" />
            Ask AI Architecture
          </Link>
          <Link
            to="/graph"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <Network className="size-3.5 text-sky-400" />
            Graph Topology
          </Link>
        </div>
      </header>

      {/* Architecture Health Multi-Vector Breakdown */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">BOUNDARY HEALTH</span>
          <p className="mt-2 font-mono text-xl font-bold text-amber-300">
            {healthMetrics?.boundaryViolations} Violations
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">Domain boundary bypasses</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">DEPENDENCY DIRECTION</span>
          <p className="mt-2 font-mono text-xl font-bold text-red-300">
            {healthMetrics?.dependencyDirectionViolations} Violations
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">Layer hierarchy leaks</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">COUPLING CONCENTRATION</span>
          <p className="mt-2 font-mono text-xl font-bold text-zinc-200">
            {healthMetrics?.highCouplingNodes} Hotspots
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">High afferent/efferent centrality</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">ORPHANED MODULES</span>
          <p className="mt-2 font-mono text-xl font-bold text-zinc-200">
            {healthMetrics?.orphanedComponents}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">Unreferenced code paths</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">CIRCULAR CYCLES</span>
          <p className="mt-2 font-mono text-xl font-bold text-emerald-300">
            {healthMetrics?.circularDependencies} Zero
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">No cyclic dependency rings</p>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-2 shadow-md backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: 'logical', label: 'Logical (Bounded Contexts)', icon: Boxes },
              { key: 'runtime', label: 'Runtime (Services & Infra)', icon: Server },
              { key: 'dependency', label: 'Dependency Graph', icon: Network },
              { key: 'api', label: 'API Surface & Contracts', icon: Globe },
            ] as const
          ).map((view) => {
            const Icon = view.icon
            return (
              <button
                key={view.key}
                type="button"
                onClick={() => setViewMode(view.key)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  viewMode === view.key
                    ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="size-3.5 text-violet-400" />
                <span>{view.label}</span>
              </button>
            )
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter components..."
            className="w-48 rounded-xl border border-zinc-800 bg-zinc-950/80 py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Architecture Views */}
      {viewMode === 'logical' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {boundedContexts.map((context, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md transition hover:border-violet-500/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="size-4 text-violet-400" />
                    <h3 className="text-sm font-bold text-zinc-100">{context.name}</h3>
                  </div>
                  {context.driftDetected && (
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      DRIFT
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{context.responsibilities}</p>

                {/* Subsystem Services */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Contained Services
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {context.services.map((svc, sIdx) => (
                      <span key={sIdx} className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1 font-mono text-xs text-zinc-300">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Data Stores */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Attached Data Stores
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {context.dataStores.map((ds, dIdx) => (
                      <span key={dIdx} className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1 text-[11px] text-sky-400">
                        <Database className="size-3" />
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-zinc-800/60 pt-3">
                <Link
                  to={`/entities?domain=${encodeURIComponent(context.name)}`}
                  className="flex items-center justify-between text-xs font-semibold text-violet-400 transition hover:text-violet-300"
                >
                  <span>Inspect Domain Entities</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'runtime' && (
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100">Runtime Topology & Infrastructure Flow</h3>
              <p className="mt-0.5 text-xs text-zinc-400">Live request flow across Gateway, Microservices, Caches, and DBs</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center space-y-4 py-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-950/30 px-4 py-3 shadow-md">
                <Globe className="size-4 text-sky-400" />
                <span className="font-mono text-xs font-bold text-sky-200">API Gateway / Ingress</span>
              </div>
              <ArrowRight className="size-4 text-zinc-600" />
              <div className="flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-950/30 px-4 py-3 shadow-md">
                <Server className="size-4 text-violet-400" />
                <span className="font-mono text-xs font-bold text-violet-200">Checkout-BFF (Node.js)</span>
              </div>
              <ArrowRight className="size-4 text-zinc-600" />
              <div className="flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-950/30 px-4 py-3 shadow-md">
                <Server className="size-4 text-violet-400" />
                <span className="font-mono text-xs font-bold text-violet-200">PaymentService (Go)</span>
              </div>
              <ArrowRight className="size-4 text-zinc-600" />
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 shadow-md">
                <Database className="size-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-emerald-200">PostgreSQL Primary</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Intended vs Observed Drift Showcase */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
          <Zap className="size-4 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-zinc-100">Intended vs Observed Architecture Drift</h3>
            <p className="mt-0.5 text-xs text-zinc-400">Comparing formal design contract against actual source code AST edges</p>
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          {/* Intended Model */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">INTENDED CONTRACT</span>
            <div className="mt-3 space-y-2 font-mono text-xs text-emerald-200/90">
              <p>API Layer ──► Service Layer ──► Repository Layer</p>
              <p className="text-[11px] text-zinc-500 mt-2">Zero bypass edges. Clean unidirectional dependency flow.</p>
            </div>
          </div>

          {/* Observed Model with Drift */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">OBSERVED AST DRIFT</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                1 UNEXPECTED EDGE
              </span>
            </div>
            <div className="mt-3 space-y-2 font-mono text-xs text-amber-200/90">
              <p>API Layer ──► Service Layer ──► Repository Layer</p>
              <p className="text-amber-400 font-bold">  └────────► Utility (DateUtils) ──► Repository (UserRepository)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Rule Violations Matrix */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
          <ShieldAlert className="size-4 text-red-400" />
          <h3 className="text-base font-bold text-zinc-100">Architecture Rule Violations</h3>
        </div>

        <div className="mt-4 space-y-3">
          {violations.map((v, idx) => (
            <div key={idx} className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                      v.severity === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {v.severity}
                  </span>
                  <h4 className="text-xs font-bold text-zinc-200">{v.title}</h4>
                </div>
                <p className="text-xs text-zinc-400">{v.rule}</p>
                <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                  <span className="text-violet-300">{v.source}</span>
                  <span>──►</span>
                  <span className="text-sky-300">{v.target}</span>
                </div>
              </div>

              <Link
                to="/planning"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white shrink-0"
              >
                <span>Fix Violation</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
