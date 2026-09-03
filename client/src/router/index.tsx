/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
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
const Graph = lazy(() => import('../pages/Graph').then(({ Graph }) => ({ default: Graph })))
const Timeline = lazy(() => import('../pages/Timeline').then(({ Timeline }) => ({ default: Timeline })))
const Entities = lazy(() => import('../pages/Entities').then(({ Entities }) => ({ default: Entities })))
const Architecture = lazy(() => import('../pages/Architecture').then(({ Architecture }) => ({ default: Architecture })))
const Changes = lazy(() => import('../pages/Changes').then(({ Changes }) => ({ default: Changes })))
const Impact = lazy(() => import('../pages/Impact').then(({ Impact }) => ({ default: Impact })))
const Planning = lazy(() => import('../pages/Planning').then(({ Planning }) => ({ default: Planning })))
const Chat = lazy(() => import('../pages/Chat').then(({ Chat }) => ({ default: Chat })))
const CodeReviews = lazy(() => import('../pages/CodeReviews').then(({ CodeReviews }) => ({ default: CodeReviews })))
const Testing = lazy(() => import('../pages/Testing').then(({ Testing }) => ({ default: Testing })))
const Deployment = lazy(() => import('../pages/Deployment').then(({ Deployment }) => ({ default: Deployment })))
const Observability = lazy(() => import('../pages/Observability').then(({ Observability }) => ({ default: Observability })))
const Incidents = lazy(() => import('../pages/Incidents').then(({ Incidents }) => ({ default: Incidents })))
const Integrations = lazy(() => import('../pages/Integrations').then(({ Integrations }) => ({ default: Integrations })))
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
          // Home / System Launchpad
          { index: true, element: <Dashboard /> },

          // UNDERSTAND
          { path: 'intelligence', element: <Intelligence /> },
          { path: 'graph', element: <Graph /> },
          { path: 'architecture', element: <Architecture /> },
          { path: 'entities', element: <Entities /> },
          { path: 'entities/:entityId', element: <Entities /> },
          { path: 'code', element: <Repository /> },
          { path: 'code/:fileId', element: <Repository /> },

          // EVOLVE
          { path: 'timeline', element: <Timeline /> },
          { path: 'changes', element: <Changes /> },
          { path: 'changes/:changeId', element: <Changes /> },
          { path: 'impact', element: <Impact /> },
          { path: 'impact/:changeId', element: <Impact /> },

          // ACT
          { path: 'planning', element: <Planning /> },
          { path: 'reviews', element: <CodeReviews /> },
          { path: 'testing', element: <Testing /> },
          { path: 'deployments', element: <Deployment /> },

          // OPERATE
          { path: 'operations', element: <Observability /> },
          { path: 'incidents', element: <Incidents /> },

          // SYSTEM
          { path: 'repositories', element: <RepositoryOverview /> },
          { path: 'projects', element: <Projects /> },
          { path: 'organizations', element: <Organizations /> },
          { path: 'integrations', element: <Integrations /> },
          { path: 'workflows', element: <Workflows /> },
          { path: 'audit', element: <Audit /> },
          { path: 'settings', element: <Settings /> },

          // Backward Compatibility & Aliases
          { path: 'chat', element: <Chat /> },
          { path: 'deployment', element: <Navigate to="/deployments" replace /> },
          { path: 'observability', element: <Navigate to="/operations" replace /> },
          { path: 'repository', element: <Navigate to="/repositories" replace /> },
          { path: 'repository/explore', element: <Navigate to="/code" replace /> },
        ],
      },
    ],
  },
])
