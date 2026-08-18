import type { RepositoryMetadata } from '../../types/analysis'

export function RepositoryHeader({ repository }: { repository: RepositoryMetadata }) {
  const repositoryStats = [
    repository.primary_language || 'Unknown',
    `${repository.files} Files`,
    `${repository.directories} Modules`,
    `Analysis Time ${repository.analysis_time} sec`,
  ]

  return (
    <section className="animate-fade-in-up flex flex-col gap-4 rounded-lg border border-zinc-800/90 bg-zinc-950/90 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.045)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          Repository
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-normal text-white">
          {repository.owner}/{repository.name}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {repositoryStats.map((stat) => (
          <span
            key={stat}
            className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm font-medium text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
          >
            {stat}
          </span>
        ))}
      </div>
    </section>
  )
}
