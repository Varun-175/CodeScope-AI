import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { JobProvider } from './contexts/JobContext'
import { applySettings, loadSettings } from './utils/settings'

export default function App() {
  useEffect(() => {
    applySettings(loadSettings())
  }, [])

  return (
    <AuthProvider>
      <ToastProvider>
        <JobProvider>
          <RouterProvider router={router} />
        </JobProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

