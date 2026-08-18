import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { primaryNavigation, type NavigationItem } from '../../constants/navigation'
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
          'group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium tracking-normal transition duration-200',
          isCollapsed ? 'justify-center' : '',
          isActive
            ? 'bg-gradient-to-r from-violet-500/25 via-violet-500/10 to-transparent text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_8px_22px_rgba(124,58,237,.12)] before:absolute before:left-0 before:h-6 before:w-1 before:rounded-r-full before:bg-violet-400'
            : 'text-zinc-500 hover:bg-white/[.06] hover:text-zinc-100 hover:translate-x-0.5',
        ].join(' ')
      }
      title={isCollapsed ? item.label : undefined}
    >
      <Icon className="size-4 shrink-0 text-zinc-500 transition group-hover:text-zinc-700 dark:group-hover:text-zinc-200" aria-hidden="true" />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

export function Sidebar({ isCollapsed, isOpen, onClose }: SidebarProps) {
  const widthClass = isCollapsed ? 'lg:w-20' : 'lg:w-64'

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-[120%] flex-col overflow-hidden border-y border-r border-zinc-800 bg-[#010409] transition duration-300 lg:translate-x-0',
          widthClass,
          isOpen ? 'translate-x-0' : '',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
          <NavLink to="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <div className="grid size-9 shrink-0 place-items-center rounded-md border border-zinc-700 bg-zinc-900">
              <Logo size={24} />
            </div>
            {!isCollapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-normal text-zinc-900 dark:text-white">
                  CodeScope AI
                </span>
                <span className="block truncate text-xs font-medium text-zinc-500">
                  Developer Intelligence
                </span>
              </span>
            )}
          </NavLink>

          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col px-3 py-5">
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              Platform
            </p>
          )}

          <div className="space-y-2">
            {primaryNavigation.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                isCollapsed={isCollapsed}
                onClose={onClose}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}
