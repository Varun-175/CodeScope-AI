import { Calendar, Filter, MoreHorizontal, Plus, Clock, Target, ListTodo } from 'lucide-react'

export function Planning() {
  const columns = [
    { name: 'To Do', icon: ListTodo, color: 'text-zinc-400', count: 3, tasks: [
      { id: 'TSK-102', title: 'Implement OAuth2 Flow', points: 5, priority: 'High' },
      { id: 'TSK-105', title: 'Update dependencies to React 19', points: 3, priority: 'Medium' },
      { id: 'TSK-106', title: 'Design system tokens refactor', points: 8, priority: 'Medium' }
    ]},
    { name: 'In Progress', icon: Clock, color: 'text-amber-400', count: 2, tasks: [
      { id: 'TSK-101', title: 'Setup monorepo tooling', points: 13, priority: 'Critical' },
      { id: 'TSK-104', title: 'Database migration scripts', points: 5, priority: 'High' }
    ]},
    { name: 'In Review', icon: Target, color: 'text-sky-400', count: 1, tasks: [
      { id: 'TSK-98', title: 'User profile dashboard', points: 8, priority: 'Medium' }
    ]},
    { name: 'Done', icon: Calendar, color: 'text-emerald-400', count: 0, tasks: [] }
  ]

  return (
    <div className="space-y-6 animate-fade-in-up h-[calc(100vh-10rem)] flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="size-6 text-fuchsia-500" />
            Sprint Planning
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Current iteration: Sprint 42 (Ends in 3 days)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="neo-pressed flex h-9 items-center gap-2 px-4 text-sm text-zinc-300">
            <Filter className="size-4" /> Filter
          </button>
          <button className="neo-accent flex h-9 items-center gap-2 px-4 text-sm font-semibold transition bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30 border-fuchsia-500/50">
            <Plus className="size-4" /> New Issue
          </button>
        </div>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 scrollbar-thin">
        {columns.map(col => (
          <div key={col.name} className="flex flex-col min-w-[320px] w-[320px] bg-zinc-900/20 rounded-2xl border border-zinc-800/50">
            <div className="p-4 flex justify-between items-center border-b border-zinc-800/50">
              <h3 className={`text-sm font-semibold flex items-center gap-2 ${col.color}`}>
                <col.icon className="size-4" /> {col.name}
              </h3>
              <span className="neo-pressed px-2 py-0.5 rounded-full text-xs text-zinc-400 font-mono">
                {col.count}
              </span>
            </div>
            
            <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
              {col.tasks.map(task => (
                <div key={task.id} className="neo-flat p-4 cursor-pointer hover:border-fuchsia-500/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                      {task.id}
                    </span>
                    <button className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-medium text-zinc-200 mb-3">{task.title}</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className={[
                      'px-2 py-0.5 rounded-full font-medium',
                      task.priority === 'Critical' ? 'bg-red-500/10 text-red-400' :
                      task.priority === 'High' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-zinc-800 text-zinc-400'
                    ].join(' ')}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="neo-pressed size-6 rounded-full flex items-center justify-center font-mono text-[10px] text-zinc-400">
                        {task.points}
                      </span>
                      <div className="size-6 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 border border-zinc-800" title="Assigned to you"></div>
                    </div>
                  </div>
                </div>
              ))}
              {col.tasks.length === 0 && (
                <div className="text-center p-6 text-xs text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
                  No issues
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
