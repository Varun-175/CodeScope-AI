import {
  GitBranch,
  Layers,
  ShieldAlert,
  BrainCircuit,
  ArrowRight,
  Network,
  Sparkles,
  Activity,
  Box,
  Terminal,
  ExternalLink,
} from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

const features = [
  {
    icon: Network,
    title: 'Software Knowledge Graph',
    desc: 'Topological model mapping services, symbols, APIs, and cross-boundary dependencies.',
    color: 'text-violet-400',
    border: 'hover:border-violet-500/40',
    glow: 'from-violet-500/10 to-indigo-500/5',
    iconBg: 'bg-violet-500/15 border-violet-500/30 text-violet-300',
  },
  {
    icon: ShieldAlert,
    title: 'Deterministic Risk & Blast Radius',
    desc: 'Pinpoint complexity hotspots, high-churn code, and predict multi-hop change impact.',
    color: 'text-rose-400',
    border: 'hover:border-rose-500/40',
    glow: 'from-rose-500/10 to-pink-500/5',
    iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
  },
  {
    icon: Layers,
    title: 'Architecture & Drift Analysis',
    desc: 'Verify architectural layering, circular imports, and enforce clean domain boundaries.',
    color: 'text-sky-400',
    border: 'hover:border-sky-500/40',
    glow: 'from-sky-500/10 to-blue-500/5',
    iconBg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
  },
  {
    icon: BrainCircuit,
    title: 'Grounded Software Intelligence AI',
    desc: 'Ask deep architectural questions backed by verified AST evidence and exact file lines.',
    color: 'text-amber-400',
    border: 'hover:border-amber-500/40',
    glow: 'from-amber-500/10 to-orange-500/5',
    iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  },
]

export function EmptyDashboardState() {
  const { openAnalyzeModal } = useRepositoryAnalysis()

  return (
    <div className="relative flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8 overflow-hidden">
      {/* Ambient background lighting mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-gradient-to-tr from-violet-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      <section className="relative z-10 w-full max-w-3xl animate-fade-in-up">
        {/* Top Intelligence Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/15 to-indigo-500/15 border border-violet-500/30 text-xs font-semibold text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Sparkles className="size-3.5 text-violet-400" />
            <span>CodeScope AI V3 · Living Software Model</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Software Intelligence Platform
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto font-normal">
            Connect any repository to extract an AST-grounded software knowledge graph, calculate change blast radius, and unlock AI reasoning backed by verifiable code evidence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className={`group relative p-5 rounded-xl bg-[#0c101a]/70 backdrop-blur-xl border border-white/[0.08] ${feat.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-lg border ${feat.iconBg} shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-md`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Primary CTA Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <button
            type="button"
            onClick={openAnalyzeModal}
            className="group relative inline-flex h-12 items-center justify-center gap-2.5 px-8 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-sm font-bold text-white shadow-xl shadow-violet-600/30 border border-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <GitBranch className="size-4" />
            <span>Connect & Analyze Repository</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>

          <p className="text-xs text-zinc-500 font-mono">
            Supports GitHub repositories, local workspaces, and containerized architectures
          </p>
        </div>
      </section>
    </div>
  )
}
