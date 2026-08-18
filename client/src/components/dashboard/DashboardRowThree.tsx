import { CardSkeleton, DashboardCard } from './DashboardCard'
import type { AnalysisResponse } from '../../types/analysis'

export function DashboardRowThree({
  data,
  isLoading = false,
}: {
  data?: AnalysisResponse | null
  isLoading?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-12">
      <DashboardCard title="Codebase Structure" className="min-h-72 xl:col-span-4">
        {isLoading && <CardSkeleton />}
        {!isLoading && data && (
          <div className="mt-5 space-y-2 text-sm text-zinc-400">
            {(data.repository.directory_metrics ?? []).slice(0, 8).map((item) => (
              <div key={item.path} className="flex justify-between gap-3">
                <span className="truncate">{item.path}</span>
                <span className="font-mono text-zinc-300">{item.lines} LOC</span>
              </div>
            ))}
            {!data.repository.directory_metrics?.length && <p>No structure metrics detected.</p>}
          </div>
        )}
      </DashboardCard>

      <DashboardCard title="Complexity Hotspots" className="min-h-72 xl:col-span-4">
        {isLoading && <CardSkeleton />}
        {!isLoading && data && (
          <div className="mt-5 space-y-2 text-sm text-zinc-400">
            {data.risks.complexity_hotspots.map((item) => (
              <div key={item.path} className="flex justify-between gap-3">
                <span className="truncate">{item.path}</span>
                <span className="font-mono text-zinc-300">{item.lines} LOC</span>
              </div>
            ))}
            {!data.risks.complexity_hotspots.length && <p>No hotspots detected.</p>}
          </div>
        )}
      </DashboardCard>

      <DashboardCard title="Import Analysis" className="min-h-72 xl:col-span-4">
        {isLoading && <CardSkeleton />}
        {!isLoading && data && (
          <div className="mt-5 space-y-2 text-sm text-zinc-400">
            {(data.repository.import_counts ?? []).slice(0, 6).map((item) => (
              <div key={item.module} className="flex justify-between gap-3">
                <span className="truncate">{item.module}</span>
                <span className="font-mono text-zinc-300">{item.count}</span>
              </div>
            ))}
            {!data.repository.import_counts?.length && (
              <p>{data.repository.most_imported_module || 'None detected'}</p>
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
