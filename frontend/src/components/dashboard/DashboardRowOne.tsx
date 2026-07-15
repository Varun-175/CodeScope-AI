import { MetricCard } from './MetricCard'
import type { AnalysisResponse } from '../../types/analysis'

export function DashboardRowOne({
  data,
  isLoading = false,
}: {
  data?: AnalysisResponse | null
  isLoading?: boolean
}) {
  const metrics = [
    {
      title: 'Repository Health',
      value: data ? `${data.health.score}/100` : undefined,
      detail: data?.health.status,
    },
    {
      title: 'Files',
      value: data ? String(data.repository.files) : undefined,
      detail: data ? `${data.repository.lines_of_code.toLocaleString()} LOC` : undefined,
    },
    {
      title: 'Risks',
      value: data ? String(data.risks.critical.length + data.risks.warnings.length) : undefined,
      detail: data ? `${data.risks.largest_files.length} hotspots` : undefined,
    },
    {
      title: 'Languages',
      value: data ? String(data.repository.languages.length) : undefined,
      detail: data?.repository.primary_language,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} isLoading={isLoading} />
      ))}
    </div>
  )
}
