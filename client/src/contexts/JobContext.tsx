import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed'

export type Job = {
  id: string
  title: string
  status: JobStatus
  progress?: number
  startedAt?: Date
  completedAt?: Date
  error?: string
}

type JobContextType = {
  jobs: Job[]
  addJob: (job: Omit<Job, 'id' | 'startedAt'>) => string
  updateJob: (id: string, updates: Partial<Job>) => void
  removeJob: (id: string) => void
  clearCompleted: () => void
  activeCount: number
}

const JobContext = createContext<JobContextType | null>(null)

let idCounter = 1

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([
    { id: 'job-1', title: 'Repository Indexing: CodeScope-AI', status: 'running', progress: 62, startedAt: new Date() },
    { id: 'job-2', title: 'Generate AST Snapshot (main)', status: 'queued' },
    { id: 'job-3', title: 'Docker Image Build', status: 'failed', error: 'Layer cache miss', completedAt: new Date() },
    { id: 'job-4', title: 'Run Nightly Security Scan', status: 'completed', completedAt: new Date() },
  ])

  const addJob = useCallback((job: Omit<Job, 'id' | 'startedAt'>): string => {
    const id = `job-${idCounter++}`
    setJobs(prev => [{ ...job, id, startedAt: new Date() }, ...prev])
    return id
  }, [])

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j))
  }, [])

  const removeJob = useCallback((id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setJobs(prev => prev.filter(j => j.status !== 'completed'))
  }, [])

  const activeCount = jobs.filter(j => j.status === 'running' || j.status === 'queued').length

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, removeJob, clearCompleted, activeCount }}>
      {children}
    </JobContext.Provider>
  )
}

export function useJobs() {
  const ctx = useContext(JobContext)
  if (!ctx) throw new Error('useJobs must be used within <JobProvider>')
  return ctx
}
