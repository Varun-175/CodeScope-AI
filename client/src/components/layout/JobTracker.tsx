import { useState } from 'react'
import { Activity, Loader2, CheckCircle2, AlertCircle, X, Maximize2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export type JobStatus = 'running' | 'completed' | 'failed' | 'queued'

export type Job = {
  id: string
  title: string
  status: JobStatus
  progress?: number
}

export function JobTracker() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Mock data for jobs
  const [jobs] = useState<Job[]>([
    { id: 'job-1', title: 'Repository Indexing: CodeScope-AI', status: 'running', progress: 45 },
    { id: 'job-2', title: 'Running Backend Tests', status: 'queued' },
    { id: 'job-3', title: 'Docker Image Build', status: 'failed' },
    { id: 'job-4', title: 'Generate AST for main', status: 'completed' }
  ])

  const runningJobs = jobs.filter(j => j.status === 'running')

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="neo-convex flex h-9 items-center gap-2 px-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <Activity className="size-4" />
        <span>Jobs</span>
        {runningJobs.length > 0 && (
          <span className="flex h-5 items-center rounded-full bg-violet-500/10 px-2 text-[10px] text-violet-500">
            {runningJobs.length} active
          </span>
        )}
      </button>

      {isOpen && (
        <div className="neo-flat absolute right-0 top-full mt-2 w-80 overflow-hidden z-50">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-zinc-100">Background Tasks</h3>
            <div className="flex gap-2">
              <NavLink 
                to="/workflows"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white"
                title="View all workflows"
              >
                <Maximize2 className="size-4" />
              </NavLink>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {jobs.length === 0 ? (
              <p className="p-4 text-center text-sm text-zinc-500">No active jobs.</p>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="group relative flex items-center gap-3 rounded-lg p-3 hover:bg-zinc-800/50">
                  <div className="shrink-0">
                    {job.status === 'running' && <Loader2 className="size-4 animate-spin text-violet-500" />}
                    {job.status === 'completed' && <CheckCircle2 className="size-4 text-green-500" />}
                    {job.status === 'failed' && <AlertCircle className="size-4 text-red-500" />}
                    {job.status === 'queued' && <Activity className="size-4 text-zinc-500" />}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">{job.title}</p>
                    {job.status === 'running' && job.progress !== undefined && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div 
                          className="h-full bg-violet-500 transition-all duration-500"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
