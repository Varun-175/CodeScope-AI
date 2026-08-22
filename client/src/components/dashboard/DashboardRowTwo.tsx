import { Cpu, Layers, Lightbulb, Package, AlertTriangle, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react'
import type { AnalysisResponse } from '../../types/analysis'

function SectionCard({
  title,
  description,
  children,
  className = '',
  icon: Icon,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  icon?: React.ElementType
}) {
  return (
    <div className={`neo-flat p-5 flex flex-col ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && (
          <div className="p-1.5 neo-pressed rounded-lg">
            <Icon className="size-4 text-violet-400" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
          {description && <p className="text-[11px] text-zinc-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function SkeletonBlock({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between gap-4">
          <div className="h-3 skeleton-shimmer rounded" style={{ width: `${50 + (i % 3) * 15}%` }} />
          <div className="h-3 w-16 skeleton-shimmer rounded" />
        </div>
      ))}
    </div>
  )
}

function generateRecommendations(data: AnalysisResponse): string[] {
  const recommendations: string[] = []

  if (!data.repository.readme) {
    recommendations.push('Add a README so repository purpose and setup are explicit.')
  }
  if (!data.repository.license) {
    recommendations.push('Add a license to clarify reuse and distribution rights.')
  }
  if (!data.repository.has_tests) {
    recommendations.push('Add automated tests to improve codebase confidence and stability.')
  }
  if (data.repository.largest_file_lines > 500) {
    recommendations.push(
      `Review ${data.repository.largest_file}; high complexity with ${data.repository.largest_file_lines} LOC.`,
    )
  }
  if (!data.repository.entry_points?.length) {
    recommendations.push('Define explicit entry points to streamline module discovery and runtime tracing.')
  }
  if (!recommendations.length) {
    recommendations.push('Architecture and structure look robust based on deterministic scan signals.')
  }
  return recommendations.slice(0, 4)
}

export function DashboardRowTwo({
  data,
  isLoading = false,
}: {
  data?: AnalysisResponse | null
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="neo-flat p-5 min-h-[260px]"><SkeletonBlock rows={8} /></div>
          <div className="neo-flat p-5 min-h-[160px]"><SkeletonBlock rows={4} /></div>
        </div>
        <div className="space-y-4 xl:col-span-4">
          <div className="neo-flat p-5 min-h-[200px]"><SkeletonBlock rows={6} /></div>
          <div className="neo-flat p-5 min-h-[140px]"><SkeletonBlock rows={3} /></div>
          <div className="neo-flat p-5 min-h-[120px]"><SkeletonBlock rows={3} /></div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const healthPercent = data.health.score
  const recommendations = generateRecommendations(data)

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {/* Left column */}
      <div className="space-y-4 xl:col-span-8 animate-fade-in-up animation-delay-100">
        
        {/* Architecture */}
        <SectionCard title="Architecture" description="Detected patterns and module graph" icon={Layers}>
          <div className="space-y-4">
            <div className="neo-pressed p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-zinc-200">{data.architecture.pattern}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 neo-flat px-2 py-1">Detected</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-zinc-500 mb-1.5 font-medium uppercase tracking-wider text-[9px]">Layers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.architecture.layers ?? []).map(l => (
                      <span key={l} className="neo-convex px-2 py-0.5 text-zinc-300 text-[10px]">{l}</span>
                    ))}
                    {!data.architecture.layers?.length && <span className="text-zinc-600">None detected</span>}
                  </div>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1.5 font-medium uppercase tracking-wider text-[9px]">Modules</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.architecture.modules ?? []).slice(0, 6).map(m => (
                      <span key={m} className="neo-convex px-2 py-0.5 text-zinc-300 text-[10px]">{m}</span>
                    ))}
                    {!data.architecture.modules?.length && <span className="text-zinc-600">None detected</span>}
                  </div>
                </div>
              </div>

              {data.architecture.entry_points?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-800/60">
                  <p className="text-zinc-500 mb-1.5 font-medium uppercase tracking-wider text-[9px]">Entry Points</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.architecture.entry_points.map(ep => (
                      <span key={ep} className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">{ep}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Summary */}
        <SectionCard title="Intelligence Summary" description="Deterministic analysis overview" icon={Cpu}>
          <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
            <p className="text-zinc-300">{data.summary.overview}</p>
            {data.summary.assessment && (
              <p className="text-zinc-500 text-xs border-l-2 border-violet-500/40 pl-3">{data.summary.assessment}</p>
            )}
            {data.summary.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.summary.technologies.map(t => (
                  <span key={t} className="neo-pressed px-2 py-0.5 text-[10px] font-mono text-zinc-300">{t}</span>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <SectionCard title="AI Recommendations" description="Actionable improvement signals" icon={Lightbulb}>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="neo-pressed p-3 flex items-start gap-3 group cursor-pointer hover:border-violet-500/20 transition">
                  <div className="mt-0.5 p-1 rounded-full bg-violet-500/10 shrink-0">
                    <TrendingUp className="size-3 text-violet-400" />
                  </div>
                  <p className="text-xs text-zinc-300 flex-1 leading-5">{rec}</p>
                  <ArrowRight className="size-3.5 text-zinc-700 group-hover:text-violet-400 transition shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-4 xl:col-span-4 animate-fade-in-up animation-delay-200">

        {/* Health Score Ring */}
        <SectionCard title="Health Score" description="Overall repository signal quality">
          <div className="flex flex-col items-center py-4">
            <div className="relative size-28">
              <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-800" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#health-gradient)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - healthPercent / 100)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="health-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={healthPercent >= 80 ? '#10b981' : healthPercent >= 50 ? '#f59e0b' : '#ef4444'} />
                    <stop offset="100%" stopColor={healthPercent >= 80 ? '#6ee7b7' : healthPercent >= 50 ? '#fbbf24' : '#fca5a5'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{healthPercent}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">/ 100</span>
              </div>
            </div>
            <span className={`mt-3 text-sm font-semibold ${healthPercent >= 80 ? 'text-emerald-400' : healthPercent >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {data.health.status}
            </span>
            {data.health.details?.reasons?.slice(0, 3).map(r => (
              <div key={r.reason} className="flex items-center justify-between w-full mt-2 text-xs text-zinc-500">
                <span className="truncate">{r.reason}</span>
                <span className="font-mono text-amber-500 shrink-0 ml-2">-{r.points}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Repository DNA */}
        <SectionCard title="Repository DNA" icon={Cpu}>
          <dl className="space-y-2.5 text-xs">
            {[
              ['Project Type', data.dna.project_type],
              ['Framework', data.dna.framework || 'Unknown'],
              ['Architecture', data.dna.architecture],
              ['Primary Lang', data.dna.primary_language || 'Unknown'],
              ['Maturity', data.dna.maturity],
              ['Confidence', `${data.dna.confidence}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 items-center">
                <dt className="text-zinc-500">{label}</dt>
                <dd className="font-medium text-zinc-200 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        {/* Top Risks */}
        <SectionCard title="Risk Signals" icon={AlertTriangle}>
          <div className="space-y-2 text-xs">
            {data.risks.critical.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-start gap-2 neo-pressed p-2.5 rounded-lg">
                <AlertTriangle className="size-3.5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-zinc-300 leading-4">
                  {item.reason || item.path || 'Critical risk item'}
                </span>
              </div>
            ))}
            {data.risks.warnings.slice(0, 2).map((item, i) => (
              <div key={i} className="flex items-start gap-2 neo-pressed p-2.5 rounded-lg">
                <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-zinc-400 leading-4">
                  {item.reason || item.path || 'Warning item'}
                </span>
              </div>
            ))}
            {!data.risks.critical.length && !data.risks.warnings.length && (
              <div className="flex items-center gap-2 text-emerald-400 py-2">
                <CheckCircle2 className="size-4" /> No major risks detected
              </div>
            )}
          </div>
        </SectionCard>

        {/* Dependencies */}
        <SectionCard title="Dependency Health" icon={Package}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Total Dependencies</span>
              <span className="font-mono text-xl font-bold text-white">{data.dependency_health.total_dependencies}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Manager</span>
              <span className="text-zinc-300">{data.dependency_health.package_manager || 'Unknown'}</span>
            </div>
            {data.dependency_health.top_dependencies?.slice(0, 3).map(dep => (
              <div key={dep.name} className="flex justify-between neo-pressed px-2 py-1.5 rounded">
                <span className="font-mono text-zinc-300">{dep.name}</span>
                {dep.version && <span className="text-zinc-500 font-mono">{dep.version}</span>}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
