import { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Crown,
  Settings,
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

interface OrgMember {
  name: string
  handle: string
  role: 'Owner' | 'Admin' | 'Engineer' | 'Viewer'
  avatar: string
  accessLevel: string
}

const SAMPLE_MEMBERS: OrgMember[] = [
  { name: 'Varun A K', handle: 'varun-dev', role: 'Owner', avatar: 'VK', accessLevel: 'Full Administrative' },
  { name: 'Alex Chen', handle: 'alex-chen', role: 'Admin', avatar: 'AC', accessLevel: 'Deploy & Review Gate' },
  { name: 'Sarah Miller', handle: 'sarah-dev', role: 'Engineer', avatar: 'SM', accessLevel: 'Read & Write' },
]

export function Organizations() {
  const { data, error, status } = useRepositoryAnalysis()
  const [activeTab, setActiveTab] = useState<'members' | 'security' | 'billing' | 'settings'>('members')

  if (status === 'analyzing') {
    return <LoadingState title="Loading Organization Workspace" hint="Fetching team permissions, policy controls, and billing metrics..." />
  }

  const tabs: Array<{
    key: 'members' | 'security' | 'billing' | 'settings'
    label: string
    icon: typeof Users
    count?: string
  }> = [
    { key: 'members', label: 'Team Members', icon: Users, count: `${SAMPLE_MEMBERS.length}` },
    { key: 'security', label: 'Security & Access Policies', icon: Shield, count: '3 Active' },
    { key: 'billing', label: 'Billing & Quota', icon: CreditCard, count: 'Pro' },
    { key: 'settings', label: 'Workspace Settings', icon: Settings },
  ]

  return (
    <div className="space-y-6">
      {error && <ErrorState title="Organization context unavailable" description={error} />}

      {/* Header Context Bar */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 ring-1 ring-sky-500/30">
              <Building2 className="size-5 text-sky-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Organization & Workspace Governance</h1>
                <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
                  Enterprise Tier
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Workspace access, team role-based permissions, compliance policies, and billing for {data?.repository.owner || 'codescope-org'}.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
        >
          <UserPlus className="size-3.5" />
          <span>Invite Member</span>
        </button>
      </header>

      {/* Organization Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                <Crown className="size-3" /> PRO WORKSPACE
              </span>
              <span className="text-xs text-zinc-500">·</span>
              <span className="text-xs text-zinc-400">Owner: <strong className="text-zinc-200">{data?.repository.owner || 'Varun A K'}</strong></span>
            </div>
            <h2 className="text-lg font-bold text-zinc-100">{data?.repository.owner || 'CodeScope Engineering Org'}</h2>
            <p className="text-xs text-zinc-400">Unified governance across all repositories, pipelines, and continuous intelligence services.</p>
          </div>

          <div className="flex items-center gap-4 border-t border-zinc-800/80 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div>
              <span className="text-[10px] uppercase text-zinc-500 font-semibold">Active Seats</span>
              <p className="mt-0.5 font-mono text-base font-bold text-zinc-200">3 / 10 Seats</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-zinc-500 font-semibold">SLO Status</span>
              <p className="mt-0.5 font-mono text-base font-bold text-emerald-400">99.9% Nominal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-1.5 backdrop-blur-md">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="size-3.5 text-sky-400" />
              <span>{tab.label}</span>
              {tab.count && (
                <span className="rounded-full bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300">
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Contents: Members List */}
      {activeTab === 'members' && (
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-bold text-zinc-100">Organization Members & Roles</h3>
            <span className="text-xs text-zinc-500">{SAMPLE_MEMBERS.length} active users</span>
          </div>

          <div className="space-y-3">
            {SAMPLE_MEMBERS.map((m, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 font-mono text-xs font-bold text-violet-300">
                    {m.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-200">{m.name}</span>
                      <span className="font-mono text-[11px] text-zinc-500">@{m.handle}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{m.accessLevel}</p>
                  </div>
                </div>

                <span
                  className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider self-start sm:self-center ${
                    m.role === 'Owner'
                      ? 'bg-amber-500/20 text-amber-300'
                      : m.role === 'Admin'
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab Content: Security */}
      {activeTab === 'security' && (
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-sm font-bold text-zinc-100">Security & Compliance Policies</h3>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Strict Compliance Enforced
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <ShieldCheck className="size-4 text-emerald-400" />
                Mandatory PR Impact Gate
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Requires automated blast radius calculation and zero unresolved critical vulnerabilities before merge.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <ShieldCheck className="size-4 text-emerald-400" />
                Immutable Audit Logging
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All repository indexing runs, risk recalculations, and deployment approvals are signed with SHA-256 evidence.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
