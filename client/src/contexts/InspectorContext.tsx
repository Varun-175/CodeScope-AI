import React, { createContext, useContext, useState } from 'react'

export type InspectedNodeType =
  | 'service'
  | 'symbol'
  | 'file'
  | 'commit'
  | 'api'
  | 'database'
  | 'queue'
  | 'dependency'
  | 'test'
  | 'deployment'
  | 'environment'
  | 'incident'
  | 'entity'

export interface InspectedEntity {
  id: string
  name: string
  type: InspectedNodeType
  description?: string
  status?: 'healthy' | 'warning' | 'danger' | 'unknown' | 'stale'
  file?: string
  layer?: string
  metrics?: Record<string, string | number>
  edges?: {
    type: 'imports' | 'calls' | 'depends_on' | 'exposes' | 'consumes' | 'tests' | 'deployed_as' | 'changed_by' | 'affected_by' | 'failed_in' | 'introduced_by'
    target: string
    targetType: InspectedNodeType
  }[]
  evidence?: {
    structural?: string[]
    source?: string[]
    historical?: string[]
    test?: string[]
    deployment?: string[]
    runtime?: string[]
  }
  recommendations?: string[]
}

interface InspectorContextType {
  isOpen: boolean
  entity: InspectedEntity | null
  activeTab: 'overview' | 'edges' | 'evidence' | 'actions'
  setActiveTab: (tab: 'overview' | 'edges' | 'evidence' | 'actions') => void
  openInspector: (entity: InspectedEntity) => void
  closeInspector: () => void
}

const InspectorContext = createContext<InspectorContextType | undefined>(undefined)

export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [entity, setEntity] = useState<InspectedEntity | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'edges' | 'evidence' | 'actions'>('overview')

  const openInspector = (newEntity: InspectedEntity) => {
    setEntity(newEntity)
    setIsOpen(true)
    setActiveTab('overview')
  }

  const closeInspector = () => {
    setIsOpen(false)
  }

  return (
    <InspectorContext.Provider
      value={{
        isOpen,
        entity,
        activeTab,
        setActiveTab,
        openInspector,
        closeInspector,
      }}
    >
      {children}
    </InspectorContext.Provider>
  )
}

export function useInspector() {
  const context = useContext(InspectorContext)
  if (!context) {
    throw new Error('useInspector must be used within an InspectorProvider')
  }
  return context
}
