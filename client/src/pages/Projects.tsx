import { useState } from 'react'
import { Folder, MoreVertical, Plus, Search, Layers, GitBranch, Clock } from 'lucide-react'

export function Projects() {
  const [search, setSearch] = useState('')

  const projects = [
    { id: 1, name: 'Core Engine (AI)', repos: 4, lastActive: '2h ago', status: 'Healthy', progress: 85 },
    { id: 2, name: 'Frontend Web App', repos: 2, lastActive: '5h ago', status: 'Warning', progress: 60 },
    { id: 3, name: 'Data Pipeline', repos: 7, lastActive: '1d ago', status: 'Healthy', progress: 100 },
    { id: 4, name: 'Mobile Client (iOS)', repos: 1, lastActive: '3d ago', status: 'Critical', progress: 20 },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Folder className="size-6 text-violet-500" />
            Projects
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Group repositories into logical projects to track overall health and intelligence metrics.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="neo-pressed flex h-9 items-center gap-2 px-3">
            <Search className="size-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white outline-none placeholder:text-zinc-600 w-48"
            />
          </div>
          <button className="neo-accent flex h-9 items-center gap-2 px-4 text-sm font-semibold transition">
            <Plus className="size-4" />
            New Project
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="neo-flat flex flex-col p-5 hover:border-violet-500/30 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 neo-pressed rounded-lg">
                <Layers className="size-5 text-violet-400 group-hover:text-violet-300 transition-colors" />
              </div>
              <button className="text-zinc-500 hover:text-white p-1">
                <MoreVertical className="size-4" />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-zinc-200">{project.name}</h3>
            
            <div className="mt-4 flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1.5">
                <GitBranch className="size-3.5" /> {project.repos} repos
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" /> {project.lastActive}
              </span>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-400 font-medium">System Health</span>
                <span className={[
                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full neo-pressed',
                  project.status === 'Healthy' ? 'text-emerald-400' : 
                  project.status === 'Warning' ? 'text-amber-400' : 'text-red-400'
                ].join(' ')}>
                  {project.status}
                </span>
              </div>
              <div className="neo-pressed h-1.5 w-full rounded-full overflow-hidden flex">
                <div 
                  className={[
                    "h-full transition-all duration-1000",
                    project.status === 'Healthy' ? 'bg-emerald-500' : 
                    project.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                  ].join(' ')}
                  style={{ width: `${project.progress}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
