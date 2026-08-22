import { Building2, Users, Shield, CreditCard, Plus, MoreVertical, Settings, Mail } from 'lucide-react'

export function Organizations() {
  const teams = [
    { id: 1, name: 'Core Engineering', members: 12, lead: 'Alex Chen', role: 'Admin' },
    { id: 2, name: 'Platform Data', members: 8, lead: 'Sarah Miller', role: 'Member' },
    { id: 3, name: 'Frontend Guild', members: 5, lead: 'David Kim', role: 'Member' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="size-6 text-indigo-500" />
            Organizations & Teams
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your workspace, team access, and organizational billing.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 neo-pressed rounded-xl text-indigo-400 font-medium transition">
            <Users className="size-4" /> Team Management
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-zinc-200 transition">
            <Shield className="size-4" /> Security & Access
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-zinc-200 transition">
            <CreditCard className="size-4" /> Billing & Usage
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-xl text-zinc-400 hover:text-zinc-200 transition">
            <Settings className="size-4" /> Workspace Settings
          </button>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-200">Active Teams</h2>
            <button className="neo-accent flex h-9 items-center gap-2 px-4 text-sm font-semibold transition bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border-indigo-500/50">
              <Plus className="size-4" /> Create Team
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map(team => (
              <div key={team.id} className="neo-flat p-5 flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 neo-pressed rounded-lg">
                    <Users className="size-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                  </div>
                  <button className="text-zinc-500 hover:text-white p-1">
                    <MoreVertical className="size-4" />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-zinc-200">{team.name}</h3>
                
                <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-500">
                  <span className="flex items-center justify-between">
                    <span>Members</span>
                    <span className="text-zinc-300 font-medium">{team.members}</span>
                  </span>
                  <span className="flex items-center justify-between">
                    <span>Team Lead</span>
                    <span className="text-zinc-300">{team.lead}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="neo-flat mt-6">
            <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">Pending Invitations</h3>
                <p className="text-xs text-zinc-500">Manage pending user invites to your workspace</p>
              </div>
              <button className="neo-pressed p-2 text-zinc-400 hover:text-white transition rounded-lg flex items-center gap-2 text-xs">
                <Mail className="size-3" /> Invite User
              </button>
            </div>
            <div className="p-8 text-center text-zinc-500 text-sm">
              No pending invitations at this time.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
