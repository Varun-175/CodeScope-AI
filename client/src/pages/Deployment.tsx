import { useMemo } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, Container, FileCode2, GitBranch, Rocket, Server, ShieldAlert, Workflow, Zap, XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

type Readiness = { id: string; label: string; detail: string; ready: boolean }

export function Deployment() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()

  const readiness = useMemo<Readiness[]>(() => {
    if (!data) return []
    return [
      { id: 'framework', label: 'Framework detected', detail: data.dna.framework || data.repository.framework || 'No framework signal', ready: Boolean(data.dna.framework || data.repository.framework) },
      { id: 'entrypoint', label: 'Entry point detected', detail: data.repository.entry_points?.[0] || 'No entry point was reported', ready: (data.repository.entry_points?.length ?? 0) > 0 },
      { id: 'dependencies', label: 'Dependencies analyzed', detail: `${data.dependency_health.total_dependencies} dependencies in the current snapshot`, ready: data.dependency_health.total_dependencies > 0 },
      { id: 'tests', label: 'Test signal', detail: data.repository.has_tests ? 'Test-related files detected' : 'No test suite detected', ready: data.repository.has_tests },
      { id: 'readme', label: 'Documentation signal', detail: data.repository.readme ? 'README detected' : 'README not detected', ready: Boolean(data.repository.readme) },
    ]
  }, [data])

  if (status === 'analyzing') return <LoadingState title="Preparing deployment readiness" hint="Inspecting repository runtime and release signals" />
  if (!data) return <div className="space-y-4">{error ? <ErrorState title="Analysis failed" description={error} /> : null}<EmptyState title="Analyze a repository to prepare delivery" description="Deployment readiness is scoped to the selected repository snapshot." icon={Rocket} /></div>

  const readyCount = readiness.filter((item) => item.ready).length
  const selectedSignal = readiness.find((item) => item.id === searchParams.get('signal')) ?? readiness[0]

  function selectSignal(id: string) {
    const next = new URLSearchParams(searchParams)
    next.set('signal', id)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-5">
      {error ? <ErrorState title="Latest analysis failed" description="Showing the last completed analysis. Run another analysis to refresh these signals." /> : null}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3"><Rocket className="size-5 text-sky-400" aria-hidden="true" /><h1 className="text-lg font-semibold text-white">Deployment</h1></div>
          <p className="mt-1 text-xs text-zinc-500">Release readiness for {data.repository.owner}/{data.repository.name} at {data.repository.branch}.</p>
        </div>
        <span className="neo-pressed inline-flex items-center gap-2 px-3 py-2 text-[10px] text-zinc-500"><Server className="size-3" aria-hidden="true" />Deployment provider not configured</span>
      </header>

      <section className="neo-flat p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs uppercase tracking-wider text-zinc-500">Readiness signals</p><p className="mt-2 font-mono text-3xl font-semibold text-zinc-200">{readyCount}/{readiness.length}</p></div><p className="max-w-md text-xs leading-5 text-zinc-500">These checks describe what the analyzed snapshot can prove. They do not imply that an environment is deployed or healthy.</p></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {readiness.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectSignal(item.id)}
              className={`neo-pressed flex w-full items-start justify-between gap-3 p-3 text-left transition ${
                selectedSignal?.id === item.id ? 'ring-1 ring-violet-500/60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {item.ready ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden="true" />}
                <div>
                  <p className="text-xs font-medium text-zinc-300">{item.label}</p>
                  <p className="mt-1 text-[10px] leading-4 text-zinc-500">{item.detail}</p>
                </div>
              </div>
              <ArrowRight className="mt-0.5 size-3 shrink-0 text-zinc-600" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      {selectedSignal ? (
        <section className="neo-flat p-5" aria-label="Selected signal inspector">
          <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/70 pb-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-violet-400">Selected readiness signal</p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-200">{selectedSignal.label}</h2>
              <p className="mt-1 text-xs text-zinc-500">{selectedSignal.detail}</p>
            </div>
            <span className={`neo-pressed px-2.5 py-1 text-[10px] font-medium ${selectedSignal.ready ? 'text-emerald-400' : 'text-amber-400'}`}>
              {selectedSignal.ready ? 'Preflight Passed' : 'Action Required'}
            </span>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium text-zinc-200">Deployment preflight check</h3>
              <ul className="mt-3 space-y-2 text-xs text-zinc-400">
                <li className="neo-pressed p-3">Verify entry point configuration in container / runner definitions.</li>
                <li className="neo-pressed p-3">Ensure environment variables and secret manifests are provisioned.</li>
                <li className="neo-pressed p-3">Execute regression tests prior to triggering production artifact promotion.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium text-zinc-200">Connected actions & handoffs</h3>
              <div className="mt-3 space-y-2">
                <Link to="/workflows?stage=deploy" className="neo-pressed flex items-center justify-between p-3 text-xs text-zinc-300 hover:text-white">
                  <span className="flex items-center gap-2"><Workflow className="size-3.5 text-sky-400" />Open CI/CD Pipeline</span>
                  <ArrowRight className="size-3 text-zinc-600" />
                </Link>
                <Link to="/repository/explore" className="neo-pressed flex items-center justify-between p-3 text-xs text-zinc-300 hover:text-white">
                  <span className="flex items-center gap-2"><FileCode2 className="size-3.5 text-sky-400" />Inspect Repository Source</span>
                  <ArrowRight className="size-3 text-zinc-600" />
                </Link>
                <Link to="/incidents" className="neo-pressed flex items-center justify-between p-3 text-xs text-zinc-300 hover:text-white">
                  <span className="flex items-center gap-2"><ShieldAlert className="size-3.5 text-red-400" />Check Operational Risks</span>
                  <ArrowRight className="size-3 text-zinc-600" />
                </Link>
                <Link to="/planning" className="neo-accent flex items-center justify-between p-3 text-xs font-medium text-white">
                  <span>Create Release Plan</span>
                  <ArrowRight className="size-3 text-violet-300" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="neo-flat p-5"><div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4"><GitBranch className="size-4 text-sky-400" aria-hidden="true" /><h2 className="text-sm font-medium text-zinc-200">Release context</h2></div><dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between gap-4"><dt className="text-zinc-600">Branch</dt><dd className="font-mono text-zinc-300">{data.repository.branch}</dd></div><div className="flex justify-between gap-4"><dt className="text-zinc-600">Primary language</dt><dd className="text-zinc-300">{data.repository.primary_language}</dd></div><div className="flex justify-between gap-4"><dt className="text-zinc-600">Project type</dt><dd className="text-zinc-300">{data.dna.project_type}</dd></div><div className="flex justify-between gap-4"><dt className="text-zinc-600">Repository size</dt><dd className="text-zinc-300">{data.dna.repository_size}</dd></div><div className="flex justify-between gap-4"><dt className="text-zinc-600">Package manager</dt><dd className="text-zinc-300">{data.dependency_health.package_manager || 'Not detected'}</dd></div></dl></section>
        <section className="neo-flat p-5"><div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4"><ShieldAlert className="size-4 text-amber-400" aria-hidden="true" /><h2 className="text-sm font-medium text-zinc-200">Pre-release checklist</h2></div><ul className="mt-4 space-y-3 text-xs text-zinc-500"><li className="flex items-center gap-2">{(data.risks.critical?.length ?? 0) > 0 ? <Zap className="size-3 text-amber-400" aria-hidden="true" /> : <CheckCircle2 className="size-3 text-emerald-400" aria-hidden="true" />}<span>Critical issues: <strong className="text-zinc-300">{data.risks.critical?.length ?? 0}</strong></span></li><li className="flex items-center gap-2">{(data.risks.warnings?.length ?? 0) > 0 ? <Zap className="size-3 text-amber-400" aria-hidden="true" /> : <CheckCircle2 className="size-3 text-emerald-400" aria-hidden="true" />}<span>Warnings: <strong className="text-zinc-300">{data.risks.warnings?.length ?? 0}</strong></span></li><li className="flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" aria-hidden="true" /><span>Connect a deployment provider to create and monitor environments.</span></li><li className="flex items-center gap-2"><CheckCircle2 className="size-3 text-emerald-400" aria-hidden="true" /><span>Validate the application with a repository test runner.</span></li></ul><div className="mt-5 flex items-start gap-2 border-t border-zinc-800/70 pt-4 text-[10px] text-zinc-600"><AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-400" aria-hidden="true" />No deployment action is available until a provider contract is configured.</div></section>
      </div>

      <section className="neo-flat p-5"><div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4"><Container className="size-4 text-violet-400" aria-hidden="true" /><h2 className="text-sm font-medium text-zinc-200">Container & infrastructure</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="neo-pressed p-3"><p className="text-xs font-medium text-zinc-300">Containerization</p><p className="mt-1 text-[10px] text-zinc-600">Dockerfile generation and image building provider required</p></div><div className="neo-pressed p-3"><p className="text-xs font-medium text-zinc-300">Orchestration</p><p className="mt-1 text-[10px] text-zinc-600">Kubernetes, AKS, or ACA configuration pending</p></div><div className="neo-pressed p-3"><p className="text-xs font-medium text-zinc-300">Infrastructure as Code</p><p className="mt-1 text-[10px] text-zinc-600">Bicep, Terraform, or ARM template generation available</p></div><div className="neo-pressed p-3"><p className="text-xs font-medium text-zinc-300">CI/CD Pipeline</p><p className="mt-1 text-[10px] text-zinc-600">GitHub Actions, GitLab CI, or Jenkins integration ready</p></div></div></section>
    </div>
  )
}
