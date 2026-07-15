import { CardSkeleton, DashboardCard } from './DashboardCard'

type MetricCardProps = {
  title: string
  isLoading?: boolean
}

export function MetricCard({ title, isLoading = false }: MetricCardProps) {
  return (
    <DashboardCard title={title} className="min-h-32 xl:col-span-3">
      {isLoading && <CardSkeleton />}
    </DashboardCard>
  )
}
