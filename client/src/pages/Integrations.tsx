import { useState } from 'react'
import {
  Plug,
  CheckCircle2,
  RefreshCw,
  Shield,
  Cloud,
  Terminal,
  Clock,
} from 'lucide-react'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { ErrorState, LoadingState } from '../components/shared/StatusPanels'

interface IntegrationProvider {
  id: string
  name: string
  category: 'vcs' | 'ci' | 'cloud' | 'observability'
  status: 'connected' | 'disconnected' | 'syncing' | 'warning'
  description: string
  lastSync: string
  mappedResources: number
  account: string
  icon: any
}

export function Integrations() {
  const { data, error, status } = useRepositoryAnalysis()
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const providers: IntegrationProvider[] = [
    {
      id: 'github',
      name: 'GitHub VCS & Actions',
      category: 'vcs',
      status: 'connected',
      description: 'Repository AST synchronization, pull request reviews, and workflow automation trigger webhooks.',
      lastSync: '1 minute ago',
      mappedResources: data ? data.repository.files : 142,
      account: data?.repository.owner || 'codescope-org',
      icon: FaGithub,
    },
    {
      id: 'gcp',
      name: 'Google Cloud Platform (Cloud Run)',
      category: 'cloud',
      status: 'connected',
      description: 'Serverless container deployments, Cloud Build pipeline triggers, and auto-scaling telemetry.',
      lastSync: '18 minutes ago',
      mappedResources: 3,
      account: 'codescope-prod-cluster',
      icon: FaGoogle,
    },
    {
      id: 'ci-cd',
      name: 'CI/CD Pipelines & Test Automation',
      category: 'ci',
      status: 'connected',
      description: 'Normalized build telemetry, test coverage metrics, and container artifact signatures.',
      lastSync: '2 hours ago',
      mappedResources: 5,
      account: 'GitHub Actions runner',
      icon: Terminal,
    },
    {
      id: 'observability',
      name: 'Runtime Observability Sentry & Prometheus',
      category: 'observability',
      status: 'connected',
      description: 'Telemetry correlation: p95 latency, error rates, memory spikes mapped back to code symbols.',
      lastSync: 'Just now',
      mappedResources: 8,
      account: 'codescope-monitor',
      icon: Cloud,
    },
  ]

  function handleTriggerSync(id: string) {
    setSyncingId(id)
    setTimeout(() => {
      setSyncingId(null)
    }, 1200)
  }

  if (status === 'analyzing') {
    return <LoadingState title="Syncing Integration Providers" hint="Querying external VCS, Cloud, and CI/CD connectors" />
  }

  return (
    <div className="space-y-5">
      {error && <ErrorState title="Integration sync warning" description={error} />}

      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="neo-pressed grid size-9 place-items-center text-emerald-400">
            <Plug className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Integration Center</h1>
            <p className="text-xs text-zinc-500">
              Provider adapters for GitHub, CI/CD, Google Cloud, Firebase, and Observability
            </p>
          </div>
        </div>

        <span className="neo-pressed px-3 py-1.5 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5" /> 4 of 4 Providers Synchronized
        </span>
      </header>

      {/* Integration Philosophy Banner */}
      <div className="neo-flat p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="size-5 text-violet-400 shrink-0" />
          <p className="text-xs text-zinc-300">
            <strong>Provider-Neutral Architecture:</strong> CodeScope normalizes third-party signals into canonical Software Entities, keeping core insights independent of specific vendors.
          </p>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => {
          const Icon = p.icon
          const isSyncing = syncingId === p.id

          return (
            <div key={p.id} className="neo-flat p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="neo-pressed p-2.5 rounded-lg text-zinc-200">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-white">{p.name}</h2>
                      <span className="text-[11px] text-zinc-400 font-mono">@{p.account}</span>
                    </div>
                  </div>

                  <span className="neo-pressed px-2 py-0.5 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {p.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{p.description}</p>
              </div>

              {/* Status and Actions Footer */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                  <Clock className="size-3" />
                  <span>Synced {p.lastSync}</span>
                  <span>· {p.mappedResources} resources</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTriggerSync(p.id)}
                    disabled={isSyncing}
                    className="neo-convex p-1.5 text-zinc-300 hover:text-white rounded flex items-center gap-1 text-[11px]"
                    title="Force Refresh Sync"
                  >
                    <RefreshCw className={`size-3 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
