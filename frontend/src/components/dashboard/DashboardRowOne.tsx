import { MetricCard } from './MetricCard'

const metricCards = [
  'Repository Health',
  'Files',
  'Issues',
  'Languages',
]

export function DashboardRowOne() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
      {metricCards.map((title) => (
        <MetricCard key={title} title={title} />
      ))}
    </div>
  )
}
