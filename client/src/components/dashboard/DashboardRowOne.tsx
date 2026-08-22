import { Heart, FileCode2, AlertTriangle, Languages } from 'lucide-react'
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
      title: 'Health Score',
      value: data ? `${data.health.score}/100` : undefined,
      detail: data?.health.status,
      icon: Heart,
      tone: 'emerald' as const,
      trend: { value: 4, label: 'vs last week' },
      delay: 0,
    },
    {
      title: 'Files Tracked',
      value: data ? String(data.repository.files) : undefined,
      detail: data ? `${data.repository.lines_of_code.toLocaleString()} total LOC` : undefined,
      icon: FileCode2,
      tone: 'sky' as const,
      trend: { value: 2, label: 'since last scan' },
      delay: 100,
    },
    {
      title: 'Active Risks',
      value: data ? String(data.risks.critical.length + data.risks.warnings.length) : undefined,
      detail: data ? `${data.risks.largest_files.length} complexity hotspots` : undefined,
      icon: AlertTriangle,
      tone: data && (data.risks.critical.length + data.risks.warnings.length) > 5 ? 'red' as const : 'amber' as const,
      trend: { value: -1, label: 'resolved' },
      delay: 200,
    },
    {
      title: 'Languages',
      value: data ? String(data.repository.languages.length) : undefined,
      detail: data?.repository.primary_language ? `Primary: ${data.repository.primary_language}` : undefined,
      icon: Languages,
      tone: 'violet' as const,
      delay: 300,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} isLoading={isLoading} />
      ))}
    </div>
  )
}
