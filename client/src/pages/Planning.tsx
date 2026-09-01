import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Calendar, CheckCircle2, Clock, FileSearch, ListChecks, ListTodo, ShieldCheck, Target } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

type PlanStatus = 'todo' | 'progress' | 'review' | 'done'
type PlanPriority = 'Critical' | 'High' | 'Medium'
type PlanTask = {
  id: string
  title: string
  detail: string
  priority: PlanPriority
  status: PlanStatus
  source: string
}

const COLUMNS: Array<{ id: PlanStatus; name: string; icon: typeof ListTodo; color: string }> = [
  { id: 'todo', name: 'To Do', icon: ListTodo, color: 'text-zinc-400' },
  { id: 'progress', name: 'In Progress', icon: Clock, color: 'text-amber-400' },
  { id: 'review', name: 'In Review', icon: Target, color: 'text-sky-400' },
  { id: 'done', name: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
]

export function Planning() {
  const { data, error, status } = useRepositoryAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const [taskStatuses, setTaskStatuses] = useState<Record<string, PlanStatus>>({})
  const [criteriaStatus, setCriteriaStatus] = useState<Record<string, boolean>>({})

  const tasks = useMemo<PlanTask[]>(() => {
    if (!data) return []
    const risks = [...(data.risks.critical ?? []), ...(data.risks.warnings ?? []), ...(data.risks.complexity_hotspots ?? [])]
    const nextTasks: PlanTask[] = risks.slice(0, 6).map((risk, index) => ({
      id: `RISK-${String(index + 1).padStart(3, '0')}`,
      title: risk.reason || `Review ${risk.path || 'analysis hotspot'}`,
      detail: risk.path ? `${risk.path}${risk.lines ? ` · ${risk.lines.toLocaleString()} lines` : ''}` : 'Current repository analysis signal',
      priority: risk.severity?.toLowerCase() === 'critical' || index === 0 ? 'Critical' : index < 3 ? 'High' : 'Medium',
      status: 'todo',
      source: 'Repository risk analysis',
    }))

    if (!data.repository.has_tests) {
      nextTasks.push({ id: 'TEST-001', title: 'Add coverage for high-risk modules', detail: 'No test suite was detected in the current snapshot.', priority: 'Critical', status: 'todo', source: 'Test detection' })
    }
    if ((data.dependency_health.unknown?.length ?? 0) > 0) {
      nextTasks.push({ id: 'DEP-001', title: 'Review unknown dependencies', detail: `${data.dependency_health.unknown.length} dependencies need verification.`, priority: 'High', status: 'todo', source: 'Dependency analysis' })
    }
    if (!data.repository.readme) {
      nextTasks.push({ id: 'DOC-001', title: 'Document repository setup', detail: 'README evidence was not found in the current snapshot.', priority: 'Medium', status: 'todo', source: 'Documentation analysis' })
    }
    return nextTasks
  }, [data])

  function moveTask(id: string, status: PlanStatus) {
    setTaskStatuses((current) => ({ ...current, [id]: status }))
  }

  function selectTask(id: string) {
    const next = new URLSearchParams(searchParams)
    next.set('task', id)
    setSearchParams(next, { replace: true })
  }

  if (status === 'analyzing') return <LoadingState title="Preparing planning signals" hint="Converting repository findings into actionable work" />
  if (!data) return <EmptyState title="Analyze a repository to create a plan" description="Planning items are generated from risks, dependencies, documentation, and test signals in the selected snapshot." icon={Calendar} />

  const selectedTask = tasks.find((task) => task.id === searchParams.get('task')) ?? tasks[0]
  const acceptanceCriteria = selectedTask ? criteriaFor(selectedTask) : []

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-5">
      {error ? <ErrorState title="Latest analysis failed" description="Showing the last completed plan. Run another analysis to refresh the recommendations." /> : null}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <Calendar className="size-5 text-fuchsia-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Planning</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Actionable work derived from {data.repository.owner}/{data.repository.name} at {data.repository.branch}.</p>
        </div>
        <span className="neo-pressed inline-flex items-center gap-2 px-3 py-2 text-[10px] text-zinc-500"><AlertTriangle className="size-3 text-amber-400" aria-hidden="true" />Snapshot-scoped recommendations</span>
      </header>

      {tasks.length === 0 ? (
        <div className="neo-flat flex flex-1 items-center justify-center"><EmptyState title="No planning signals found" description="The current analysis did not produce risks or follow-up actions." icon={CheckCircle2} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Plan summary">
            <Summary label="Total tasks" value={tasks.length} />
            <Summary label="Critical" value={tasks.filter((task) => task.priority === 'Critical').length} tone="text-red-400" />
            <Summary label="High" value={tasks.filter((task) => task.priority === 'High').length} tone="text-amber-400" />
            <Summary label="Completed" value={tasks.filter((task) => (taskStatuses[task.id] ?? task.status) === 'done').length} tone="text-emerald-400" />
          </div>
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const Icon = column.icon
            const columnTasks = tasks.filter((task) => (taskStatuses[task.id] ?? task.status) === column.id)
            return (
              <section key={column.id} className="neo-flat flex min-w-[290px] flex-1 flex-col p-3">
                <div className="flex items-center justify-between border-b border-zinc-800/70 px-2 pb-3">
                  <h2 className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${column.color}`}><Icon className="size-3.5" aria-hidden="true" />{column.name}</h2>
                  <span className="neo-pressed px-2 py-0.5 font-mono text-[10px] text-zinc-500">{columnTasks.length}</span>
                </div>
                <div className="mt-3 flex flex-1 flex-col gap-3">
                  {columnTasks.map((task) => {
                    const nextColumn = COLUMNS[COLUMNS.findIndex((item) => item.id === (taskStatuses[task.id] ?? task.status)) + 1]
                    return (
                      <article key={task.id} className="neo-convex p-4">
                        <div className="flex items-start justify-between gap-3"><span className="font-mono text-[10px] text-zinc-600">{task.id}</span><span className={`text-[10px] font-medium ${task.priority === 'Critical' ? 'text-red-400' : task.priority === 'High' ? 'text-amber-400' : 'text-zinc-500'}`}>{task.priority}</span></div>
                        <button type="button" onClick={() => selectTask(task.id)} className="mt-3 text-left text-sm font-medium leading-5 text-zinc-200 hover:text-violet-300">{task.title}</button>
                        <p className="mt-2 text-xs leading-5 text-zinc-500">{task.detail}</p>
                        <p className="mt-3 border-t border-zinc-800/70 pt-3 text-[10px] text-zinc-600">Source: {task.source}</p>
                        {nextColumn ? <button type="button" onClick={() => moveTask(task.id, nextColumn.id)} className="mt-3 inline-flex items-center gap-1 text-[10px] text-violet-400 transition hover:text-violet-300">Move to {nextColumn.name}<ArrowRight className="size-3" aria-hidden="true" /></button> : null}
                      </article>
                    )
                  })}
                  {columnTasks.length === 0 ? <div className="flex flex-1 items-center justify-center border border-dashed border-zinc-800 p-6 text-center text-[10px] text-zinc-700">No items</div> : null}
                </div>
              </section>
            )
          })}
          </div>
          {selectedTask ? <section className="neo-flat p-5" aria-label="Plan task inspector"><div className="flex flex-col justify-between gap-3 border-b border-zinc-800/70 pb-4 sm:flex-row sm:items-start"><div><p className="text-[10px] uppercase tracking-wider text-violet-400">Task inspector</p><h2 className="mt-1 text-sm font-semibold text-zinc-200">{selectedTask.title}</h2><p className="mt-1 font-mono text-[10px] text-zinc-600">{selectedTask.id} · {selectedTask.source}</p></div><span className="neo-pressed px-2 py-1 text-[10px] text-zinc-400">{COLUMNS.find((column) => column.id === (taskStatuses[selectedTask.id] ?? selectedTask.status))?.name}</span></div><p className="mt-4 text-sm leading-6 text-zinc-400">{selectedTask.detail}</p><div className="mt-5 grid gap-5 lg:grid-cols-2"><div><div className="flex items-center gap-2"><ListChecks className="size-4 text-emerald-400" aria-hidden="true" /><h3 className="text-xs font-medium text-zinc-200">Acceptance criteria</h3></div><div className="mt-3 space-y-2">{acceptanceCriteria.map((criterion, index) => { const key = `${selectedTask.id}-${index}`; return <label key={key} className="neo-pressed flex items-start gap-2 p-3 text-xs text-zinc-400"><input type="checkbox" checked={criteriaStatus[key] ?? false} onChange={(event) => setCriteriaStatus((current) => ({ ...current, [key]: event.target.checked }))} className="mt-0.5 accent-violet-500" />{criterion}</label> })}</div></div><div><div className="flex items-center gap-2"><ShieldCheck className="size-4 text-sky-400" aria-hidden="true" /><h3 className="text-xs font-medium text-zinc-200">Evidence and next steps</h3></div><div className="mt-3 space-y-2"><Link to="/repository/explore" className="neo-pressed flex items-center gap-2 p-3 text-xs text-zinc-400"><FileSearch className="size-3.5 text-sky-400" aria-hidden="true" />Inspect repository source</Link><Link to="/reviews" className="neo-pressed flex items-center gap-2 p-3 text-xs text-zinc-400"><AlertTriangle className="size-3.5 text-amber-400" aria-hidden="true" />Review related findings</Link><Link to="/testing" className="neo-pressed flex items-center gap-2 p-3 text-xs text-zinc-400"><CheckCircle2 className="size-3.5 text-emerald-400" aria-hidden="true" />Validate with testing</Link></div></div></div></section> : null}
        </>
      )}
    </div>
  )
}

function Summary({ label, value, tone = 'text-zinc-200' }: { label: string; value: number; tone?: string }) {
  return <div className="neo-flat p-3"><p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p><p className={`mt-2 font-mono text-xl font-semibold ${tone}`}>{value}</p></div>
}

function criteriaFor(task: PlanTask) {
  if (task.source === 'Test detection') return ['Add tests for the selected high-risk behavior.', 'Run the repository test suite successfully.', 'Document the test coverage boundary.']
  if (task.source === 'Dependency analysis') return ['Verify the dependency purpose and version.', 'Record the dependency risk decision.', 'Confirm affected builds remain valid.']
  if (task.source === 'Documentation analysis') return ['Document setup and local execution steps.', 'Describe expected configuration and dependencies.', 'Link to the relevant implementation area.']
  return ['Inspect the flagged source and its callers.', 'Resolve or formally accept the identified risk.', 'Add or update tests for the affected behavior.']
}
