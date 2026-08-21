import { Activity, Terminal, AlertTriangle, Eye, LineChart, ChevronDown } from 'lucide-react'

export function Observability() {
  return (
    <div className="space-y-6 animate-fade-in-up h-[calc(100vh-10rem)] flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Activity className="size-6 text-pink-500" />
            Observability
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Real-time logs, metrics, and incident tracing.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="neo-pressed flex h-9 items-center gap-2 px-4 text-sm text-zinc-300">
            Last 24 Hours <ChevronDown className="size-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
        <div className="neo-flat p-4 flex items-center gap-4">
          <div className="p-3 neo-pressed rounded-xl text-pink-500"><LineChart className="size-6" /></div>
          <div>
            <div className="text-sm text-zinc-400">Total Requests</div>
            <div className="text-2xl font-bold text-zinc-200">1.2M</div>
          </div>
        </div>
        <div className="neo-flat p-4 flex items-center gap-4">
          <div className="p-3 neo-pressed rounded-xl text-amber-500"><AlertTriangle className="size-6" /></div>
          <div>
            <div className="text-sm text-zinc-400">Error Rate</div>
            <div className="text-2xl font-bold text-zinc-200">0.04%</div>
          </div>
        </div>
        <div className="neo-flat p-4 flex items-center gap-4">
          <div className="p-3 neo-pressed rounded-xl text-emerald-500"><Activity className="size-6" /></div>
          <div>
            <div className="text-sm text-zinc-400">Avg Latency</div>
            <div className="text-2xl font-bold text-zinc-200">142ms</div>
          </div>
        </div>
      </div>

      <div className="neo-flat flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-zinc-800/50 flex items-center gap-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-900/30">
          <Terminal className="size-4" /> Live Logs
        </div>
        <div className="flex-1 overflow-auto bg-[#0c0c0c] p-4 font-mono text-xs space-y-2 scrollbar-thin">
          {[
            { level: 'INFO', time: '14:32:01.023', msg: 'Incoming request to /api/v1/users', service: 'api-gateway' },
            { level: 'DEBUG', time: '14:32:01.045', msg: 'DB Connection acquired from pool', service: 'auth-service' },
            { level: 'INFO', time: '14:32:01.102', msg: 'User authenticated successfully', service: 'auth-service' },
            { level: 'WARN', time: '14:32:02.405', msg: 'Rate limit approaching for IP 192.168.1.1', service: 'rate-limiter' },
            { level: 'ERROR', time: '14:32:05.912', msg: 'Failed to connect to Redis cache', service: 'session-store' },
            { level: 'INFO', time: '14:32:06.001', msg: 'Retrying connection to Redis (1/3)', service: 'session-store' },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-4 hover:bg-zinc-800/30 py-1 transition-colors">
              <span className="text-zinc-600 shrink-0">{log.time}</span>
              <span className={[
                'shrink-0 w-12',
                log.level === 'INFO' ? 'text-sky-400' : 
                log.level === 'WARN' ? 'text-amber-400' : 
                log.level === 'ERROR' ? 'text-red-400' : 'text-zinc-400'
              ].join(' ')}>{log.level}</span>
              <span className="text-zinc-500 shrink-0 w-24 truncate">[{log.service}]</span>
              <span className="text-zinc-300">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
