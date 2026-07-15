import { useState } from 'react'
import {
  Activity,
  PanelLeft,
  Play,
  Search,
  SidebarClose,
  SidebarOpen,
  LogOut,
} from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'
import { useAuth } from '../../contexts/AuthContext'

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
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Get user initials (e.g. Varun A K -> VK or VA)
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'US'

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

      <div className="relative">
        <button
          type="button"
          aria-label="User profile"
          onClick={() => setIsDropdownOpen((v) => !v)}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white"
        >
          {initials}
        </button>

        {isDropdownOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-transparent cursor-default"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 z-50 w-56 rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 shadow-xl">
              <div className="px-3 py-2 border-b border-zinc-800/60 mb-1.5">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-red-400 hover:bg-red-950/20"
              >
                <LogOut className="size-3.5" /> Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

