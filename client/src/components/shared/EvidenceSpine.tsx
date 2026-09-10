import React from 'react'
import {
  Activity,
  CheckCircle2,
  Code2,
  FileCode2,
  GitCommitHorizontal,
  Layers,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Zap,
} from 'lucide-react'

export interface EvidenceNode {
  category: 'STRUCTURE' | 'HISTORY' | 'TESTS' | 'DEPLOYMENT' | 'RUNTIME'
  title: string
  detail: string
  status?: 'verified' | 'warning' | 'missing' | 'nominal'
  metric?: string
  link?: string
}

interface EvidenceSpineProps {
  rootLabel?: string
  rootSublabel?: string
  nodes: EvidenceNode[]
  className?: string
}

export function EvidenceSpine({
  rootLabel = 'CHANGE ROOT',
  rootSublabel = 'Commit / PR Trigger',
  nodes,
  className = '',
}: EvidenceSpineProps) {
  const getCategoryIcon = (cat: EvidenceNode['category']) => {
    switch (cat) {
      case 'STRUCTURE':
        return Code2
      case 'HISTORY':
        return GitCommitHorizontal
      case 'TESTS':
        return TestTube2
      case 'DEPLOYMENT':
        return Rocket
      case 'RUNTIME':
        return Activity
      default:
        return Layers
    }
  }

  const getStatusBadge = (status?: EvidenceNode['status']) => {
    switch (status) {
      case 'verified':
      case 'nominal':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" /> VERIFIED
          </span>
        )
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-950/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-400 border border-amber-500/20">
            FLAGGED
          </span>
        )
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-950/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-rose-400 border border-rose-500/20">
            UNPROTECTED
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className={`relative rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 backdrop-blur-xl ${className}`}>
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-violet-400 mb-4 pb-3 border-b border-white/[0.06]">
        <Sparkles className="size-3.5" />
        <span>Ground Truth Evidence Spine</span>
      </div>

      {/* Root Element */}
      <div className="flex items-start gap-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 font-mono text-xs font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)]">
          <Layers className="size-4" />
        </div>
        <div className="min-w-0">
          <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wide">
            {rootLabel}
          </h4>
          <p className="text-[11px] text-zinc-400">{rootSublabel}</p>
        </div>
      </div>

      {/* Spine Tree Branches */}
      <div className="relative ml-4 mt-2 space-y-3.5 pl-6 border-l-2 border-violet-500/20">
        {nodes.map((node, index) => {
          const Icon = getCategoryIcon(node.category)
          const isLast = index === nodes.length - 1

          return (
            <div key={index} className="relative group">
              {/* Branch connector line */}
              <div className="absolute -left-[25px] top-3.5 h-0.5 w-4 bg-violet-500/30 group-hover:bg-violet-400 transition" />

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-violet-500/30 hover:bg-white/[0.04]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="size-3.5 text-violet-400 shrink-0" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {node.category}
                    </span>
                    <span className="text-zinc-600 font-mono text-[10px]">·</span>
                    <span className="font-semibold text-xs text-zinc-200 truncate">
                      {node.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {node.metric && (
                      <span className="font-mono text-[11px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                        {node.metric}
                      </span>
                    )}
                    {getStatusBadge(node.status)}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 pl-5.5 leading-relaxed">
                  {node.detail}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
