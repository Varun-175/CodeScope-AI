/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

const Login = lazy(() => import('../pages/Login').then(({ Login }) => ({ default: Login })))
const Register = lazy(() => import('../pages/Register').then(({ Register }) => ({ default: Register })))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then(({ ForgotPassword }) => ({ default: ForgotPassword })))
const Dashboard = lazy(() => import('../pages/Dashboard').then(({ Dashboard }) => ({ default: Dashboard })))
const Organizations = lazy(() => import('../pages/Organizations').then(({ Organizations }) => ({ default: Organizations })))
const Projects = lazy(() => import('../pages/Projects').then(({ Projects }) => ({ default: Projects })))
const RepositoryOverview = lazy(() => import('../pages/RepositoryOverview').then(({ RepositoryOverview }) => ({ default: RepositoryOverview })))
const Repository = lazy(() => import('../pages/Repository').then(({ Repository }) => ({ default: Repository })))
const Intelligence = lazy(() => import('../pages/Intelligence').then(({ Intelligence }) => ({ default: Intelligence })))
const Architecture = lazy(() => import('../pages/Architecture').then(({ Architecture }) => ({ default: Architecture })))
const Impact = lazy(() => import('../pages/Impact').then(({ Impact }) => ({ default: Impact })))
const Planning = lazy(() => import('../pages/Planning').then(({ Planning }) => ({ default: Planning })))
const Chat = lazy(() => import('../pages/Chat').then(({ Chat }) => ({ default: Chat })))
const CodeReviews = lazy(() => import('../pages/CodeReviews').then(({ CodeReviews }) => ({ default: CodeReviews })))
const Testing = lazy(() => import('../pages/Testing').then(({ Testing }) => ({ default: Testing })))
const Deployment = lazy(() => import('../pages/Deployment').then(({ Deployment }) => ({ default: Deployment })))
const Observability = lazy(() => import('../pages/Observability').then(({ Observability }) => ({ default: Observability })))
const Incidents = lazy(() => import('../pages/Incidents').then(({ Incidents }) => ({ default: Incidents })))
const Workflows = lazy(() => import('../pages/Workflows').then(({ Workflows }) => ({ default: Workflows })))
const Settings = lazy(() => import('../pages/Settings').then(({ Settings }) => ({ default: Settings })))
const Audit = lazy(() => import('../pages/Audit').then(({ Audit }) => ({ default: Audit })))

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
          { path: 'impact', element: <Impact /> },
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

