import { AlertTriangle, ArrowRight, FileCode2, FolderTree, GitBranch, Layers, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

export function RepositoryOverview() {
  const { data, error, status } = useRepositoryAnalysis()

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing repository" hint="The overview will appear when the analysis completes." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Connect a repository to see its overview"
        description="Run an analysis from the repository context bar to populate verified repository signals."
        icon={FolderTree}
      />
    )
  }

  const totalRisks = data.risks.critical.length + data.risks.warnings.length
  const healthTone = data.health.score >= 85 ? 'text-emerald-400' : data.health.score >= 70 ? 'text-amber-400' : 'text-red-400'

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