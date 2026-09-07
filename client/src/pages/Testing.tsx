import { useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Beaker,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileCode2,
  Flame,
  Layers,
  Play,
  RefreshCw,
  Rocket,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Waypoints,
  XCircle,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

interface TargetedTestCase {
  id: string
  symbol: string
  affectedPath: string
  domain: string
  existingTests: {
    name: string
    type: 'unit' | 'integration' | 'e2e'
    status: 'passed' | 'failed' | 'skipped'
    durationMs: number
  }[]
  missingTests: {
    description: string
    risk: 'critical' | 'high' | 'medium'
    rationale: string
  }[]
  recommendedTargetedSuite: string
  coveragePct: number
}

const SAMPLE_TARGETED_TESTS: TargetedTestCase[] = [
  {
    id: 'test-case-1',
    symbol: 'PaymentClient.authorize()',
    affectedPath: 'Payment Gateway ──► Webhook Handler ──► Settlement DB',
    domain: 'Billing & Settlement',
    existingTests: [
      { name: 'PaymentClientAuthTokenSpec', type: 'unit', status: 'passed', durationMs: 45 },
      { name: 'StripeWebhookSignatureVerification', type: 'integration', status: 'passed', durationMs: 120 },
      { name: 'IdempotencyKeyCollisionSpec', type: 'unit', status: 'passed', durationMs: 38 },
    ],
    missingTests: [
      {
        description: 'Gateway 8s Timeout & 504 Failover Simulation',
        risk: 'critical',
        rationale: 'Uncovered 3DS failover retry loop can exhaust socket connections during upstream outages',
      },
      {
        description: 'Partial Settlement Reconciliation Branch',
        risk: 'high',
        rationale: 'No test verifies ledger rollback when webhook payload reports partial authorization',
      },
    ],
    recommendedTargetedSuite: 'npm test -- src/clients/payment.client.spec.ts src/services/billing.spec.ts',
    coveragePct: 76,
  },
  {
    id: 'test-case-2',
    symbol: 'OrderService.processOrder()',
    affectedPath: 'Cart Checkout ──► Inventory Reservation ──► Order Created Topic',
    domain: 'Commerce & Orders',
    existingTests: [
      { name: 'OrderCreationSuccessFlow', type: 'integration', status: 'passed', durationMs: 210 },
      { name: 'OutOfStockReservationAbort', type: 'unit', status: 'passed', durationMs: 25 },
      { name: 'OrderDiscountCalculationMatrix', type: 'unit', status: 'passed', durationMs: 18 },
    ],
    missingTests: [
      {
        description: 'Kafka Broker Disconnect & Replay Safety',
        risk: 'high',
        rationale: 'Message publishing failure does not verify local outbox table persistence',
      },
    ],
    recommendedTargetedSuite: 'npm test -- src/services/order.service.spec.ts src/events/order.publisher.spec.ts',
    coveragePct: 88,
  },
]

export function Testing() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCaseId, setSelectedCaseId] = useState<string>('test-case-1')
  const [isRunningTargeted, setIsRunningTargeted] = useState(false)

  const selectedCase = SAMPLE_TARGETED_TESTS.find((c) => c.id === selectedCaseId) || SAMPLE_TARGETED_TESTS[0]

  function handleRunTargeted() {
    setIsRunningTargeted(true)
    setTimeout(() => {
      setIsRunningTargeted(false)
    }, 1500)
  }

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing Test Intelligence" hint="Mapping test protections, coverage gaps, and targeted suites..." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to inspect test intelligence"
        description="Testing intelligence pinpoints test protection for modified symbols, uncovered edge cases, and targeted regression suites."
        icon={TestTube2}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Test intelligence warning" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 ring-1 ring-emerald-500/30">
              <TestTube2 className="size-5 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Test Intelligence & Protection Matrix</h1>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                  Targeted Verification
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Targeted test execution grounded in AST blast radius for {data.repository.owner}/{data.repository.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Global Test Stats Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="size-3.5 text-emerald-400" />
            <span>Automated Tests Detected</span>
          </div>
          <button
            type="button"
            onClick={handleRunTargeted}
            disabled={isRunningTargeted}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {isRunningTargeted ? <RefreshCw className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            <span>{isRunningTargeted ? 'Running Targeted Suite...' : 'Run Targeted Suite'}</span>
          </button>
        </div>
      </header>

      {/* Flagship Targeted Testing Pipeline Banner */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/80 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-zinc-100">Targeted Test Optimization Pipeline</h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Only execute tests directly safeguarding impacted call paths instead of slow, ungrounded whole-repo runs.
            </p>
          </div>

          {/* Test Case Switcher */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
            {SAMPLE_TARGETED_TESTS.map((tc) => (
              <button
                key={tc.id}
                type="button"
                onClick={() => setSelectedCaseId(tc.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedCaseId === tc.id
                    ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{tc.symbol.split('(')[0]}</span>
                <span className="rounded bg-zinc-700 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                  {tc.coveragePct}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4-Stage Targeted Flow: Symbol -> Path -> Existing -> Missing */}
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">1. CHANGED SYMBOL</span>
            <p className="mt-2 font-mono text-sm font-bold text-zinc-100">{selectedCase.symbol}</p>
            <p className="mt-1 text-[11px] text-zinc-400">Domain: {selectedCase.domain}</p>
          </div>

          <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">2. AFFECTED PATH</span>
            <p className="mt-2 font-mono text-xs leading-relaxed text-sky-200">{selectedCase.affectedPath}</p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">3. EXISTING TESTS</span>
              <CheckCircle2 className="size-3.5 text-emerald-400" />
            </div>
            <p className="mt-2 font-mono text-sm font-bold text-emerald-300">{selectedCase.existingTests.length} Suites Passing</p>
            <p className="mt-1 text-[11px] text-zinc-400">Total duration: 203ms</p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">4. MISSING TESTS</span>
              <AlertTriangle className="size-3.5 text-amber-400" />
            </div>
            <p className="mt-2 font-mono text-sm font-bold text-amber-300">{selectedCase.missingTests.length} Coverage Gaps</p>
            <p className="mt-1 text-[11px] text-zinc-400">Critical failover unsimulated</p>
          </div>
        </div>
      </section>

      {/* Main Grid: Existing Tests vs Missing Test Harnesses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Existing Test Suites */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">Active Test Protection Suites</h3>
            </div>
            <span className="text-[11px] text-zinc-400">Deterministic verification</span>
          </div>

          <div className="space-y-2.5">
            {selectedCase.existingTests.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 font-mono text-[9px] uppercase text-zinc-400">
                      {t.type}
                    </span>
                    <span className="font-mono text-xs font-semibold text-zinc-200">{t.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">{t.durationMs}ms execution</span>
                </div>
                <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 className="size-3" /> PASS
                </span>
              </div>
            ))}
          </div>

          {/* Targeted Execution CLI Snippet */}
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Optimal Targeted Test Command
            </span>
            <pre className="mt-1.5 font-mono text-xs text-sky-400 overflow-x-auto select-all">
              {selectedCase.recommendedTargetedSuite}
            </pre>
          </div>
        </div>

        {/* Missing Test Scenarios (High Risk Gaps) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-100">Identified Test Coverage Gaps</h3>
            </div>
            <span className="text-[11px] text-red-400 font-semibold">Action Recommended</span>
          </div>

          <div className="space-y-3">
            {selectedCase.missingTests.map((gap, idx) => (
              <div key={idx} className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-200">{gap.description}</h4>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                      gap.risk === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {gap.risk} risk
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-400">{gap.rationale}</p>
                <div className="mt-2 pt-2 border-t border-amber-500/20 flex justify-end">
                  <Link
                    to={`/intelligence?q=Generate+a+test+suite+for+${encodeURIComponent(gap.description)}`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300"
                  >
                    <Sparkles className="size-3" />
                    Generate Spec with AI
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Handoff Buttons */}
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/80 pt-4">
            <Link
              to="/impact"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <Waypoints className="size-3.5 text-sky-400" />
              Inspect Impact Radius
            </Link>
            <Link
              to="/planning"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
            >
              <Brain className="size-3.5" />
              Add to Test Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
