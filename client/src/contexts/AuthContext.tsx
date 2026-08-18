import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react'

export type User = {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  joinedAt: string
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const MOCK_USER: User = {
  id: 'usr_001',
  name: 'Varun A K',
  email: 'varun@codescope.ai',
  role: 'Admin',
  joinedAt: '2025-03-15',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('codescope_user')
    return stored ? JSON.parse(stored) : null
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (_email: string, _password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setUser(MOCK_USER)
    localStorage.setItem('codescope_user', JSON.stringify(MOCK_USER))
    setIsLoading(false)
  }, [])

  const register = useCallback(async (name: string, email: string, _password: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const newUser: User = { ...MOCK_USER, name, email, id: 'usr_' + Date.now() }
    setUser(newUser)
    localStorage.setItem('codescope_user', JSON.stringify(newUser))
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('codescope_user')
  }, [])

  const forgotPassword = useCallback(async (_email: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      forgotPassword,
    }),
    [user, isLoading, login, register, logout, forgotPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
