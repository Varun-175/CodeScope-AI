import { CheckCircle2, CircleDashed, GitBranch, Play, Settings, Workflow, XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

export function Workflows() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams] = useSearchParams()

  if (status === 'analyzing') return <LoadingState title="Preparing workflow workspace" hint="Inspecting repository entry points and validation signals" />
  if (!data) return <EmptyState title="Analyze a repository to design workflows" description="Workflow design is ready for a provider connection. Start with a repository snapshot to preflight the pipeline." icon={Workflow} />

  const steps = [
    { label: 'Source', detail: `${data.repository.branch} snapshot`, ready: true },
    { label: 'Build', detail: data.dna.framework || data.repository.primary_language || 'Build command required', ready: Boolean(data.dna.framework || data.repository.primary_language) },
    { label: 'Test', detail: data.repository.has_tests ? 'Test files detected' : 'Test suite required', ready: data.repository.has_tests },
    { label: 'Deploy', detail: 'Provider connection required', ready: false },
  ]
  const readySteps = steps.filter((step) => step.ready).length
  const selectedStep = steps.find((step) => step.label.toLowerCase() === searchParams.get('stage')) ?? steps[0]

  return (
    <div className="space-y-5">
      {error ? <ErrorState title="Latest analysis failed" description="Showing the last completed workflow preflight. Run another analysis to refresh these signals." /> : null}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div><div className="flex items-center gap-3"><Workflow className="size-5 text-amber-400" aria-hidden="true" /><h1 className="text-lg font-semibold text-white">Workflows</h1></div><p className="mt-1 text-xs text-zinc-500">Pipeline design for {data.repository.owner}/{data.repository.name} at {data.repository.branch}.</p></div>
        <div className="flex gap-2"><button type="button" disabled className="neo-pressed inline-flex items-center gap-2 px-3 py-2 text-xs text-zinc-600"><Settings className="size-3.5" aria-hidden="true" />Configure provider</button><button type="button" disabled className="neo-accent inline-flex items-center gap-2 px-3 py-2 text-xs opacity-40"><Play className="size-3.5" aria-hidden="true" />Run workflow</button></div>
      </header>

      <section className="neo-flat p-5"><div className="flex flex-col justify-between gap-3 border-b border-zinc-800/70 pb-4 sm:flex-row sm:items-end"><div><p className="text-xs uppercase tracking-wider text-zinc-500">Pipeline readiness</p><p className="mt-2 font-mono text-3xl font-semibold text-zinc-200">{readySteps}/{steps.length}</p></div><p className="max-w-md text-xs leading-5 text-zinc-500">The pipeline canvas is preflighted from repository evidence. Execution history and runner telemetry will populate after a CI provider is connected.</p></div><div className="mt-6 grid gap-3 md:grid-cols-4">{steps.map((step, index) => <div key={step.label} className="relative"><div className={`neo-pressed min-h-24 p-4 ${step.ready ? 'border-emerald-500/30' : 'border-zinc-800'}`}><div className="flex items-center gap-2">{step.ready ? <CheckCircle2 className="size-4 text-emerald-400" aria-hidden="true" /> : <XCircle className="size-4 text-zinc-600" aria-hidden="true" />}<span className="text-xs font-semibold text-zinc-300">{step.label}</span></div><p className="mt-3 text-[10px] leading-4 text-zinc-500">{step.detail}</p></div>{index < steps.length - 1 && <span className="absolute -right-2 top-12 hidden text-zinc-700 md:block">→</span>}</div>)}</div></section>

      <section className="neo-flat p-5"><p className="text-[10px] uppercase tracking-wider text-violet-400">Selected pipeline stage</p><h2 className="mt-1 text-sm font-semibold text-zinc-200">{selectedStep.label}</h2><p className="mt-2 text-xs text-zinc-500">{selectedStep.detail}</p><div className="mt-4 flex flex-wrap gap-2"><Link to="/repository/explore" className="neo-convex px-3 py-2 text-xs text-zinc-400">Inspect source</Link><Link to="/testing" className="neo-convex px-3 py-2 text-xs text-zinc-400">Review test targets</Link><Link to="/deployment" className="neo-accent px-3 py-2 text-xs font-medium">Open deployment readiness</Link></div></section>

      <div className="grid gap-5 lg:grid-cols-2"><section className="neo-flat p-5"><div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4"><GitBranch className="size-4 text-sky-400" aria-hidden="true" /><h2 className="text-sm font-medium text-zinc-200">Workflow inputs</h2></div><dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between gap-4"><dt className="text-zinc-600">Branch</dt><dd className="font-mono text-zinc-300">{data.repository.branch}</dd></div><div className="flex justify-between gap-4"><dt className="text-zinc-600">Entry point</dt><dd className="font-mono text-zinc-300">{data.repository.entry_points?.[0] || 'Not detected'}</dd></div><div className="flex justify-between gap-4"><dt className="text-zinc-600">Package manager</dt><dd className="text-zinc-300">{data.dependency_health.package_manager || 'Not detected'}</dd></div></dl></section><section className="neo-flat p-5"><div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4"><CircleDashed className="size-4 text-zinc-500" aria-hidden="true" /><h2 className="text-sm font-medium text-zinc-200">Execution history</h2></div><div className="flex min-h-28 items-center justify-center text-center text-xs text-zinc-600">No workflow runs are available.<br />Connect a CI provider to collect build evidence.</div></section></div>
    </div>
  )
}
