import { X } from 'lucide-react'
import { useState } from 'react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'
import { AnalysisProgress } from './AnalysisProgress'

type AnalysisMode = 'quick' | 'deep'

function isValidRepositoryUrl(value: string) {
  try {
    const url = new URL(value)
    return url.hostname === 'github.com' && url.pathname.split('/').length >= 3
  } catch {
    return false
  }
}

export function AnalyzeRepositoryModal() {
  const {
    closeAnalyzeModal,
    completeAnalysis,
    isAnalyzeModalOpen,
    startAnalysis,
  } = useRepositoryAnalysis()
  const [repositoryUrl, setRepositoryUrl] = useState('')
  const [branch, setBranch] = useState('')
  const [mode, setMode] = useState<AnalysisMode>('quick')
  const [error, setError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  if (!isAnalyzeModalOpen) {
    return null
  }

  function handleCancel() {
    setRepositoryUrl('')
    setBranch('')
    setMode('quick')
    setError('')
    setIsAnalyzing(false)
    closeAnalyzeModal()
  }

  function handleAnalyze() {
    if (!isValidRepositoryUrl(repositoryUrl.trim())) {
      setError('Enter a valid GitHub repository URL.')
      return
    }

    setError('')
    startAnalysis()
    setIsAnalyzing(true)
  }

  function handleComplete() {
    completeAnalysis()
    window.setTimeout(() => {
      setRepositoryUrl('')
      setBranch('')
      setMode('quick')
      setError('')
      setIsAnalyzing(false)
      closeAnalyzeModal()
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close analysis dialog"
        className="absolute inset-0 bg-black/70"
        onClick={handleCancel}
      />

      <div className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-[#09090b] p-5 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-white">
              Analyze GitHub Repository
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Start a local mock analysis flow.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-white"
            onClick={handleCancel}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {isAnalyzing ? (
          <AnalysisProgress onComplete={handleComplete} />
        ) : (
          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-zinc-300">
                Repository URL
              </span>
              <input
                type="url"
                value={repositoryUrl}
                onChange={(event) => {
                  setRepositoryUrl(event.target.value)
                  setError('')
                }}
                placeholder="https://github.com/owner/repository"
                className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
              {error && <span className="mt-2 block text-xs text-red-400">{error}</span>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-300">
                Branch <span className="text-zinc-600">optional</span>
              </span>
              <input
                type="text"
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                placeholder="main"
                className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </label>

            <div>
              <span className="text-sm font-medium text-zinc-300">
                Analysis mode
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                {(['quick', 'deep'] as AnalysisMode[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={[
                      'h-9 rounded-md text-sm font-medium capitalize transition',
                      mode === option
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-500 hover:text-zinc-200',
                    ].join(' ')}
                    onClick={() => setMode(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-800 pt-5">
              <button
                type="button"
                className="h-9 rounded-md px-3 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-9 rounded-md border border-zinc-700 bg-zinc-100 px-3 text-sm font-medium text-zinc-950 transition hover:bg-white"
                onClick={handleAnalyze}
              >
                Analyze
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
