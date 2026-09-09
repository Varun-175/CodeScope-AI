import { NavLink } from 'react-router-dom'
import {
  Activity,
  Boxes,
  Compass,
  GitPullRequest,
  Home,
  Menu,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'

interface MobileNavProps {
  onOpenSidebar: () => void
}

export function MobileNav({ onOpenSidebar }: MobileNavProps) {
  const items = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/intelligence', label: 'Understand', icon: Sparkles },
    { to: '/impact', label: 'Evolve', icon: GitPullRequest },
    { to: '/planning', label: 'Act', icon: Boxes },
    { to: '/incidents', label: 'Operate', icon: ShieldAlert },
  ]

  return (
    <nav
      aria-label="Mobile navigation bar"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-white/[0.08] bg-[#090c14]/90 px-2 backdrop-blur-2xl lg:hidden"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 transition ${
              isActive
                ? 'text-violet-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          {({ isActive }) => {
            const Icon = item.icon
            return (
              <>
                <Icon
                  className={`size-5 ${
                    isActive ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : ''
                  }`}
                />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </>
            )
          }}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200 transition"
        aria-label="More navigation items"
      >
        <Menu className="size-5" />
        <span className="text-[10px] tracking-tight">More</span>
      </button>
    </nav>
  )
}
