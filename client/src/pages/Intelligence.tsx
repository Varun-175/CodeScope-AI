import { useEffect, useState, type FormEvent } from 'react'
import { Brain, CheckCircle2, Database, FileCode2, GitPullRequest, LoaderCircle, Network, Search, ShieldAlert, Sparkles, TestTube2, XCircle, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { chatWithRepository, getRepositoryIndexStatus, reindexRepository } from '../services/api/analysis'
import type { RepositoryIndexStatus } from '../types/analysis'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'

const SUGGESTIONS = [
  'Find circular dependencies',
  'Show complex functions',
  'List untested public methods',
  'Find undocumented APIs',
]

type IndexStatusProps = {
  status: RepositoryIndexStatus | null
  onReindex: () => void
  isReindexing: boolean
}

function IndexStatus({ status, onReindex, isReindexing }: IndexStatusProps) {
  if (!status) return null

  return (
    <div className="neo-pressed flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-2">
        {status.indexed ? <CheckCircle2 className="size-4 text-emerald-400" aria-hidden="true" /> : <XCircle className="size-4 text-amber-400" aria-hidden="true" />}
        <div>
          <p className="text-xs font-medium text-zinc-200">{status.indexed ? 'Repository indexed' : 'Indexing required'}</p>
          <p className="mt-0.5 text-[10px] text-zinc-500">{status.indexed ? `${status.doc_count ?? 0} source documents available` : status.progress_message || 'Semantic queries are limited until indexing completes.'}</p>
        </div>
      </div>
      <button type="button" onClick={onReindex} disabled={isReindexing} className="neo-convex inline-flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 transition hover:text-white disabled:cursor-wait disabled:opacity-60">
        {isReindexing ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : <Database className="size-3.5" aria-hidden="true" />}
        {isReindexing ? 'Indexing' : 'Refresh index'}
      </button>
    </div>
  )
}

export function Intelligence() {
  const { data, status: analysisStatus } = useRepositoryAnalysis()
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [indexStatus, setIndexStatus] = useState<RepositoryIndexStatus | null>(null)
  const [isReindexing, setIsReindexing] = useState(false)

  useEffect(() => {
    if (!data) return
    void getRepositoryIndexStatus().then(setIndexStatus).catch(() => setIndexStatus(null))
  }, [data])

  async function handleReindex() {
    setIsReindexing(true)
    try {
      setIndexStatus(await reindexRepository())
    } catch (caught) {
      setQueryError(caught instanceof Error ? caught.message : 'Repository indexing failed.')
    } finally {
      setIsReindexing(false)
    }
  }

  async function handleAsk(event: FormEvent) {
    event.preventDefault()
    const question = query.trim()
    if (!question || isAsking) return
    setIsAsking(true)
    setQueryError(null)
    try {
      const result = await chatWithRepository(question)
      setAnswer(result.answer)
    } catch (caught) {
      setAnswer('')
      setQueryError(caught instanceof Error ? caught.message : 'The intelligence service is unavailable.')
    } finally {
      setIsAsking(false)
    }
  }

  if (analysisStatus === 'analyzing') return <LoadingState title="Preparing intelligence" hint="Waiting for repository analysis to complete" />
  if (!data) return <EmptyState title="Analyze a repository to use Intelligence" description="Repository context and an indexed snapshot are required for semantic questions." icon={Brain} />

  const deterministicSignals = [
    { label: 'Source evidence', detail: `${data.repository.parsed_files.toLocaleString()} files parsed in this snapshot`, icon: FileCode2, href: '/repository/explore' },
    { label: 'Risk evidence', detail: `${data.risks.critical.length + data.risks.warnings.length} critical or warning findings`, icon: ShieldAlert, href: '/reviews' },
    { label: 'Dependency evidence', detail: `${data.dependency_health.total_dependencies.toLocaleString()} dependencies detected`, icon: Network, href: '/architecture' },
    { label: 'Test evidence', detail: data.repository.has_tests ? 'Test-related files detected' : 'No test files detected', icon: TestTube2, href: '/testing' },
  ]
  const evidenceStrength = indexStatus?.indexed && (indexStatus.doc_count ?? 0) > 0 ? 'Strong' : 'Limited'

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <Brain className="size-5 text-violet-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Code Intelligence</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Ask about {data.repository.owner}/{data.repository.name} using the current {data.repository.branch} snapshot.</p>
        </div>
        <div className="neo-pressed flex items-center gap-2 px-3 py-2 text-[10px] text-zinc-500">
          <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          Snapshot: {data.repository.branch}
        </div>
      </header>

      <IndexStatus status={indexStatus} onReindex={() => void handleReindex()} isReindexing={isReindexing} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="neo-flat space-y-4 p-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Semantic queries</h2>
            <p className="mt-1 text-[10px] leading-4 text-zinc-600">Start with a structural question, then refine it with repository context.</p>
          </div>
          <div className="space-y-2">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuery(suggestion)} className="neo-convex flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-zinc-400 transition hover:text-white">
                <Zap className="size-3 text-amber-400" aria-hidden="true" />
                {suggestion}
              </button>
            ))}
          </div>
          <div className="border-t border-zinc-800/70 pt-4 text-[10px] leading-4 text-zinc-600">
            <p className="font-medium text-zinc-500">Evidence boundary</p>
            <p className="mt-1">Answers are limited to the indexed repository snapshot. Verify important conclusions against source files before acting.</p>
          </div>
        </aside>

        <section className="neo-flat flex min-h-[420px] flex-col p-5">
          <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
            <Sparkles className="size-4 text-violet-400" aria-hidden="true" />
            <h2 className="text-sm font-medium text-zinc-200">Ask CodeScope</h2>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            {!answer && !queryError && !isAsking ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                <GitPullRequest className="size-7 text-zinc-700" aria-hidden="true" />
                <p className="mt-3 text-sm text-zinc-400">What would you like to understand?</p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-600">Ask about architecture, dependencies, risks, or code behavior in the selected snapshot.</p>
              </div>
            ) : null}
            {isAsking ? <div className="flex items-center gap-2 text-xs text-zinc-500"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Searching indexed evidence...</div> : null}
            {queryError ? <div className="neo-pressed border-l-2 border-red-500/70 p-4 text-xs text-red-300">{queryError}</div> : null}
            {answer ? <div className="space-y-5"><div className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-zinc-300">{answer}</div><section className="border-t border-zinc-800/70 pt-4" aria-label="Answer evidence"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-medium text-zinc-200">Evidence and next steps</h3><p className="mt-1 text-xs text-zinc-500">AI interpretation must be checked against this snapshot.</p></div><span className={`rounded-full border px-2 py-1 text-[10px] ${evidenceStrength === 'Strong' ? 'border-emerald-900/50 text-emerald-400' : 'border-amber-900/50 text-amber-400'}`}>Evidence strength: {evidenceStrength}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{deterministicSignals.map(({ label, detail, icon: Icon, href }) => <Link key={label} to={href} className="neo-pressed flex items-start gap-2 p-3 text-left transition hover:border-violet-400/40"><Icon className="mt-0.5 size-3.5 shrink-0 text-violet-400" aria-hidden="true" /><span><span className="block text-xs font-medium text-zinc-300">{label}</span><span className="mt-0.5 block text-[10px] leading-4 text-zinc-600">{detail}</span></span></Link>)}</div><div className="mt-3 flex flex-wrap gap-2"><Link to="/planning" className="neo-accent px-3 py-2 text-xs font-medium">Create plan from findings</Link><Link to="/impact" className="neo-convex px-3 py-2 text-xs text-zinc-400">Review change impact</Link></div></section></div> : null}
          </div>

          <form onSubmit={handleAsk} className="border-t border-zinc-800/70 pt-4">
            <label htmlFor="intelligence-query" className="sr-only">Ask about the repository</label>
            <div className="neo-pressed flex items-end gap-2 p-2">
              <Search className="mb-2 ml-2 size-4 shrink-0 text-zinc-600" aria-hidden="true" />
              <textarea id="intelligence-query" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} rows={2} placeholder="Ask a question about this repository..." className="min-h-10 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-600" />
              <button type="submit" disabled={!query.trim() || isAsking} aria-label="Ask question" className="neo-accent mb-0.5 p-2 text-white transition disabled:cursor-not-allowed disabled:opacity-40"><Search className="size-4" aria-hidden="true" /></button>
            </div>
            <p className="mt-2 text-[10px] text-zinc-700">Enter to ask · Shift+Enter for a new line</p>
          </form>
        </section>
      </div>
    </div>
  )
}
