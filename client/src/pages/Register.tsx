import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useAuth } from '../contexts/AuthContext'

export function Register() {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      await register(name, email, password)
      navigate('/')
    } catch {
      setErrors({ email: 'Registration failed. Please try again.' })
    }
  }

  function clearError(field: string) {
    setErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }

  return (
    <AuthLayout title="Create an account" subtitle="Get started with CodeScope AI">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Full Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError('name') }}
            placeholder="John Doe"
            className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            autoFocus
          />
          {errors.name && <span className="mt-1.5 block text-xs text-red-400">{errors.name}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email') }}
            placeholder="you@example.com"
            className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            autoComplete="email"
          />
          {errors.email && <span className="mt-1.5 block text-xs text-red-400">{errors.email}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Password</span>
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError('password') }}
              placeholder="••••••••"
              className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              autoComplete="new-password"
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

        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Confirm Password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword') }}
            placeholder="••••••••"
            className="mt-2 h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="mt-1.5 block text-xs text-red-400">{errors.confirmPassword}</span>}
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-100 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-zinc-300 transition hover:text-white">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
