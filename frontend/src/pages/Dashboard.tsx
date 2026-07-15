import { DashboardRowOne } from '../components/dashboard/DashboardRowOne'
import { DashboardRowThree } from '../components/dashboard/DashboardRowThree'
import { DashboardRowTwo } from '../components/dashboard/DashboardRowTwo'
import { EmptyDashboardState } from '../components/dashboard/EmptyDashboardState'
import { RepositoryHeader } from '../components/dashboard/RepositoryHeader'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

export function Dashboard() {
  const { status } = useRepositoryAnalysis()

  if (status === 'idle') {
    return <EmptyDashboardState />
  }

  const isLoading = status === 'analyzing'

  return (
    <div className="space-y-4">
      {status === 'complete' && <RepositoryHeader />}
      <DashboardRowOne isLoading={isLoading} />
      <DashboardRowTwo isLoading={isLoading} />
      <DashboardRowThree isLoading={isLoading} />
    </div>
  )
}
