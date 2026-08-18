import type { AnalysisResponse } from '../../types/analysis'
import { DashboardCard } from './DashboardCard'

function buildRecommendations(data: AnalysisResponse): string[] {
  const recommendations: string[] = []

  if (!data.repository.readme) {
    recommendations.push('Add a README so repository purpose and setup are explicit.')
  }

  if (!data.repository.license) {
    recommendations.push('Add a license to clarify reuse and distribution rights.')
  }

  if (!data.repository.has_tests) {
    recommendations.push('Add or expose test directories to improve maturity confidence.')
  }

  if (data.repository.largest_file_lines > 500) {
    recommendations.push(
      `Review ${data.repository.largest_file}; it is ${data.repository.largest_file_lines} LOC.`,
    )
  }

  if (!data.repository.entry_points.length) {
    recommendations.push('Define obvious entry points so new engineers can trace runtime flow faster.')
  }

  if (!recommendations.length) {
    recommendations.push('Repository structure looks demo-ready based on deterministic scan signals.')
  }

  return recommendations.slice(0, 5)
}

export function AIRecommendations({ data }: { data: AnalysisResponse }) {
  return (
    <DashboardCard
      title="AI Recommendations"
      description="Deterministic recommendations from repository metadata"
      className="min-h-52"
    >
      <div className="mt-5 space-y-3 text-sm text-zinc-400">
        {buildRecommendations(data).map((item) => (
          <div key={item} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
            {item}
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
