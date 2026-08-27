import {
  Activity,
  AlertTriangle,
  BotMessageSquare,
  Brain,
  Building,
  Folder,
  Gauge,
  GitBranch,
  History,
  Waypoints,
  Layers,
  Rocket,
  Settings,
  ShieldAlert,
  Target,
  TestTube,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: Gauge },
      { label: 'Organizations', path: '/organizations', icon: Building },
      { label: 'Projects', path: '/projects', icon: Folder },
    ],
  },
  {
    label: 'Code',
    items: [
      { label: 'Repositories', path: '/repository', icon: GitBranch },
      { label: 'Code Intelligence', path: '/intelligence', icon: Brain },
      { label: 'Architecture', path: '/architecture', icon: Layers },
      { label: 'Change Impact', path: '/impact', icon: Waypoints },
    ],
  },
  {
    label: 'Lifecycle',
    items: [
      { label: 'Planning', path: '/planning', icon: Target },
      { label: 'AI Chat', path: '/chat', icon: BotMessageSquare },
      { label: 'Code Reviews', path: '/reviews', icon: ShieldAlert },
      { label: 'Testing', path: '/testing', icon: TestTube },
      { label: 'Deployment', path: '/deployment', icon: Rocket },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Observability', path: '/observability', icon: Activity },
      { label: 'Incidents', path: '/incidents', icon: AlertTriangle },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Workflows', path: '/workflows', icon: Workflow },
      { label: 'Settings', path: '/settings', icon: Settings },
      { label: 'Audit', path: '/audit', icon: History },
    ],
  },
]

