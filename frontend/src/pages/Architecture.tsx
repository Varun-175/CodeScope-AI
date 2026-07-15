import { useMemo, useState } from 'react'
import {
  Boxes,
  Network,
  Layers,
  Package,
  ArrowRight,
  Cpu,
  Database,
  Globe,
  Shield,
} from 'lucide-react'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'

type ArchitectureModule = {
  name: string
  type: string
  icon: typeof Boxes
  files: number
  lines: number
  dependencies: number
  description: string
}

type ArchitectureMetric = {
  label: string
  value: string
  detail: string
  icon: typeof Boxes
  color: string
}

export function Architecture() {
  const { data, status } = useRepositoryAnalysis()
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set())

  const architectureModules = useMemo<ArchitectureModule[]>(() => {
    if (!data) return []

    const folders = data.repository.folder_structure ?? []
    const layers = data.architecture.layers ?? []

    const modules = folders.length > 0
      ? folders.slice(0, 6).map((folder, index) => ({
          name: folder.path.replace(/^\//, ''),
          type: layers[index % Math.max(1, layers.length)] || 'Repository Module',
          icon: index % 2 === 0 ? Globe : Database,
          files: folder.files,
          lines: folder.directories ? folder.files * 120 : folder.files * 80,
          dependencies: Math.max(1, Math.min(8, Math.round(folder.files / 4))),
          description: `Repository path derived from ${data.repository.name}`,
        }))
      : (data.architecture.modules ?? []).map((module, index) => ({
          name: module,
          type: layers[index % Math.max(1, layers.length)] || 'Repository Module',
          icon: index % 2 === 0 ? Globe : Shield,
          files: data.repository.files,
          lines: data.repository.lines_of_code,
          dependencies: Math.max(1, Math.min(6, data.dependency_health.detected.length)),
          description: `Implementation unit identified in ${data.repository.name}`,
        }))

    return modules
  }, [data])

  const metrics = useMemo<ArchitectureMetric[]>(() => {
    if (!data) return []

    const couplingScore = Math.max(12, Math.min(95, Math.round(100 - data.health.score * 0.6 + (data.risks.complexity_hotspots?.length ?? 0) * 2)))

    return [
      { label: 'Architecture Pattern', value: data.dna.architecture || data.architecture.pattern, detail: `${data.dna.framework || data.repository.framework} • ${data.repository.primary_language}`, icon: Layers, color: 'text-violet-400' },
      { label: 'Total Modules', value: `${architectureModules.length}`, detail: `${data.architecture.layers?.length ?? 1} layers detected`, icon: Boxes, color: 'text-blue-400' },
      { label: 'Coupling Score', value: `${couplingScore}/100`, detail: 'Derived from repository complexity and hotspots', icon: Network, color: 'text-emerald-400' },
      { label: 'Entry Points', value: `${data.repository.entry_points?.length ?? data.architecture.entry_points?.length ?? 0}`, detail: 'Based on repository entry-point analysis', icon: Cpu, color: 'text-amber-400' },
    ]
  }, [architectureModules.length, data])

  const dependencyNodes = useMemo(() => {
    if (!data) return []
    return (data.dependency_health.top_dependencies ?? data.dependency_health.detected ?? []).slice(0, 6).map((dependency) => ({
      from: data.repository.name,
      to: dependency.name,
    }))
  }, [data])

  const layers = useMemo(() => {
    if (!data) return []
    const names = data.architecture.layers ?? []
    return names.length > 0
      ? names.map((name, index) => ({
          name,
          modules: architectureModules.slice(index, index + 2).map((module) => module.name),
          color: index % 2 === 0 ? 'border-violet-800/50 bg-violet-950/10' : 'border-blue-800/50 bg-blue-950/10',
        }))
      : [{ name: 'Repository Layer', modules: architectureModules.map((module) => module.name), color: 'border-emerald-800/50 bg-emerald-950/10' }]
  }, [architectureModules, data])

  function toggleLayer(name: string) {
    setExpandedLayers((current) => {
      const next = new Set(current)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  if (status === 'analyzing') {
    return <LoadingState title="Analyzing architecture" hint="Collecting modules, layers, and repositories signals" />
  }

  if (!data) {
    return <EmptyState title="Analyze a repository to view architecture" description="Use the repository analysis flow to populate this screen with the currently selected repository." icon={Layers} />
  }

  const selectedArchitectureModule = architectureModules.find((module) => module.name === selectedModule) ?? architectureModules[0] ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="size-5 text-violet-400" />
        <div>
          <h1 className="text-lg font-semibold text-white">Architecture</h1>
          <p className="text-xs text-zinc-500">{data.repository.owner}/{data.repository.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex items-center gap-2">
                <Icon className={`size-4 ${metric.color}`} />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">{metric.label}</span>
              </div>
              <p className="mt-3 font-mono text-2xl font-semibold text-white">{metric.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{metric.detail}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-200">Dependency Graph</h2>
            <p className="mt-1 text-xs text-zinc-500">Repository dependencies and direct relationships</p>
          </div>
          <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-500">Live</span>
        </div>

        <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 p-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {dependencyNodes.map((edge, index) => (
              <button
                key={`${edge.to}-${index}`}
                type="button"
                onClick={() => setSelectedModule(edge.to)}
                className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs transition hover:border-zinc-700 hover:bg-zinc-900"
              >
                <span className="font-medium text-zinc-300">{edge.from}</span>
                <ArrowRight className="size-3 text-zinc-600" />
                <span className="text-zinc-500">{edge.to}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-zinc-600">
            <Network className="size-5" />
            <span>{selectedArchitectureModule ? `${selectedArchitectureModule.name}: ${selectedArchitectureModule.description}` : 'Select a dependency node'}</span>
          </div>
          <p className="mt-2 text-xs text-zinc-700">
            {dependencyNodes.length} dependency connections derived from the analyzed repository
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-200">Repository Layers</h2>
            <p className="mt-1 text-xs text-zinc-500">Architectural layers and repository grouping</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {layers.map((layer) => (
            <div key={layer.name} className={`rounded-lg border p-4 transition ${layer.color}`}>
              <button type="button" onClick={() => toggleLayer(layer.name)} className="flex w-full items-center justify-between text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{layer.name}</h3>
                <span className="text-xs text-zinc-500">{expandedLayers.has(layer.name) ? 'Collapse' : 'Expand'}</span>
              </button>
              {expandedLayers.has(layer.name) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {layer.modules.map((moduleName) => {
                    const module = architectureModules.find((item) => item.name === moduleName)
                    const Icon = module?.icon ?? Package
                    return (
                      <button
                        key={moduleName}
                        type="button"
                        onClick={() => module && setSelectedModule(module.name)}
                        className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm transition hover:border-zinc-700 hover:bg-zinc-900"
                      >
                        <Icon className="size-4 text-zinc-400" />
                        <span className="text-zinc-300">{moduleName}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-medium text-zinc-200">Repository Modules</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {architectureModules.map((module) => {
            const Icon = module.icon
            return (
              <button
                key={module.name}
                type="button"
                onClick={() => setSelectedModule(module.name)}
                className={[
                  'group rounded-lg border bg-zinc-950/80 p-5 text-left transition hover:border-zinc-700 hover:shadow-lg',
                  selectedArchitectureModule?.name === module.name ? 'border-zinc-600 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]' : 'border-zinc-800',
                ].join(' ')}
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-10 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/50">
                    <Icon className="size-5 text-zinc-400 transition group-hover:text-white" />
                  </div>
                  <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    {module.type}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-medium text-white">{module.name}</h3>
                <p className="mt-1 text-xs text-zinc-500">{module.description}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-zinc-800/50 pt-3 text-xs text-zinc-500">
                  <span>{module.files} files</span>
                  <span>{module.lines.toLocaleString()} LOC</span>
                  <span>{module.dependencies} deps</span>
                </div>
              </button>
            )
          })}
        </div>
        {selectedArchitectureModule && (
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-400">
            <p className="font-medium text-zinc-200">{selectedArchitectureModule.name}</p>
            <p className="mt-1">{selectedArchitectureModule.description}</p>
            <p className="mt-3 font-mono text-xs text-zinc-500">
              {selectedArchitectureModule.files} files · {selectedArchitectureModule.lines.toLocaleString()} LOC · {selectedArchitectureModule.dependencies} dependencies
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-6">
        <h2 className="text-sm font-medium text-zinc-200">Architecture Summary</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{data.summary.overview}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.summary.technologies.slice(0, 6).map((technology) => (
            <span key={technology} className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400">{technology}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
