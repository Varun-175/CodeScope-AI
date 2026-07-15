import { DashboardRowOne } from '../components/dashboard/DashboardRowOne'
import { DashboardRowThree } from '../components/dashboard/DashboardRowThree'
import { DashboardRowTwo } from '../components/dashboard/DashboardRowTwo'
import { EmptyDashboardState } from '../components/dashboard/EmptyDashboardState'
import { RepositoryHeader } from '../components/dashboard/RepositoryHeader'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

export function Dashboard() {
  const { data, error, status } = useRepositoryAnalysis()

  if (status === 'idle') {
    return <EmptyDashboardState />
  }

  const isLoading = status === 'analyzing'

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-300">
          {error}
        </div>
      )}
      {status === 'complete' && data && <RepositoryHeader repository={data.repository} />}
      <DashboardRowOne data={data} isLoading={isLoading} />
      <DashboardRowTwo data={data} isLoading={isLoading} />
      <DashboardRowThree data={data} isLoading={isLoading} />
    </div>
  )
}
