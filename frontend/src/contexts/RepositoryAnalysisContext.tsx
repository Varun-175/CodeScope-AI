import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { analyzeRepository } from '../services/api/analysis'
import type { AnalysisResponse } from '../types/analysis'

type AnalysisStatus = 'idle' | 'analyzing' | 'complete'

type RepositoryAnalysisContextValue = {
  status: AnalysisStatus
  data: AnalysisResponse | null
  error: string
  openAnalyzeModal: () => void
  closeAnalyzeModal: () => void
  runAnalysis: (repoUrl: string, branch?: string) => Promise<void>
  isAnalyzeModalOpen: boolean
}

const RepositoryAnalysisContext =
  createContext<RepositoryAnalysisContextValue | null>(null)

export function RepositoryAnalysisProvider({
  children,
}: {
  children: ReactNode
}) {
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false)
  const [data, setData] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState('')

  async function runAnalysis(repoUrl: string, branch?: string) {
    setStatus('analyzing')
    setError('')
    try {
      const result = await analyzeRepository({
        repo_url: repoUrl,
        branch: branch || undefined,
      })
      setData(result)
      setStatus('complete')
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Repository analysis failed.'
      setError(message)
      setStatus(data ? 'complete' : 'idle')
      throw caught
    }
  }

  const value = useMemo<RepositoryAnalysisContextValue>(
    () => ({
      status,
      data,
      error,
      isAnalyzeModalOpen,
      openAnalyzeModal: () => setIsAnalyzeModalOpen(true),
      closeAnalyzeModal: () => setIsAnalyzeModalOpen(false),
      runAnalysis,
    }),
    [data, error, isAnalyzeModalOpen, status],
  )

  return (
    <RepositoryAnalysisContext.Provider value={value}>
      {children}
    </RepositoryAnalysisContext.Provider>
  )
}

export function useRepositoryAnalysis() {
  const context = useContext(RepositoryAnalysisContext)

  if (!context) {
    throw new Error(
      'useRepositoryAnalysis must be used within RepositoryAnalysisProvider',
    )
  }

  return context
}
