import { Rocket, Server, Activity, ArrowRight, GitCommit, Check } from 'lucide-react'

export function Deployment() {
  const environments = [
    { name: 'Production', status: 'live', version: 'v1.4.2', commit: '8f4b2a1', updated: '2 days ago' },
    { name: 'Staging', status: 'live', version: 'v1.5.0-rc.1', commit: '3c9d1e2', updated: '4 hours ago' },
    { name: 'Preview (PR-142)', status: 'deploying', version: '-', commit: '9a1b2c3', updated: 'Just now' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Rocket className="size-6 text-sky-500" />
            Deployment
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage environments, delivery pipelines, and release orchestration.
          </p>
        </div>
        
        <button className="neo-accent flex h-9 items-center gap-2 px-4 text-sm font-semibold transition bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border-sky-500/50">
          <Rocket className="size-4" />
          Trigger Release
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {environments.map((env) => (
          <div key={env.name} className="neo-flat p-5 flex flex-col relative overflow-hidden group">
            {env.status === 'live' ? (
              <div className="absolute top-0 right-0 p-4">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
            ) : (
              <div className="absolute top-0 right-0 p-4">
                <Activity className="size-4 text-amber-500 animate-pulse" />
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 neo-pressed rounded-lg">
                <Server className="size-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">{env.name}</h3>
            </div>
            
            <div className="space-y-3 mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Version</span>
                <span className="font-mono text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">{env.version}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Commit</span>
                <span className="font-mono text-zinc-400 flex items-center gap-1">
                  <GitCommit className="size-3" /> {env.commit}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Updated</span>
                <span className="text-zinc-400">{env.updated}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {env.status === 'live' ? 'Environment Healthy' : 'Deployment in progress'}
              </span>
              <button className="text-sky-400 hover:text-sky-300 text-xs font-medium flex items-center gap-1 transition">
                View Logs <ArrowRight className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="neo-flat p-6">
        <h3 className="text-sm font-semibold text-zinc-300 mb-6">Recent Deployments</h3>
        <div className="space-y-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start gap-4">
              <div className="mt-1 neo-pressed p-1.5 rounded-full">
                <Check className="size-3 text-emerald-500" />
              </div>
              <div className="flex-1 pb-6 border-b border-zinc-800/50">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-zinc-200">Deployed v1.4.{item} to Production</h4>
                  <span className="text-xs text-zinc-500">{(item * 2)} days ago</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                  <GitCommit className="size-3" /> e8a2{item}f9 by @alex-dev
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
