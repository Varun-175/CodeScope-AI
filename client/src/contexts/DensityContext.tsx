import React, { createContext, useContext, useEffect, useState } from 'react'

export type DisplayDensity = 'comfortable' | 'compact' | 'ultra-compact'

interface DensityContextType {
  density: DisplayDensity
  setDensity: (density: DisplayDensity) => void
  densityPadding: string
  densityGap: string
  densityText: string
}

const DensityContext = createContext<DensityContextType | undefined>(undefined)

const STORAGE_KEY = 'codescope_display_density'

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<DisplayDensity>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as DisplayDensity
      if (saved && ['comfortable', 'compact', 'ultra-compact'].includes(saved)) {
        return saved
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return 'comfortable'
  })

  const setDensity = (newDensity: DisplayDensity) => {
    setDensityState(newDensity)
    try {
      localStorage.setItem(STORAGE_KEY, newDensity)
    } catch {
      // Ignore write errors
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
  }, [density])

  const densityPadding =
    density === 'ultra-compact'
      ? 'p-1.5'
      : density === 'compact'
        ? 'p-2.5'
        : 'p-4'

  const densityGap =
    density === 'ultra-compact'
      ? 'gap-1.5'
      : density === 'compact'
        ? 'gap-2.5'
        : 'gap-4'

  const densityText =
    density === 'ultra-compact'
      ? 'text-xs'
      : density === 'compact'
        ? 'text-xs'
        : 'text-sm'

  return (
    <DensityContext.Provider
      value={{
        density,
        setDensity,
        densityPadding,
        densityGap,
        densityText,
      }}
    >
      {children}
    </DensityContext.Provider>
  )
}

export function useDensity() {
  const context = useContext(DensityContext)
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider')
  }
  return context
}
