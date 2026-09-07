import { useMemo } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  FileCode2,
  Flame,
  FolderTree,
  GitBranch,
  GitCommitHorizontal,
  Layers,
  Network,
  Package,
  Plus,
  Rocket,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Waypoints,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

export function RepositoryOverview() {
  const { data, error, openAnalyzeModal, status } = useRepositoryAnalysis()

  const languages = useMemo(() => {
    if (!data) return []
    const rawLangs = data.repository.languages ?? []
    if (rawLangs.length === 0) {
      return [{ language: data.repository.primary_language || 'TypeScript', percentage: 100, color: 'bg-blue-500' }]
    }
    const totalLines = rawLangs.reduce((acc, l) => acc + l.lines, 0) || 1
    const colors = ['bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-pink-500']
    return rawLangs.map((l, idx) => ({
      language: l.language,
      percentage: Math.round((l.lines / totalLines) * 100) || 1,
      color: colors[idx % colors.length],
      lines: l.lines,
    }))
  }, [data])

  if (status === 'analyzing') {
    return (
      <LoadingState
        title="Analyzing Repository Model"
        hint="Constructing language breakdowns, AST hierarchies, and architecture patterns..."
      />
    )
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {error ? <ErrorState title="Repository analysis failed" description={error} /> : null}
        <EmptyState
          title="Connect a repository to see its overview"
          description="Analyze any public or authenticated GitHub repository to extract software architecture, risk vectors, and language breakdowns."
          icon={FolderTree}
        />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={openAnalyzeModal}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
          >
            <Plus className="size-4" />
            <span>Analyze Repository</span>
          </button>
        </div>
      </div>
    )
  }

  const totalRisks = data.risks.critical.length + data.risks.warnings.length

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Repository sync warning" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-sky-500/20 ring-1 ring-violet-500/30">
              <FolderTree className="size-5 text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {data.repository.owner}/{data.repository.name}
                </h1>
                <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-300">
                  {data.repository.branch}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">{data.summary.overview}</p>
            </div>
          </div>
        </div>

        {/* Global Action Handoffs */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/code"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <Code2 className="size-3.5 text-sky-400" />
            Code Workspace
          </Link>
          <Link
            to="/intelligence"
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
          >
            <Brain className="size-3.5" />
            Ask AI
          </Link>
        </div>
      </header>

      {/* Top 4 Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">System Health</span>
            <ShieldCheck className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-emerald-300">{data.health.score}/100</p>
          <p className="mt-1 text-[11px] text-zinc-400">{data.health.status}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Source Surface</span>
            <FileCode2 className="size-4 text-sky-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-zinc-100">{data.repository.files.toLocaleString()} Files</p>
          <p className="mt-1 text-[11px] text-zinc-400">{data.repository.lines_of_code.toLocaleString()} total lines</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Architecture Pattern</span>
            <Layers className="size-4 text-violet-400" />
          </div>
          <p className="mt-2 font-mono text-base font-bold text-zinc-100 truncate">{data.architecture.pattern || data.dna.architecture}</p>
          <p className="mt-1 text-[11px] text-zinc-400">{data.architecture.layers?.length || 3} layers detected</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Risk Hotspots</span>
            <AlertTriangle className="size-4 text-amber-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-300">{totalRisks}</p>
          <p className="mt-1 text-[11px] text-zinc-400">{data.risks.critical.length} critical · {data.risks.warnings.length} warnings</p>
        </div>
      </div>

      {/* Language Breakdown Ribbon */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-100">Language Distribution</h3>
          <span className="text-xs text-zinc-500">{languages.length} languages detected</span>
        </div>

        {/* Multi-color Bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800">
          {languages.map((l, idx) => (
            <div
              key={idx}
              style={{ width: `${l.percentage}%` }}
              className={`${l.color} transition-all duration-500`}
              title={`${l.language}: ${l.percentage}%`}
            />
          ))}
        </div>

        {/* Language Pills */}
        <div className="flex flex-wrap gap-4 pt-1">
          {languages.map((l, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className={`size-2.5 rounded-full ${l.color}`} />
              <span className="font-semibold text-zinc-200">{l.language}</span>
              <span className="text-zinc-500">{l.percentage}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Jump Links Grid */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-zinc-100">Connected System Workspaces</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/graph"
            className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 transition hover:border-violet-500/40 hover:bg-zinc-900/60"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-200">Software Graph Topology</span>
              <p className="text-[11px] text-zinc-500">Interactive dependency constellation</p>
            </div>
            <ArrowRight className="size-4 text-zinc-600" />
          </Link>

          <Link
            to="/impact"
            className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 transition hover:border-violet-500/40 hover:bg-zinc-900/60"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-200">Change Impact Workspace</span>
              <p className="text-[11px] text-zinc-500">Multi-hop blast radius simulation</p>
            </div>
            <ArrowRight className="size-4 text-zinc-600" />
          </Link>

          <Link
            to="/planning"
            className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 transition hover:border-violet-500/40 hover:bg-zinc-900/60"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-200">Architecture Planning</span>
              <p className="text-[11px] text-zinc-500">7-stage refactoring roadmap</p>
            </div>
            <ArrowRight className="size-4 text-zinc-600" />
          </Link>
        </div>
      </section>
    </div>
  )
}
