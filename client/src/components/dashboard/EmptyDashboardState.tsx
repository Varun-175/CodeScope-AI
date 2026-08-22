import { GitBranch, Zap, Layers, Shield, Brain, ArrowRight } from 'lucide-react'
import { useRepositoryAnalysis } from '../../contexts/RepositoryAnalysisContext'

const features = [
  { icon: Brain, title: 'Code Intelligence', desc: 'Semantic graph of your entire codebase', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Shield, title: 'Risk Detection', desc: 'Identify vulnerabilities and hotspots', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Layers, title: 'Architecture Map', desc: 'Visual layer and module analysis', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { icon: Zap, title: 'Instant Insights', desc: 'AI-powered recommendations in seconds', color: 'text-amber-400', bg: 'bg-amber-500/10' },
]

export function EmptyDashboardState() {
  const { openAnalyzeModal } = useRepositoryAnalysis()

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center p-4">
      <section className="animate-fade-in-up w-full max-w-2xl">
        
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="relative mx-auto mb-8 size-20 flex items-center justify-center">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-violet-500/10 backdrop-blur-sm" />
            <div className="relative neo-flat rounded-full p-4 glow-violet">
              <GitBranch className="size-8 text-violet-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gradient-violet mb-3">
            Software Intelligence Platform
          </h1>
          <p className="text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Connect a GitHub repository to unlock deterministic code analysis, risk detection,
            architecture mapping, and AI-assisted engineering insights.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className="neo-flat p-4 flex items-start gap-3 animate-fade-in-up"
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <div className={`p-2 rounded-lg ${feat.bg} shrink-0`}>
                <feat.icon className={`size-4 ${feat.color}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">{feat.title}</h3>
                <p className="text-xs text-zinc-500 mt-0.5 leading-4">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 animate-fade-in-up animation-delay-500">
          <button
            type="button"
            onClick={openAnalyzeModal}
            className="neo-accent group flex h-12 items-center justify-center gap-3 px-8 text-base font-bold rounded-xl"
          >
            <GitBranch className="size-5" />
            Analyze a Repository
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-xs text-zinc-600">
            Paste any public GitHub URL to get started
          </p>
        </div>
      </section>
    </div>
  )
}
