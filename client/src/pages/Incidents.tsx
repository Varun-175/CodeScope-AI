import { AlertOctagon, ArrowRight, Beaker, CheckCircle2, FileCode2, Layers, ShieldAlert, Waypoints, XCircle, Zap } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

export function Incidents() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()

  if (status === 'analyzing') return <LoadingState title="Preparing incident signals" hint="Inspecting repository risks and analysis status" />
  if (!data) return <EmptyState title="Analyze a repository to inspect incident signals" description="Incident intelligence is scoped to the currently analyzed repository snapshot. Live incidents and on-call data require an operations provider." icon={Beaker} />

  const risks = [
    ...(data.risks.critical ?? []).map((risk, index) => ({ id: `inc-crit-${index}`, severity: 'Critical', title: risk.path || 'Critical repository risk', detail: risk.reason || 'The analyzer reported a critical risk.', path: risk.path })),
    ...(data.risks.warnings ?? []).map((risk, index) => ({ id: `inc-warn-${index}`, severity: 'Warning', title: risk.path || 'Repository warning', detail: risk.reason || 'The analyzer reported a warning.', path: risk.path })),
  ]

  const selectedIncident = risks.find((r) => r.id === searchParams.get('incident')) ?? risks[0]

  function selectIncident(id: string) {
    const next = new URLSearchParams(searchParams)
    next.set('incident', id)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-5">
      {error ? <ErrorState title="Latest analysis failed" description="Showing the last completed incident signals. Run another analysis to refresh this snapshot." /> : null}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-white">
            <AlertOctagon className="size-5 text-red-400" aria-hidden="true" />
            Incidents & Operational Risks
          </h1>
          <p className="mt-1 text-xs text-zinc-500">Operational risk signals for {data.repository.owner}/{data.repository.name} at {data.repository.branch}.</p>
        </div>
        <span className="neo-pressed px-3 py-2 text-[10px] text-zinc-500">Live incident provider not configured</span>
      </header>

      <section className="neo-flat p-5">
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/70 pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Repository risk signals</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-zinc-200">{risks.length}</p>
          </div>
          <p className="max-w-md text-xs leading-5 text-zinc-500">These are analyzer findings, not production incidents. Connect an operations provider to monitor runtime impact and responders.</p>
        </div>

        <div className="mt-4 space-y-3">
          {risks.length === 0 && (
            <div className="neo-pressed flex items-center gap-3 p-4 text-xs text-zinc-500">
              <CheckCircle2 className="size-4 text-emerald-400" aria-hidden="true" />
              No critical or warning risks were reported for this snapshot.
            </div>
          )}
          {risks.map((risk) => {
            const RiskIcon = risk.severity === 'Critical' ? ShieldAlert : XCircle
            return (
              <button
                key={risk.id}
                type="button"
                onClick={() => selectIncident(risk.id)}
                className={`neo-pressed flex w-full items-start justify-between gap-3 p-4 text-left transition ${
                  selectedIncident?.id === risk.id ? 'ring-1 ring-red-500/50' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <RiskIcon className={`mt-0.5 size-4 shrink-0 ${risk.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${risk.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
                        {risk.severity}
                      </span>
                      <p className="text-xs font-medium text-zinc-300 truncate">{risk.title}</p>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-zinc-500">{risk.detail}</p>
                    {risk.path && <p className="mt-2 font-mono text-[10px] text-zinc-500">{risk.path}</p>}
                  </div>
                </div>
                <ArrowRight className="mt-1 size-3.5 shrink-0 text-zinc-600" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </section>

      {selectedIncident ? (
        <section className="neo-flat p-5" aria-label="Selected incident inspector">
          <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/70 pb-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-red-400">Incident Diagnosis & Remediation</p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-200">{selectedIncident.title}</h2>
              <p className="mt-1 font-mono text-xs text-zinc-500">{selectedIncident.path || 'Architectural level signal'}</p>
            </div>
            <span className={`neo-pressed px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              selectedIncident.severity === 'Critical' ? 'text-red-400 border border-red-800/50' : 'text-amber-400 border border-amber-800/50'
            }`}>
              {selectedIncident.severity}
            </span>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium text-zinc-200">Root-cause candidate analysis</h3>
              <p className="mt-2 text-xs leading-5 text-zinc-400">{selectedIncident.detail}</p>
              <div className="mt-4 rounded border border-zinc-800/70 bg-zinc-950/40 p-3">
                <p className="text-[11px] font-medium text-zinc-300">Recommended Resolution Procedure:</p>
                <ol className="mt-2 list-decimal pl-4 space-y-1.5 text-[11px] text-zinc-500">
                  <li>Inspect callers and references in the Source Explorer.</li>
                  <li>Check dependency security and vulnerability catalogs.</li>
                  <li>Create a remediation plan with automated test verification.</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-zinc-200">Connected diagnostic handoffs</h3>
              <div className="mt-3 space-y-2">
                <Link to="/repository/explore" className="neo-pressed flex items-center justify-between p-3 text-xs text-zinc-300 hover:text-white">
                  <span className="flex items-center gap-2"><FileCode2 className="size-3.5 text-sky-400" />Inspect Affected Code</span>
                  <ArrowRight className="size-3 text-zinc-600" />
                </Link>
                <Link to="/architecture" className="neo-pressed flex items-center justify-between p-3 text-xs text-zinc-300 hover:text-white">
                  <span className="flex items-center gap-2"><Layers className="size-3.5 text-violet-400" />Explore Component Architecture</span>
                  <ArrowRight className="size-3 text-zinc-600" />
                </Link>
                <Link to="/impact" className="neo-pressed flex items-center justify-between p-3 text-xs text-zinc-300 hover:text-white">
                  <span className="flex items-center gap-2"><Waypoints className="size-3.5 text-sky-400" />Calculate Change Blast Radius</span>
                  <ArrowRight className="size-3 text-zinc-600" />
                </Link>
                <Link to="/planning" className="neo-accent flex items-center justify-between p-3 text-xs font-medium text-white">
                  <span className="flex items-center gap-2"><Zap className="size-3.5" />Generate Remediation Plan</span>
                  <ArrowRight className="size-3 text-violet-300" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
