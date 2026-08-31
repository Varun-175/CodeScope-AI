import { useMemo } from 'react'
import { Activity, ArrowRight, BookOpen, FileCode2, GitCommitHorizontal, Network, ShieldAlert, TestTube2, Waypoints } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

export function Impact() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()

  const targets = useMemo(() => {
    if (!data) return []
    return [...(data.risks.critical ?? []), ...(data.risks.complexity_hotspots ?? []), ...(data.risks.warnings ?? [])].slice(0, 8).map((target, index) => ({ ...target, id: `${target.path ?? target.reason ?? 'signal'}-${index}` }))
  }, [data])

  if (status === 'analyzing') {
    return <LoadingState title="Preparing impact workspace" hint="Mapping repository risks and likely change targets" />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to explore impact"
        description="Impact analysis will connect commits, changed files, affected tests, and risk evidence when source-control data is available."
        icon={Waypoints}
      />
    )
  }

  const selectedTarget = targets.find((target) => target.id === searchParams.get('entity')) ?? targets[0]
  const criticalTargets = targets.filter((target) => target.severity?.toLowerCase() === 'critical').length
  function selectTarget(id: string) {
    const next = new URLSearchParams(searchParams)
    next.set('entity', id)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-5">
      {error ? <ErrorState title="Latest analysis failed" description="Showing the last completed analysis. Run another analysis to refresh these signals." /> : null}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <Waypoints className="size-5 text-sky-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Change Impact</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            A snapshot-aware change workspace for {data.repository.owner}/{data.repository.name}.
          </p>
        </div>
        <span className="neo-pressed px-3 py-2 text-[10px] text-zinc-500">Commit provider not configured</span>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric icon={GitCommitHorizontal} label="Compared changes" value="--" detail="Awaiting a commit or diff" />
        <Metric icon={Activity} label="Affected targets" value={`${targets.length}`} detail="Risk signals in this snapshot" />
        <Metric icon={TestTube2} label="Affected tests" value="--" detail="Execution provider required" />
      </div>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Impact dimensions">
        <Dimension icon={ShieldAlert} label="Risk concentration" value={criticalTargets > 0 ? 'High' : targets.length > 0 ? 'Moderate' : 'Low'} detail={`${criticalTargets} critical targets in this snapshot`} tone={criticalTargets > 0 ? 'text-red-400' : 'text-emerald-400'} />
        <Dimension icon={Network} label="Dependency context" value={data.dependency_health.unknown.length > 0 ? 'Review needed' : 'Known'} detail={`${data.dependency_health.unknown.length} dependency signals unknown`} tone={data.dependency_health.unknown.length > 0 ? 'text-amber-400' : 'text-emerald-400'} />
        <Dimension icon={TestTube2} label="Test confidence" value={data.repository.has_tests ? 'Detected' : 'Unavailable'} detail={data.repository.has_tests ? 'Test-related files were found' : 'No test files were found'} tone={data.repository.has_tests ? 'text-emerald-400' : 'text-amber-400'} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
        <section className="neo-flat p-5">
          <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
            <GitCommitHorizontal className="size-4 text-sky-400" aria-hidden="true" />
            <h2 className="text-sm font-medium text-zinc-200">Change timeline</h2>
          </div>

          <div className="mt-4 space-y-3">
            {[
              {
                title: 'Repository snapshot analyzed',
                detail: `${data.repository.files.toLocaleString()} files and ${data.repository.lines_of_code.toLocaleString()} lines inspected`,
                tag: 'source',
              },
              {
                title: 'Risk hotspots identified',
                detail: `${targets.length} candidate change targets were flagged from the current analysis`,
                tag: 'impact',
              },
              {
                title: 'Test readiness reviewed',
                detail: data.repository.has_tests ? 'Automated validation signals were detected in the repository' : 'No automated validation evidence was found in the current snapshot',
                tag: 'validation',
              },
            ].map((item) => (
              <div key={item.title} className="neo-pressed flex items-start justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>
                </div>
                <span className="rounded-full border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="neo-flat p-5">
          <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
            <ShieldAlert className="size-4 text-amber-400" aria-hidden="true" />
            <h2 className="text-sm font-medium text-zinc-200">Potential targets</h2>
          </div>

          <div className="mt-4 space-y-2">
            {targets.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-600">No risk targets reported.</p>
            ) : (
              targets.map((target) => (
                <button key={target.id} type="button" onClick={() => selectTarget(target.id)} className={`neo-pressed flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left ${selectedTarget?.id === target.id ? 'ring-1 ring-violet-500/50' : ''}`}>
                  <span className="min-w-0 truncate font-mono text-[10px] text-zinc-400">
                    {target.path || target.reason || 'Repository signal'}
                  </span>
                  <ArrowRight className="size-3 shrink-0 text-zinc-600" aria-hidden="true" />
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      {selectedTarget ? <section className="neo-flat p-5"><div className="flex flex-col justify-between gap-3 border-b border-zinc-800/70 pb-4 sm:flex-row sm:items-start"><div><p className="text-[10px] uppercase tracking-wider text-violet-400">Selected impact target</p><h2 className="mt-1 font-mono text-sm text-zinc-200">{selectedTarget.path || 'Repository signal'}</h2></div><span className="neo-pressed px-2 py-1 text-[10px] text-amber-400">{selectedTarget.severity || 'Analyzer finding'}</span></div><p className="mt-4 text-sm leading-6 text-zinc-400">{selectedTarget.reason || 'The repository analyzer flagged this target for review.'}</p><div className="mt-4 flex flex-wrap gap-2"><Link to="/repository/explore" className="neo-convex inline-flex items-center gap-2 px-3 py-2 text-xs text-zinc-400"><FileCode2 className="size-3.5 text-sky-400" aria-hidden="true" />Inspect source</Link><Link to="/reviews" className="neo-convex inline-flex items-center gap-2 px-3 py-2 text-xs text-zinc-400"><ShieldAlert className="size-3.5 text-amber-400" aria-hidden="true" />Review finding</Link><Link to="/planning" className="neo-accent inline-flex items-center gap-2 px-3 py-2 text-xs font-medium"><BookOpen className="size-3.5" aria-hidden="true" />Create plan</Link></div></section> : null}

      <section className="neo-flat p-5">
        <h2 className="text-sm font-medium text-zinc-200">Impact evidence</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Evidence label="Source snapshot" detail={`${data.repository.parsed_files} parsed files`} available />
          <Evidence label="Dependency context" detail={`${data.dependency_health.total_dependencies} dependencies detected`} available />
          <Evidence label="Test coverage" detail={data.repository.has_tests ? 'Test files detected' : 'Test execution provider required'} available={data.repository.has_tests} />
        </div>
        <p className="mt-4 border-t border-zinc-800/70 pt-4 text-[10px] text-zinc-600">
          This page is ready for commit, graph, and test APIs. Current values are intentionally not simulated.
        </p>
      </section>
    </div>
  )
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Activity; label: string; value: string; detail: string }) {
  return (
    <div className="neo-flat p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-sky-400" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold text-zinc-200">{value}</p>
      <p className="mt-1 text-[10px] text-zinc-600">{detail}</p>
    </div>
  )
}

function Dimension({ icon: Icon, label, value, detail, tone }: { icon: typeof Activity; label: string; value: string; detail: string; tone: string }) {
  return <div className="neo-flat p-4"><div className="flex items-center gap-2"><Icon className={`size-4 ${tone}`} aria-hidden="true" /><span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span></div><p className={`mt-3 text-sm font-semibold ${tone}`}>{value}</p><p className="mt-1 text-[10px] text-zinc-600">{detail}</p></div>
}

function Evidence({ label, detail, available }: { label: string; detail: string; available: boolean }) {
  return (
    <div className="neo-pressed p-3">
      <p className="text-xs font-medium text-zinc-300">{label}</p>
      <p className="mt-1 text-[10px] text-zinc-600">{detail}</p>
      <p className={`mt-2 text-[10px] ${available ? 'text-emerald-400' : 'text-amber-400'}`}>{available ? 'Verified in current snapshot' : 'Unavailable in current snapshot'}</p>
    </div>
  )
}
