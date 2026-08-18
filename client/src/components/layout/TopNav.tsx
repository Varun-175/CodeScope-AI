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
import { Logo } from '../shared/Logo'

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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0b0b10]/84 px-4 shadow-[0_12px_35px_rgba(0,0,0,.18)] backdrop-blur-2xl sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Open navigation"
        className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white lg:hidden"
        onClick={onMenuClick}
      >
        <PanelLeft className="size-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white lg:inline-flex"
        onClick={onToggleSidebar}
      >
        {isSidebarCollapsed ? (
          <SidebarOpen className="size-5" aria-hidden="true" />
        ) : (
          <SidebarClose className="size-5" aria-hidden="true" />
        )}
      </button>

      <div className="flex min-w-0 items-center gap-3 lg:hidden">
        <div className="grid size-8 shrink-0 place-items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <Logo size={20} />
        </div>
        <span className="hidden truncate text-sm font-semibold text-zinc-900 dark:text-white sm:block">
          CodeScope AI
        </span>
      </div>

      <div className="surface-glass hidden min-w-0 items-center gap-2 rounded-xl px-3 py-1.5 text-sm sm:flex">
        <Activity className="size-4 text-emerald-400" aria-hidden="true" />
        <span className="hidden text-zinc-500 md:inline">Repository</span>
        <span className="font-medium text-zinc-200">Connected</span>
      </div>

      <div className="ml-auto hidden h-9 w-full max-w-sm items-center gap-2 rounded-xl border border-white/10 bg-white/[.045] px-3 text-sm text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] md:flex">
        <Search className="size-4" aria-hidden="true" />
        <span className="truncate">Search repositories, files, symbols</span>
      </div>

      <button
        type="button"
        className="tactile-control inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-3 text-sm font-semibold text-white"
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
          className="tactile-control grid size-9 shrink-0 place-items-center rounded-full border-violet-400/30 bg-gradient-to-br from-violet-500/30 to-cyan-400/10 text-xs font-semibold text-zinc-200"
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
            <div className="absolute right-0 mt-2 z-50 w-56 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 shadow-xl">
              <div className="px-3 py-2 border-b border-zinc-150 dark:border-zinc-800/60 mb-1.5">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
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
