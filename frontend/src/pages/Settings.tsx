import { useEffect, useState, type ComponentType } from 'react'
import {
  User,
  Sliders,
  Sparkles,
  Cpu,
  Monitor,
  Info,
  Check,
  Lock,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  HardDrive,
  RefreshCw,
  Download,
} from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { useToast } from '../contexts/ToastContext'
import { exportSettings, loadSettings, resetSettings, saveSettings } from '../utils/settings'

type SettingsTab = 'profile' | 'theme' | 'ai' | 'local' | 'github' | 'preferences' | 'about'

export function Settings() {
  const initialSettings = loadSettings()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [profile, setProfile] = useState(initialSettings.profile)
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(initialSettings.theme)
  const [accent, setAccent] = useState<'violet' | 'blue' | 'emerald'>(initialSettings.accent)
  const [sidebarDensity, setSidebarDensity] = useState<'compact' | 'comfortable' | 'spacious'>(initialSettings.sidebarDensity)
  const [animations, setAnimations] = useState(initialSettings.animations)
  const [aiConfig, setAiConfig] = useState(initialSettings.ai)
  const [localConfig, setLocalConfig] = useState(initialSettings.local)
  const [github, setGithub] = useState(initialSettings.github)
  const [preferences, setPreferences] = useState(initialSettings.preferences)
  const [isSaved, setIsSaved] = useState(false)
  const { pushToast } = useToast()

  useEffect(() => {
    const settings = loadSettings()
    setProfile(settings.profile)
    setTheme(settings.theme)
    setAccent(settings.accent)
    setSidebarDensity(settings.sidebarDensity)
    setAnimations(settings.animations)
    setAiConfig(settings.ai)
    setLocalConfig(settings.local)
    setGithub(settings.github)
    setPreferences(settings.preferences)
  }, [])

  function handleSave() {
    saveSettings({ theme, accent, sidebarDensity, animations, profile, ai: aiConfig, local: localConfig, github, preferences })
    setIsSaved(true)
    pushToast('Settings saved', 'success')
    setTimeout(() => setIsSaved(false), 2000)
  }

  function handleReset() {
    const defaults = resetSettings()
    setProfile(defaults.profile)
    setTheme(defaults.theme)
    setAccent(defaults.accent)
    setSidebarDensity(defaults.sidebarDensity)
    setAnimations(defaults.animations)
    setAiConfig(defaults.ai)
    setLocalConfig(defaults.local)
    setGithub(defaults.github)
    setPreferences(defaults.preferences)
    setIsSaved(true)
    pushToast('Settings reset', 'info')
    setTimeout(() => setIsSaved(false), 1600)
  }

  function handleExport() {
    exportSettings()
    pushToast('Settings exported', 'success')
  }

  const tabs: { id: SettingsTab; label: string; icon: ComponentType<{ className?: string }> }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'theme', label: 'Theme & Appearance', icon: Monitor },
    { id: 'ai', label: 'AI Cloud Models', icon: Sparkles },
    { id: 'local', label: 'Local Models', icon: Cpu },
    { id: 'github', label: 'GitHub Connection', icon: FaGithub },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'about', label: 'About CodeScope AI', icon: Info },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sliders className="size-5 text-violet-400" />
          <h1 className="text-lg font-semibold text-white">Settings</h1>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="flex h-9 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition hover:bg-white"
        >
          {isSaved ? <Check className="size-4 text-emerald-600" /> : null}
          {isSaved ? 'Settings Saved' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="flex h-9 items-center gap-2 rounded-md border border-zinc-800 px-3 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          <Download className="size-4" />
          Export
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex h-9 items-center gap-2 rounded-md border border-zinc-800 px-3 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          <RefreshCw className="size-4" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Navigation Tabs */}
        <nav className="space-y-1 md:col-span-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-zinc-900 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                    : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200',
                ].join(' ')}
              >
                <Icon className={['size-4 shrink-0', isActive ? 'text-violet-400' : 'text-zinc-500'].join(' ')} />
                <span className="truncate">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Content Pane */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-6 md:col-span-9">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-200">Profile Settings</h2>
                <p className="mt-1 text-xs text-zinc-500">Manage your developer profile and account details.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">Display Name</span>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-2 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white outline-none focus:border-zinc-700"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">Email Address</span>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="mt-2 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white outline-none focus:border-zinc-700"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-zinc-400">Workspace Role</span>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="mt-2 h-9 w-full cursor-not-allowed rounded-md border border-zinc-800 bg-zinc-900/20 px-3 text-sm text-zinc-500 outline-none"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-200">Theme & Appearance</h2>
                <p className="mt-1 text-xs text-zinc-500">Select how CodeScope AI looks on your device.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { id: 'dark', label: 'Dark Mode', icon: Moon },
                  { id: 'light', label: 'Light Mode', icon: Sun },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map((option) => {
                  const Icon = option.icon
                  const isSelected = theme === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTheme(option.id as any)}
                      className={[
                        'flex flex-col items-center justify-center rounded-lg border p-4 transition text-center',
                        isSelected
                          ? 'border-violet-500 bg-violet-950/10 text-white'
                          : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700',
                      ].join(' ')}
                    >
                      <Icon className="size-5 mb-2" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  )
                })}
              </div>

              <div>
                <h3 className="text-xs font-medium text-zinc-400">Accent Color</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { id: 'violet', className: 'bg-violet-500' },
                    { id: 'blue', className: 'bg-blue-500' },
                    { id: 'emerald', className: 'bg-emerald-500' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAccent(option.id as typeof accent)}
                      className={[
                        'flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium capitalize transition',
                        accent === option.id ? 'border-zinc-500 text-white' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300',
                      ].join(' ')}
                    >
                      <span className={`size-3 rounded-full ${option.className}`} />
                      {option.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-zinc-400">Sidebar Density</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { id: 'comfortable', label: 'Comfortable' },
                    { id: 'compact', label: 'Compact' },
                    { id: 'spacious', label: 'Spacious' },
                  ].map((option) => {
                    const isSelected = sidebarDensity === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSidebarDensity(option.id as 'compact' | 'comfortable' | 'spacious')}
                        className={['rounded-md border px-3 py-2 text-xs font-medium transition', isSelected ? 'border-violet-500 bg-violet-950/20 text-white' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'].join(' ')}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-zinc-400">Animated Interface</h3>
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/20 px-4 py-3">
                  <label className="flex items-center gap-2 text-sm text-zinc-200">
                    <input
                      type="checkbox"
                      checked={animations}
                      onChange={(e) => setAnimations(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-violet-500"
                    />
                    Enable UI animations
                  </label>
                  <span className="text-xs text-zinc-500">Toggle motion effects for transitions and feedback.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-200">AI Cloud Provider Settings</h2>
                <p className="mt-1 text-xs text-zinc-500">Configure cloud LLM connections for parsing and chat.</p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-zinc-400">Default Model Provider</span>
                  <select
                    value={aiConfig.provider}
                    onChange={(e) => setAiConfig({ ...aiConfig, provider: e.target.value })}
                    className="mt-2 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-700"
                  >
                    <option value="anthropic">Anthropic (Claude 3.5 Sonnet / Opus)</option>
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="gemini">Google Gemini (1.5 Pro / Flash)</option>
                    <option value="deepseek">DeepSeek (Coder-V2)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Lock className="size-3 text-zinc-500" /> API Secret Key
                  </span>
                  <input
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                    className="mt-2 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white outline-none focus:border-zinc-700"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-medium text-zinc-400">Temperature: {aiConfig.temperature}</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiConfig.temperature}
                      onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                      className="mt-3 w-full accent-violet-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-zinc-400">Max Tokens</span>
                    <input
                      type="number"
                      value={aiConfig.maxTokens}
                      onChange={(e) => setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) || 2048 })}
                      className="mt-2 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white outline-none focus:border-zinc-700"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'local' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-200">Local Models Config (Ollama / Llama.cpp)</h2>
                <p className="mt-1 text-xs text-zinc-500">Run code analysis completely locally for total data privacy.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
                  <input
                    type="checkbox"
                    checked={localConfig.enabled}
                    onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
                    className="size-4 rounded border-zinc-800 bg-zinc-950 accent-violet-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-zinc-200">Enable Local Inference</span>
                    <span className="block text-xs text-zinc-500">Fallback to local endpoint when processing sensitive data.</span>
                  </div>
                </label>

                {localConfig.enabled && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-400">Local Inference URL</span>
                      <input
                        type="url"
                        value={localConfig.endpoint}
                        onChange={(e) => setLocalConfig({ ...localConfig, endpoint: e.target.value })}
                        className="mt-2 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white outline-none focus:border-zinc-700"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-400">Model Identifier</span>
                      <input
                        type="text"
                        value={localConfig.model}
                        onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                        className="mt-2 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white outline-none focus:border-zinc-700"
                      />
                    </label>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 sm:col-span-2">
                      <HardDrive className="size-4" />
                      <span>Ensure Ollama server is running locally on port 11434.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-200">GitHub Connection</h2>
                <p className="mt-1 text-xs text-zinc-500">Connect to private repositories using personal credentials.</p>
              </div>

              {github.connected ? (
                <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-lg bg-zinc-900">
                        <FaGithub className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Connected to GitHub as @{github.username}</p>
                        <p className="text-xs text-zinc-500">Access to private repositories enabled</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGithub({ ...github, connected: false })}
                      className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-red-400 hover:bg-zinc-900"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setGithub({ ...github, connected: true })}
                    className="flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    <FaGithub className="size-4" /> Connect with OAuth
                  </button>

                  <div className="flex items-center gap-2 py-2">
                    <div className="h-px flex-1 bg-zinc-800" />
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600">Or use token</span>
                    <div className="h-px flex-1 bg-zinc-800" />
                  </div>

                  <label className="block">
                    <span className="text-xs font-medium text-zinc-400">Personal Access Token (PAT)</span>
                    <input
                      type="password"
                      value={github.token}
                      onChange={(e) => setGithub({ ...github, token: e.target.value })}
                      placeholder="ghp_••••••••••••••••••••••••••••••••••••"
                      className="mt-2 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white outline-none focus:border-zinc-700"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-200">Application Preferences</h2>
                <p className="mt-1 text-xs text-zinc-500">Fine-tune system background tasks and diagnostics.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
                  <input
                    type="checkbox"
                    checked={preferences.autoAnalyze}
                    onChange={(e) => setPreferences({ ...preferences, autoAnalyze: e.target.checked })}
                    className="size-4 mt-0.5 rounded border-zinc-800 bg-zinc-950 accent-violet-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-zinc-200">Auto-Analyze Connected Repositories</span>
                    <span className="block text-xs text-zinc-500">Automatically start repository parsing whenever a new commits is pushed.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                    className="size-4 mt-0.5 rounded border-zinc-800 bg-zinc-950 accent-violet-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-zinc-200">In-App Notifications</span>
                    <span className="block text-xs text-zinc-500">Receive alert notifications when critical security issues are detected.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
                  <input
                    type="checkbox"
                    checked={preferences.telemetry}
                    onChange={(e) => setPreferences({ ...preferences, telemetry: e.target.checked })}
                    className="size-4 mt-0.5 rounded border-zinc-800 bg-zinc-950 accent-violet-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-zinc-200">Telemetry & Diagnostic Sharing</span>
                    <span className="block text-xs text-zinc-500">Share anonymous usage data to help improve CodeScope intelligence systems.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="grid size-12 place-items-center rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  CS
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">CodeScope AI</h2>
                  <p className="text-xs text-zinc-500">Enterprise Software Intelligence Platform</p>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-5 space-y-4 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-500">Application Version</span>
                  <span className="font-mono text-zinc-300">v1.2.0-stable</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-500">Release Date</span>
                  <span className="text-zinc-300">July 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-500">License Status</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Shield className="size-3.5" /> Enterprise Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-500">Engine Host</span>
                  <span className="font-mono text-zinc-300">localhost:8000</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-5">
                <a
                  href="#support"
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  <HelpCircle className="size-3.5" /> Documentation
                </a>
                <span className="text-zinc-800">•</span>
                <a
                  href="#check-updates"
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  <RefreshCw className="size-3.5" /> Check for updates
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
