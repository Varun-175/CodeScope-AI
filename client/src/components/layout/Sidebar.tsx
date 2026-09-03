import { NavLink } from 'react-router-dom'
import { X, Sparkles } from 'lucide-react'
import { navigationGroups, type NavigationItem } from '../../constants/navigation'
import { Logo } from '../shared/Logo'

type SidebarProps = {
  isCollapsed: boolean
  isOpen: boolean
  onClose: () => void
}

function SidebarLink({
  item,
  isCollapsed,
  onClose,
}: {
  item: NavigationItem
  isCollapsed: boolean
  onClose: () => void
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onClose}
      className={({ isActive }) =>
        [
          'group relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium tracking-tight transition-all duration-150',
          isCollapsed ? 'justify-center px-0' : '',
          isActive
            ? 'bg-gradient-to-r from-violet-600/20 via-indigo-600/10 to-transparent text-white font-semibold border-l-2 border-violet-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] pl-2'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]',
        ].join(' ')
      }
      title={isCollapsed ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`size-4 shrink-0 transition-colors duration-150 ${
              isActive
                ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]'
                : 'text-zinc-400 group-hover:text-zinc-200'
            }`}
            aria-hidden="true"
          />
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ isCollapsed, isOpen, onClose }: SidebarProps) {
  const widthClass = isCollapsed ? 'lg:w-16' : 'lg:w-60'

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col overflow-y-auto bg-[#080b11]/95 backdrop-blur-2xl border-r border-white/[0.06] transition-all duration-300 -translate-x-full lg:translate-x-0',
          widthClass,
          isOpen ? 'translate-x-0' : '',
        ].join(' ')}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-3.5 shrink-0">
          <NavLink to="/" className="flex min-w-0 items-center gap-2.5" onClick={onClose}>
            <div className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.25)]">
              <Logo size={20} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="block truncate text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  CodeScope AI
                  <span className="rounded bg-violet-500/20 px-1 py-0.2 text-[9px] font-mono font-bold text-violet-300 border border-violet-500/30">
                    V3
                  </span>
                </span>
                <span className="block truncate text-[10px] text-zinc-500 font-medium">
                  Software Intelligence
                </span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white lg:hidden"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex flex-1 flex-col px-2.5 py-4 pb-20 space-y-5">
          {navigationGroups.map((group, groupIdx) => (
            <div key={group.label} className="space-y-0.5">
              {!isCollapsed && (
                <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500/90">
                  {group.label}
                </p>
              )}
              {isCollapsed && groupIdx !== 0 && (
                <div className="mx-2 my-2 border-t border-white/[0.06]" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.path}
                    item={item}
                    isCollapsed={isCollapsed}
                    onClose={onClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
