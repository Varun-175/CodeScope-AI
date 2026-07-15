import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useAuth } from '../contexts/AuthContext'

export function ForgotPassword() {
  const { forgotPassword, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return }
    setError('')
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError('Failed to send reset link. Try again.')
    }
  }

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent you a password reset link">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="grid size-14 place-items-center rounded-full border border-emerald-900/40 bg-emerald-950/30">
            <CheckCircle2 className="size-7 text-emerald-400" />
          </div>
          <p className="mt-5 text-sm leading-6 text-zinc-400">
            A password reset link has been sent to{' '}
            <span className="font-medium text-zinc-200">{email}</span>.
            Check your inbox and follow the instructions to reset your password.
          </p>
          <Link
            to="/login"
            className="mt-6 flex h-10 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition hover:bg-white"
          >
            <ArrowLeft className="size-4" /> Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Email address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder="you@example.com"
            className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            autoComplete="email"
            autoFocus
          />
          {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-100 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          {isLoading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link to="/login" className="inline-flex items-center gap-1 font-medium text-zinc-300 transition hover:text-white">
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
