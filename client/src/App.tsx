import { Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { JobProvider } from './contexts/JobContext'
import { applySettings, loadSettings } from './utils/settings'
import { LoadingState } from './components/shared/StatusPanels'

export default function App() {
  useEffect(() => {
    applySettings(loadSettings())
  }, [])

  return (
    <AuthProvider>
      <ToastProvider>
        <JobProvider>
          <Suspense fallback={<LoadingState title="Loading workspace" hint="Preparing the selected view" />}>
            <RouterProvider router={router} />
          </Suspense>
        </JobProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

