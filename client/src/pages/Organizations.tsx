import { Building2, CreditCard, Mail, Settings, Shield, Users } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

const areas = [
  { label: 'Team management', icon: Users },
  { label: 'Security & access', icon: Shield },
  { label: 'Billing & usage', icon: CreditCard },
  { label: 'Workspace settings', icon: Settings },
]

export function Organizations() {
  const { data, error, status } = useRepositoryAnalysis()

  if (status === 'analyzing') {
    return <LoadingState title="Preparing organization workspace" hint="Waiting for repository context" />
  }

  return (
    <div className="space-y-5">
      {error && <ErrorState title="Organization context unavailable" description={error} />}

      <header>
        <div className="flex items-center gap-3">
          <Building2 className="size-5 text-sky-400" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-white">Organizations</h1>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Workspace access, teams, billing, and policy controls.
        </p>
      </header>

      {!data && !error && (
        <EmptyState
          title="No organization workspace connected"
          description="Connect a repository or workspace to populate access, ownership, and security context."
          icon={Building2}
        />
      )}

      {data && (
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="neo-flat p-3">
            <div className="space-y-1">
              {areas.map(({ label, icon: Icon }, index) => (
                <button
                  type="button"
                  disabled
                  key={label}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs ${
                    index === 0 ? 'neo-pressed text-sky-400' : 'text-zinc-600'
                  }`}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-5">
            <div className="neo-flat p-5">
              <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
                <Users className="size-4 text-sky-400" aria-hidden="true" />
                <h2 className="text-sm font-medium text-zinc-200">Workspace ownership</h2>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <InfoCard label="Owner" value={data.repository.owner} />
                <InfoCard label="Repository" value={data.repository.name} />
                <InfoCard label="Primary language" value={data.repository.primary_language || 'Not detected'} />
              </div>

              <p className="mt-4 text-xs leading-5 text-zinc-500">
                The current workspace is scoped to {data.repository.owner}/{data.repository.name} with active engineering signals from the latest repository analysis.
              </p>
            </div>

            <div className="neo-flat p-5">
              <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
                <Shield className="size-4 text-emerald-400" aria-hidden="true" />
                <h2 className="text-sm font-medium text-zinc-200">Access & policy</h2>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoCard label="Health score" value={`${data.health.score}/100`} />
                <InfoCard label="Branch" value={data.repository.branch || 'default'} />
                <InfoCard label="Risk signals" value={`${data.risks.critical.length + data.risks.warnings.length}`} />
                <InfoCard label="Files parsed" value={data.repository.parsed_files.toLocaleString()} />
              </div>
            </div>

            <div className="neo-flat p-5">
              <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
                <Mail className="size-4 text-amber-400" aria-hidden="true" />
                <h2 className="text-sm font-medium text-zinc-200">Invitations</h2>
              </div>

              <p className="py-8 text-center text-xs text-zinc-600">
                Pending invitations will appear when an organization provider is configured.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="neo-pressed p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-2 text-sm text-zinc-200">{value}</p>
    </div>
  )
}
