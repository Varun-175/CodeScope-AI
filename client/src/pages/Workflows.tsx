import { Workflow, Play, Settings, CheckCircle2, CircleDashed, ChevronRight, Share2, PauseCircle } from 'lucide-react'

export function Workflows() {
  const runs = [
    { id: 'run-8291', name: 'Nightly Security Scan', status: 'running', trigger: 'schedule', time: '12m ago' },
    { id: 'run-8290', name: 'Deploy to Production', status: 'success', trigger: 'push', time: '2h ago' },
    { id: 'run-8289', name: 'Run E2E Tests', status: 'success', trigger: 'pull_request', time: '4h ago' },
    { id: 'run-8288', name: 'Database Backup', status: 'paused', trigger: 'manual', time: '1d ago' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Workflow className="size-6 text-orange-500" />
            Automated Workflows
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Define, monitor, and trace CI/CD pipelines and custom automation tasks.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="neo-pressed flex h-9 items-center gap-2 px-4 text-sm text-zinc-300">
            <Settings className="size-4" /> Config
          </button>
          <button className="neo-accent flex h-9 items-center gap-2 px-4 text-sm font-semibold transition bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-orange-500/50">
            <Play className="size-4" /> Run Workflow
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="neo-flat overflow-hidden">
            <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
              <h2 className="text-sm font-semibold text-zinc-300">Recent Workflow Runs</h2>
            </div>
            
            <div className="divide-y divide-zinc-800/50">
              {runs.map(run => (
                <div key={run.id} className="p-4 hover:bg-zinc-800/20 transition flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    {run.status === 'success' && <CheckCircle2 className="size-5 text-emerald-500" />}
                    {run.status === 'running' && <CircleDashed className="size-5 text-amber-500 animate-spin" />}
                    {run.status === 'paused' && <PauseCircle className="size-5 text-zinc-500" />}
                    
                    <div>
                      <h3 className="text-sm font-medium text-zinc-200">{run.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 font-mono">
                        <span className="text-zinc-400">{run.id}</span>
                        <span>•</span>
                        <span>trigger: {run.trigger}</span>
                        <span>•</span>
                        <span>{run.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="size-4 text-zinc-600 group-hover:text-zinc-300 transition" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="neo-flat p-6">
            <h3 className="text-sm font-semibold text-zinc-300 mb-6">Pipeline Visualization (Preview)</h3>
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="neo-pressed p-3 rounded-lg border border-zinc-700/50 flex flex-col items-center gap-2">
                  <Share2 className="size-4 text-zinc-400" /> Webhook
                </div>
                <div className="h-0.5 w-8 bg-zinc-700"></div>
                <div className="neo-pressed p-3 rounded-lg border border-zinc-700/50 flex flex-col items-center gap-2">
                  <Settings className="size-4 text-sky-400" /> Build
                </div>
                <div className="h-0.5 w-8 bg-zinc-700"></div>
                <div className="neo-pressed p-3 rounded-lg border border-emerald-500/30 flex flex-col items-center gap-2 relative">
                  <div className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                  <div className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-500"></div>
                  <Play className="size-4 text-emerald-400" /> Test
                </div>
                <div className="h-0.5 w-8 bg-zinc-800 border-t border-dashed border-zinc-700"></div>
                <div className="neo-flat p-3 rounded-lg flex flex-col items-center gap-2 opacity-50">
                  <Workflow className="size-4 text-orange-400" /> Deploy
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="neo-flat p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Active Runners</h3>
            <div className="space-y-3">
              {[
                { name: 'ubuntu-latest (core-1)', status: 'busy', load: 85 },
                { name: 'ubuntu-latest (core-2)', status: 'idle', load: 5 },
                { name: 'macos-13 (build-1)', status: 'offline', load: 0 },
              ].map(runner => (
                <div key={runner.name} className="neo-pressed p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="text-xs font-medium text-zinc-200">{runner.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{runner.status}</div>
                  </div>
                  {runner.status !== 'offline' && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono text-zinc-400">{runner.load}% CPU</span>
                      <div className="w-16 h-1 bg-zinc-800 rounded-full">
                        <div className={['h-full rounded-full', runner.load > 80 ? 'bg-orange-500' : 'bg-emerald-500'].join(' ')} style={{ width: `${runner.load}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
