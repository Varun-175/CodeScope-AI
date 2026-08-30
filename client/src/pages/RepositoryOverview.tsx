import { AlertTriangle, ArrowRight, BookOpen, FileCode2, FolderTree, GitBranch, Layers, Package, Plus, ShieldCheck, TestTube2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

export function RepositoryOverview() {
  const { data, error, openAnalyzeModal, status } = useRepositoryAnalysis()

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing repository" hint="The overview will appear when the analysis completes." />
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {error ? <ErrorState title="Repository analysis failed" description="No completed repository snapshot is available. Check the repository connection and try again." /> : null}
        <EmptyState
          title="Connect a repository to see its overview"
          description="Run an analysis from the repository context bar to populate verified repository signals."
          icon={FolderTree}
        />
        <div className="flex justify-center">
          <button type="button" onClick={openAnalyzeModal} className="neo-accent inline-flex h-9 items-center gap-2 px-3 text-sm font-medium">
            <Plus className="size-4" aria-hidden="true" />
            Analyze repository
          </button>
        </div>
      </div>
    )
  }

  const totalRisks = data.risks.critical.length + data.risks.warnings.length
  const healthTone = data.health.score >= 85 ? 'text-emerald-400' : data.health.score >= 70 ? 'text-amber-400' : 'text-red-400'
  const nextActions = [
    data.risks.critical.length > 0 ? { label: 'Review critical risks', detail: `${data.risks.critical.length} critical findings require attention`, href: '/reviews', icon: AlertTriangle } : null,
    !data.repository.has_tests ? { label: 'Plan test coverage', detail: 'No test-related files were detected', href: '/testing', icon: TestTube2 } : null,
    !data.repository.readme ? { label: 'Document the repository', detail: 'No README was found in this snapshot', href: '/planning', icon: BookOpen } : null,
    data.dependency_health.unknown.length > 0 ? { label: 'Review dependencies', detail: `${data.dependency_health.unknown.length} dependency signals are unknown`, href: '/architecture', icon: Package } : null,
  ].filter((action): action is NonNullable<typeof action> => Boolean(action)).slice(0, 3)

  return (
    <div className="space-y-5">
      {error && <ErrorState title="Latest analysis failed" description="Showing the last completed analysis. Run another analysis to refresh this repository." />}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">Repository overview</p>
          <h1 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{data.repository.owner}/{data.repository.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">{data.summary.overview}</p>
        </div>
        <Link to="/repository/explore" className="neo-accent inline-flex h-9 shrink-0 items-center justify-center gap-2 px-3 text-sm font-medium">
          Explore files
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Repository metrics">
        <Metric icon={ShieldCheck} label="Health" value={`${data.health.score}/100`} detail={data.health.status} valueClass={healthTone} />
        <Metric icon={FileCode2} label="Source files" value={data.repository.files.toLocaleString()} detail={`${data.repository.lines_of_code.toLocaleString()} lines of code`} />
        <Metric icon={FolderTree} label="Directories" value={data.repository.directories.toLocaleString()} detail={`${data.repository.parsed_files.toLocaleString()} files parsed`} />
        <Metric icon={AlertTriangle} label="Risks" value={totalRisks.toLocaleString()} detail={`${data.risks.critical.length} critical, ${data.risks.warnings.length} warnings`} valueClass={totalRisks ? 'text-amber-400' : 'text-emerald-400'} />
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="neo-flat p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-violet-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Architecture signals</h2>
          </div>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Detail label="Pattern" value={data.architecture.pattern || 'Not detected'} />
            <Detail label="Framework" value={data.repository.framework || 'Not detected'} />
            <Detail label="Primary language" value={data.repository.primary_language || 'Not detected'} />
            <Detail label="Entry points" value={(data.repository.entry_points.length || 0).toLocaleString()} />
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {data.architecture.layers.length > 0
              ? data.architecture.layers.map((layer) => <span key={layer} className="neo-pressed px-2.5 py-1 text-xs text-zinc-500">{layer}</span>)
              : <span className="text-xs text-zinc-500">No architectural layers detected.</span>}
          </div>
        </section>

        <section className="neo-flat p-5">
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-sky-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Snapshot context</h2>
          </div>
          <dl className="mt-5 space-y-4">
            <Detail label="Branch" value={data.repository.branch || 'Default branch'} />
            <Detail label="Analysis source" value={data.health.details.source} />
            <Detail label="Analysis duration" value={`${data.repository.analysis_time}s`} />
          </dl>
          <p className="mt-5 text-xs leading-5 text-zinc-500">This overview reflects the latest completed analysis for the selected branch.</p>
        </section>
      </div>

      <section className="neo-flat p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Languages</h2>
            <p className="mt-1 text-xs text-zinc-500">Lines detected by the repository analyzer</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.repository.languages.length > 0
            ? data.repository.languages.slice(0, 6).map((language) => (
                <div key={language.language} className="neo-pressed flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                  <span className="text-zinc-500">{language.language}</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-300">{language.lines.toLocaleString()}</span>
                </div>
              ))
            : <p className="text-sm text-zinc-500">No language signals detected.</p>}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="neo-flat p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Health rationale</h2>
              <p className="mt-1 text-xs text-zinc-500">Signals contributing to the current score</p>
            </div>
            <span className={`font-mono text-lg font-semibold ${healthTone}`}>{data.health.score}</span>
          </div>
          <div className="mt-4 space-y-2">
            {(data.health.details.reasons ?? []).slice(0, 5).map((reason, index) => (
              <div key={`${reason.reason}-${index}`} className="neo-pressed flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-xs text-zinc-500">{reason.reason}</span>
                <span className="font-mono text-xs text-zinc-300">{reason.points > 0 ? '+' : ''}{reason.points}</span>
              </div>
            ))}
            {(data.health.details.reasons ?? []).length === 0 && <p className="text-xs text-zinc-600">No score rationale was returned for this snapshot.</p>}
          </div>
        </section>

        <section className="neo-flat p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recommended next steps</h2>
          <p className="mt-1 text-xs text-zinc-500">Prioritized from verified repository signals</p>
          <div className="mt-4 space-y-2">
            {nextActions.length > 0 ? nextActions.map(({ label, detail, href, icon: Icon }) => (
              <Link key={label} to={href} className="neo-pressed flex items-center gap-3 px-3 py-2.5 transition-colors hover:border-violet-400/40">
                <Icon className="size-4 shrink-0 text-violet-400" aria-hidden="true" />
                <span className="min-w-0 flex-1"><span className="block text-xs font-medium text-zinc-300">{label}</span><span className="mt-0.5 block text-[10px] text-zinc-600">{detail}</span></span>
                <ArrowRight className="size-3 shrink-0 text-zinc-600" aria-hidden="true" />
              </Link>
            )) : <p className="text-xs text-emerald-500">No immediate follow-up actions were identified.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value, detail, valueClass = 'text-zinc-900 dark:text-zinc-100' }: { icon: typeof ShieldCheck; label: string; value: string; detail: string; valueClass?: string }) {
  return (
    <div className="neo-flat p-4">
      <div className="flex items-center gap-2 text-xs text-zinc-500"><Icon className="size-4" aria-hidden="true" />{label}</div>
      <p className={`mt-3 text-2xl font-semibold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-300">{value}</dd>
    </div>
  )
}
