import { useMemo } from 'react'
import { ArrowRight, BookOpen, GitBranch, GitCommitHorizontal, ShieldAlert, Waypoints } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

type ChangeEvent = {
  id: string
  title: string
  detail: string
  category: 'architecture' | 'risk' | 'dependency' | 'validation'
  path?: string
  severity?: string
}

export function Changes() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()

  const changeEvents = useMemo<ChangeEvent[]>(() => {
    if (!data) return []

    const events: ChangeEvent[] = [
      {
        id: 'snapshot-baseline',
        title: 'Snapshot analyzed',
        detail: `${data.repository.files.toLocaleString()} files (${data.repository.lines_of_code.toLocaleString()} lines) in ${data.repository.primary_language}`,
        category: 'architecture',
      },
    ]

    ;(data.risks.critical ?? []).forEach((risk, i) => {
      events.push({
        id: `crit-${i}`,
        title: risk.path || 'Critical hotspot detected',
        detail: risk.reason || 'Analyzer reported high complexity risk in this component.',
        category: 'risk',
        path: risk.path,
        severity: 'Critical',
      })
    })

    ;(data.risks.warnings ?? []).forEach((warning, i) => {
      events.push({
        id: `warn-${i}`,
        title: warning.path || 'Warning signal detected',
        detail: warning.reason || 'Analyzer flagged an architectural caution.',
        category: 'risk',
        path: warning.path,
        severity: 'Warning',
      })
    })

    if (data.dependency_health.total_dependencies > 0) {
      events.push({
        id: 'deps-baseline',
        title: 'Dependency baseline indexed',
        detail: `${data.dependency_health.total_dependencies} packages (${data.dependency_health.healthy?.length ?? 0} verified healthy, ${data.dependency_health.unknown?.length ?? 0} unverified)`,
        category: 'dependency',
      })
    }

    events.push({
      id: 'test-validation',
      title: data.repository.has_tests ? 'Automated test suite indexed' : 'No automated test suite detected',
      detail: data.repository.has_tests
        ? `${data.repository.parsed_files} parseable files available for test-impact mapping.`
        : 'Connect a test runner or configure test directories to track coverage deltas.',
      category: 'validation',
    })

    return events
  }, [data])

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing repository changes" hint="Computing snapshot differences, architectural shifts, and risk progression" />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to view changes"
        description="Change timeline, commit diffs, and risk deltas will appear once a repository snapshot is analyzed."
        icon={GitCommitHorizontal}
      />
    )
  }

  const selectedEventId = searchParams.get('item') || changeEvents[0]?.id
  const selectedEvent = changeEvents.find((e) => e.id === selectedEventId) ?? changeEvents[0]

  function selectEvent(id: string) {
    const next = new URLSearchParams(searchParams)
    next.set('item', id)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-5">
      {error ? <ErrorState title="Latest analysis failed" description="Showing changes for the last completed snapshot. Run another analysis to refresh." /> : null}

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <GitCommitHorizontal className="size-5 text-sky-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Changes & Snapshot Timeline</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Architectural and risk delta tracking for {data.repository.owner}/{data.repository.name} on branch <span className="font-mono text-zinc-300">{data.repository.branch}</span>.
          </p>
        </div>
        <span className="neo-pressed inline-flex items-center gap-2 px-3 py-2 text-[10px] text-zinc-500">
          <GitBranch className="size-3" aria-hidden="true" />
          Single snapshot indexed
        </span>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="neo-flat p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total Events</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-zinc-200">{changeEvents.length}</p>
          <p className="mt-1 text-[10px] text-zinc-600">in current snapshot</p>
        </div>
        <div className="neo-flat p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Risk Signals</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-amber-400">
            {(data.risks.critical?.length ?? 0) + (data.risks.warnings?.length ?? 0)}
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">flagged by analyzer</p>
        </div>
        <div className="neo-flat p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Dependencies</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-sky-400">{data.dependency_health.total_dependencies}</p>
          <p className="mt-1 text-[10px] text-zinc-600">packages monitored</p>
        </div>
        <div className="neo-flat p-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Validation Status</p>
          <p className={`mt-2 font-mono text-2xl font-semibold ${data.repository.has_tests ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {data.repository.has_tests ? 'Active' : 'Unset'}
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">{data.repository.has_tests ? 'Tests detected' : 'No tests found'}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        {/* Timeline list */}
        <section className="neo-flat p-5">
          <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
            <GitCommitHorizontal className="size-4 text-sky-400" aria-hidden="true" />
            <h2 className="text-sm font-medium text-zinc-200">Snapshot event timeline</h2>
          </div>

          <div className="mt-4 space-y-3">
            {changeEvents.map((evt) => (
              <button
                key={evt.id}
                type="button"
                onClick={() => selectEvent(evt.id)}
                className={`neo-pressed flex w-full items-start justify-between gap-3 p-3.5 text-left transition ${
                  selectedEvent?.id === evt.id ? 'ring-1 ring-violet-500/60' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                        evt.severity === 'Critical'
                          ? 'border border-red-800/50 bg-red-950/40 text-red-400'
                          : evt.severity === 'Warning'
                            ? 'border border-amber-800/50 bg-amber-950/40 text-amber-400'
                            : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400'
                      }`}
                    >
                      {evt.category}
                    </span>
                    <p className="truncate text-xs font-semibold text-zinc-200">{evt.title}</p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">{evt.detail}</p>
                </div>
                <ArrowRight className="mt-1 size-3.5 shrink-0 text-zinc-600" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        {/* Selected Event Details / Inspector */}
        {selectedEvent ? (
          <section className="neo-flat flex flex-col justify-between p-5">
            <div>
              <div className="border-b border-zinc-800/70 pb-4">
                <p className="text-[10px] uppercase tracking-wider text-violet-400">Event Inspector</p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-200">{selectedEvent.title}</h3>
                <p className="mt-1 font-mono text-[10px] text-zinc-500">Category: {selectedEvent.category}</p>
              </div>

              <div className="mt-4 space-y-4 text-xs text-zinc-400 leading-relaxed">
                <div>
                  <h4 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Analysis Summary</h4>
                  <p className="mt-1 text-zinc-300">{selectedEvent.detail}</p>
                </div>

                {selectedEvent.path ? (
                  <div>
                    <h4 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Affected File Path</h4>
                    <p className="mt-1 font-mono text-[11px] text-zinc-300 bg-zinc-950/60 p-2 rounded border border-zinc-800">
                      {selectedEvent.path}
                    </p>
                  </div>
                ) : null}

                <div>
                  <h4 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Contextual Impact</h4>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Changes to this component may influence downstream dependency health, test reliability, and deployment preflight checks.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-800/70 pt-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Connected Handoffs</h4>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  to="/impact"
                  className="neo-convex flex items-center justify-between p-2.5 text-xs text-zinc-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Waypoints className="size-3.5 text-sky-400" />
                    Calculate Blast Radius
                  </span>
                  <ArrowRight className="size-3 text-zinc-600" />
                </Link>
                <Link
                  to="/reviews"
                  className="neo-convex flex items-center justify-between p-2.5 text-xs text-zinc-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="size-3.5 text-amber-400" />
                    Review Code Findings
                  </span>
                  <ArrowRight className="size-3 text-zinc-600" />
                </Link>
                <Link
                  to="/planning"
                  className="neo-accent flex items-center justify-between p-2.5 text-xs font-medium text-white"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-3.5" />
                    Create Remediation Plan
                  </span>
                  <ArrowRight className="size-3 text-violet-300" />
                </Link>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <section className="neo-flat p-5">
        <h2 className="text-sm font-medium text-zinc-200">Snapshot Integrity & Diff Signals</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="neo-pressed p-3">
            <p className="text-xs font-medium text-zinc-300">File Tree Delta</p>
            <p className="mt-1 text-[10px] text-zinc-500">{data.repository.files} files indexed</p>
            <p className="mt-2 text-[10px] text-emerald-400">Verified</p>
          </div>
          <div className="neo-pressed p-3">
            <p className="text-xs font-medium text-zinc-300">Architecture Shift</p>
            <p className="mt-1 text-[10px] text-zinc-500">Framework: {data.dna.framework || 'Generic'}</p>
            <p className="mt-2 text-[10px] text-emerald-400">Baseline recorded</p>
          </div>
          <div className="neo-pressed p-3">
            <p className="text-xs font-medium text-zinc-300">Multi-commit Diff</p>
            <p className="mt-1 text-[10px] text-zinc-500">Git provider webhook required for live PR diffs</p>
            <p className="mt-2 text-[10px] text-amber-400">Standby</p>
          </div>
        </div>
      </section>
    </div>
  )
}
