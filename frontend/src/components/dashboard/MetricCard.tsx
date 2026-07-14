import { DashboardCard, EmptyCardContent } from './DashboardCard'

type MetricCardProps = {
  title: string
}

export function MetricCard({ title }: MetricCardProps) {
  return (
    <DashboardCard title={title} className="min-h-32 xl:col-span-3">
      <EmptyCardContent />
    </DashboardCard>
  )
}
