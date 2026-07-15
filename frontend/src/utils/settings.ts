export type SettingsTheme = 'dark' | 'light' | 'system'
export type AccentColor = 'violet' | 'blue' | 'emerald'
export type SidebarDensity = 'compact' | 'comfortable' | 'spacious'

export type AppSettings = {
  theme: SettingsTheme
  accent: AccentColor
  sidebarDensity: SidebarDensity
  animations: boolean
  profile: {
    name: string
    email: string
    role: string
  }
  ai: {
    provider: string
    apiKey: string
    temperature: number
    maxTokens: number
  }
  local: {
    enabled: boolean
    endpoint: string
    model: string
  }
  github: {
    connected: boolean
    username: string
    token: string
  }
  preferences: {
    autoAnalyze: boolean
    telemetry: boolean
    notifications: boolean
    defaultBranch: string
    defaultRepository: string
  }
}

export const STORAGE_KEY = 'codescope-ui-settings'

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accent: 'violet',
  sidebarDensity: 'comfortable',
  animations: true,
  profile: {
    name: 'Varun A K',
    email: 'varun@codescope.ai',
    role: 'Lead Frontend Engineer',
  },
  ai: {
    provider: 'anthropic',
    apiKey: '',
    temperature: 0.2,
    maxTokens: 4096,
  },
  local: {
    enabled: false,
    endpoint: 'http://localhost:11434',
    model: 'llama3:8b',
  },
  github: {
    connected: true,
    username: 'varun-175',
    token: '',
  },
  preferences: {
    autoAnalyze: true,
    telemetry: false,
    notifications: true,
    defaultBranch: 'main',
    defaultRepository: 'pallets/flask',
  },
}

function getSafeStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function mergeSettings(partial: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    profile: {
      ...DEFAULT_SETTINGS.profile,
      ...(partial.profile ?? {}),
    },
    ai: {
      ...DEFAULT_SETTINGS.ai,
      ...(partial.ai ?? {}),
    },
    local: {
      ...DEFAULT_SETTINGS.local,
      ...(partial.local ?? {}),
    },
    github: {
      ...DEFAULT_SETTINGS.github,
      ...(partial.github ?? {}),
    },
    preferences: {
      ...DEFAULT_SETTINGS.preferences,
      ...(partial.preferences ?? {}),
    },
  }
}

export function loadSettings(): AppSettings {
  const storage = getSafeStorage()
  if (!storage) return DEFAULT_SETTINGS

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return mergeSettings(parsed)
  } catch {
    storage.removeItem(STORAGE_KEY)
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const storage = getSafeStorage()
  const next = mergeSettings(partial)
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  applySettings(next)
  return next
}

export function resetSettings(): AppSettings {
  const storage = getSafeStorage()
  if (storage) {
    storage.removeItem(STORAGE_KEY)
  }
  applySettings(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export function applySettings(settings: Partial<AppSettings> | AppSettings) {
  const resolved = mergeSettings(settings)
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.theme = resolved.theme
  root.dataset.accent = resolved.accent
  root.dataset.sidebarDensity = resolved.sidebarDensity
  root.dataset.animations = resolved.animations ? 'true' : 'false'

  const accentMap: Record<AccentColor, string> = {
    violet: '#8b5cf6',
    blue: '#60a5fa',
    emerald: '#34d399',
  }

  root.style.setProperty('--accent-color', accentMap[resolved.accent])
  root.style.setProperty('--accent-soft', `${accentMap[resolved.accent]}22`)
}

export function exportSettings() {
  const settings = loadSettings()
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'codescope-settings.json'
  link.click()
  URL.revokeObjectURL(url)
}

export function importSettings(rawText: string): AppSettings {
  const parsed = JSON.parse(rawText) as Partial<AppSettings>
  return saveSettings(parsed)
}
