import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function validate() {
    const newErrors: typeof errors = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setErrors({ email: 'Login failed. Please try again.' })
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to CodeScope AI to continue">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
            placeholder="you@example.com"
            className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            autoComplete="email"
            autoFocus
          />
          {errors.email && <span className="mt-1.5 block text-xs text-red-400">{errors.email}</span>}
        </label>

        <label className="block">
          <span className="flex items-center justify-between text-sm font-medium text-zinc-300">
            Password
            <Link to="/forgot-password" className="text-xs text-zinc-500 transition hover:text-zinc-300">
              Forgot password?
            </Link>
          </span>
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
              placeholder="••••••••"
              className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <span className="mt-1.5 block text-xs text-red-400">{errors.password}</span>}
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-100 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogIn className="size-4" />
          )}
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-zinc-300 transition hover:text-white">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
