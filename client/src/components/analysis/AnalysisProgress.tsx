import { Check, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const stages = [
  'Cloning repository',
  'Parsing source files',
  'Building AST',
  'Indexing embeddings',
  'Detecting architecture',
  'Repository DNA',
  'AI Summary',
]

type AnalysisProgressProps = {
  onComplete?: () => void
}

export function AnalysisProgress({ onComplete }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(12)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 5, 100)

        if (next === 100) {
          window.clearInterval(interval)
          onComplete?.()
        }

        return next
      })
    }, 280)

    return () => window.clearInterval(interval)
  }, [onComplete])

  const completedStages = useMemo(
    () => Math.min(stages.length, Math.floor((progress / 100) * stages.length)),
    [progress],
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Analyzing Repository...
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Preparing scan results for the dashboard.
        </p>
      </div>

      <div className="space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono">{progress}%</span>
          <span>Analysis progress</span>
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isComplete = index < completedStages
          const isActive = index === completedStages && progress < 100

          return (
            <div
              key={stage}
              className="flex items-center gap-3 text-sm text-zinc-400"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full border border-zinc-800 bg-zinc-950">
                {isComplete ? (
                  <Check className="size-3.5 text-emerald-400" aria-hidden="true" />
                ) : isActive ? (
                  <Loader2
                    className="size-3.5 animate-spin text-zinc-300"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="size-1.5 rounded-full bg-zinc-700" />
                )}
              </span>
              <span className={isComplete || isActive ? 'text-zinc-100' : ''}>
                {stage}
              </span>
            </div>
          )
        })}
      </div>

      <p className="border-t border-zinc-800 pt-4 text-sm font-medium text-zinc-300">
        Preparing Dashboard...
      </p>
    </div>
  )
}
