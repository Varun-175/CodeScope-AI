import {
  BotMessageSquare,
  Gauge,
  GitBranch,
  Settings,
  ShieldAlert,
  Layers,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
}

export const primaryNavigation: NavigationItem[] = [
  { label: 'Dashboard', path: '/', icon: Gauge },
  { label: 'Repository', path: '/repository', icon: GitBranch },
  { label: 'Chat', path: '/chat', icon: BotMessageSquare },
  { label: 'Code Reviews', path: '/reviews', icon: ShieldAlert },
  { label: 'Architecture', path: '/architecture', icon: Layers },
  { label: 'Settings', path: '/settings', icon: Settings },
]

