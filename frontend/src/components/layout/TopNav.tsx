import {
  Activity,
  PanelLeft,
  Play,
  Search,
  SidebarClose,
  SidebarOpen,
} from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

type TopNavProps = {
  isSidebarCollapsed: boolean
  onMenuClick: () => void
  onToggleSidebar: () => void
}

export function TopNav({
  isSidebarCollapsed,
  onMenuClick,
  onToggleSidebar,
}: TopNavProps) {
  const { openAnalyzeModal } = useRepositoryAnalysis()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-800/80 bg-[#09090b]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Open navigation"
        className="rounded-md p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden"
        onClick={onMenuClick}
      >
        <PanelLeft className="size-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden rounded-md p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white lg:inline-flex"
        onClick={onToggleSidebar}
      >
        {isSidebarCollapsed ? (
          <SidebarOpen className="size-5" aria-hidden="true" />
        ) : (
          <SidebarClose className="size-5" aria-hidden="true" />
        )}
      </button>

      <div className="flex min-w-0 items-center gap-3 lg:hidden">
        <span className="grid size-8 shrink-0 place-items-center rounded-md border border-zinc-800 bg-zinc-950 text-xs font-semibold text-white">
          CS
        </span>
        <span className="hidden truncate text-sm font-semibold text-white sm:block">
          CodeScope AI
        </span>
      </div>

      <div className="hidden min-w-0 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm sm:flex">
        <Activity className="size-4 text-emerald-400" aria-hidden="true" />
        <span className="hidden text-zinc-500 md:inline">Repository</span>
        <span className="font-medium text-zinc-200">Connected</span>
      </div>

      <div className="ml-auto hidden h-9 w-full max-w-sm items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/70 px-3 text-sm text-zinc-500 md:flex">
        <Search className="size-4" aria-hidden="true" />
        <span className="truncate">Search repositories, files, symbols</span>
      </div>

      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-100 px-3 text-sm font-medium text-zinc-950 transition hover:bg-white"
        onClick={openAnalyzeModal}
      >
        <Play className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Analyze Repository</span>
        <span className="sm:hidden">Analyze</span>
      </button>

      <button
        type="button"
        aria-label="User profile"
        className="grid size-9 shrink-0 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white"
      >
        VA
      </button>
    </header>
  )
}
