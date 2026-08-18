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
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-violet-600/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-cyan-600/5 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Branding */}
        <div className="mb-10 text-center">
          <div className="mx-auto inline-flex rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <Logo size={120} variant="glowing" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
