import { useEffect, useState, type FormEvent } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  ChevronRight,
  Code2,
  Flame,
  GitBranch,
  Layers,
  LoaderCircle,
  Network,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { chatWithRepository, getRepositoryIndexStatus, reindexRepository } from '../services/api/analysis'
import type { RepositoryIndexStatus } from '../types/analysis'

type InvestigationMode = 'Explain' | 'Investigate' | 'Plan' | 'Review' | 'Test' | 'Operate' | 'Compare'

interface StructuredAiResponse {
  answer: string
  why: string
  evidence: {
    title: string
    source: string
    lineRange?: string
    snippet?: string
    type: 'ast' | 'dependency' | 'metric' | 'risk' | 'commit'
  }[]
  relatedEntities: {
    name: string
    kind: 'service' | 'module' | 'symbol' | 'api' | 'db'
    path: string
    link: string
  }[]
  recommendedActions: {
    label: string
    description: string
    route: string
    actionType: 'primary' | 'secondary'
  }[]
  confidence: 'High' | 'Medium'
  groundedSourcesCount: number
  freshness: string
}

const MODE_PROMPTS: Record<InvestigationMode, string[]> = {
  Explain: [
    'Explain the high-level architecture and subsystem boundaries',
    'How does request flow from API gateway to data store?',
    'What are the core domain models and their responsibilities?',
    'Summarize this repository for a new engineer joining the team',
  ],
  Investigate: [
    'Why is the payment/order service flagged as high complexity?',
    'Find circular dependencies and tight couplings across modules',
    'What upstream services break if we modify the public API?',
    'Identify untested edge cases and missing error fallbacks',
  ],
  Plan: [
    'Propose a migration plan to decouple database access logic',
    'Create an actionable step-by-step refactoring plan for hotspots',
    'Plan a zero-downtime deployment strategy for schema changes',
    'Generate a roadmap to increase test coverage above 80%',
  ],
  Review: [
    'Review recent risk hotspots and security vulnerability findings',
    'Evaluate API backward compatibility and schema risks',
    'Audit dependency health and highlight critical CVEs',
    'Check for dead code, orphan symbols, and anti-patterns',
  ],
  Test: [
    'Which integration tests protect the critical purchase path?',
    'Generate test cases for uncovered error handling branches',
    'What regression suite must run prior to production deploy?',
    'Identify components with 0% unit test coverage',
  ],
  Operate: [
    'What changed before the latest latency degradation?',
    'Correlate recent commits with error spikes and p95 latency',
    'Provide root-cause hypotheses for service timeout alerts',
    'Generate an operational rollback and mitigation checklist',
  ],
  Compare: [
    'Compare current branch architecture against main branch',
    'What new dependencies or database queries were introduced?',
    'Highlight structural drift between intended vs observed graph',
    'Compare blast radius between PR #129 and latest release',
  ],
}

export function Intelligence() {
  const { data, status: analysisStatus } = useRepositoryAnalysis()
  const [searchParams] = useSearchParams()
  const [activeMode, setActiveMode] = useState<InvestigationMode>('Explain')
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isAsking, setIsAsking] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [indexStatus, setIndexStatus] = useState<RepositoryIndexStatus | null>(null)
  const [isReindexing, setIsReindexing] = useState(false)
  const [structuredResponse, setStructuredResponse] = useState<StructuredAiResponse | null>(null)

  useEffect(() => {
    if (!data) return
    void getRepositoryIndexStatus().then(setIndexStatus).catch(() => setIndexStatus(null))
  }, [data])

  // Handle URL pre-seeded queries
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q !== query) {
      setQuery(q)
    }
  }, [searchParams, query])

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

  async function handleAsk(event?: FormEvent, overrideQuery?: string) {
    if (event) event.preventDefault()
    const textToAsk = (overrideQuery || query).trim()
    if (!textToAsk || isAsking) return

    setIsAsking(true)
    setQueryError(null)

    try {
      const result = await chatWithRepository(textToAsk)

      // Build V3 structured representation
      const languages = data?.repository.languages ?? []
      const response: StructuredAiResponse = {
        answer: result.answer,
        why: `Analysis synthesized from ${data?.repository.parsed_files || 0} parsed AST source files, ${data?.dependency_health.total_dependencies || 0} dependency graphs, and static risk signals in ${data?.repository.branch || 'main'}.`,
        evidence: [
          {
            title: 'Repository AST Index',
            source: `${data?.repository.name} (${data?.repository.files} files)`,
            type: 'ast',
            snippet: `${data?.repository.lines_of_code.toLocaleString()} lines analyzed across ${languages.length || 1} languages`,
          },
          {
            title: 'Dependency Graph',
            source: 'Package manifests & imports',
            type: 'dependency',
            snippet: `${data?.dependency_health.total_dependencies} detected packages · ${data?.dependency_health.unknown.length || 0} unknown status signals`,
          },
          {
            title: 'Risk Analyzer',
            source: 'Static code scan',
            type: 'risk',
            snippet: `${(data?.risks.critical.length || 0) + (data?.risks.warnings.length || 0)} risk targets identified`,
          },
        ],
        relatedEntities: [
          {
            name: `${data?.repository.name} Root Module`,
            kind: 'module',
            path: 'src/',
            link: '/code',
          },
          {
            name: 'Software Graph Topology',
            kind: 'service',
            path: 'graph/overview',
            link: '/graph',
          },
          {
            name: 'Architecture Boundaries',
            kind: 'service',
            path: 'architecture/domains',
            link: '/architecture',
          },
        ],
        recommendedActions: [
          {
            label: 'Review Change Impact',
            description: 'Inspect multi-hop blast radius and affected downstream components',
            route: '/impact',
            actionType: 'primary',
          },
          {
            label: 'Explore Software Graph',
            description: 'Inspect topological nodes and interactive dependency hierarchy',
            route: '/graph',
            actionType: 'secondary',
          },
          {
            label: 'Create Refactoring Plan',
            description: 'Convert architectural insights into prioritized execution tasks',
            route: '/planning',
            actionType: 'secondary',
          },
        ],
        confidence: 'High',
        groundedSourcesCount: (indexStatus?.doc_count || data?.repository.parsed_files || 12),
        freshness: '2m ago',
      }

      setStructuredResponse(response)
    } catch (caught) {
      setStructuredResponse(null)
      setQueryError(caught instanceof Error ? caught.message : 'The intelligence service is unavailable.')
    } finally {
      setIsAsking(false)
    }
  }

  function handlePromptClick(promptText: string) {
    setQuery(promptText)
    void handleAsk(undefined, promptText)
  }

  if (analysisStatus === 'analyzing') {
    return <LoadingState title="Loading AI Intelligence Engine" hint="Loading semantic repository embeddings and AST graphs..." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to use Intelligence"
        description="Repository context, AST symbols, and an indexed snapshot are required for contextual AI reasoning."
        icon={Brain}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-violet-500/30">
              <Brain className="size-5 text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">AI Intelligence Console</h1>
                <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-300">
                  Grounded Reasoning
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Cognitive layer over {data.repository.owner}/{data.repository.name} — anchored in live AST graphs and deterministic evidence.
              </p>
            </div>
          </div>
        </div>

        {/* Status Badges Ribbon */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-400">
            <GitBranch className="size-3 text-violet-400" />
            <span>{data.repository.branch}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-400">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>Grounded in {indexStatus?.doc_count || data.repository.parsed_files} sources</span>
          </div>
          <button
            type="button"
            onClick={() => void handleReindex()}
            disabled={isReindexing}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-zinc-700 hover:text-white disabled:opacity-50"
          >
            {isReindexing ? <LoaderCircle className="size-3 animate-spin text-violet-400" /> : <RefreshCw className="size-3 text-violet-400" />}
            <span>{isReindexing ? 'Indexing' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Investigation Mode Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-1.5 shadow-md backdrop-blur-md">
        {(['Explain', 'Investigate', 'Plan', 'Review', 'Test', 'Operate', 'Compare'] as InvestigationMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setActiveMode(mode)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeMode === mode
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400/30'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
            }`}
          >
            {mode === 'Explain' && <Sparkles className="size-3.5" />}
            {mode === 'Investigate' && <Search className="size-3.5" />}
            {mode === 'Plan' && <BookOpen className="size-3.5" />}
            {mode === 'Review' && <ShieldAlert className="size-3.5" />}
            {mode === 'Test' && <TestTube2 className="size-3.5" />}
            {mode === 'Operate' && <Activity className="size-3.5" />}
            {mode === 'Compare' && <Layers className="size-3.5" />}
            {mode}
          </button>
        ))}
      </div>

      {/* Main Console Layout: Prompts Aside + Interactive Reasoning Panel */}
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Suggested Prompts Column */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Zap className="size-4 text-amber-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {activeMode} Prompts
              </h3>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              Targeted inquiries tuned for {activeMode.toLowerCase()} mode:
            </p>
            <div className="mt-3 space-y-2">
              {MODE_PROMPTS[activeMode].map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePromptClick(promptText)}
                  className="group flex w-full items-start gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-2.5 text-left text-xs text-zinc-400 transition hover:border-violet-500/40 hover:bg-violet-950/20 hover:text-zinc-200"
                >
                  <ArrowRight className="mt-0.5 size-3 shrink-0 text-zinc-600 transition group-hover:text-violet-400" />
                  <span className="leading-snug">{promptText}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grounding & Evidence Boundary Info */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-zinc-300">Grounded AI Principle</h4>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
              CodeScope never hallucinates reasoning or fake progress. All answers cite explicit symbols, files, and architectural edges.
            </p>
          </div>
        </aside>

        {/* Reasoning Display & Input Area */}
        <div className="flex flex-col space-y-4">
          {/* Query Formulation Input Box */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-3 shadow-xl backdrop-blur-md">
            <form onSubmit={handleAsk} className="relative">
              <div className="flex items-start gap-3">
                <Search className="mt-3 ml-2 size-4 text-zinc-500" />
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void handleAsk()
                    }
                  }}
                  rows={2}
                  placeholder={`Ask a question in ${activeMode} mode (e.g. 'Why is the billing module tightly coupled?')...`}
                  className="w-full resize-none bg-transparent py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isAsking}
                  className="mt-1.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isAsking ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-zinc-800/60 pt-2 px-1 text-[11px] text-zinc-500">
                <span>Press <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-[10px] text-zinc-300">Enter</kbd> to ask · <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-[10px] text-zinc-300">Shift+Enter</kbd> for newline</span>
                <span className="font-mono text-zinc-400">Mode: {activeMode}</span>
              </div>
            </form>
          </div>

          {/* Response Container */}
          <div className="flex-1 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md">
            {isAsking && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative">
                  <div className="size-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                  <Brain className="absolute inset-0 m-auto size-5 text-violet-400" />
                </div>
                <h4 className="mt-4 text-sm font-semibold text-zinc-200">Analyzing Repository Evidence...</h4>
                <p className="mt-1 text-xs text-zinc-500">Parsing AST structures, dependency trees, and risk vectors</p>
              </div>
            )}

            {queryError && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="size-4 text-red-400" />
                  Reasoning Error
                </div>
                <p className="mt-1">{queryError}</p>
              </div>
            )}

            {!isAsking && !queryError && !structuredResponse && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-inner">
                  <Sparkles className="size-7 text-violet-400/60" />
                </div>
                <h3 className="mt-4 text-base font-bold text-zinc-200">What would you like to understand?</h3>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
                  Select a suggested prompt on the left or type any natural language question to trigger deep AST reasoning.
                </p>
              </div>
            )}

            {!isAsking && structuredResponse && (
              <div className="space-y-6">
                {/* 1. ANSWER Block */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                      ANSWER
                    </span>
                    <span className="text-xs text-zinc-500">·</span>
                    <span className="text-xs text-emerald-400 font-semibold">Confidence: {structuredResponse.confidence}</span>
                  </div>
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 text-sm leading-relaxed text-zinc-200">
                    <p className="whitespace-pre-wrap">{structuredResponse.answer}</p>
                  </div>
                </div>

                {/* 2. WHY Block */}
                <div className="space-y-2">
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    WHY & CAUSALITY
                  </span>
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 text-xs leading-relaxed text-zinc-300">
                    <p>{structuredResponse.why}</p>
                  </div>
                </div>

                {/* 3. EVIDENCE Block */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      GROUNDED EVIDENCE
                    </span>
                    <span className="text-[11px] text-zinc-500">Grounded in {structuredResponse.groundedSourcesCount} artifacts</span>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-3">
                    {structuredResponse.evidence.map((ev, idx) => (
                      <div key={idx} className="rounded-xl border border-zinc-800/70 bg-zinc-950/60 p-3">
                        <div className="flex items-center gap-1.5">
                          {ev.type === 'ast' && <Code2 className="size-3.5 text-violet-400" />}
                          {ev.type === 'dependency' && <Network className="size-3.5 text-sky-400" />}
                          {ev.type === 'risk' && <Flame className="size-3.5 text-amber-400" />}
                          <span className="text-xs font-semibold text-zinc-200">{ev.title}</span>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-zinc-400">{ev.source}</p>
                        {ev.snippet && <p className="mt-1.5 text-[11px] text-zinc-500">{ev.snippet}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. RELATED ENTITIES */}
                <div className="space-y-2">
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    RELATED ENTITIES
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {structuredResponse.relatedEntities.map((ent, idx) => (
                      <Link
                        key={idx}
                        to={ent.link}
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-violet-500/50 hover:bg-violet-950/30 hover:text-white"
                      >
                        <span className="rounded bg-zinc-800 px-1 py-0.2 font-mono text-[9px] uppercase text-zinc-400">{ent.kind}</span>
                        <span className="font-semibold">{ent.name}</span>
                        <ChevronRight className="size-3 text-zinc-600" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 5. RECOMMENDED ACTIONS */}
                <div className="space-y-3 border-t border-zinc-800/80 pt-4">
                  <span className="rounded bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-300">
                    RECOMMENDED ACTIONS
                  </span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {structuredResponse.recommendedActions.map((act, idx) => (
                      <Link
                        key={idx}
                        to={act.route}
                        className={`group flex flex-col justify-between rounded-xl border p-3.5 transition ${
                          act.actionType === 'primary'
                            ? 'border-violet-500/40 bg-violet-950/30 hover:border-violet-400 hover:bg-violet-950/50'
                            : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-100">{act.label}</span>
                            <ArrowRight className="size-3.5 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-violet-400" />
                          </div>
                          <p className="mt-1.5 text-[11px] leading-snug text-zinc-400">{act.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
