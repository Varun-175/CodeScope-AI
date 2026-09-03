import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Box,
  BrainCircuit,
  FileCode2,
  FileSearch,
  FolderTree,
  Gauge,
  GitBranch,
  GitCommitHorizontal,
  History,
  Layers,
  Network,
  Play,
  Plug,
  Rocket,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Target,
  TestTube,
  Waypoints,
  Workflow,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

type CommandPaletteProps = { open: boolean; onClose: () => void }

interface CommandItem {
  category: 'Navigate' | 'Investigate & Ask AI' | 'Analyze' | 'Actions'
  label: string
  detail: string
  icon: any
  action: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { data, openAnalyzeModal } = useRepositoryAnalysis()
  const [query, setQuery] = useState('')

  const commands = useMemo<CommandItem[]>(
    () => [
      // Actions
      {
        category: 'Actions',
        label: 'Analyze latest repository',
        detail: 'Trigger a fresh AST & software intelligence scan',
        icon: Play,
        action: () => {
          onClose()
          openAnalyzeModal()
        },
      },
      {
        category: 'Actions',
        label: 'Connect Integration Provider',
        detail: 'Link GitHub, GCP, Firebase, or Observability connectors',
        icon: Plug,
        action: () => {
          onClose()
          navigate('/integrations')
        },
      },

      // Investigate & Ask AI
      {
        category: 'Investigate & Ask AI',
        label: 'Ask CodeScope AI',
        detail: 'Contextual software investigation grounded in repository evidence',
        icon: Sparkles,
        action: () => {
          onClose()
          navigate('/intelligence')
        },
      },
      {
        category: 'Investigate & Ask AI',
        label: 'Investigate Incident Causality',
        detail: 'Trace runtime anomalies to deployments, commits, and code symbols',
        icon: AlertTriangle,
        action: () => {
          onClose()
          navigate('/incidents')
        },
      },
      {
        category: 'Investigate & Ask AI',
        label: 'Compute Change Impact',
        detail: 'Predict blast radius, affected tests, and architectural risks',
        icon: Waypoints,
        action: () => {
          onClose()
          navigate('/impact')
        },
      },

      // Analyze & Understand
      {
        category: 'Analyze',
        label: 'Software Graph Topology',
        detail: 'Explore service, module, and symbol dependency graphs',
        icon: Network,
        action: () => {
          onClose()
          navigate('/graph')
        },
      },
      {
        category: 'Analyze',
        label: 'Software Timeline',
        detail: 'Living evolutionary history across releases, tests, and commits',
        icon: History,
        action: () => {
          onClose()
          navigate('/timeline')
        },
      },
      {
        category: 'Analyze',
        label: 'Entity 360 Inspector',
        detail: 'Unified 360-degree surface for services, modules, and symbols',
        icon: Box,
        action: () => {
          onClose()
          navigate('/entities')
        },
      },
      {
        category: 'Analyze',
        label: 'Architecture Explorer',
        detail: 'Inspect structural modularity, layers, and dependency drift',
        icon: Layers,
        action: () => {
          onClose()
          navigate('/architecture')
        },
      },
      {
        category: 'Analyze',
        label: 'Code Workspace',
        detail: 'Syntax-highlighted code viewer and AST symbol inspector',
        icon: FileCode2,
        action: () => {
          onClose()
          navigate('/code')
        },
      },

      // Navigate
      {
        category: 'Navigate',
        label: 'System Launchpad',
        detail: 'Workspace command center, attention queue, and evolution pulse',
        icon: Gauge,
        action: () => {
          onClose()
          navigate('/')
        },
      },
      {
        category: 'Navigate',
        label: 'Engineering Plans',
        detail: 'Turn repository findings and complexity into actionable work',
        icon: Target,
        action: () => {
          onClose()
          navigate('/planning')
        },
      },
      {
        category: 'Navigate',
        label: 'Code Reviews',
        detail: 'Automated review findings, diffs, and risk analysis',
        icon: ShieldAlert,
        action: () => {
          onClose()
          navigate('/reviews')
        },
      },
      {
        category: 'Navigate',
        label: 'Test Intelligence',
        detail: 'Test suite coverage readiness and priority protection targets',
        icon: TestTube,
        action: () => {
          onClose()
          navigate('/testing')
        },
      },
      {
        category: 'Navigate',
        label: 'Deployments & Rollouts',
        detail: 'Target environments, container releases, and runtime diffs',
        icon: Rocket,
        action: () => {
          onClose()
          navigate('/deployments')
        },
      },
      {
        category: 'Navigate',
        label: 'Runtime Operations',
        detail: 'Telemetry pulse, deployment correlation, and anomalies',
        icon: Activity,
        action: () => {
          onClose()
          navigate('/operations')
        },
      },
      {
        category: 'Navigate',
        label: 'Repository Center',
        detail: 'Connected repositories, branches, and snapshot versions',
        icon: GitBranch,
        action: () => {
          onClose()
          navigate('/repositories')
        },
      },
      {
        category: 'Navigate',
        label: 'Pipelines & Workflows',
        detail: 'CI/CD execution status, triggers, and automated jobs',
        icon: Workflow,
        action: () => {
          onClose()
          navigate('/workflows')
        },
      },
      {
        category: 'Navigate',
        label: 'System Settings',
        detail: 'AI providers, appearance, local models, and preferences',
        icon: Settings,
        action: () => {
          onClose()
          navigate('/settings')
        },
      },
    ],
    [navigate, onClose, openAnalyzeModal]
  )

  if (!open) return null

  const matchingCommands = commands.filter((command) =>
    `${command.category} ${command.label} ${command.detail}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[10vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="neo-flat relative z-10 w-full max-w-2xl overflow-hidden border border-zinc-700/60 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-zinc-800/80 px-4 py-3.5">
          <Search className="size-5 text-violet-400" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands, entities, tools, investigations... (e.g. 'why is checkout risky?')"
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
          <button
            type="button"
            aria-label="Close command palette"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {matchingCommands.map((command) => {
            const Icon = command.icon
            return (
              <button
                key={command.label}
                type="button"
                onClick={command.action}
                className="flex w-full items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-left transition hover:bg-zinc-800/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
              >
                <div className="neo-pressed grid size-8 place-items-center rounded-md text-violet-400 shrink-0">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">{command.label}</span>
                    <span className="text-[10px] uppercase font-mono text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                      {command.category}
                    </span>
                  </div>
                  <span className="mt-0.5 block text-xs text-zinc-400 truncate">{command.detail}</span>
                </div>
              </button>
            )
          })}
          {matchingCommands.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-500">
              <p>No matching commands found.</p>
              <p className="text-xs text-zinc-600 mt-1">Try searching for an entity name, investigation query, or route.</p>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800/80 px-4 py-2.5 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Navigate with arrows or type to filter</span>
          <span>
            Press <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">Esc</kbd> to close
          </span>
        </div>
      </section>
    </div>
  )
}
