import {
  Activity,
  AlertTriangle,
  Box,
  FileCode2,
  Gauge,
  GitBranch,
  GitCommitHorizontal,
  History,
  Layers,
  Network,
  Plug,
  Rocket,
  Settings,
  ShieldAlert,
  Sparkles,
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
    label: 'UNDERSTAND',
    items: [
      { label: 'Launchpad', path: '/', icon: Gauge },
      { label: 'Intelligence', path: '/intelligence', icon: Sparkles },
      { label: 'Software Graph', path: '/graph', icon: Network },
      { label: 'Architecture', path: '/architecture', icon: Layers },
      { label: 'Entity 360', path: '/entities', icon: Box },
      { label: 'Code Workspace', path: '/code', icon: FileCode2 },
    ],
  },
  {
    label: 'EVOLVE',
    items: [
      { label: 'Timeline', path: '/timeline', icon: History },
      { label: 'Changes', path: '/changes', icon: GitCommitHorizontal },
      { label: 'Impact', path: '/impact', icon: Waypoints },
    ],
  },
  {
    label: 'ACT',
    items: [
      { label: 'Planning', path: '/planning', icon: Target },
      { label: 'Reviews', path: '/reviews', icon: ShieldAlert },
      { label: 'Testing', path: '/testing', icon: TestTube },
      { label: 'Deployments', path: '/deployments', icon: Rocket },
    ],
  },
  {
    label: 'OPERATE',
    items: [
      { label: 'Operations', path: '/operations', icon: Activity },
      { label: 'Incidents', path: '/incidents', icon: AlertTriangle },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Repositories', path: '/repositories', icon: GitBranch },
      { label: 'Integrations', path: '/integrations', icon: Plug },
      { label: 'Workflows', path: '/workflows', icon: Workflow },
      { label: 'Audit', path: '/audit', icon: History },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
]
