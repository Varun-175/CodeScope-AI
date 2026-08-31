import { useMemo, useState } from 'react'
import {
  Boxes,
  Network,
  Layers,
  Package,
  Cpu,
  Database,
  Globe,
  Shield,
  Search,
} from 'lucide-react'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'
import { DependencyConstellation } from '../components/analysis/DependencyConstellation'

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
  const { data, error, status } = useRepositoryAnalysis()
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set())
  const [moduleQuery, setModuleQuery] = useState('')
  const [layerFilter, setLayerFilter] = useState('all')

  const architectureModules = useMemo<ArchitectureModule[]>(() => {
    if (!data) return []

    const folders = data.repository.folder_structure ?? []
    const layers = data.architecture.layers ?? []
    const directoryMetrics = data.repository.directory_metrics ?? []

    const modules = folders.length > 0
      ? folders.slice(0, 6).map((folder, index) => ({
          name: folder.path.replace(/^\//, ''),
          type: layers[index % Math.max(1, layers.length)] || 'Repository Module',
          icon: index % 2 === 0 ? Globe : Database,
          files: folder.files,
          lines: directoryMetrics.find((metric) => metric.path === folder.path)?.lines ?? 0,
          dependencies: 0,
          description: 'Repository module identified from the analyzed folder structure',
        }))
      : (data.architecture.modules ?? []).map((module, index) => ({
          name: module,
          type: layers[index % Math.max(1, layers.length)] || 'Repository Module',
          icon: index % 2 === 0 ? Globe : Shield,
          files: data.repository.files,
          lines: data.repository.lines_of_code,
          dependencies: 0,
          description: 'Implementation unit identified by the repository analyzer',
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

  const dependencies = useMemo(() => {
    if (!data) return []
    return (data.dependency_health.top_dependencies ?? data.dependency_health.detected ?? []).slice(0, 6)
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
  const visibleModules = architectureModules.filter((module) => {
    const matchesQuery = module.name.toLowerCase().includes(moduleQuery.toLowerCase()) || module.type.toLowerCase().includes(moduleQuery.toLowerCase())
    const matchesLayer = layerFilter === 'all' || module.type === layerFilter
    return matchesQuery && matchesLayer
  })

  return (
    <div className="space-y-6">
      {error ? <ErrorState title="Latest analysis failed" description="Showing the last completed architecture snapshot. Run another analysis to refresh these signals." /> : null}
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
            <div key={metric.label} className="neo-flat p-5">
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

      <div className="neo-flat p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-200">Dependency Constellation</h2>
            <p className="mt-1 text-xs text-zinc-500">A high-level spatial view of the analyzed dependency surface</p>
          </div>
          <span className="border border-amber-500/30 px-2.5 py-1 text-xs text-amber-400">Snapshot</span>
        </div>

        <div className="mt-6">
          {dependencies.length > 0 ? (
            <DependencyConstellation repositoryName={data.repository.name} dependencies={dependencies} onSelect={setSelectedModule} />
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-zinc-600">
              <Network className="size-6" aria-hidden="true" />
              <p className="mt-3 text-xs">No dependency relationships were detected</p>
              <p className="mt-1 text-[10px] text-zinc-700">Run analysis again after adding repository dependency metadata.</p>
            </div>
          )}
        </div>
        <div className="mt-4 border-t border-zinc-800/70 pt-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Accessible dependency list</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-500">
              <caption className="sr-only">Dependencies detected in the current repository snapshot</caption>
              <thead><tr className="border-b border-zinc-800/70 text-[10px] uppercase tracking-wider text-zinc-600"><th className="px-2 py-2 font-medium">Package</th><th className="px-2 py-2 font-medium">Version</th><th className="px-2 py-2 font-medium">Source</th></tr></thead>
              <tbody>{dependencies.map((dependency) => <tr key={`${dependency.name}-${dependency.version}`} className="border-b border-zinc-900/70"><td className="px-2 py-2 font-mono text-zinc-300">{dependency.name}</td><td className="px-2 py-2 font-mono">{dependency.version || 'Unknown'}</td><td className="px-2 py-2">{dependency.source || 'Analyzer'}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="neo-flat p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-200">Repository Layers</h2>
            <p className="mt-1 text-xs text-zinc-500">Architectural layers and repository grouping</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {layers.map((layer) => (
            <div key={layer.name} className={`neo-pressed p-4 transition ${layer.color.replace('border-', 'ring-1 ring-').replace('bg-', '')}`}>
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
                        className="neo-convex flex items-center gap-2 px-3 py-2 text-sm transition"
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
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><h2 className="text-sm font-medium text-zinc-200">Repository Modules</h2><p className="mt-1 text-xs text-zinc-500">Search and inspect analyzer-identified modules</p></div>
          <div className="flex gap-2">
            <label className="neo-pressed flex items-center gap-2 px-3 py-2"><Search className="size-3.5 text-zinc-600" aria-hidden="true" /><span className="sr-only">Search modules</span><input value={moduleQuery} onChange={(event) => setModuleQuery(event.target.value)} placeholder="Search modules" className="w-32 bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-700" /></label>
            <label className="sr-only" htmlFor="architecture-layer-filter">Filter architecture layer</label><select id="architecture-layer-filter" value={layerFilter} onChange={(event) => setLayerFilter(event.target.value)} className="neo-pressed px-2 py-2 text-xs text-zinc-400 outline-none"><option value="all">All layers</option>{(data.architecture.layers ?? []).map((layer) => <option key={layer} value={layer}>{layer}</option>)}</select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleModules.map((module) => {
            const Icon = module.icon
            return (
              <button
                key={module.name}
                type="button"
                onClick={() => setSelectedModule(module.name)}
                className={[
                  'group p-5 text-left transition',
                  selectedArchitectureModule?.name === module.name ? 'neo-pressed ring-1 ring-violet-500/50' : 'neo-convex',
                ].join(' ')}
              >
                <div className="flex items-start justify-between">
                  <div className="neo-pressed grid size-10 place-items-center">
                    <Icon className="size-5 text-zinc-400 transition group-hover:text-white" />
                  </div>
                  <span className="neo-pressed px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
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
        {visibleModules.length === 0 && <p className="neo-pressed p-6 text-center text-xs text-zinc-600">No modules match the current filters.</p>}
        {selectedArchitectureModule && (
          <div className="neo-pressed mt-4 p-4 text-sm text-zinc-400">
            <p className="font-medium text-zinc-200">{selectedArchitectureModule.name}</p>
            <p className="mt-1">{selectedArchitectureModule.description}</p>
            <p className="mt-3 font-mono text-xs text-zinc-500">
              {selectedArchitectureModule.files} files · {selectedArchitectureModule.lines.toLocaleString()} LOC · {selectedArchitectureModule.dependencies} dependencies
            </p>
          </div>
        )}
      </div>

      <div className="neo-flat p-6">
        <h2 className="text-sm font-medium text-zinc-200">Architecture Summary</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{data.summary.overview}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.summary.technologies.slice(0, 6).map((technology) => (
            <span key={technology} className="neo-convex px-2.5 py-1 text-xs text-zinc-400">{technology}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
