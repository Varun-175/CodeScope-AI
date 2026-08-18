import type { RepositoryMetadata } from '../../types/analysis'

export function RepositoryHeader({ repository }: { repository: RepositoryMetadata }) {
  const repositoryStats = [
    repository.primary_language || 'Unknown',
    `${repository.files} Files`,
    `${repository.directories} Modules`,
    `Analysis Time ${repository.analysis_time} sec`,
  ]

  return (
    <section className="animate-fade-in-up flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm font-medium text-zinc-300"
          >
            {stat}
          </span>
        ))}
      </div>
    </section>
  )
}
