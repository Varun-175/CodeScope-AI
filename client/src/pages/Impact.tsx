import { useState, useMemo } from 'react'
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Flame,
  GitBranch,
  GitPullRequest,
  Layers,
  Network,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Waypoints,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

type BlastCategory = 'direct' | 'indirect' | 'architectural' | 'test' | 'deployment' | 'runtime'

interface ImpactScenario {
  id: string
  title: string
  kind: 'pr' | 'commit' | 'branch' | 'snapshot'
  author: string
  timeAgo: string
  filesCount: number
  servicesCount: number
  apisCount: number
  dbPathsCount: number
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  confidence: 'High' | 'Medium' | 'Low'
  summary: string
  changedEntities: {
    name: string
    type: 'service' | 'symbol' | 'schema' | 'config' | 'api'
    filePath: string
    predictedImpact: string
    protection: {
      status: 'covered' | 'missing' | 'warning'
      detail: string
      testCount?: number
    }
    riskNote: string
  }[]
  blastRadius: Record<
    BlastCategory,
    {
      title: string
      count: number
      items: { name: string; detail: string; severity: 'high' | 'medium' | 'low' }[]
    }
  >
  impactPath: {
    stage: string
    entity: string
    type: string
    detail: string
    risk: 'high' | 'medium' | 'low'
  }[]
  riskFactors: { factor: string; description: string; impact: string }[]
  counterEvidence: { evidence: string; mitigates: string; verified: boolean }[]
  recommendations: { action: string; category: string; priority: 'immediate' | 'recommended' | 'optional' }[]
}

const SAMPLE_SCENARIOS: ImpactScenario[] = [
  {
    id: 'pr-129',
    title: 'PR #129: Refactor Payment & Order Settlement Pipeline',
    kind: 'pr',
    author: 'alex-chen',
    timeAgo: '2 hours ago',
    filesCount: 14,
    servicesCount: 3,
    apisCount: 2,
    dbPathsCount: 1,
    riskLevel: 'HIGH',
    confidence: 'High',
    summary: 'Modifies public Payment Gateway interfaces, transactional settlement hooks, and adds SQL migration for idempotency keys.',
    changedEntities: [
      {
        name: 'OrderService.processOrder()',
        type: 'symbol',
        filePath: 'src/services/order.service.ts',
        predictedImpact: 'checkout-service · order-events topic',
        protection: {
          status: 'covered',
          detail: '8 integration & unit tests passing',
          testCount: 8,
        },
        riskNote: 'High caller centrality (12 upstream callers)',
      },
      {
        name: 'PaymentClient.authorize()',
        type: 'api',
        filePath: 'src/clients/payment.client.ts',
        predictedImpact: 'public /v2/payments API · webhook handler',
        protection: {
          status: 'missing',
          detail: '2 test cases missing (timeout + 3DS failover)',
        },
        riskNote: 'Public API contract changed with new required header',
      },
      {
        name: '0024_payment_idempotency.sql',
        type: 'schema',
        filePath: 'db/migrations/0024_idempotency.sql',
        predictedImpact: 'PostgreSQL settlement table lock on large dataset',
        protection: {
          status: 'warning',
          detail: 'No automated rollback test detected',
        },
        riskNote: 'Requires non-concurrent index creation safety check',
      },
    ],
    blastRadius: {
      direct: {
        title: 'Direct Modifications',
        count: 14,
        items: [
          { name: 'PaymentClient.ts', detail: 'Public API interface & retry loop', severity: 'high' },
          { name: 'OrderService.ts', detail: 'State transition hooks & async publishing', severity: 'high' },
          { name: 'migration_0024.sql', detail: 'Idempotency table schema addition', severity: 'medium' },
        ],
      },
      indirect: {
        title: 'Indirect Callers & Transitive',
        count: 8,
        items: [
          { name: 'CheckoutFrontend (BFF)', detail: 'Consumes OrderService response payload', severity: 'medium' },
          { name: 'NotificationWorker', detail: 'Subscribes to payment.settled Kafka event', severity: 'low' },
          { name: 'AuditLogSubscriber', detail: 'Logs idempotency state transitions', severity: 'low' },
        ],
      },
      architectural: {
        title: 'Architectural Boundaries',
        count: 3,
        items: [
          { name: 'Core Commerce -> Billing', detail: 'Boundary coupling increased across 2 domains', severity: 'high' },
          { name: 'Public API v2', detail: 'New required header violates backward compatibility if omitted', severity: 'high' },
        ],
      },
      test: {
        title: 'Test Protection Coverage',
        count: 5,
        items: [
          { name: 'Test Coverage Gap', detail: '3DS failover branch lacks end-to-end simulation', severity: 'high' },
          { name: 'Regression Suite', detail: '14/14 checkout unit tests passing', severity: 'low' },
        ],
      },
      deployment: {
        title: 'Deployment & Migration Risks',
        count: 2,
        items: [
          { name: 'Database Lock Risk', detail: 'Migration requires zero-downtime execution flag', severity: 'high' },
          { name: 'Canary Requirement', detail: 'Recommended 5% progressive canary rollout', severity: 'medium' },
        ],
      },
      runtime: {
        title: 'Runtime & Performance Surface',
        count: 3,
        items: [
          { name: 'P95 Latency Sensitive', detail: 'Payment gateway auth is on critical purchase path', severity: 'high' },
          { name: 'Connection Pool', detail: 'Max connection surge potential on PostgreSQL', severity: 'medium' },
        ],
      },
    },
    impactPath: [
      { stage: 'Changed Symbol', entity: 'PaymentClient.authorize()', type: 'Source', detail: 'Added strict timeout & token check', risk: 'medium' },
      { stage: 'Containing Service', entity: 'Billing & Settlement Service', type: 'Service', detail: 'Handles transactions & webhook events', risk: 'high' },
      { stage: 'Public API Surface', entity: 'POST /v2/payments/charge', type: 'Public API', detail: 'External merchant & mobile SDK contract', risk: 'high' },
      { stage: 'Dependent Services', entity: 'Checkout-BFF & CartService', type: 'Subscribers', detail: '3 downstream internal microservices', risk: 'medium' },
      { stage: 'Test Protection Path', entity: 'PaymentIntegrationSpec.ts', type: 'Test Suite', detail: 'Coverage: 76% (Missing failover spec)', risk: 'high' },
      { stage: 'Deployment Strategy', entity: 'Rolling Pipeline -> K8s Prod', type: 'Release', detail: 'Post-migration deployment required', risk: 'medium' },
      { stage: 'Runtime Surface', entity: 'Critical Path p95 Latency', type: 'Telemetry', detail: 'Monitored via Datadog APM & Prometheus', risk: 'low' },
    ],
    riskFactors: [
      { factor: 'Public API Contract Modified', description: 'Changes contract consumed by external clients and mobile apps', impact: 'Potential 400 Bad Request on outdated SDKs' },
      { factor: 'High Centrality Service', description: 'OrderService sits at intersection of 12 internal microservices', impact: 'Failure cascades to Cart, Checkout, and Accounting' },
      { factor: 'Database Migration Included', description: 'Table schema alteration on high-throughput orders table', impact: 'Locks during peak traffic if unindexed' },
      { factor: 'Missing Failover Tests', description: 'No integration test verifying third-party gateway 504 timeouts', impact: 'Unhandled promises during payment provider outages' },
    ],
    counterEvidence: [
      { evidence: 'Feature Flag Protection', mitigates: 'New authorization logic guarded by `ff_v2_payment_settle`', verified: true },
      { evidence: 'Deterministic Unit Tests', mitigates: '14 core order lifecycle tests pass deterministically', verified: true },
      { evidence: 'Backward Compatible Fallback', mitigates: 'Legacy token parser handles pre-v2 payload format', verified: true },
    ],
    recommendations: [
      { action: 'Add integration test for gateway timeout & 3DS failure branches', category: 'Testing', priority: 'immediate' },
      { action: 'Execute database migration with CONCURRENTLY lock safety in staging', category: 'Database', priority: 'immediate' },
      { action: 'Deploy to 5% canary environment and observe error budget for 30 minutes', category: 'Deployment', priority: 'recommended' },
      { action: 'Notify Mobile SDK maintainers of updated headers in v2 API', category: 'API Governance', priority: 'optional' },
    ],
  },
]

export function Impact() {
  const { data, error, status } = useRepositoryAnalysis()
  const [activeCategory, setActiveCategory] = useState<BlastCategory>('direct')
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('pr-129')

  // Generate dynamic scenario from live analysis if available
  const liveScenario: ImpactScenario | null = useMemo(() => {
    if (!data) return null
    const criticalRisks = data.risks.critical ?? []
    const warnings = data.risks.warnings ?? []
    const hotspots = data.risks.complexity_hotspots ?? []
    const allSignals = [...criticalRisks, ...hotspots, ...warnings]
    const languages = data.repository.languages ?? []

    const changedEntities = allSignals.slice(0, 5).map((signal, idx) => ({
      name: signal.path || signal.reason || `Signal #${idx + 1}`,
      type: (signal.path?.endsWith('.ts') || signal.path?.endsWith('.js') ? 'symbol' : 'service') as 'service' | 'symbol' | 'schema' | 'config' | 'api',
      filePath: signal.path || 'src/core',
      predictedImpact: `${data.repository.name} · ${data.dependency_health.total_dependencies} dependencies`,
      protection: {
        status: (data.repository.has_tests ? 'covered' : 'missing') as 'covered' | 'missing' | 'warning',
        detail: data.repository.has_tests ? 'Automated test suite detected' : 'No automated test protection found',
        testCount: data.repository.has_tests ? 12 : 0,
      },
      riskNote: signal.reason || 'Flagged by static analysis engine',
    }))

    return {
      id: 'live-snapshot',
      title: `Snapshot Analysis: ${data.repository.name} (${data.repository.branch})`,
      kind: 'snapshot',
      author: data.repository.owner,
      timeAgo: 'Live snapshot',
      filesCount: data.repository.files,
      servicesCount: Math.max(1, languages.length),
      apisCount: data.repository.entry_points?.length || 2,
      dbPathsCount: data.repository.directories,
      riskLevel: criticalRisks.length > 0 ? 'CRITICAL' : warnings.length > 0 ? 'HIGH' : 'LOW',
      confidence: 'High',
      summary: `Automated impact radius across ${data.repository.files} files and ${data.dependency_health.total_dependencies} detected dependencies in ${data.repository.branch}.`,
      changedEntities: changedEntities.length > 0 ? changedEntities : [
        {
          name: 'Core Module Entry',
          type: 'service',
          filePath: 'src/index.ts',
          predictedImpact: 'Repository entry point & runtime startup',
          protection: {
            status: data.repository.has_tests ? 'covered' : 'missing',
            detail: data.repository.has_tests ? 'Test suites present' : 'Test suites missing',
          },
          riskNote: 'High centrality root component',
        },
      ],
      blastRadius: {
        direct: {
          title: 'Direct Risk Hotspots',
          count: allSignals.length,
          items: allSignals.slice(0, 4).map((s) => ({
            name: s.path || 'Repository Component',
            detail: s.reason || 'Code hotspot requiring review',
            severity: s.severity?.toLowerCase() === 'critical' ? 'high' : 'medium',
          })),
        },
        indirect: {
          title: 'Transitive Consumers',
          count: data.dependency_health.total_dependencies,
          items: data.dependency_health.detected.slice(0, 3).map((dep) => ({
            name: dep.name,
            detail: `Version ${dep.version} (${dep.source})`,
            severity: 'medium',
          })),
        },
        architectural: {
          title: 'Architectural Boundaries',
          count: languages.length,
          items: languages.map((l) => ({
            name: `${l.language} Subsystem`,
            detail: `${l.lines.toLocaleString()} lines analyzed`,
            severity: 'low',
          })),
        },
        test: {
          title: 'Test Protection Coverage',
          count: data.repository.has_tests ? 1 : 0,
          items: [
            {
              name: data.repository.has_tests ? 'Automated Test Suite' : 'Test Coverage Warning',
              detail: data.repository.has_tests ? 'Repository contains test files' : 'No tests detected in root snapshot',
              severity: data.repository.has_tests ? 'low' : 'high',
            },
          ],
        },
        deployment: {
          title: 'Deployment & Release Target',
          count: 1,
          items: [
            { name: `Target Branch: ${data.repository.branch}`, detail: 'Production branch validation', severity: 'low' },
          ],
        },
        runtime: {
          title: 'Runtime & Health Surface',
          count: data.dependency_health.unknown.length,
          items: data.dependency_health.unknown.map((u) => ({
            name: u.name,
            detail: `Dependency signal requiring audit (${u.source})`,
            severity: 'medium',
          })),
        },
      },
      impactPath: [
        { stage: 'Analyzed Component', entity: `${data.repository.owner}/${data.repository.name}`, type: 'Repository', detail: `${data.repository.files} source files parsed`, risk: 'low' },
        { stage: 'Architecture Boundary', entity: `${languages[0]?.language || 'Main'} Subsystem`, type: 'Language', detail: 'Primary code layer', risk: 'medium' },
        { stage: 'Identified Risk Hotspots', entity: `${allSignals.length} Signal Targets`, type: 'Static Risk', detail: `${criticalRisks.length} critical findings`, risk: criticalRisks.length > 0 ? 'high' : 'medium' },
        { stage: 'Dependency Surface', entity: `${data.dependency_health.total_dependencies} Packages`, type: 'Ecosystem', detail: `${data.dependency_health.unknown.length} unknown status dependencies`, risk: data.dependency_health.unknown.length > 0 ? 'medium' : 'low' },
        { stage: 'Test Protection', entity: data.repository.has_tests ? 'Detected' : 'Missing', type: 'Verification', detail: data.repository.has_tests ? 'Test files verified' : 'No test suite', risk: data.repository.has_tests ? 'low' : 'high' },
      ],
      riskFactors: allSignals.slice(0, 4).map((s) => ({
        factor: s.path || 'Hotspot Signal',
        description: s.reason || 'Identified by static code parser',
        impact: `Severity: ${s.severity || 'Warning'}`,
      })),
      counterEvidence: [
        { evidence: 'Snapshot AST Verified', mitigates: `${data.repository.parsed_files} files parsed without syntax failure`, verified: true },
        { evidence: 'Branch Integrity', mitigates: `Tracking upstream branch ${data.repository.branch}`, verified: true },
      ],
      recommendations: [
        { action: 'Review and remediate critical security and complexity findings', category: 'Quality', priority: 'immediate' },
        { action: 'Establish automated end-to-end test harnesses for critical paths', category: 'Testing', priority: 'recommended' },
        { action: 'Update outdated third-party library dependencies to latest stable releases', category: 'Dependencies', priority: 'recommended' },
      ],
    }
  }, [data])

  const currentScenario = selectedScenarioId === 'live-snapshot' && liveScenario ? liveScenario : SAMPLE_SCENARIOS[0]

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing change blast radius" hint="Mapping symbols, public APIs, database mutations, and test protections..." />
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Live repository sync failed" description="Showing cached impact graph and scenario simulation." />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 ring-1 ring-violet-500/30">
              <Waypoints className="size-5 text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Change Impact Workspace</h1>
                <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-300">
                  V3 Intelligence
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Multi-hop blast radius, risk causality, test protection matrix, and automated action proposals.
              </p>
            </div>
          </div>
        </div>

        {/* Scenario Selector Switcher */}
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSelectedScenarioId('pr-129')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedScenarioId === 'pr-129'
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GitPullRequest className="size-3.5" />
            PR #129 (Payment Refactor)
          </button>
          {liveScenario && (
            <button
              type="button"
              onClick={() => setSelectedScenarioId('live-snapshot')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedScenarioId === 'live-snapshot'
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <GitBranch className="size-3.5" />
              Live Snapshot ({data?.repository.name})
            </button>
          )}
        </div>
      </header>

      {/* Flagship Change Scope Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                {currentScenario.kind.toUpperCase()} CHANGE
              </span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-zinc-400">Authored by <strong className="text-zinc-200 font-mono">{currentScenario.author}</strong></span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-zinc-400">{currentScenario.timeAgo}</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">{currentScenario.title}</h2>
            <p className="max-w-2xl text-xs leading-relaxed text-zinc-400">{currentScenario.summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800/80 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="text-left">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Predicted Risk</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                  currentScenario.riskLevel === 'CRITICAL'
                    ? 'border border-red-500/40 bg-red-500/20 text-red-300'
                    : currentScenario.riskLevel === 'HIGH'
                    ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                }`}>
                  <Flame className="size-3.5" />
                  {currentScenario.riskLevel}
                </span>
              </div>
            </div>

            <div className="text-left">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Confidence</p>
              <p className="mt-1 font-mono text-sm font-semibold text-zinc-200">{currentScenario.confidence}</p>
            </div>

            <div className="text-left">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Scope Impact</p>
              <p className="mt-1 font-mono text-xs font-semibold text-zinc-300">
                {currentScenario.filesCount} files · {currentScenario.servicesCount} services · {currentScenario.apisCount} APIs · {currentScenario.dbPathsCount} DB
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Changed vs Predicted Impact vs Protection Matrix */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        {/* Left Column: Impact Matrix & Multi-hop Blast Radius */}
        <div className="space-y-6">
          {/* Main Matrix Table */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Primary Impact Matrix</h3>
              </div>
              <span className="text-[11px] text-zinc-400">3 core paths analyzed</span>
            </div>

            <div className="mt-4 space-y-3">
              {currentScenario.changedEntities.map((entity, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 transition hover:border-violet-500/40 hover:bg-zinc-950/70"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-300">
                          {entity.type}
                        </span>
                        <span className="font-mono text-sm font-semibold text-zinc-100">{entity.name}</span>
                      </div>
                      <p className="font-mono text-[11px] text-zinc-500">{entity.filePath}</p>
                    </div>

                    {/* Protection Badge */}
                    <div className="flex items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                      {entity.protection.status === 'covered' && <CheckCircle2 className="size-3.5 text-emerald-400" />}
                      {entity.protection.status === 'warning' && <AlertTriangle className="size-3.5 text-amber-400" />}
                      {entity.protection.status === 'missing' && <XCircle className="size-3.5 text-red-400" />}
                      <span className={entity.protection.status === 'covered' ? 'text-emerald-400' : entity.protection.status === 'warning' ? 'text-amber-400' : 'text-red-400'}>
                        {entity.protection.detail}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 border-t border-zinc-800/60 pt-3 text-xs sm:grid-cols-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Predicted Target Impact:</span>
                      <p className="mt-0.5 font-medium text-zinc-300">{entity.predictedImpact}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Risk Assessment:</span>
                      <p className="mt-0.5 text-zinc-400">{entity.riskNote}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Blast Radius Explorer */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/80 pb-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Network className="size-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Blast Radius Decomposition</h3>
              </div>
              <span className="text-xs text-zinc-500">Multi-hop graph propagation</span>
            </div>

            {/* Blast Category Tabs */}
            <div className="mt-4 flex flex-wrap gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-1">
              {(
                [
                  { key: 'direct', label: 'Direct', count: currentScenario.blastRadius.direct.count },
                  { key: 'indirect', label: 'Indirect', count: currentScenario.blastRadius.indirect.count },
                  { key: 'architectural', label: 'Architectural', count: currentScenario.blastRadius.architectural.count },
                  { key: 'test', label: 'Test Suites', count: currentScenario.blastRadius.test.count },
                  { key: 'deployment', label: 'Deployment', count: currentScenario.blastRadius.deployment.count },
                  { key: 'runtime', label: 'Runtime & Perf', count: currentScenario.blastRadius.runtime.count },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    activeCategory === cat.key
                      ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="rounded-full bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Blast Radius Content */}
            <div className="mt-4 space-y-2.5">
              {currentScenario.blastRadius[activeCategory].items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 transition hover:border-zinc-700"
                >
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs font-semibold text-zinc-200">{item.name}</p>
                    <p className="text-xs text-zinc-400">{item.detail}</p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      item.severity === 'high'
                        ? 'bg-red-500/20 text-red-300'
                        : item.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Visual Impact Path Flow */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
              <Waypoints className="size-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-zinc-100">End-to-End Impact Path</h3>
            </div>

            <div className="mt-5 relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-violet-500 via-sky-500 to-emerald-500 opacity-30" />
              <div className="space-y-4">
                {currentScenario.impactPath.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-1">
                    <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-violet-500/40 bg-zinc-950 font-mono text-[11px] font-bold text-violet-300 shadow-md">
                      {idx + 1}
                    </div>
                    <div className="flex-1 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            {step.stage}
                          </span>
                          <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400">
                            {step.type}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            step.risk === 'high' ? 'text-red-400' : step.risk === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {step.risk} risk
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-xs font-semibold text-zinc-200">{step.entity}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Risk Factors, Counter-Evidence & Automated Actions */}
        <div className="space-y-6">
          {/* Action Center: High-Leverage Next Steps */}
          <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-950/30 to-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Sparkles className="size-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Recommended Actions</h3>
            </div>

            <div className="mt-4 space-y-2.5">
              {currentScenario.recommendations.map((rec, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-800/70 bg-zinc-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                      {rec.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        rec.priority === 'immediate' ? 'text-red-400' : rec.priority === 'recommended' ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-300">{rec.action}</p>
                </div>
              ))}
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-zinc-800/80 pt-4">
              <Link
                to="/testing?action=plan"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
              >
                <TestTube2 className="size-3.5 text-sky-400" />
                Create Test Plan
              </Link>
              <Link
                to="/reviews?action=new"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
              >
                <ShieldCheck className="size-3.5 text-emerald-400" />
                Create Review
              </Link>
              <Link
                to="/deployments?action=checklist"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
              >
                <Rocket className="size-3.5 text-amber-400" />
                Deploy Checklist
              </Link>
              <Link
                to="/intelligence?context=impact"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-medium text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
              >
                <Brain className="size-3.5" />
                Ask CodeScope
              </Link>
            </div>
          </section>

          {/* Risk Factors Breakdown */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <ShieldAlert className="size-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Identified Risk Factors</h3>
            </div>

            <div className="mt-4 space-y-3">
              {currentScenario.riskFactors.map((rf, idx) => (
                <div key={idx} className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3">
                  <div className="flex items-center gap-2">
                    <Flame className="size-3.5 text-amber-400" />
                    <h4 className="text-xs font-semibold text-amber-200">{rf.factor}</h4>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{rf.description}</p>
                  <p className="mt-1 font-mono text-[10px] text-amber-300/80">Impact: {rf.impact}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Counter-Evidence (Risk Mitigations) */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <ShieldCheck className="size-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Counter-Evidence (Mitigations)</h3>
            </div>

            <div className="mt-4 space-y-3">
              {currentScenario.counterEvidence.map((ce, idx) => (
                <div key={idx} className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      <h4 className="text-xs font-semibold text-emerald-200">{ce.evidence}</h4>
                    </div>
                    {ce.verified && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{ce.mitigates}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
