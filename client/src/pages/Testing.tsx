import { useMemo } from 'react'
import { AlertCircle, ArrowRight, Beaker, CheckCircle2, FileCode2, Layers2, ShieldAlert, TestTube2, Zap, XCircle } from 'lucide-react'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'

export function Testing() {
  const { data, status } = useRepositoryAnalysis()

  const testSignals = useMemo(() => {
    if (!data) return []
    return [
      {
        label: 'Test files detected',
        value: data.repository.has_tests ? 'Yes' : 'No',
        detail: data.repository.has_tests ? 'The analyzer found test-related files.' : 'No test suite was detected in the current snapshot.',
        icon: data.repository.has_tests ? CheckCircle2 : XCircle,
        color: data.repository.has_tests ? 'text-emerald-400' : 'text-red-400',
      },
      {
        label: 'Parsed source files',
        value: `${data.repository.parsed_files}`,
        detail: `${data.repository.supported_files} supported files were scanned.`,
        icon: FileCode2,
        color: 'text-blue-400',
      },
      {
        label: 'Risk hotspots',
        value: `${data.risks.complexity_hotspots?.length ?? 0}`,
        detail: 'Complexity signals requiring focused test coverage.',
        icon: ShieldAlert,
        color: 'text-amber-400',
      },
    ]
  }, [data])

  const priorityTargets = useMemo(() => {
    if (!data) return []
    const hotspots = data.risks.complexity_hotspots ?? []
    return hotspots.slice(0, 5).map((hotspot, idx) => ({
      id: `target-${idx}`,
      path: hotspot.path || 'Unknown path',
      reason: hotspot.reason || 'Complexity hotspot',
      lines: hotspot.lines || 0,
      priority: idx === 0 ? 'Critical' : idx < 3 ? 'High' : 'Medium',
    }))
  }, [data])

  if (status === 'analyzing') {
    return <LoadingState title="Preparing test intelligence" hint="Inspecting source and test signals" />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to inspect testing"
        description="Testing intelligence is scoped to the currently analyzed repository snapshot."
        icon={Beaker}
      />
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <Beaker className="size-5 text-emerald-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Testing</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Test intelligence for {data.repository.owner}/{data.repository.name} at {data.repository.branch}.
          </p>
        </div>
        <span className="neo-pressed px-3 py-2 text-[10px] text-zinc-500">Execution provider not configured</span>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {testSignals.map((signal) => {
          const Icon = signal.icon
          return (
            <div key={signal.label} className="neo-flat p-4">
              <div className="flex items-center gap-2">
                <Icon className={`size-4 ${signal.color}`} aria-hidden="true" />
                <span className="text-xs uppercase tracking-wider text-zinc-500">{signal.label}</span>
              </div>
              <p className="mt-3 font-mono text-2xl font-semibold text-zinc-200">{signal.value}</p>
              <p className="mt-1 text-[10px] leading-4 text-zinc-600">{signal.detail}</p>
            </div>
          )
        })}
      </div>

      <section className="neo-flat p-5">
        <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
          <TestTube2 className="size-4 text-emerald-400" aria-hidden="true" />
          <h2 className="text-sm font-medium text-zinc-200">Coverage readiness</h2>
        </div>
        <div className="mt-5 space-y-3">
          <div className="neo-pressed flex items-start gap-3 p-4">
            <CheckCircle2 className="mt-0.5 size-4 text-emerald-400" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium text-zinc-300">Source inventory available</p>
              <p className="mt-1 text-xs text-zinc-500">
                {data.repository.lines_of_code.toLocaleString()} lines across {data.repository.files} files can be used to target test work.
              </p>
            </div>
          </div>
          <div className="neo-pressed flex items-start gap-3 p-4">
            {data.repository.has_tests ? (
              <CheckCircle2 className="mt-0.5 size-4 text-emerald-400" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 text-amber-400" aria-hidden="true" />
            )}
            <div>
              <p className="text-xs font-medium text-zinc-300">Test suite signal</p>
              <p className="mt-1 text-xs text-zinc-500">
                {data.repository.has_tests
                  ? 'Test-related files were found. Connect a test runner to collect execution results.'
                  : 'Add a test suite around the highest-risk modules before relying on change automation.'}
              </p>
            </div>
          </div>
          <div className="neo-pressed flex items-start gap-3 p-4">
            <ShieldAlert className="mt-0.5 size-4 text-amber-400" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium text-zinc-300">Priority targets</p>
              <p className="mt-1 text-xs text-zinc-500">
                {priorityTargets.length > 0
                  ? `${priorityTargets.length} files require focused test coverage`
                  : 'No complexity hotspots were reported.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {priorityTargets.length > 0 && (
        <section className="neo-flat p-5">
          <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
            <Layers2 className="size-4 text-sky-400" aria-hidden="true" />
            <h2 className="text-sm font-medium text-zinc-200">Test priority targets</h2>
          </div>
          <div className="mt-4 space-y-3">
            {priorityTargets.map((target) => (
              <div key={target.id} className="neo-pressed flex items-start justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold ${
                        target.priority === 'Critical'
                          ? 'text-red-400'
                          : target.priority === 'High'
                            ? 'text-amber-400'
                            : 'text-zinc-500'
                      }`}
                    >
                      {target.priority}
                    </span>
                    <p className="truncate font-mono text-xs text-zinc-300">{target.path}</p>
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-500">{target.reason}</p>
                  {target.lines > 0 && (
                    <p className="mt-1 text-[10px] text-zinc-600">
                      <Zap className="inline size-3 mr-1 text-amber-400" aria-hidden="true" />
                      {target.lines} lines
                    </p>
                  )}
                </div>
                <ArrowRight className="mt-0.5 size-3 shrink-0 text-zinc-600" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="neo-flat p-5">
        <h2 className="text-sm font-medium text-zinc-200">Test execution contract</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <TestContract label="Test discovery" detail="Jest, pytest, or unittest" />
          <TestContract label="Coverage collection" detail="Execution metrics provider" />
          <TestContract label="Result reporting" detail="Success/failure verdicts" />
        </div>
        <p className="mt-4 border-t border-zinc-800/70 pt-4 text-[10px] text-zinc-600">
          Pass/fail counts and coverage percentages will appear when a repository test execution contract is available.
        </p>
      </section>
    </div>
  )
}

function TestContract({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="neo-pressed p-3">
      <p className="text-xs font-medium text-zinc-300">{label}</p>
      <p className="mt-1 text-[10px] text-zinc-600">{detail} pending</p>
    </div>
  )
}
