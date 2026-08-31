import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnalyzeRepositoryModal } from '../components/analysis/AnalyzeRepositoryModal'
import { Sidebar } from '../components/layout/Sidebar'
import { TopNav } from '../components/layout/TopNav'
import { RepositoryContextBar } from '../components/layout/RepositoryContextBar'
import { CommandPalette } from '../components/layout/CommandPalette'
import { IntelligencePanel } from '../components/layout/IntelligencePanel'
import { RepositoryAnalysisProvider } from '../contexts/RepositoryAnalysisContext'

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isIntelligencePanelOpen, setIsIntelligencePanelOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandPaletteOpen(true)
      }
      if (event.key === 'Escape') {
        setIsCommandPaletteOpen(false)
        setIsIntelligencePanelOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <RepositoryAnalysisProvider>
      <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div
          className={
            isSidebarCollapsed
              ? 'min-h-screen transition-[padding] duration-200 lg:pl-20'
              : 'min-h-screen transition-[padding] duration-200 lg:pl-64'
          }
        >
          <TopNav
            isSidebarCollapsed={isSidebarCollapsed}
            onMenuClick={() => setIsSidebarOpen(true)}
            onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenIntelligencePanel={() => setIsIntelligencePanelOpen(true)}
          />

          <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl animate-fade-in-up">
              <RepositoryContextBar />
              <Outlet />
            </div>
          </main>
        </div>

        <AnalyzeRepositoryModal />
        <CommandPalette open={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
        {isIntelligencePanelOpen ? <IntelligencePanel onClose={() => setIsIntelligencePanelOpen(false)} /> : null}
      </div>
    </RepositoryAnalysisProvider>
  )
}
