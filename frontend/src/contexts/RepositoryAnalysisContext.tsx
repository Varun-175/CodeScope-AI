import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type AnalysisStatus = 'idle' | 'analyzing' | 'complete'

type RepositoryAnalysisContextValue = {
  status: AnalysisStatus
  openAnalyzeModal: () => void
  closeAnalyzeModal: () => void
  startAnalysis: () => void
  completeAnalysis: () => void
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

  const value = useMemo<RepositoryAnalysisContextValue>(
    () => ({
      status,
      isAnalyzeModalOpen,
      openAnalyzeModal: () => setIsAnalyzeModalOpen(true),
      closeAnalyzeModal: () => setIsAnalyzeModalOpen(false),
      startAnalysis: () => setStatus('analyzing'),
      completeAnalysis: () => setStatus('complete'),
    }),
    [isAnalyzeModalOpen, status],
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
