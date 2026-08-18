export type SettingsTheme = 'dark' | 'light' | 'system'
export type AccentColor = 'violet' | 'blue' | 'emerald'
export type SidebarDensity = 'compact' | 'comfortable' | 'spacious'

export type AppSettings = {
  theme: SettingsTheme
  accent: AccentColor
  sidebarDensity: SidebarDensity
  animations: boolean
  profile: { name: string; email: string; role: string }
  ai: { provider: string; apiKey: string; temperature: number; maxTokens: number }
  local: { enabled: boolean; endpoint: string; model: string }
  github: { connected: boolean; username: string; token: string }
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
  profile: { name: 'Varun A K', email: 'varun@codescope.ai', role: 'Lead Frontend Engineer' },
  ai: { provider: 'anthropic', apiKey: '', temperature: 0.2, maxTokens: 4096 },
  local: { enabled: false, endpoint: 'http://localhost:11434', model: 'llama3:8b' },
  github: { connected: true, username: 'varun-175', token: '' },
  preferences: {
    autoAnalyze: true,
    telemetry: false,
    notifications: true,
    defaultBranch: 'main',
    defaultRepository: 'pallets/flask',
  },
}

const THEMES: SettingsTheme[] = ['dark', 'light', 'system']
const ACCENTS: AccentColor[] = ['violet', 'blue', 'emerald']
const DENSITIES: SidebarDensity[] = ['compact', 'comfortable', 'spacious']
const ACCENT_COLORS: Record<AccentColor, string> = {
  violet: '#8b5cf6',
  blue: '#60a5fa',
  emerald: '#34d399',
}

let systemThemeQuery: MediaQueryList | null = null
let systemThemeListener: ((event: MediaQueryListEvent) => void) | null = null

function cloneDefaults(): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    profile: { ...DEFAULT_SETTINGS.profile },
    ai: { ...DEFAULT_SETTINGS.ai },
    local: { ...DEFAULT_SETTINGS.local },
    github: { ...DEFAULT_SETTINGS.github },
    preferences: { ...DEFAULT_SETTINGS.preferences },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function numberValue(value: unknown, fallback: number, minimum: number, maximum: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback
}

function oneOf<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return typeof value === 'string' && values.includes(value as T) ? (value as T) : fallback
}

function normalizeSettings(value: unknown, base: AppSettings = cloneDefaults()): AppSettings {
  if (!isRecord(value)) return base
  const profile = isRecord(value.profile) ? value.profile : {}
  const ai = isRecord(value.ai) ? value.ai : {}
  const local = isRecord(value.local) ? value.local : {}
  const github = isRecord(value.github) ? value.github : {}
  const preferences = isRecord(value.preferences) ? value.preferences : {}

  return {
    theme: oneOf(value.theme, THEMES, base.theme),
    accent: oneOf(value.accent, ACCENTS, base.accent),
    sidebarDensity: oneOf(value.sidebarDensity, DENSITIES, base.sidebarDensity),
    animations: booleanValue(value.animations, base.animations),
    profile: {
      name: stringValue(profile.name, base.profile.name),
      email: stringValue(profile.email, base.profile.email),
      role: stringValue(profile.role, base.profile.role),
    },
    ai: {
      provider: stringValue(ai.provider, base.ai.provider),
      apiKey: stringValue(ai.apiKey, base.ai.apiKey),
      temperature: numberValue(ai.temperature, base.ai.temperature, 0, 1),
      maxTokens: Math.round(numberValue(ai.maxTokens, base.ai.maxTokens, 1, 128000)),
    },
    local: {
      enabled: booleanValue(local.enabled, base.local.enabled),
      endpoint: stringValue(local.endpoint, base.local.endpoint),
      model: stringValue(local.model, base.local.model),
    },
    github: {
      connected: booleanValue(github.connected, base.github.connected),
      username: stringValue(github.username, base.github.username),
      token: stringValue(github.token, base.github.token),
    },
    preferences: {
      autoAnalyze: booleanValue(preferences.autoAnalyze, base.preferences.autoAnalyze),
      telemetry: booleanValue(preferences.telemetry, base.preferences.telemetry),
      notifications: booleanValue(preferences.notifications, base.preferences.notifications),
      defaultBranch: stringValue(preferences.defaultBranch, base.preferences.defaultBranch),
      defaultRepository: stringValue(preferences.defaultRepository, base.preferences.defaultRepository),
    },
  }
}

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function loadSettings(): AppSettings {
  const storage = getStorage()
  if (!storage) return cloneDefaults()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    return raw ? normalizeSettings(JSON.parse(raw)) : cloneDefaults()
  } catch {
    try { storage.removeItem(STORAGE_KEY) } catch { /* storage is unavailable */ }
    return cloneDefaults()
  }
}

function persist(settings: AppSettings) {
  try { getStorage()?.setItem(STORAGE_KEY, JSON.stringify(settings)) } catch { /* keep settings usable without storage */ }
}

function syncDocument(settings: AppSettings) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const root = document.documentElement
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.dataset.theme = settings.theme
  root.dataset.accent = settings.accent
  root.dataset.sidebarDensity = settings.sidebarDensity
  root.dataset.animations = String(settings.animations)
  root.classList.toggle('dark', isDark)
  root.style.setProperty('--bg-color', isDark ? '#0d1117' : '#f6f8fa')
  root.style.setProperty('--text-color', isDark ? '#f0f6fc' : '#1f2328')
  root.style.setProperty('--accent-color', ACCENT_COLORS[settings.accent])
  root.style.setProperty('--accent-soft', `${ACCENT_COLORS[settings.accent]}22`)
}

function watchSystemTheme(settings: AppSettings) {
  if (typeof window === 'undefined') return
  if (systemThemeQuery && systemThemeListener) systemThemeQuery.removeEventListener('change', systemThemeListener)
  systemThemeQuery = null
  systemThemeListener = null
  if (settings.theme !== 'system') return
  systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemThemeListener = () => syncDocument(settings)
  systemThemeQuery.addEventListener('change', systemThemeListener)
}

export function applySettings(partial: Partial<AppSettings> | AppSettings): AppSettings {
  const resolved = normalizeSettings(partial, loadSettings())
  syncDocument(resolved)
  watchSystemTheme(resolved)
  return resolved
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const next = normalizeSettings(partial, loadSettings())
  persist(next)
  syncDocument(next)
  watchSystemTheme(next)
  return next
}

export function resetSettings(): AppSettings {
  const settings = cloneDefaults()
  try { getStorage()?.removeItem(STORAGE_KEY) } catch { /* storage is unavailable */ }
  syncDocument(settings)
  watchSystemTheme(settings)
  return settings
}

export function exportSettings() {
  const settings = loadSettings()
  const safeSettings: AppSettings = { ...settings, ai: { ...settings.ai, apiKey: '' }, github: { ...settings.github, token: '' } }
  const blob = new Blob([JSON.stringify(safeSettings, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'codescope-settings.json'
  link.click()
  URL.revokeObjectURL(url)
}

export function importSettings(rawText: string): AppSettings {
  const parsed: unknown = JSON.parse(rawText)
  if (!isRecord(parsed)) throw new Error('Settings import must contain a JSON object.')
  return saveSettings(parsed as Partial<AppSettings>)
}
