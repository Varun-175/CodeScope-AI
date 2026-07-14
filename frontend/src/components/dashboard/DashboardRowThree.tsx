import { DashboardCard, EmptyCardContent } from './DashboardCard'

export function DashboardRowThree() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-12">
      <DashboardCard title="Codebase Structure" className="min-h-72 xl:col-span-4">
        <EmptyCardContent />
      </DashboardCard>

      <DashboardCard title="Complexity Hotspots" className="min-h-72 xl:col-span-4">
        <EmptyCardContent />
      </DashboardCard>

      <DashboardCard title="Import Analysis" className="min-h-72 xl:col-span-4">
        <EmptyCardContent />
      </DashboardCard>
    </div>
  )
}
