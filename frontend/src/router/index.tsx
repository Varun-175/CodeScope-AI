import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { Chat } from '../pages/Chat'
import { Dashboard } from '../pages/Dashboard'
import { Repository } from '../pages/Repository'
import { Settings } from '../pages/Settings'
import { CodeReviews } from '../pages/CodeReviews'
import { Architecture } from '../pages/Architecture'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { ForgotPassword } from '../pages/ForgotPassword'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

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
          { path: 'repository', element: <Repository /> },
          { path: 'chat', element: <Chat /> },
          { path: 'reviews', element: <CodeReviews /> },
          { path: 'architecture', element: <Architecture /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
    ],
  },
])

