import {
  Activity,
  AlertTriangle,
  BotMessageSquare,
  FileCode2,
  Folder,
  Gauge,
  GitBranch,
  GitCommitHorizontal,
  History,
  Layers,
  Rocket,
  Settings,
  ShieldAlert,
  Target,
  TestTube,
  Waypoints,
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
    label: 'WORKSPACE',
    items: [
      { label: 'Overview', path: '/', icon: Gauge },
      { label: 'Projects', path: '/projects', icon: Folder },
      { label: 'Repositories', path: '/repository', icon: GitBranch },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { label: 'Explore', path: '/repository/explore', icon: FileCode2 },
      { label: 'Architecture', path: '/architecture', icon: Layers },
      { label: 'Changes', path: '/changes', icon: GitCommitHorizontal },
      { label: 'Impact', path: '/impact', icon: Waypoints },
      { label: 'Ask CodeScope', path: '/chat', icon: BotMessageSquare },
    ],
  },
  {
    label: 'ENGINEERING',
    items: [
      { label: 'Plans', path: '/planning', icon: Target },
      { label: 'Reviews', path: '/reviews', icon: ShieldAlert },
      { label: 'Tests', path: '/testing', icon: TestTube },
    ],
  },
  {
    label: 'DELIVERY',
    items: [
      { label: 'Pipelines', path: '/workflows', icon: Workflow },
      { label: 'Deployments', path: '/deployment', icon: Rocket },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Runtime', path: '/observability', icon: Activity },
      { label: 'Incidents', path: '/incidents', icon: AlertTriangle },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Activity', path: '/audit', icon: History },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
]
