import { Beaker, CheckCircle2, XCircle, AlertCircle, PlayCircle, Clock, BarChart } from 'lucide-react'

export function Testing() {
  const testSuites = [
    { name: 'Unit Tests (Frontend)', status: 'passed', time: '45s', coverage: 92, failed: 0, passed: 1240 },
    { name: 'Unit Tests (Backend)', status: 'passed', time: '1m 12s', coverage: 88, failed: 0, passed: 856 },
    { name: 'Integration Tests', status: 'failed', time: '3m 40s', coverage: 75, failed: 3, passed: 142 },
    { name: 'E2E Tests', status: 'running', time: '4m 10s...', coverage: null, failed: 0, passed: 45 },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Beaker className="size-6 text-emerald-500" />
            Testing & Coverage
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Deterministic validation pipelines, code coverage, and test intelligence.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="neo-accent flex h-9 items-center gap-2 px-4 text-sm font-semibold transition bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/50">
            <PlayCircle className="size-4" />
            Run All Tests
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="neo-flat p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
            <CheckCircle2 className="size-4 text-emerald-500" /> Passed Tests
          </div>
          <div className="text-3xl font-bold text-zinc-200">2,238</div>
          <div className="text-xs text-emerald-400 mt-2">↑ 14 from last run</div>
        </div>
        
        <div className="neo-flat p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
            <XCircle className="size-4 text-red-500" /> Failed Tests
          </div>
          <div className="text-3xl font-bold text-zinc-200">3</div>
          <div className="text-xs text-red-400 mt-2">Needs immediate attention</div>
        </div>
        
        <div className="neo-flat p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
            <BarChart className="size-4 text-violet-500" /> Global Coverage
          </div>
          <div className="text-3xl font-bold text-zinc-200">86.4%</div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-3">
            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: '86.4%' }}></div>
          </div>
        </div>
      </div>

      <div className="neo-flat overflow-hidden">
        <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-zinc-300">Active Test Suites</h2>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {testSuites.map((suite, idx) => (
            <div key={idx} className="p-4 hover:bg-zinc-800/20 transition flex items-center justify-between">
              <div className="flex items-center gap-4">
                {suite.status === 'passed' && <CheckCircle2 className="size-5 text-emerald-500" />}
                {suite.status === 'failed' && <XCircle className="size-5 text-red-500" />}
                {suite.status === 'running' && <AlertCircle className="size-5 text-amber-500 animate-pulse" />}
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">{suite.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 font-mono">
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {suite.time}</span>
                    <span>{suite.passed} passed</span>
                    {suite.failed > 0 && <span className="text-red-400">{suite.failed} failed</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {suite.coverage && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-zinc-400 mb-1">Coverage</span>
                    <span className="text-sm font-mono font-semibold text-zinc-200">{suite.coverage}%</span>
                  </div>
                )}
                <button className="neo-pressed p-2 text-zinc-400 hover:text-white transition rounded-lg">
                  View Logs
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
