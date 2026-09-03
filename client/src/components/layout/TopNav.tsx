import { useState } from 'react'
import {
  PanelLeft,
  Play,
  Search,
  SidebarClose,
  SidebarOpen,
  LogOut,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'
import { useAuth } from '../../contexts/AuthContext'
import { Logo } from '../shared/Logo'
import { JobTracker } from './JobTracker'

type TopNavProps = {
  isSidebarCollapsed: boolean
  onMenuClick: () => void
  onToggleSidebar: () => void
  onOpenCommandPalette: () => void
  onOpenIntelligencePanel: () => void
}

export function TopNav({
  isSidebarCollapsed,
  onMenuClick,
  onToggleSidebar,
  onOpenCommandPalette,
  onOpenIntelligencePanel,
}: TopNavProps) {
  const { data, status, openAnalyzeModal } = useRepositoryAnalysis()
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'US'

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4 sm:px-6 bg-[#080b11]/80 backdrop-blur-xl border-b border-white/[0.06] mb-6">
      {/* Mobile Toggle */}
      <button
        type="button"
        aria-label="Open navigation"
        className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white lg:hidden"
        onClick={onMenuClick}
      >
        <PanelLeft className="size-4" aria-hidden="true" />
      </button>

      {/* Desktop Sidebar Toggle */}
      <button
        type="button"
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white lg:inline-flex"
        onClick={onToggleSidebar}
      >
        {isSidebarCollapsed ? (
          <SidebarOpen className="size-4" aria-hidden="true" />
        ) : (
          <SidebarClose className="size-4" aria-hidden="true" />
        )}
      </button>

      {/* Mobile Brand */}
      <div className="flex min-w-0 items-center gap-2 lg:hidden">
        <div className="grid size-7 place-items-center rounded-lg bg-violet-600/20 border border-violet-500/30">
          <Logo size={16} />
        </div>
        <span className="truncate text-xs font-bold text-white sm:block">
          CodeScope AI
        </span>
      </div>

      {/* Active Repository Badge */}
      <div className="hidden min-w-0 items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs sm:flex">
        <span
          className={`size-2 rounded-full ${
            status === 'analyzing'
              ? 'bg-amber-400 animate-pulse'
              : data
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                : 'bg-zinc-600'
          }`}
          aria-hidden="true"
        />
        <span className="text-zinc-500 font-medium">Repo:</span>
        <span className="max-w-44 truncate font-semibold text-zinc-200">
          {data ? data.repository.name : status === 'analyzing' ? 'Analyzing AST...' : 'Not connected'}
        </span>
      </div>

      {/* Search Input Trigger for Command Palette */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="ml-auto hidden h-8 w-full max-w-sm items-center gap-2.5 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-left text-xs text-zinc-400 transition hover:border-violet-500/40 hover:bg-white/[0.06] md:flex"
        aria-label="Open command palette"
      >
        <Search className="size-3.5 text-zinc-500" aria-hidden="true" />
        <span className="truncate">Search software graph, code, entities...</span>
        <kbd className="ml-auto hidden rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 lg:inline">
          Ctrl K
        </kbd>
      </button>

      {/* Primary Analyze Action */}
      <button
        type="button"
        className="neo-accent inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold shadow-lg shadow-violet-600/20"
        onClick={openAnalyzeModal}
      >
        <Play className="size-3.5 fill-current" aria-hidden="true" />
        <span className="hidden sm:inline">Analyze Repository</span>
        <span className="sm:hidden">Analyze</span>
      </button>

      <JobTracker />

      {/* Quick AI Investigation Button */}
      <button
        type="button"
        onClick={onOpenIntelligencePanel}
        className="hidden size-8 place-items-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:border-violet-500/40 hover:text-violet-300 sm:grid transition"
        aria-label="Open intelligence panel"
        title="Open CodeScope AI Investigation"
      >
        <Sparkles className="size-3.5" aria-hidden="true" />
      </button>

      {/* User Profile Menu */}
      <div className="relative">
        <button
          type="button"
          aria-label="User profile"
          onClick={() => setIsDropdownOpen((v) => !v)}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 text-xs font-bold text-violet-200 hover:border-violet-400 transition"
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
            <div className="absolute right-0 mt-2 z-50 w-56 rounded-xl border border-white/[0.08] bg-[#0c101a] p-1.5 shadow-2xl backdrop-blur-2xl">
              <div className="px-3 py-2 border-b border-white/[0.06] mb-1.5">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 transition"
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
