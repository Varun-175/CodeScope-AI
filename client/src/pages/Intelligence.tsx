import { Brain, Layers, GitCompare, GitPullRequest, Search, Zap } from 'lucide-react'

export function Intelligence() {
  return (
    <div className="space-y-6 animate-fade-in-up h-[calc(100vh-10rem)] flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Brain className="size-6 text-violet-500" />
            Code Intelligence
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Query the semantic graph and explore the global software intelligence index.
          </p>
        </div>
        
        <div className="neo-pressed flex h-10 items-center gap-2 px-4 lg:w-96">
          <Search className="size-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search functions, classes, cross-repo dependencies..." 
            className="bg-transparent text-sm text-white outline-none placeholder:text-zinc-600 w-full"
          />
          <div className="text-[10px] text-zinc-600 border border-zinc-700 rounded px-1">⌘K</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <aside className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin">
          <div className="neo-flat p-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Semantic Queries</h3>
            <div className="space-y-2">
              {['Find circular dependencies', 'Show complex functions > 10', 'List untested public methods', 'Find undocumented APIs'].map(q => (
                <button key={q} className="neo-convex w-full text-left p-2.5 text-xs text-zinc-300 hover:text-white transition">
                  <span className="flex items-center gap-2"><Zap className="size-3 text-amber-500" /> {q}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="neo-flat p-4 flex-1">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Graph Filters</h3>
            <div className="space-y-3 text-xs text-zinc-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-violet-500" defaultChecked />
                Show Function Calls
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-violet-500" defaultChecked />
                Show Imports
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-violet-500" />
                Show Database Models
              </label>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3 neo-flat relative overflow-hidden flex items-center justify-center border-dashed">
          {/* Decorative background grid for graph placeholder */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          
          <div className="z-10 text-center max-w-sm">
            <div className="neo-pressed mx-auto grid size-16 place-items-center rounded-2xl text-violet-500 mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
              <Layers className="size-8" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-200">Intelligence Graph</h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              The Code Intelligence Graph requires an active indexing job to complete. Select a repository from the overview to begin semantic indexing.
            </p>
            <button className="mt-6 neo-accent px-6 py-2 text-sm font-semibold inline-flex items-center gap-2">
              <GitPullRequest className="size-4" />
              Index Repository
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
