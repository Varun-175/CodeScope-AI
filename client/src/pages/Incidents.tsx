import { AlertOctagon, Flame, ArrowUpRight, Activity, MessageSquareWarning } from 'lucide-react'

export function Incidents() {
  const incidents = [
    { id: 'INC-412', status: 'Active', severity: 'SEV-1', title: 'Database connection pool exhaustion in US-East', duration: '42m', responders: 3 },
    { id: 'INC-411', status: 'Resolved', severity: 'SEV-3', title: 'Elevated latency on image processing queue', duration: '2h 15m', responders: 1 },
    { id: 'INC-410', status: 'Resolved', severity: 'SEV-2', title: 'Payment webhook failures for Stripe integration', duration: '45m', responders: 2 },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertOctagon className="size-6 text-red-500" />
            Incidents & On-Call
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track ongoing outages, manage on-call rotations, and conduct post-mortems.
          </p>
        </div>
        
        <button className="neo-accent flex h-9 items-center gap-2 px-4 text-sm font-semibold transition bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50">
          <Flame className="size-4" />
          Declare Incident
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="neo-flat p-5 border-l-4 border-l-red-500 bg-red-500/5 relative overflow-hidden">
          <Flame className="absolute -right-4 -bottom-4 size-32 text-red-500/10" />
          <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
            <Activity className="size-5" /> Active SEV-1 Incident
          </h3>
          <p className="text-sm text-zinc-300 mt-2 font-medium">Database connection pool exhaustion in US-East</p>
          <div className="mt-4 flex gap-4 text-xs font-mono text-red-400/80">
            <span>Started: 42m ago</span>
            <span>Impact: High</span>
          </div>
          <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            Join War Room
          </button>
        </div>

        <div className="neo-flat p-5">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
            <MessageSquareWarning className="size-4" /> Current On-Call
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 neo-pressed rounded-lg">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">AC</div>
                <div>
                  <div className="text-sm font-medium text-zinc-200">Alex Chen (Primary)</div>
                  <div className="text-xs text-zinc-500">Platform Engineering</div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Active</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3 opacity-50">
                <div className="size-8 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white text-xs">SM</div>
                <div>
                  <div className="text-sm font-medium text-zinc-200">Sarah Miller (Secondary)</div>
                  <div className="text-xs text-zinc-500">Backend Systems</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="neo-flat overflow-hidden">
        <div className="p-4 border-b border-zinc-800/50">
          <h2 className="text-sm font-semibold text-zinc-300">Recent Incidents</h2>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {incidents.map((inc) => (
            <div key={inc.id} className="p-4 hover:bg-zinc-800/20 transition flex items-center justify-between group cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <span className={[
                  'text-xs font-mono font-bold px-2 py-1 rounded w-16 text-center',
                  inc.severity === 'SEV-1' ? 'bg-red-500/20 text-red-400' :
                  inc.severity === 'SEV-2' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-zinc-800 text-zinc-400'
                ].join(' ')}>{inc.severity}</span>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">{inc.id}</span>
                    <h3 className="text-sm font-medium text-zinc-200">{inc.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                    <span>{inc.status === 'Active' ? `Active for ${inc.duration}` : `Resolved in ${inc.duration}`}</span>
                    <span>•</span>
                    <span>{inc.responders} responders</span>
                  </div>
                </div>
              </div>
              
              <ArrowUpRight className="size-4 text-zinc-600 group-hover:text-zinc-300 transition" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
