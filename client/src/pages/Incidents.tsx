import { AlertOctagon, ArrowUpRight, Beaker, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'

export function Incidents() {
  const { data, status } = useRepositoryAnalysis()

  if (status === 'analyzing') return <LoadingState title="Preparing incident signals" hint="Inspecting repository risks and analysis status" />
  if (!data) return <EmptyState title="Analyze a repository to inspect incident signals" description="Incident intelligence is scoped to the currently analyzed repository snapshot. Live incidents and on-call data require an operations provider." icon={Beaker} />

  const risks = [
    ...(data.risks.critical ?? []).map((risk) => ({ severity: 'Critical', title: risk.path || 'Critical repository risk', detail: risk.reason || 'The analyzer reported a critical risk.', path: risk.path })),
    ...(data.risks.warnings ?? []).map((risk) => ({ severity: 'Warning', title: risk.path || 'Repository warning', detail: risk.reason || 'The analyzer reported a warning.', path: risk.path })),
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-white">
            <AlertOctagon className="size-5 text-red-400" aria-hidden="true" />
            Incidents
          </h1>
          <p className="mt-1 text-xs text-zinc-500">Operational risk signals for {data.repository.owner}/{data.repository.name} at {data.repository.branch}.</p>
        </div>
        <span className="neo-pressed px-3 py-2 text-[10px] text-zinc-500">Live incident provider not configured</span>
      </header>

      <section className="neo-flat p-5">
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/70 pb-4 sm:flex-row sm:items-end"><div><p className="text-xs uppercase tracking-wider text-zinc-500">Repository risk signals</p><p className="mt-2 font-mono text-3xl font-semibold text-zinc-200">{risks.length}</p></div><p className="max-w-md text-xs leading-5 text-zinc-500">These are analyzer findings, not production incidents. Connect an operations provider to monitor runtime impact and responders.</p></div>
        <div className="mt-4 space-y-3">
          {risks.length === 0 && <div className="neo-pressed flex items-center gap-3 p-4 text-xs text-zinc-500"><CheckCircle2 className="size-4 text-emerald-400" aria-hidden="true" />No critical or warning risks were reported for this snapshot.</div>}
          {risks.map((risk, index) => {
            const RiskIcon = risk.severity === 'Critical' ? ShieldAlert : XCircle
            return <div key={`${risk.title}-${index}`} className="neo-pressed flex items-start gap-3 p-4"><RiskIcon className={`mt-0.5 size-4 shrink-0 ${risk.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}`} aria-hidden="true" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`text-[10px] uppercase tracking-wider ${risk.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>{risk.severity}</span><p className="text-xs font-medium text-zinc-300">{risk.title}</p></div><p className="mt-1 text-[10px] leading-4 text-zinc-500">{risk.detail}</p>{risk.path && <p className="mt-2 flex items-center gap-1 text-[10px] text-zinc-600"><ArrowUpRight className="size-3" aria-hidden="true" />{risk.path}</p>}</div></div>
          })}
        </div>
      </section>
    </div>
  )
}
