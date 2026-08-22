import { Flame, GitMerge, Package2 } from 'lucide-react'
import type { AnalysisResponse } from '../../types/analysis'

function SectionCard({
  title,
  children,
  className = '',
  icon: Icon,
}: {
  title: string
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
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function DashboardRowThree({
  data,
  isLoading = false,
}: {
  data?: AnalysisResponse | null
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-12">
        {[0, 1, 2].map(i => (
          <div key={i} className="neo-flat p-5 xl:col-span-4 space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="h-3 skeleton-shimmer rounded" style={{ width: `${60 + (j % 4) * 10}%` }} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const directoryMetrics = data.repository.directory_metrics ?? []
  const hotspots = data.risks.complexity_hotspots ?? []
  const importCounts = data.repository.import_counts ?? []

  // Compute bar widths relative to max
  const maxLoc = Math.max(...directoryMetrics.map(d => d.lines || 0), 1)
  const maxHot = Math.max(...hotspots.map(h => h.lines || 0), 1)
  const maxImp = Math.max(...importCounts.map(i => i.count || 0), 1)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-12 animate-fade-in-up animation-delay-300">
      {/* Codebase Structure */}
      <SectionCard title="Codebase Structure" className="xl:col-span-4" icon={GitMerge}>
        <div className="space-y-2.5">
          {directoryMetrics.slice(0, 8).map((item) => {
            const lines = item.lines || 0
            const pct = Math.round((lines / maxLoc) * 100)
            return (
              <div key={item.path}>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-mono text-zinc-400 truncate max-w-[65%]">{item.path}</span>
                  <span className="text-zinc-300 font-semibold">{lines.toLocaleString()}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
          {!directoryMetrics.length && (
            <p className="text-xs text-zinc-600 py-4 text-center">No structure metrics detected.</p>
          )}
        </div>
      </SectionCard>

      {/* Complexity Hotspots */}
      <SectionCard title="Complexity Hotspots" className="xl:col-span-4" icon={Flame}>
        <div className="space-y-2.5">
          {hotspots.slice(0, 7).map((item, i) => {
            const lines = item.lines || 0
            const pct = Math.round((lines / maxHot) * 100)
            const isHigh = pct > 70
            const displayName = item.path || item.reason || `Hotspot #${i + 1}`
            return (
              <div key={item.path || i}>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-mono text-zinc-400 truncate max-w-[65%]">{displayName}</span>
                  <span className={`font-semibold ${isHigh ? 'text-red-400' : i < 3 ? 'text-amber-400' : 'text-zinc-300'}`}>
                    {lines ? lines.toLocaleString() : (item.points ? `-${item.points} pts` : 'Hotspot')}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 bg-gradient-to-r ${isHigh ? 'from-red-700 to-red-500' : i < 3 ? 'from-amber-600 to-amber-400' : 'from-zinc-600 to-zinc-400'}`}
                    style={{ width: `${Math.max(pct, 10)}%` }}
                  />
                </div>
              </div>
            )
          })}
          {!hotspots.length && (
            <p className="text-xs text-zinc-600 py-4 text-center">No hotspots detected — great!</p>
          )}
        </div>
      </SectionCard>

      {/* Import Analysis */}
      <SectionCard title="Top Imports" className="xl:col-span-4" icon={Package2}>
        <div className="space-y-2.5">
          {importCounts.slice(0, 7).map((item) => {
            const count = item.count || 0
            const pct = Math.round((count / maxImp) * 100)
            return (
              <div key={item.module}>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-mono text-zinc-400 truncate max-w-[65%]">{item.module}</span>
                  <span className="text-zinc-300 font-semibold">{count}×</span>
                </div>
                <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
          {!importCounts.length && data.repository.most_imported_module && (
            <div className="neo-pressed p-3 text-xs text-zinc-300">
              Most imported: <span className="font-mono text-violet-400">{data.repository.most_imported_module}</span>
            </div>
          )}
          {!importCounts.length && !data.repository.most_imported_module && (
            <p className="text-xs text-zinc-600 py-4 text-center">No import data available.</p>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
