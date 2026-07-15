const repositoryStats = [
  'Java',
  '148 Files',
  '12 Modules',
  'Analysis Time 8.2 sec',
]

export function RepositoryHeader() {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-950/80 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          Repository
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-normal text-white">
          Spring Pet Clinic
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {repositoryStats.map((stat) => (
          <span
            key={stat}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm font-medium text-zinc-300"
          >
            {stat}
          </span>
        ))}
      </div>
    </section>
  )
}
