import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { TopNav } from '../components/layout/TopNav'

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
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
        />

        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
