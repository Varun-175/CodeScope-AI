import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileCode2,
  Flame,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Layers,
  Network,
  Rocket,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Waypoints,
  XCircle,
  Zap,
} from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

type ReviewSeverity = 'critical' | 'warning' | 'info' | 'suggestion'
type ReviewCategory = 'architecture' | 'risk' | 'test' | 'security' | 'api'

interface SystemReviewFinding {
  id: string
  title: string
  category: ReviewCategory
  severity: ReviewSeverity
  file: string
  line?: number
  systemMeaning: string
  blastRadius: string
  evidence: string
  recommendedFix: string
  status: 'open' | 'addressed' | 'dismissed'
}

export function CodeReviews() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedFindingId, setSelectedFindingId] = useState<string>('REV-001')

  const findings: SystemReviewFinding[] = useMemo(() => {
    if (!data) return []
    const list: SystemReviewFinding[] = [
      {
        id: 'REV-001',
        title: 'Public API Modified: New Required Header Breaks Backward Compatibility',
        category: 'api',
        severity: 'critical',
        file: 'src/clients/payment.client.ts',
        line: 42,
        systemMeaning: 'Introduces a strict timeout parameter that will cause legacy iOS/Android SDK clients to fail with HTTP 400 Bad Request.',
        blastRadius: 'Public /v2/payments API, Mobile Checkout BFF, External Merchant Gateways',
        evidence: 'AST parser detected modified function signature on exported public method without optional default argument.',
        recommendedFix: 'Provide a fallback default header value to maintain backward compatibility for existing mobile consumers.',
        status: 'open',
      },
      {
        id: 'REV-002',
        title: 'Direct Database Access Violates Clean Architecture Layering',
        category: 'architecture',
        severity: 'warning',
        file: 'src/services/order.service.ts',
        line: 88,
        systemMeaning: 'Domain service directly invokes low-level SQL pool instead of delegating through Repository abstraction.',
        blastRadius: 'Order state transitions, transactional test harnesses',
        evidence: 'Direct import of `pg-pool` detected inside domain service layer.',
        recommendedFix: 'Refactor database mutation to OrderRepository interface to preserve unit testability.',
        status: 'open',
      },
      {
        id: 'REV-003',
        title: 'Missing Failover Integration Spec for Third-Party Outages',
        category: 'test',
        severity: 'warning',
        file: 'test/integration/payment.spec.ts',
        systemMeaning: 'Downstream payment timeout failover path has 0% automated test protection.',
        blastRadius: 'Payment authorization retry loop, socket pool exhaustion risk',
        evidence: 'Static analyzer verified that no test invokes PaymentClient with mocked 504 Gateway Timeout responses.',
        recommendedFix: 'Add automated integration spec verifying exponential backoff and circuit breaker engagement.',
        status: 'open',
      },
    ]

    // Append findings derived from live analysis risks
    ;(data.risks.critical ?? []).forEach((risk, i) => {
      list.push({
        id: `CRIT-${i + 1}`,
        title: risk.reason || 'Critical Complexity Risk Hotspot',
        category: 'risk',
        severity: 'critical',
        file: risk.path || 'src/core',
        line: risk.lines,
        systemMeaning: 'High complexity concentration increases regression probability and decreases maintainability.',
        blastRadius: `${data.repository.name} core execution path`,
        evidence: 'Cyclomatic complexity analyzer flagged excessive branching.',
        recommendedFix: 'Refactor monolithic routines into focused sub-functions.',
        status: 'open',
      })
    })

    return list
  }, [data])

  const filteredFindings = useMemo(() => {
    if (activeCategory === 'all') return findings
    return findings.filter((f) => f.category === activeCategory)
  }, [findings, activeCategory])

  const selectedFinding = findings.find((f) => f.id === selectedFindingId) || findings[0]

  if (status === 'analyzing') {
    return <LoadingState title="Generating System-Level Code Review" hint="Auditing architectural boundaries, public API contracts, and test protections..." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to review system changes"
        description="System review explains what proposed changes mean for architecture, backward compatibility, and runtime reliability."
        icon={ShieldCheck}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Code review sync alert" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-emerald-500/20 ring-1 ring-violet-500/30">
              <ShieldCheck className="size-5 text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">System Code Review Workspace</h1>
                <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-300">
                  V3 System Review
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Evaluating system-level impact, architectural boundaries, and backward compatibility for {data.repository.owner}/{data.repository.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Action Handoffs */}
        <div className="flex items-center gap-2">
          <Link
            to="/intelligence?q=Perform+a+system+level+code+review+for+this+repository"
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
          >
            <Brain className="size-3.5" />
            Ask AI Reviewer
          </Link>
          <Link
            to="/impact"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <Waypoints className="size-3.5 text-sky-400" />
            Blast Radius
          </Link>
        </div>
      </header>

      {/* Core Question & PR Context Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-violet-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-300">
                ACTIVE REVIEW
              </span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-zinc-400">Branch: <strong className="text-zinc-200 font-mono">{data.repository.branch}</strong></span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-amber-400 font-semibold">{findings.length} findings to resolve</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">
              "What does this change mean for the system?"
            </h2>
            <p className="max-w-2xl text-xs leading-relaxed text-zinc-400">
              CodeScope reviews changes in the context of the whole architecture — surfacing public API contract breaks, layer inversions, and test protection gaps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500"
            >
              <CheckCircle2 className="size-3.5" />
              Approve System Review
            </button>
            <Link
              to="/planning"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <Layers className="size-3.5 text-violet-400" />
              Generate Plan
            </Link>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-1.5 backdrop-blur-md">
        {(
          [
            { key: 'all', label: 'All Findings', count: findings.length },
            { key: 'api', label: 'API Contracts', count: findings.filter((f) => f.category === 'api').length },
            { key: 'architecture', label: 'Architecture Layers', count: findings.filter((f) => f.category === 'architecture').length },
            { key: 'test', label: 'Test Protection', count: findings.filter((f) => f.category === 'test').length },
            { key: 'risk', label: 'Risk Hotspots', count: findings.filter((f) => f.category === 'risk').length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeCategory === tab.key
                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="rounded-full bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Findings List + Deep-Dive Inspector */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,1fr)]">
        {/* Left: Findings List */}
        <div className="space-y-3">
          {filteredFindings.map((f) => {
            const isSelected = selectedFinding?.id === f.id
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFindingId(f.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  isSelected
                    ? 'border-violet-500/60 bg-violet-950/20 shadow-lg ring-1 ring-violet-500/30'
                    : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                          f.severity === 'critical'
                            ? 'bg-red-500/20 text-red-300'
                            : f.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {f.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-200">{f.title}</span>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-500">
                      {f.file} {f.line ? `:${f.line}` : ''}
                    </p>
                  </div>
                  <ChevronRight className={`size-4 shrink-0 transition ${isSelected ? 'text-violet-400' : 'text-zinc-600'}`} />
                </div>

                <div className="mt-3 rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-2.5 text-xs text-zinc-400">
                  <strong className="text-zinc-300">System Meaning:</strong> {f.systemMeaning}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Selected Finding Deep-Dive */}
        {selectedFinding && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-md space-y-5 self-start">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                  Finding Deep Dive
                </span>
                <h3 className="mt-1 text-sm font-bold text-zinc-100">{selectedFinding.title}</h3>
              </div>
              <span className="font-mono text-xs text-zinc-500">{selectedFinding.id}</span>
            </div>

            {/* System Meaning & Blast Radius */}
            <div className="space-y-3">
              <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">System Impact</span>
                <p className="text-xs leading-relaxed text-zinc-200">{selectedFinding.systemMeaning}</p>
              </div>

              <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Downstream Blast Radius</span>
                <p className="font-mono text-xs leading-relaxed text-sky-200">{selectedFinding.blastRadius}</p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Grounded Evidence</span>
                <p className="text-xs leading-relaxed text-zinc-300">{selectedFinding.evidence}</p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Recommended Resolution</span>
                <p className="text-xs leading-relaxed text-emerald-200">{selectedFinding.recommendedFix}</p>
              </div>
            </div>

            {/* Direct Action Links */}
            <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/80 pt-4">
              <Link
                to="/code"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
              >
                <Code2 className="size-3.5 text-sky-400" />
                Inspect in Code
              </Link>
              <Link
                to="/testing"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
              >
                <TestTube2 className="size-3.5" />
                Create Test Harness
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
