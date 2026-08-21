import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
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
          'group relative flex h-9 items-center gap-3 px-3 text-sm font-medium tracking-normal transition duration-200',
          isCollapsed ? 'justify-center' : '',
          isActive
            ? 'neo-pressed text-violet-500 before:absolute before:left-0 before:h-5 before:w-1 before:rounded-r-full before:bg-violet-500'
            : 'neo-convex text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100',
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
          'neo-flat rounded-none border-none fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-[120%] flex-col overflow-y-auto transition duration-300 lg:translate-x-0',
          widthClass,
          isOpen ? 'translate-x-0' : '',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4 shrink-0">
          <NavLink to="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <div className="neo-pressed grid size-9 shrink-0 place-items-center">
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

        <nav className="flex flex-1 flex-col px-3 py-5 pb-20 space-y-6">
          {navigationGroups.map((group, groupIdx) => (
            <div key={group.label} className="space-y-1">
              {!isCollapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                  {group.label}
                </p>
              )}
              {isCollapsed && groupIdx !== 0 && (
                <div className="mx-4 my-2 border-t border-zinc-800" />
              )}
              
              <div className="space-y-1.5">
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
