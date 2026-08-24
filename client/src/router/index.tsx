import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { Chat } from '../pages/Chat'
import { Dashboard } from '../pages/Dashboard'
import { Repository } from '../pages/Repository'
import { RepositoryOverview } from '../pages/RepositoryOverview'
import { Settings } from '../pages/Settings'
import { CodeReviews } from '../pages/CodeReviews'
import { Architecture } from '../pages/Architecture'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { ForgotPassword } from '../pages/ForgotPassword'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

// New domain pages
import { Organizations } from '../pages/Organizations'
import { Projects } from '../pages/Projects'
import { Intelligence } from '../pages/Intelligence'
import { Planning } from '../pages/Planning'
import { Testing } from '../pages/Testing'
import { Deployment } from '../pages/Deployment'
import { Observability } from '../pages/Observability'
import { Incidents } from '../pages/Incidents'
import { Workflows } from '../pages/Workflows'
import { Audit } from '../pages/Audit'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'organizations', element: <Organizations /> },
          { path: 'projects', element: <Projects /> },
          { path: 'repository', element: <RepositoryOverview /> },
          { path: 'repository/explore', element: <Repository /> },
          { path: 'intelligence', element: <Intelligence /> },
          { path: 'architecture', element: <Architecture /> },
          { path: 'planning', element: <Planning /> },
          { path: 'chat', element: <Chat /> },
          { path: 'reviews', element: <CodeReviews /> },
          { path: 'testing', element: <Testing /> },
          { path: 'deployment', element: <Deployment /> },
          { path: 'observability', element: <Observability /> },
          { path: 'incidents', element: <Incidents /> },
          { path: 'workflows', element: <Workflows /> },
          { path: 'settings', element: <Settings /> },
          { path: 'audit', element: <Audit /> },
        ],
      },
    ],
  },
])

