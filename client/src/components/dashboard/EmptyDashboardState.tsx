import { GitBranch } from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

export function EmptyDashboardState() {
  const { openAnalyzeModal } = useRepositoryAnalysis()

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <section className="animate-fade-in-up w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900/40 p-10 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10">
          <GitBranch className="size-6 text-violet-300" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-lg font-semibold text-white">
          Your codebase, clearly mapped.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Analyze a GitHub repository to inspect architecture, risks, dependency health, and codebase signals in one place.
        </p>
        <button
          type="button"
          className="mt-7 inline-flex h-10 items-center justify-center rounded-md border border-violet-400/30 bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
          onClick={openAnalyzeModal}
        >
          Analyze Repository
        </button>
      </section>
    </div>
  )
}
