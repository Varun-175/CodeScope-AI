import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { Chat } from '../pages/Chat'
import { Dashboard } from '../pages/Dashboard'
import { Repository } from '../pages/Repository'
import { Settings } from '../pages/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'repository', element: <Repository /> },
      { path: 'chat', element: <Chat /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])
