import { GitBranch } from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

export function EmptyDashboardState() {
  const { openAnalyzeModal } = useRepositoryAnalysis()

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <section className="animate-fade-in-up w-full max-w-md rounded-xl border border-zinc-800/90 bg-zinc-950/90 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.045)]">
        <div className="mx-auto grid size-12 place-items-center rounded-lg border border-zinc-800 bg-zinc-950">
          <GitBranch className="size-5 text-zinc-300" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-lg font-semibold text-white">
          No Repository Analyzed
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Analyze a GitHub repository to unlock software intelligence.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition hover:bg-white"
          onClick={openAnalyzeModal}
        >
          Analyze Repository
        </button>
      </section>
    </div>
  )
}
