import { useState } from 'react'
import { Activity, Loader2, CheckCircle2, AlertCircle, Clock, X, Maximize2, Trash2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useJobs, type Job } from '../../contexts/JobContext'

const statusMeta: Record<Job['status'], { icon: React.ReactNode; label: string; color: string }> = {
  running: { icon: <Loader2 className="size-4 animate-spin text-violet-400" />, label: 'Running', color: 'text-violet-400' },
  queued:  { icon: <Clock className="size-4 text-zinc-500" />, label: 'Queued', color: 'text-zinc-400' },
  completed: { icon: <CheckCircle2 className="size-4 text-emerald-500" />, label: 'Done', color: 'text-emerald-400' },
  failed:  { icon: <AlertCircle className="size-4 text-red-500" />, label: 'Failed', color: 'text-red-400' },
}

export function JobTracker() {
  const [isOpen, setIsOpen] = useState(false)
  const { jobs, removeJob, clearCompleted, activeCount } = useJobs()

  const runningJobs = jobs.filter(j => j.status === 'running')
  const hasCompleted = jobs.some(j => j.status === 'completed')

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={[
          'neo-convex flex h-9 items-center gap-2 px-3 text-sm font-medium transition',
          isOpen ? 'neo-pressed text-violet-400' : 'text-zinc-500 hover:text-zinc-100',
        ].join(' ')}
      >
        {runningJobs.length > 0
          ? <Loader2 className="size-4 animate-spin text-violet-400" />
          : <Activity className="size-4" />
        }
        <span>Jobs</span>
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500/15 px-1.5 text-[10px] font-bold text-violet-400 animate-pulse-glow">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-label="Close job panel"
          />

          <div className="neo-flat animate-slide-in-right absolute right-0 top-full mt-2 w-[340px] overflow-hidden z-50 border border-zinc-800/80">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Background Tasks</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">{jobs.length} total · {activeCount} active</p>
              </div>
              <div className="flex items-center gap-2">
                {hasCompleted && (
                  <button
                    onClick={clearCompleted}
                    className="neo-convex p-1.5 text-zinc-500 hover:text-zinc-200 transition"
                    title="Clear completed"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
                <NavLink
                  to="/workflows"
                  onClick={() => setIsOpen(false)}
                  className="neo-convex p-1.5 text-zinc-500 hover:text-zinc-200 transition"
                  title="View all workflows"
                >
                  <Maximize2 className="size-3.5" />
                </NavLink>
                <button
                  onClick={() => setIsOpen(false)}
                  className="neo-convex p-1.5 text-zinc-500 hover:text-zinc-200 transition"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Job list */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin p-2 space-y-1">
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <Activity className="size-6 text-zinc-700" />
                  <p className="text-sm text-zinc-500">No active jobs.</p>
                </div>
              ) : (
                jobs.map(job => {
                  const meta = statusMeta[job.status]
                  return (
                    <div key={job.id} className="group flex items-start gap-3 rounded-lg p-3 hover:bg-zinc-800/40 transition relative">
                      <div className="shrink-0 pt-0.5">{meta.icon}</div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200 pr-6">{job.title}</p>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
                          {meta.label}
                        </span>
                        {job.error && (
                          <p className="text-[10px] text-red-400 mt-0.5 truncate">{job.error}</p>
                        )}
                        {job.status === 'running' && job.progress !== undefined && (
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeJob(job.id)}
                        className="absolute right-2 top-2 p-1 text-zinc-700 hover:text-zinc-300 transition opacity-0 group-hover:opacity-100"
                        title="Dismiss"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
