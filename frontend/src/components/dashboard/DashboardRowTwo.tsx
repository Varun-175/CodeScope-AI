import { CardSkeleton, DashboardCard } from './DashboardCard'

export function DashboardRowTwo({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-8">
        <DashboardCard
          title="Architecture"
          description="Module dependency map placeholder"
          className="min-h-[400px]"
        >
          {isLoading && <CardSkeleton />}
        </DashboardCard>

        <DashboardCard
          title="Repository Summary"
          description="AI-generated repository brief placeholder"
          className="min-h-52"
        >
          {isLoading && <CardSkeleton />}
        </DashboardCard>
      </div>

      <div className="space-y-4 xl:col-span-4">
        <DashboardCard title="Repository DNA" className="min-h-72">
          {isLoading && <CardSkeleton />}
        </DashboardCard>

        <DashboardCard title="Top Risks" className="min-h-52">
          {isLoading && <CardSkeleton />}
        </DashboardCard>

        <DashboardCard title="Dependency Health" className="min-h-40">
          {isLoading && <CardSkeleton />}
        </DashboardCard>
      </div>
    </div>
  )
}
