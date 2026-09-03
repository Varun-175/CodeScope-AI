import { useMemo, useState } from 'react'
import { Activity, BrainCircuit, FileSearch, FolderTree, GitBranch, Network, Play, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

type CommandPaletteProps = { open: boolean; onClose: () => void }

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { data, openAnalyzeModal } = useRepositoryAnalysis()
  const [query, setQuery] = useState('')

  const commands = useMemo(() => [
    { label: 'Analyze latest repository', detail: 'Start a new repository analysis', icon: Play, action: () => { onClose(); openAnalyzeModal() } },
    { label: 'Workspace Overview', detail: 'Go to workspace and project overview', icon: FolderTree, action: () => { onClose(); navigate('/') } },
    { label: 'Organizations', detail: 'Team management and workspace settings', icon: FolderTree, action: () => { onClose(); navigate('/organizations') } },
    { label: 'Projects', detail: 'Group repositories into durable workspaces', icon: FolderTree, action: () => { onClose(); navigate('/projects') } },
    { label: 'Repositories', detail: 'Connected repositories in workspace', icon: GitBranch, action: () => { onClose(); navigate('/repository') } },
    { label: 'Explore source files', detail: 'Browse files and source evidence', icon: FileSearch, action: () => { onClose(); navigate('/repository/explore') } },
    { label: 'Open architecture', detail: 'Inspect modules and dependencies', icon: Network, action: () => { onClose(); navigate('/architecture') } },
    { label: 'Review changes', detail: 'Commit timeline and snapshot diff', icon: GitBranch, action: () => { onClose(); navigate('/changes') } },
    { label: 'Analyze change impact', detail: 'Review risk and affected targets', icon: Activity, action: () => { onClose(); navigate('/impact') } },
    { label: 'Ask CodeScope', detail: 'Ask a repository-scoped question', icon: BrainCircuit, action: () => { onClose(); navigate('/chat') } },
    { label: 'Create a plan', detail: 'Turn repository findings into work', icon: GitBranch, action: () => { onClose(); navigate('/planning') } },
    { label: 'Code Reviews', detail: 'Code review findings and recommendations', icon: Activity, action: () => { onClose(); navigate('/reviews') } },
    { label: 'Tests', detail: 'Test intelligence and validation checklists', icon: Activity, action: () => { onClose(); navigate('/testing') } },
    { label: 'Pipelines', detail: 'Workflow actions and deployments', icon: Activity, action: () => { onClose(); navigate('/workflows') } },
    { label: 'Deployments', detail: 'Environment deployments and targets', icon: Activity, action: () => { onClose(); navigate('/deployment') } },
    { label: 'Runtime Observability', detail: 'Health and performance metrics', icon: Activity, action: () => { onClose(); navigate('/observability') } },
    { label: 'Incidents', detail: 'Diagnostic timeline and incidents', icon: Activity, action: () => { onClose(); navigate('/incidents') } },
    { label: 'System Activity', label2: 'Audit', detail: 'Audit logs and activity history', icon: Activity, action: () => { onClose(); navigate('/audit') } },
    { label: 'Settings', detail: 'Manage your workspace, integrations, and preferences', icon: Activity, action: () => { onClose(); navigate('/settings') } },
  ], [navigate, onClose, openAnalyzeModal])

  if (!open) return null
  const matchingCommands = commands.filter((command) => `${command.label} ${command.detail}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/65 px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <button type="button" aria-label="Close command palette" className="absolute inset-0 cursor-default" onClick={onClose} />
      <section className="neo-flat relative z-10 w-full max-w-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-zinc-800/80 px-4 py-3">
          <Search className="size-5 text-violet-400" aria-hidden="true" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search commands, workspaces, files…" className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600" />
          <button type="button" aria-label="Close command palette" onClick={onClose} className="text-zinc-500 hover:text-zinc-200"><X className="size-4" aria-hidden="true" /></button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {matchingCommands.map((command) => {
            const Icon = command.icon
            return <button key={command.label} type="button" onClick={command.action} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-zinc-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"><Icon className="size-4 shrink-0 text-violet-400" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-sm text-zinc-200">{command.label}</span><span className="mt-0.5 block text-xs text-zinc-500">{command.detail}</span></span></button>
          })}
          {matchingCommands.length === 0 && <p className="px-3 py-8 text-center text-sm text-zinc-500">No matching commands.</p>}
        </div>
        <div className="border-t border-zinc-800/80 px-4 py-2 text-[10px] text-zinc-600">Press <kbd className="rounded border border-zinc-700 px-1 py-0.5">Esc</kbd> to close</div>
      </section>
    </div>
  )
}
