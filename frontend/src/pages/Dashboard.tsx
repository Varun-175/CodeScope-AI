import { DashboardRowOne } from '../components/dashboard/DashboardRowOne'
import { DashboardRowThree } from '../components/dashboard/DashboardRowThree'
import { DashboardRowTwo } from '../components/dashboard/DashboardRowTwo'

export function Dashboard() {
  return (
    <div className="space-y-4">
      <DashboardRowOne />
      <DashboardRowTwo />
      <DashboardRowThree />
    </div>
  )
}
