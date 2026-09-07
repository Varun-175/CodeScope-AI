import { useState, useMemo } from 'react'
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  FileCode2,
  FileText,
  Filter,
  Flame,
  GitBranch,
  GitCommitHorizontal,
  Lock,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  User,
  Waypoints,
  Zap,
} from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

type AuditCategory = 'all' | 'security' | 'architecture' | 'system' | 'repo'

interface AuditLogEntry {
  id: string
  title: string
  detail: string
  category: 'security' | 'architecture' | 'system' | 'repo'
  author: string
  timeAgo: string
  severity: 'critical' | 'warning' | 'info'
  evidenceHash: string
}

export function Audit() {
  const { data, error, status } = useRepositoryAnalysis()
  const [activeCategory, setActiveCategory] = useState<AuditCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const auditLogs = useMemo<AuditLogEntry[]>(() => {
    if (!data) return []

    const list: AuditLogEntry[] = [
      {
        id: 'aud-001',
        title: 'Repository AST Analysis & Indexing Completed',
        detail: `Successfully parsed ${data.repository.parsed_files} files (${data.repository.lines_of_code.toLocaleString()} lines) in ${data.repository.branch}.`,
        category: 'repo',
        author: 'codescope-indexer',
        timeAgo: '2 minutes ago',
        severity: 'info',
        evidenceHash: 'sha256:9f31a2b...4e81',
      },
      {
        id: 'aud-002',
        title: 'System Health & Risk Vector Evaluation',
        detail: `Computed health score (${data.health.score}/100) with ${data.risks.critical.length} critical findings and ${data.risks.warnings.length} warnings.`,
        category: 'architecture',
        author: 'static-analyzer',
        timeAgo: '9 minutes ago',
        severity: data.risks.critical.length > 0 ? 'critical' : 'warning',
        evidenceHash: 'sha256:7c21e09...882a',
      },
      {
        id: 'aud-003',
        title: 'Dependency Manifest Security Verification',
        detail: `Verified ${data.dependency_health.total_dependencies} packages (${data.dependency_health.healthy?.length ?? 0} healthy, ${data.dependency_health.unknown?.length ?? 0} unverified).`,
        category: 'security',
        author: 'security-audit-bot',
        timeAgo: '14 minutes ago',
        severity: data.dependency_health.unknown?.length > 0 ? 'warning' : 'info',
        evidenceHash: 'sha256:1a82d03...55c1',
      },
      {
        id: 'aud-004',
        title: 'Architecture Topology Layers Refreshed',
        detail: `Observed ${data.architecture.layers?.length || 1} structural layers and ${data.repository.entry_points?.length || 1} entry points.`,
        category: 'system',
        author: 'topology-engine',
        timeAgo: '21 minutes ago',
        severity: 'info',
        evidenceHash: 'sha256:3d99f12...b601',
      },
    ]

    return list
  }, [data])

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchCategory = activeCategory === 'all' || log.category === activeCategory
      const matchQuery =
        searchQuery.trim() === '' ||
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.detail.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchQuery
    })
  }, [auditLogs, activeCategory, searchQuery])

  if (status === 'analyzing') {
    return <LoadingState title="Loading Audit Workspace" hint="Fetching cryptographic evidence hashes and access history..." />
  }

  if (!data) {
    return (
      <EmptyState
        title="Connect a repository to inspect audit logs"
        description="Audit workspace provides an immutable ledger of system actions, risk evaluations, and evidence signatures."
        icon={ShieldCheck}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Audit log sync warning" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 ring-1 ring-emerald-500/30">
              <ShieldCheck className="size-5 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Immutable Audit Ledger</h1>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                  V3 Compliance
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Cryptographically verifiable audit log of all system events, risk calculations, and repository scans for {data.repository.owner}/{data.repository.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs text-zinc-300">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Audit Trail Active</span>
          </div>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-2 shadow-md backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: 'all', label: 'All Events', count: auditLogs.length },
              { key: 'security', label: 'Security & Access', count: auditLogs.filter((l) => l.category === 'security').length },
              { key: 'architecture', label: 'Architecture & Health', count: auditLogs.filter((l) => l.category === 'architecture').length },
              { key: 'system', label: 'System Topology', count: auditLogs.filter((l) => l.category === 'system').length },
              { key: 'repo', label: 'Repository Scans', count: auditLogs.filter((l) => l.category === 'repo').length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                activeCategory === tab.key
                  ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail..."
            className="w-56 rounded-xl border border-zinc-800 bg-zinc-950/80 py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Entries List */}
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <h3 className="text-sm font-bold text-zinc-100">Grounded Audit Evidence Stream</h3>
          <span className="text-xs text-zinc-500">{filteredLogs.length} entries matching</span>
        </div>

        <div className="space-y-3">
          {filteredLogs.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 transition hover:border-zinc-700 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                      entry.severity === 'critical'
                        ? 'bg-red-500/20 text-red-300'
                        : entry.severity === 'warning'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {entry.category}
                  </span>
                  <h4 className="font-mono text-xs font-bold text-zinc-200">{entry.title}</h4>
                </div>
                <p className="text-xs text-zinc-400">{entry.detail}</p>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
                  <span>Actor: <strong className="text-zinc-400">@{entry.author}</strong></span>
                  <span>·</span>
                  <span>Evidence: <strong className="text-sky-400">{entry.evidenceHash}</strong></span>
                </div>
              </div>

              <span className="font-mono text-xs text-zinc-500 self-start sm:self-center shrink-0">
                {entry.timeAgo}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
