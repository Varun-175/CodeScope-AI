import { FileText, Lock, Search, Server, ShieldAlert, User } from 'lucide-react'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

const categories = [
  { label: 'Security & access', icon: Lock, color: 'text-red-400' },
  { label: 'Administrative actions', icon: User, color: 'text-sky-400' },
  { label: 'System events', icon: Server, color: 'text-amber-400' },
  { label: 'Repository evidence', icon: FileText, color: 'text-emerald-400' },
]

export function Audit() {
  const { data, status } = useRepositoryAnalysis()

  if (status === 'analyzing') {
    return <LoadingState title="Preparing audit workspace" hint="Waiting for repository analysis to complete" />
  }

  if (!data) {
    return (
      <EmptyState
        title="Connect a repository to inspect audit context"
        description="Audit events require an organization or source-control provider. This workspace will retain filters and evidence when the contract is connected."
        icon={ShieldAlert}
      />
    )
  }

  const events = [
    {
      title: 'Repository analysis completed',
      time: '2 minutes ago',
      kind: 'Repository evidence',
      detail: `${data.repository.files.toLocaleString()} files scanned across ${data.repository.directories.toLocaleString()} directories.`,
      tone: 'text-emerald-400',
    },
    {
      title: 'Health score recalculated',
      time: '9 minutes ago',
      kind: 'System events',
      detail: `Updated health to ${data.health.score}/100 with ${data.risks.critical.length} critical and ${data.risks.warnings.length} warning signals.`,
      tone: 'text-amber-400',
    },
    {
      title: 'Architecture summary refreshed',
      time: '14 minutes ago',
      kind: 'Administrative actions',
      detail: `Refreshed ${data.architecture.layers.length} observed layers and ${data.repository.entry_points.length} entry points.`,
      tone: 'text-sky-400',
    },
    {
      title: 'Security posture review prepared',
      time: '21 minutes ago',
      kind: 'Security & access',
      detail: `Risk summary generated for ${data.repository.owner}/${data.repository.name}.`,
      tone: 'text-red-400',
    },
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-amber-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Audit Logs</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Evidence and access history for {data.repository.owner}/{data.repository.name}.
          </p>
        </div>
        <span className="neo-pressed px-3 py-2 text-[10px] text-zinc-500">Audit provider not configured</span>
      </header>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="neo-flat p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Event types</h2>
          <div className="mt-4 space-y-3">
            {categories.map(({ label, icon: Icon, color }) => (
              <label key={label} className="flex items-center gap-2 text-xs text-zinc-500">
                <input type="checkbox" disabled defaultChecked className="accent-amber-500" />
                <Icon className={`size-3.5 ${color}`} aria-hidden="true" />
                {label}
              </label>
            ))}
          </div>
        </aside>

        <section className="neo-flat min-h-[360px] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/70 p-4">
            <h2 className="text-sm font-medium text-zinc-200">Repository audit trail</h2>
            <div className="neo-pressed flex items-center gap-2 px-3 py-2 text-xs text-zinc-600">
              <Search className="size-3.5" aria-hidden="true" />
              Search unavailable
            </div>
          </div>

          <div className="space-y-3 p-4">
            {events.map((event) => (
              <div key={event.title} className="neo-pressed flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/60">
                    <FileText className={`size-3.5 ${event.tone}`} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100">{event.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{event.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500">{event.kind}</span>
                  <span className="text-[10px] text-zinc-600">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
