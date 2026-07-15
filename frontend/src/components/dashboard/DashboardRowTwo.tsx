import { CardSkeleton, DashboardCard } from './DashboardCard'
import type { AnalysisResponse } from '../../types/analysis'
import { AIRecommendations } from './AIRecommendations'

export function DashboardRowTwo({
  data,
  isLoading = false,
}: {
  data?: AnalysisResponse | null
  isLoading?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-8">
        <DashboardCard
          title="Architecture"
          description="Detected architecture and module structure"
          className="min-h-[400px]"
        >
          {isLoading && <CardSkeleton />}
          {!isLoading && data && (
            <div className="mt-5 space-y-3 text-sm text-zinc-400">
              <p className="text-zinc-200">{data.architecture.pattern}</p>
              <p>Layers: {data.architecture.layers.join(', ') || 'None detected'}</p>
              <p>Modules: {data.architecture.modules.join(', ') || 'None detected'}</p>
              <p>Entry points: {data.architecture.entry_points.join(', ') || 'None detected'}</p>
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Repository Summary"
          description="Deterministic software intelligence summary"
          className="min-h-52"
        >
          {isLoading && <CardSkeleton />}
          {!isLoading && data && (
            <div className="mt-5 space-y-3 text-sm leading-6 text-zinc-400">
              <p>{data.summary.overview}</p>
              <p>Technologies: {data.summary.technologies.join(', ') || 'None detected'}</p>
              <p className="text-zinc-500">{data.summary.assessment}</p>
            </div>
          )}
        </DashboardCard>

        {!isLoading && data && <AIRecommendations data={data} />}
      </div>

      <div className="space-y-4 xl:col-span-4">
        <DashboardCard title="Repository DNA" className="min-h-72">
          {isLoading && <CardSkeleton />}
          {!isLoading && data && (
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ['Project Type', data.dna.project_type],
                ['Framework', data.dna.framework || 'Unknown'],
                ['Architecture', data.dna.architecture],
                ['Primary Language', data.dna.primary_language || 'Unknown'],
                ['Repository Size', data.dna.repository_size],
                ['Maturity', data.dna.maturity],
                ['Confidence', `${data.dna.confidence}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-zinc-500">{label}</dt>
                  <dd className="text-right font-medium text-zinc-200">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </DashboardCard>

        <DashboardCard title="Top Risks" className="min-h-52">
          {isLoading && <CardSkeleton />}
          {!isLoading && data && (
            <div className="mt-5 space-y-3 text-sm text-zinc-400">
              {data.health.details.reasons?.slice(0, 5).map((item) => (
                <div key={item.reason} className="flex justify-between gap-3">
                  <span>{item.reason}</span>
                  <span className="font-mono text-amber-400">-{item.points}</span>
                </div>
              ))}
              {!data.health.details.reasons?.length && <p>No major risks detected.</p>}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Dependency Health" className="min-h-40">
          {isLoading && <CardSkeleton />}
          {!isLoading && data && (
            <div className="mt-5 space-y-3 text-sm text-zinc-400">
              <p className="font-mono text-2xl font-semibold text-white">
                {data.dependency_health.total_dependencies}
              </p>
              <p>
                {data.dependency_health.package_manager || 'Unknown manager'} from{' '}
                {data.dependency_health.dependency_source || 'manifest not found'}
              </p>
              <p>Framework: {data.dependency_health.framework || 'Unknown'}</p>
              <p>
                Top: {data.dependency_health.top_dependencies?.slice(0, 3).map((item) => item.name).join(', ') || 'None'}
              </p>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  )
}
