import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, importSettings, resetSettings } from './settings'

describe('settings boundary', () => {
  it('starts from independent default values', () => {
    const first = resetSettings()
    first.profile.name = 'Changed'

    const second = resetSettings()

    expect(second.profile.name).toBe(DEFAULT_SETTINGS.profile.name)
    expect(second.ai).not.toBe(first.ai)
  })

  it('normalizes imported values and clamps numeric options', () => {
    const settings = importSettings(JSON.stringify({
      theme: 'invalid',
      accent: 'blue',
      sidebarDensity: 'compact',
      animations: false,
      profile: { name: '  Ada  ' },
      ai: { temperature: 4, maxTokens: 0 },
    }))

    expect(settings.theme).toBe(DEFAULT_SETTINGS.theme)
    expect(settings.accent).toBe('blue')
    expect(settings.sidebarDensity).toBe('compact')
    expect(settings.animations).toBe(false)
    expect(settings.profile.name).toBe('Ada')
    expect(settings.ai.temperature).toBe(1)
    expect(settings.ai.maxTokens).toBe(1)
  })

  it('rejects non-object imports', () => {
    expect(() => importSettings(JSON.stringify(['not', 'settings']))).toThrow('Settings import must contain a JSON object.')
  })
})
