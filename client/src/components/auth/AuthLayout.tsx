import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Logo } from '../shared/Logo'

type AuthLayoutProps = {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-violet-600/10 blur-3xl dark:bg-violet-600/5" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-blue-600/10 blur-3xl dark:bg-blue-600/5" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Branding */}
        <div className="mb-10 text-center">
          <div className="neo-convex mx-auto inline-flex p-6">
            <Logo size={120} variant="glowing" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="neo-flat p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
