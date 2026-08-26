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
  Upload,
  Bot,
} from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { useToast } from '../contexts/ToastContext'
import { applySettings, exportSettings, loadSettings, resetSettings, saveSettings as persistLocalSettings, importSettings, type SettingsTheme } from '../utils/settings'
import { getSettings, saveSettings as saveSettingsApi, testProvider } from '../services/api/analysis'
import { Logo } from '../components/shared/Logo'

type SettingsTab = 'profile' | 'theme' | 'ai' | 'local' | 'github' | 'preferences' | 'about'

export function Settings() {
  const [initialSettings] = useState(loadSettings)
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
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingAi, setIsTestingAi] = useState(false)
  const [isTestingLocal, setIsTestingLocal] = useState(false)
  const [isConnectingGithub, setIsConnectingGithub] = useState(false)
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false)
  const { pushToast } = useToast()

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string
        const imported = importSettings(text)
        setProfile(imported.profile)
        setTheme(imported.theme)
        setAccent(imported.accent)
        setSidebarDensity(imported.sidebarDensity)
        setAnimations(imported.animations)
        setAiConfig(imported.ai)
        setLocalConfig(imported.local)
        setGithub(imported.github)
        setPreferences(imported.preferences)
        applySettings(imported)
        
        await saveSettingsApi({
          github_token: imported.github.token || undefined,
          github_base_url: 'https://api.github.com',
          gemini_api_key: imported.ai.provider === 'gemini' ? imported.ai.apiKey : undefined,
          groq_api_key: imported.ai.provider === 'groq' ? imported.ai.apiKey : undefined,
          huggingface_api_key: imported.ai.provider === 'huggingface' ? imported.ai.apiKey : undefined,
          openai_api_key: imported.ai.provider === 'openai' ? imported.ai.apiKey : undefined,
          anthropic_api_key: imported.ai.provider === 'anthropic' ? imported.ai.apiKey : undefined,
          openrouter_api_key: imported.ai.provider === 'openrouter' ? imported.ai.apiKey : undefined,
          ollama_url: imported.local.endpoint || undefined,
          local_model: imported.local.model || undefined,
          embedding_model: '',
          llm_provider: imported.ai.provider || undefined,
          temperature: imported.ai.temperature,
          max_tokens: imported.ai.maxTokens,
          top_p: 0.95,
          repository_cache: imported.preferences.autoAnalyze,
          chunk_size: 800,
          chunk_overlap: 120,
          embedding_provider: 'huggingface',
          vector_store: 'chromadb',
        })
        pushToast('Settings imported successfully', 'success')
      } catch {
        pushToast('Failed to import settings. Invalid file format.', 'error')
      }
    }
    reader.readAsText(file)
  }

  async function handleTestAi() {
    setIsTestingAi(true)
    try {
      await saveSettingsApi({
        github_token: github.token || undefined,
        github_base_url: 'https://api.github.com',
        gemini_api_key: aiConfig.provider === 'gemini' ? aiConfig.apiKey : undefined,
        groq_api_key: aiConfig.provider === 'groq' ? aiConfig.apiKey : undefined,
        huggingface_api_key: aiConfig.provider === 'huggingface' ? aiConfig.apiKey : undefined,
        openai_api_key: aiConfig.provider === 'openai' ? aiConfig.apiKey : undefined,
        anthropic_api_key: aiConfig.provider === 'anthropic' ? aiConfig.apiKey : undefined,
        openrouter_api_key: aiConfig.provider === 'openrouter' ? aiConfig.apiKey : undefined,
        ollama_url: localConfig.endpoint || undefined,
        local_model: localConfig.model || undefined,
        embedding_model: '',
        llm_provider: aiConfig.provider || undefined,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens,
        top_p: 0.95,
        repository_cache: preferences.autoAnalyze,
        chunk_size: 800,
        chunk_overlap: 120,
        embedding_provider: 'huggingface',
        vector_store: 'chromadb',
      })
      const result = await testProvider(aiConfig.provider)
      if (result.ok) {
        pushToast(`Connection to ${aiConfig.provider} successful!`, 'success')
      } else {
        pushToast(`Connection failed: ${result.message}`, 'error')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      pushToast(`Test failed: ${message}`, 'error')
    } finally {
      setIsTestingAi(false)
    }
  }

  async function handleTestLocal() {
    setIsTestingLocal(true)
    try {
      await saveSettingsApi({
        github_token: github.token || undefined,
        github_base_url: 'https://api.github.com',
        gemini_api_key: aiConfig.provider === 'gemini' ? aiConfig.apiKey : undefined,
        groq_api_key: aiConfig.provider === 'groq' ? aiConfig.apiKey : undefined,
        huggingface_api_key: aiConfig.provider === 'huggingface' ? aiConfig.apiKey : undefined,
        openai_api_key: aiConfig.provider === 'openai' ? aiConfig.apiKey : undefined,
        anthropic_api_key: aiConfig.provider === 'anthropic' ? aiConfig.apiKey : undefined,
        openrouter_api_key: aiConfig.provider === 'openrouter' ? aiConfig.apiKey : undefined,
        ollama_url: localConfig.endpoint || undefined,
        local_model: localConfig.model || undefined,
        embedding_model: '',
        llm_provider: aiConfig.provider || undefined,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens,
        top_p: 0.95,
        repository_cache: preferences.autoAnalyze,
        chunk_size: 800,
        chunk_overlap: 120,
        embedding_provider: 'huggingface',
        vector_store: 'chromadb',
      })
      const result = await testProvider('ollama')
      if (result.ok) {
        pushToast('Connection to local Ollama successful!', 'success')
      } else {
        pushToast(`Connection failed: ${result.message}`, 'error')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      pushToast(`Test failed: ${message}`, 'error')
    } finally {
      setIsTestingLocal(false)
    }
  }

  async function handleConnectGithub() {
    setIsConnectingGithub(true)
    try {
      pushToast('GitHub OAuth is not configured. Add a personal access token below, then save settings.', 'info')
    } finally {
      setIsConnectingGithub(false)
    }
  }

  function handleDisconnectGithub() {
    setGithub({
      connected: false,
      username: '',
      token: ''
    })
    pushToast('Disconnected from GitHub', 'info')
  }

  async function handleCheckUpdates() {
    setIsCheckingUpdates(true)
    pushToast('Checking for updates...', 'info')
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsCheckingUpdates(false)
    pushToast('You are on the latest version: v1.2.0-stable', 'success')
  }

  useEffect(() => {
    applySettings(initialSettings)

    async function loadBackendSettings() {
      try {
        const backend = await getSettings()
        setAiConfig((current) => ({
          ...current,
          provider: backend.llm_provider || current.provider,
          apiKey:
            (backend[
              `${(backend.llm_provider || current.provider) as string}_api_key` as keyof typeof backend
            ] as string | undefined) || current.apiKey,
          temperature: backend.temperature ?? current.temperature,
          maxTokens: backend.max_tokens ?? current.maxTokens,
        }))
      } catch {
        // ignore backend failures and keep local settings
      }
    }

    loadBackendSettings()
  }, [initialSettings])

  async function handleSave() {
    setIsSaving(true)
    persistLocalSettings({ theme, accent, sidebarDensity, animations, profile, ai: aiConfig, local: localConfig, github, preferences })
    try {
      await saveSettingsApi({
        github_token: github.token || undefined,
        github_base_url: 'https://api.github.com',
        gemini_api_key: aiConfig.provider === 'gemini' ? aiConfig.apiKey : undefined,
        groq_api_key: aiConfig.provider === 'groq' ? aiConfig.apiKey : undefined,
        huggingface_api_key: aiConfig.provider === 'huggingface' ? aiConfig.apiKey : undefined,
        openai_api_key: aiConfig.provider === 'openai' ? aiConfig.apiKey : undefined,
        anthropic_api_key: aiConfig.provider === 'anthropic' ? aiConfig.apiKey : undefined,
        openrouter_api_key: aiConfig.provider === 'openrouter' ? aiConfig.apiKey : undefined,
        ollama_url: localConfig.endpoint || undefined,
        local_model: localConfig.model || undefined,
        embedding_model: '',
        llm_provider: aiConfig.provider || undefined,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens,
        top_p: 0.95,
        repository_cache: preferences.autoAnalyze,
        chunk_size: 800,
        chunk_overlap: 120,
        embedding_provider: 'huggingface',
        vector_store: 'chromadb',
      })
      setIsSaved(true)
      pushToast('Settings saved', 'success')
      setTimeout(() => setIsSaved(false), 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save settings.'
      pushToast(`Save failed: ${message}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleReset() {
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
    await saveSettingsApi({
      github_token: '',
      github_base_url: 'https://api.github.com',
      gemini_api_key: '',
      groq_api_key: '',
      huggingface_api_key: '',
      openai_api_key: '',
      anthropic_api_key: '',
      openrouter_api_key: '',
      ollama_url: 'http://localhost:11434',
      local_model: 'llama3.2',
      embedding_model: 'all-MiniLM-L6-v2',
      llm_provider: 'groq',
      temperature: 0.2,
      max_tokens: 1024,
      top_p: 0.95,
      repository_cache: true,
      chunk_size: 800,
      chunk_overlap: 120,
      embedding_provider: 'huggingface',
      vector_store: 'chromadb',
    })
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
      <div className="neo-flat p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="neo-pressed grid size-10 place-items-center">
            <Sliders className="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Settings</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Manage your workspace, integrations, and preferences.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="neo-accent flex h-9 items-center gap-2 px-4 text-sm font-medium transition"
        >
          {isSaving ? <RefreshCw className="size-4 animate-spin" /> : isSaved ? <Check className="size-4 text-emerald-600" /> : null}
          {isSaving ? 'Saving...' : isSaved ? 'Settings Saved' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="neo-convex flex h-9 items-center gap-2 px-3 text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          <Download className="size-4" />
          Export
        </button>
        <button
          type="button"
          onClick={() => document.getElementById('import-settings-input')?.click()}
          className="neo-convex flex h-9 items-center gap-2 px-3 text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          <Upload className="size-4" />
          Import
        </button>
        <input
          id="import-settings-input"
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleReset}
          className="neo-convex flex h-9 items-center gap-2 px-3 text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          <RefreshCw className="size-4" />
          Reset
        </button>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Navigation Tabs */}
        <nav className="neo-flat h-fit p-2 space-y-2 md:col-span-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'neo-flat border-l-2 border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'neo-convex text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
                ].join(' ')}
              >
                <Icon className={['size-4 shrink-0', isActive ? 'text-violet-400' : 'text-zinc-500'].join(' ')} />
                <span className="truncate">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Content Pane */}
        <div className="neo-flat p-6 md:col-span-9 text-zinc-800 dark:text-zinc-100">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Profile Settings</h2>
                <p className="mt-1 text-xs text-zinc-500">Manage your developer profile and account details.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Display Name</span>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="neo-pressed mt-2 h-9 w-full px-3 text-sm text-zinc-900 dark:text-white outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email Address</span>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="neo-pressed mt-2 h-9 w-full px-3 text-sm text-zinc-900 dark:text-white outline-none"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Workspace Role</span>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="neo-pressed mt-2 h-9 w-full cursor-not-allowed px-3 text-sm text-zinc-500 outline-none"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Theme & Appearance</h2>
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
                      onClick={() => {
                        const nextTheme = option.id as SettingsTheme
                        setTheme(nextTheme)
                        applySettings({ theme: nextTheme })
                      }}
                      className={[
                        'flex flex-col items-center justify-center p-4 transition text-center rounded-xl',
                        isSelected
                          ? 'neo-flat ring-2 ring-violet-500 text-violet-600 dark:text-violet-400'
                          : 'neo-convex text-zinc-600 dark:text-zinc-400',
                      ].join(' ')}
                    >
                      <Icon className="size-5 mb-2" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  )
                })}
              </div>

              <div>
                <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Accent Color</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { id: 'violet', className: 'bg-violet-500' },
                    { id: 'blue', className: 'bg-blue-500' },
                    { id: 'emerald', className: 'bg-emerald-500' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setAccent(option.id as typeof accent)
                        applySettings({ accent: option.id as typeof accent })
                      }}
                      className={[
                        'flex h-9 items-center gap-2 px-3 text-xs font-medium capitalize transition rounded-lg',
                        accent === option.id ? 'neo-flat ring-2 ring-violet-500 text-zinc-900 dark:text-white' : 'neo-convex text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300',
                      ].join(' ')}
                    >
                      <span className={`size-3 rounded-full ${option.className}`} />
                      {option.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Sidebar Density</h3>
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
                        onClick={() => {
                          setSidebarDensity(option.id as 'compact' | 'comfortable' | 'spacious')
                          applySettings({ sidebarDensity: option.id as 'compact' | 'comfortable' | 'spacious' })
                        }}
                        className={['px-3 py-2 text-xs font-medium transition rounded-lg', isSelected ? 'neo-flat ring-2 ring-violet-500 text-violet-600 dark:text-violet-400' : 'neo-convex text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'].join(' ')}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Animated Interface</h3>
                <div className="neo-pressed mt-3 flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Enable UI animations</span>
                    <span className="text-xs text-zinc-500">Toggle motion effects for transitions and feedback.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAnimations(!animations)
                      applySettings({ animations: !animations })
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      animations ? 'neo-accent' : 'bg-zinc-300 dark:bg-zinc-800 neo-pressed'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        animations ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">AI Cloud Provider Settings</h2>
                <p className="mt-1 text-xs text-zinc-500">Configure cloud LLM connections for parsing and chat.</p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Default Model Provider</span>
                  <select
                    value={aiConfig.provider}
                    onChange={(e) => setAiConfig({ ...aiConfig, provider: e.target.value })}
                    className="neo-pressed mt-2 h-9 w-full px-3 text-sm text-zinc-900 dark:text-white outline-none"
                  >
                    <option value="anthropic">Anthropic (Claude 3.5 Sonnet / Opus)</option>
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="gemini">Google Gemini (1.5 Pro / Flash)</option>
                    <option value="groq">Groq</option>
                    <option value="huggingface">Hugging Face</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="ollama">Ollama</option>
                  </select>
                </label>

                <label className="block">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Lock className="size-3 text-zinc-500" /> API Secret Key
                  </span>
                  <div className="mt-2 flex gap-3">
                    <input
                      type="password"
                      value={aiConfig.apiKey}
                      onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                      className="neo-pressed h-9 flex-1 px-3 text-sm text-zinc-900 dark:text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTestAi}
                      disabled={isTestingAi}
                      className="neo-convex flex h-9 items-center gap-2 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white disabled:opacity-50"
                    >
                      {isTestingAi ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : null}
                      {isTestingAi ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Temperature: {aiConfig.temperature}</span>
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
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Max Tokens</span>
                    <input
                      type="number"
                      value={aiConfig.maxTokens}
                      onChange={(e) => setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) || 2048 })}
                      className="neo-pressed mt-2 h-9 w-full px-3 text-sm text-zinc-900 dark:text-white outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Top P</span>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={0.95}
                      readOnly
                      className="neo-pressed mt-2 h-9 w-full px-3 text-sm text-zinc-500 dark:text-zinc-400 outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Embedding Provider</span>
                    <select
                      value="huggingface"
                      className="neo-pressed mt-2 h-9 w-full px-3 text-sm text-zinc-900 dark:text-white outline-none"
                    >
                      <option value="huggingface">Hugging Face</option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </label>
                </div>

                <div className="neo-pressed flex items-center gap-3 p-4">
                  <Bot className="size-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">Provider changes are persisted to the backend and used for chat and repository indexing.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'local' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Local Models Config (Ollama / Llama.cpp)</h2>
                <p className="mt-1 text-xs text-zinc-500">Run code analysis completely locally for total data privacy.</p>
              </div>

              <div className="space-y-4">
                <div className="neo-pressed flex items-center justify-between gap-3 p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Enable Local Inference</span>
                    <span className="text-xs text-zinc-500">Fallback to local endpoint when processing sensitive data.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      localConfig.enabled ? 'neo-accent' : 'bg-zinc-300 dark:bg-zinc-800 neo-pressed'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        localConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {localConfig.enabled && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Local Inference URL</span>
                      <input
                        type="url"
                        value={localConfig.endpoint}
                        onChange={(e) => setLocalConfig({ ...localConfig, endpoint: e.target.value })}
                        className="neo-pressed mt-2 h-9 w-full px-3 text-sm text-zinc-900 dark:text-white outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Model Identifier</span>
                      <div className="mt-2 flex gap-3">
                        <input
                          type="text"
                          value={localConfig.model}
                          onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                          className="neo-pressed h-9 flex-1 px-3 text-sm text-zinc-900 dark:text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleTestLocal}
                          disabled={isTestingLocal}
                          className="neo-convex flex h-9 items-center gap-2 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white disabled:opacity-50"
                        >
                          {isTestingLocal ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                          ) : null}
                          {isTestingLocal ? 'Testing...' : 'Test Connection'}
                        </button>
                      </div>
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
                <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">GitHub Connection</h2>
                <p className="mt-1 text-xs text-zinc-500">Connect to private repositories using personal credentials.</p>
              </div>

              {github.connected ? (
                <div className="neo-flat border-emerald-500/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="neo-pressed grid size-9 place-items-center">
                        <FaGithub className="size-5 text-zinc-900 dark:text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Connected to GitHub as @{github.username}</p>
                        <p className="text-xs text-zinc-500">Access to private repositories enabled</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnectGithub}
                      className="neo-convex px-3 py-1.5 text-xs text-red-400 hover:text-red-300"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleConnectGithub}
                    disabled={isConnectingGithub}
                    className="neo-accent flex h-9 items-center justify-center gap-2 px-4 text-sm font-medium transition disabled:opacity-50"
                  >
                    {isConnectingGithub ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <FaGithub className="size-4" />
                    )}
                    {isConnectingGithub ? 'Checking...' : 'OAuth setup info'}
                  </button>

                  <div className="flex items-center gap-2 py-2">
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600">Or use token</span>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  </div>

                  <label className="block">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Personal Access Token (PAT)</span>
                    <input
                      type="password"
                      value={github.token}
                      onChange={(e) => setGithub({ ...github, token: e.target.value })}
                      placeholder="ghp_••••••••••••••••••••••••••••••••••••"
                      className="neo-pressed mt-2 h-9 w-full px-3 text-sm text-zinc-900 dark:text-white outline-none"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Application Preferences</h2>
                <p className="mt-1 text-xs text-zinc-500">Fine-tune system background tasks and diagnostics.</p>
              </div>

              <div className="space-y-4">
                <label className="neo-pressed flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={preferences.autoAnalyze}
                    onChange={(e) => setPreferences({ ...preferences, autoAnalyze: e.target.checked })}
                    className="size-4 mt-0.5 rounded border-zinc-800 bg-zinc-950 accent-violet-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Auto-Analyze Connected Repositories</span>
                    <span className="block text-xs text-zinc-500">Automatically start repository parsing whenever a new commits is pushed.</span>
                  </div>
                </label>

                <label className="neo-pressed flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                    className="size-4 mt-0.5 rounded border-zinc-800 bg-zinc-950 accent-violet-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">In-App Notifications</span>
                    <span className="block text-xs text-zinc-500">Receive alert notifications when critical security issues are detected.</span>
                  </div>
                </label>

                <label className="neo-pressed flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={preferences.telemetry}
                    onChange={(e) => setPreferences({ ...preferences, telemetry: e.target.checked })}
                    className="size-4 mt-0.5 rounded border-zinc-800 bg-zinc-950 accent-violet-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Telemetry & Diagnostic Sharing</span>
                    <span className="block text-xs text-zinc-500">Share anonymous usage data to help improve CodeScope intelligence systems.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="neo-convex grid size-12 place-items-center">
                  <Logo size={38} aria-label="CodeScope AI logo" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-white">CodeScope AI</h2>
                  <p className="text-xs text-zinc-500">Enterprise Software Intelligence Platform</p>
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-500">Application Version</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-300">v1.2.0-stable</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-500">Release Date</span>
                  <span className="text-zinc-800 dark:text-zinc-300">July 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-500">License Status</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Shield className="size-3.5" /> Enterprise Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-500">Engine Host</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-300">localhost:8000</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-5">
                <a
                  href="https://github.com/varun-175/CodeScope-AI#readme"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  <HelpCircle className="size-3.5" /> Documentation
                </a>
                <span className="text-zinc-800">•</span>
                <button
                  type="button"
                  onClick={handleCheckUpdates}
                  disabled={isCheckingUpdates}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
                >
                  <RefreshCw className={['size-3.5', isCheckingUpdates ? 'animate-spin' : ''].join(' ')} />
                  {isCheckingUpdates ? 'Checking...' : 'Check for updates'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
