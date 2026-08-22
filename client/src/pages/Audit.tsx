import { ShieldAlert, Download, FileText, Search, User, Lock, Server } from 'lucide-react'

export function Audit() {
  const logs = [
    { id: 'AL-901', user: 'Alex Chen', action: 'Modified Branch Protection', resource: 'main', type: 'security', time: '10 mins ago' },
    { id: 'AL-900', user: 'Sarah Miller', action: 'Deleted Repository', resource: 'legacy-api', type: 'critical', time: '2 hours ago' },
    { id: 'AL-899', user: 'System', action: 'Rotated API Keys', resource: 'production-env', type: 'automated', time: '1 day ago' },
    { id: 'AL-898', user: 'David Kim', action: 'Invited User', resource: 'new-hire@example.com', type: 'admin', time: '2 days ago' },
    { id: 'AL-897', user: 'Alex Chen', action: 'Changed Billing Plan', resource: 'Pro Tier', type: 'billing', time: '1 week ago' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up h-[calc(100vh-10rem)] flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="size-6 text-zinc-400" />
            Audit Logs
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Immutable ledger of security events, administrative actions, and system changes.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="neo-pressed flex h-9 items-center gap-2 px-3">
            <Search className="size-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search audit trail..." 
              className="bg-transparent text-sm text-white outline-none placeholder:text-zinc-600 w-48"
            />
          </div>
          <button className="neo-flat flex h-9 items-center gap-2 px-4 text-sm font-semibold transition hover:text-white text-zinc-400">
            <Download className="size-4" /> Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <aside className="lg:col-span-1 space-y-4">
          <div className="neo-flat p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Event Types</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                <input type="checkbox" className="accent-zinc-500" defaultChecked />
                <Lock className="size-3 text-red-400" /> Security & Access
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                <input type="checkbox" className="accent-zinc-500" defaultChecked />
                <User className="size-3 text-sky-400" /> Admin Actions
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                <input type="checkbox" className="accent-zinc-500" defaultChecked />
                <Server className="size-3 text-amber-400" /> System Events
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                <input type="checkbox" className="accent-zinc-500" defaultChecked />
                <FileText className="size-3 text-emerald-400" /> Billing
              </label>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3 neo-flat overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/30 grid grid-cols-12 gap-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-3">User / Actor</div>
            <div className="col-span-4">Action</div>
            <div className="col-span-3">Resource</div>
            <div className="col-span-2 text-right">Timestamp</div>
          </div>
          
          <div className="flex-1 overflow-auto divide-y divide-zinc-800/50 scrollbar-thin">
            {logs.map(log => (
              <div key={log.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-zinc-800/20 transition items-center text-sm">
                <div className="col-span-3 font-medium text-zinc-200 flex items-center gap-2">
                  <div className="size-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    {log.user.substring(0, 2).toUpperCase()}
                  </div>
                  {log.user}
                </div>
                <div className="col-span-4 text-zinc-300 flex items-center gap-2">
                  {log.type === 'critical' && <ShieldAlert className="size-3.5 text-red-500" />}
                  {log.type === 'security' && <Lock className="size-3.5 text-amber-500" />}
                  {log.type === 'automated' && <Server className="size-3.5 text-zinc-500" />}
                  {log.type === 'admin' && <User className="size-3.5 text-sky-500" />}
                  {log.type === 'billing' && <FileText className="size-3.5 text-emerald-500" />}
                  {log.action}
                </div>
                <div className="col-span-3">
                  <span className="font-mono text-xs text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">{log.resource}</span>
                </div>
                <div className="col-span-2 text-right text-xs text-zinc-500 font-mono">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/30 text-center text-xs text-zinc-500">
            Showing latest 50 audit events. Data is retained for 365 days.
          </div>
        </section>
      </div>
    </div>
  )
}
