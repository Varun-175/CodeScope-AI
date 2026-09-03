import { ExternalLink, GitBranch, Clock, FileCode2, FolderOpen, Layers, Waypoints, BotMessageSquare, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RepositoryMetadata } from '../../types/analysis'

export function RepositoryHeader({ repository }: { repository: RepositoryMetadata }) {
  const stats = [
    { icon: GitBranch, label: 'Branch', value: repository.branch || 'main' },
    { icon: FileCode2, label: 'Files', value: repository.files.toLocaleString() },
    { icon: FolderOpen, label: 'Directories', value: repository.directories?.toLocaleString() ?? '—' },
    { icon: Clock, label: 'Analysis', value: `${repository.analysis_time}s` },
  ]

  const repoUrl = `https://github.com/${repository.owner}/${repository.name}`

  return (
    <section className="neo-flat flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/70 pb-4">
        <div className="flex items-center gap-4">
          <div className="neo-pressed size-12 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-violet-400">
              {repository.owner?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                Active Repository Snapshot
              </span>
              <span className="neo-pressed px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                ● Verified
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-lg font-bold text-white">
                {repository.owner}/{repository.name}
              </h1>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-violet-400 transition"
                title="Open on GitHub"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="neo-pressed flex items-center gap-2 px-3 py-1.5 rounded-lg">
              <Icon className="size-3.5 text-zinc-500" />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-zinc-600 leading-none">{label}</p>
                <p className="text-xs font-semibold text-zinc-200 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[11px] text-zinc-500">
          Primary language: <strong className="text-zinc-300 font-mono">{repository.primary_language}</strong> • Framework: <strong className="text-zinc-300 font-mono">{repository.framework || 'Detected'}</strong>
        </span>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/repository/explore"
            className="neo-convex inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            <FileCode2 className="size-3.5 text-sky-400" />
            Explore Files
          </Link>
          <Link
            to="/architecture"
            className="neo-convex inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            <Layers className="size-3.5 text-violet-400" />
            Architecture
          </Link>
          <Link
            to="/impact"
            className="neo-convex inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            <Waypoints className="size-3.5 text-sky-400" />
            Impact
          </Link>
          <Link
            to="/chat"
            className="neo-accent inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white"
          >
            <BotMessageSquare className="size-3.5" />
            Ask CodeScope
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
