import { useMemo } from 'react'
import { Activity, ArrowRight, GitCommitHorizontal, ShieldAlert, TestTube2, Waypoints } from 'lucide-react'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'

export function Impact() {
  const { data, status } = useRepositoryAnalysis()
  const targets = useMemo(() => {
    if (!data) return []
    return [...(data.risks.critical ?? []), ...(data.risks.complexity_hotspots ?? []), ...(data.risks.warnings ?? [])].slice(0, 8)
  }, [data])

  if (status === 'analyzing') return <LoadingState title="Preparing impact workspace" hint="Mapping repository risks and likely change targets" />
  if (!data) return <EmptyState title="Analyze a repository to explore impact" description="Impact analysis will connect commits, changed files, affected tests, and risk evidence when source-control data is available." icon={Waypoints} />

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex items-center gap-3"><Waypoints className="size-5 text-sky-400" aria-hidden="true" /><h1 className="text-lg font-semibold text-white">Change Impact</h1></div><p className="mt-1 text-xs text-zinc-500">A snapshot-aware change workspace for {data.repository.owner}/{data.repository.name}.</p></div><span className="neo-pressed px-3 py-2 text-[10px] text-zinc-500">Commit provider not configured</span></header>
      <div className="grid gap-3 md:grid-cols-3"><Metric icon={GitCommitHorizontal} label="Compared changes" value="--" detail="Awaiting a commit or diff" /><Metric icon={Activity} label="Affected targets" value={`${targets.length}`} detail="Risk signals in this snapshot" /><Metric icon={TestTube2} label="Affected tests" value="--" detail="Execution provider required" /></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]"><section className="neo-flat p-5"><div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4"><GitCommitHorizontal className="size-4 text-sky-400" aria-hidden="true" /><h2 className="text-sm font-medium text-zinc-200">Change timeline</h2></div><div className="flex min-h-64 items-center justify-center p-8 text-center"><div><GitCommitHorizontal className="mx-auto size-7 text-zinc-700" aria-hidden="true" /><p className="mt-3 text-sm text-zinc-400">No commit history loaded</p><p className="mt-1 max-w-sm text-xs leading-5 text-zinc-600">Select a repository commit or compare two snapshots to calculate changed files and downstream impact.</p></div></div></section><section className="neo-flat p-5"><div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4"><ShieldAlert className="size-4 text-amber-400" aria-hidden="true" /><h2 className="text-sm font-medium text-zinc-200">Potential targets</h2></div><div className="mt-4 space-y-2">{targets.length === 0 ? <p className="py-8 text-center text-xs text-zinc-600">No risk targets reported.</p> : targets.map((target, index) => <div key={`${target.path}-${index}`} className="neo-pressed flex items-center justify-between gap-3 px-3 py-2.5"><span className="min-w-0 truncate font-mono text-[10px] text-zinc-400">{target.path || target.reason || 'Repository signal'}</span><ArrowRight className="size-3 shrink-0 text-zinc-600" aria-hidden="true" /></div>)}</div></section></div>
      <section className="neo-flat p-5"><h2 className="text-sm font-medium text-zinc-200">Evidence contract</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><Evidence label="Changed files" detail="Diff service" /><Evidence label="Downstream entities" detail="Graph service" /><Evidence label="Test coverage" detail="Test runner" /></div><p className="mt-4 border-t border-zinc-800/70 pt-4 text-[10px] text-zinc-600">This page is ready for commit, graph, and test APIs. Current values are intentionally not simulated.</p></section>
    </div>
  )
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Activity; label: string; value: string; detail: string }) { return <div className="neo-flat p-4"><div className="flex items-center gap-2"><Icon className="size-4 text-sky-400" aria-hidden="true" /><span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span></div><p className="mt-3 font-mono text-2xl font-semibold text-zinc-200">{value}</p><p className="mt-1 text-[10px] text-zinc-600">{detail}</p></div> }
function Evidence({ label, detail }: { label: string; detail: string }) { return <div className="neo-pressed p-3"><p className="text-xs font-medium text-zinc-300">{label}</p><p className="mt-1 text-[10px] text-zinc-600">{detail} pending</p></div> }
