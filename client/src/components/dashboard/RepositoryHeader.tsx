import { ExternalLink, GitBranch, Clock, FileCode2, FolderOpen } from 'lucide-react'
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
    <section className="neo-flat animate-fade-in-up gradient-border flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {/* Avatar placeholder */}
        <div className="neo-pressed size-12 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-violet-400">
            {repository.owner?.charAt(0).toUpperCase() ?? '?'}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-0.5">
            Active Repository
          </p>
          <div className="flex items-center gap-2">
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

      <div className="flex flex-wrap gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="neo-pressed flex items-center gap-2 px-3 py-2 rounded-lg">
            <Icon className="size-3.5 text-zinc-500" />
            <div>
              <p className="text-[9px] uppercase tracking-wider text-zinc-600 leading-none">{label}</p>
              <p className="text-xs font-semibold text-zinc-200 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
