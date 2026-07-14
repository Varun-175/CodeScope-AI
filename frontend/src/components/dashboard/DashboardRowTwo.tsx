import { DashboardCard, EmptyCardContent } from './DashboardCard'

export function DashboardRowTwo() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-8">
        <DashboardCard
          title="Architecture"
          description="Module dependency map placeholder"
          className="min-h-[400px]"
        >
          <EmptyCardContent />
        </DashboardCard>

        <DashboardCard
          title="Repository Summary"
          description="AI-generated repository brief placeholder"
          className="min-h-52"
        >
          <EmptyCardContent />
        </DashboardCard>
      </div>

      <div className="space-y-4 xl:col-span-4">
        <DashboardCard title="Repository DNA" className="min-h-72">
          <EmptyCardContent />
        </DashboardCard>

        <DashboardCard title="Top Risks" className="min-h-52">
          <EmptyCardContent />
        </DashboardCard>

        <DashboardCard title="Dependency Health" className="min-h-40">
          <EmptyCardContent />
        </DashboardCard>
      </div>
    </div>
  )
}
