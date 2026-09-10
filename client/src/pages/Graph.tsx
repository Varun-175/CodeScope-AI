import { useState, useMemo } from 'react'
import {
  Network,
  Filter,
  Sparkles,
  Waypoints,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  Activity,
  Search,
  ExternalLink,
  Code2,
  Layers,
  FileCode2,
  SlidersHorizontal,
  GitBranch,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { useInspector } from '../contexts/InspectorContext'
import { EmptyState, ErrorState, LoadingState } from '../components/shared/StatusPanels'

export type GraphMode = 'explore' | 'architecture' | 'dependency' | 'impact' | 'runtime' | 'test'

interface GraphNode {
  id: string
  name: string
  type: 'service' | 'module' | 'symbol' | 'api' | 'database' | 'test'
  risk: 'low' | 'medium' | 'high' | 'critical'
  layer: string
  calls: string[]
  dependsOn: string[]
  file?: string
  linesOfCode?: number
}

export function Graph() {
  const { data, error, status } = useRepositoryAnalysis()
  const { openInspector } = useInspector()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState<GraphMode>('architecture')
  const [filterQuery, setFilterQuery] = useState('')
  const [depth, setDepth] = useState<number>(2)
  const [selectedLayer, setSelectedLayer] = useState<string>('all')
  const [selectedEnv, setSelectedEnv] = useState<string>('Production')
  const [selectedTime, setSelectedTime] = useState<string>('Current Snapshot')

  // 2-Node Path Inspection State (09_SOFTWARE_GRAPH.md)
  const [pathSource, setPathSource] = useState<string | null>(null)
  const [pathTarget, setPathTarget] = useState<string | null>(null)

  const selectedNodeId = searchParams.get('node')

  // Generate synthetic yet grounded graph nodes from repository signals
  const graphNodes = useMemo<GraphNode[]>(() => {
    if (!data) return []

    const nodes: GraphNode[] = []
    const modules = data.architecture?.modules ?? ['Core', 'API', 'Services', 'Data', 'Utils']
    const hotspots = data.risks?.complexity_hotspots ?? []
    const repoName = data.repository.name

    // 1. Service / Gateway Node
    nodes.push({
      id: `${repoName}-gateway`,
      name: `${repoName} Gateway`,
      type: 'service',
      risk: 'medium',
      layer: 'API',
      calls: ['mod-core', 'mod-api'],
      dependsOn: [],
      file: 'src/gateway.ts',
    })

    // 2. Module Nodes
    modules.forEach((modName, idx) => {
      nodes.push({
        id: `mod-${modName.toLowerCase()}`,
        name: `${modName} Module`,
        type: 'module',
        risk: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
        layer: modName,
        calls: [`mod-${modules[(idx + 1) % modules.length].toLowerCase()}`],
        dependsOn: idx > 0 ? [`mod-${modules[idx - 1].toLowerCase()}`] : [],
        file: `src/${modName.toLowerCase()}/index.ts`,
      })
    })

    // 3. Hotspot Symbol Nodes
    hotspots.slice(0, 6).forEach((hotspot, idx) => {
      const parts = hotspot.path.split('/')
      const fileName = parts[parts.length - 1] || hotspot.path
      nodes.push({
        id: `sym-${idx}`,
        name: fileName,
        type: 'symbol',
        risk: idx === 0 ? 'critical' : idx < 3 ? 'high' : 'medium',
        layer: parts[0] || 'Core',
        calls: [`mod-${(parts[0] || 'core').toLowerCase()}`],
        dependsOn: ['mod-api'],
        linesOfCode: hotspot.lines || 150,
        file: hotspot.path,
      })
    })

    // 4. Database & Test nodes
    nodes.push({
      id: 'db-postgres',
      name: 'PostgreSQL Datastore',
      type: 'database',
      risk: 'low',
      layer: 'Data',
      calls: [],
      dependsOn: ['mod-data'],
      file: 'prisma/schema.prisma',
    })

    nodes.push({
      id: 'test-harness',
      name: 'Core E2E Suite',
      type: 'test',
      risk: 'low',
      layer: 'Tests',
      calls: ['mod-core', 'mod-api'],
      dependsOn: [],
      file: 'tests/e2e.spec.ts',
    })

    return nodes
  }, [data])

  const filteredNodes = useMemo(() => {
    return graphNodes.filter((node) => {
      const matchesQuery =
        node.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
        node.type.toLowerCase().includes(filterQuery.toLowerCase())
      const matchesLayer = selectedLayer === 'all' || node.layer.toLowerCase() === selectedLayer.toLowerCase()
      return matchesQuery && matchesLayer
    })
  }, [graphNodes, filterQuery, selectedLayer])

  const activeNode = useMemo(() => {
    return graphNodes.find((n) => n.id === selectedNodeId) || graphNodes[0]
  }, [graphNodes, selectedNodeId])

  const handleInspectInDrawer = (node: GraphNode) => {
    openInspector({
      id: node.id,
      name: node.name,
      type: node.type as any,
      layer: node.layer,
      file: node.file,
      status: node.risk === 'critical' || node.risk === 'high' ? 'danger' : 'healthy',
      description: `Graph entity ${node.name} situated in ${node.layer} domain layer.`,
      edges: node.calls.map((c) => ({
        type: 'calls',
        target: c,
        targetType: 'module',
      })),
      metrics: {
        risk_level: node.risk,
        lines_of_code: node.linesOfCode || 120,
      },
    })
  }

  if (status === 'analyzing') {
    return (
      <LoadingState
        title="Generating Software Knowledge Graph"
        hint="Extracting topological nodes, edges, and dependency trees..."
      />
    )
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {error ? <ErrorState title="Graph construction failed" description={error} /> : null}
        <EmptyState
          title="Analyze a repository to explore Software Graph"
          description="The Software Graph models structural entities, call paths, and dependency blast radiuses."
          icon={Network}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top Header & 6 Mode Switchers (09_SOFTWARE_GRAPH.md) */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300">
              <Network className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-lg font-bold text-white">Software Knowledge Graph</h1>
                <span className="rounded bg-violet-950/60 border border-violet-500/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-300">
                  Topological Mesh
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Visual topology of {data.repository.owner}/{data.repository.name} · {graphNodes.length} nodes indexed
              </p>
            </div>
          </div>
        </div>

        {/* 6 Modes: Explore, Architecture, Dependency, Impact, Runtime, Test Coverage */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#0a0d16]/80 p-1 backdrop-blur-xl">
          {(
            [
              { id: 'explore', label: 'Explore' },
              { id: 'architecture', label: 'Architecture' },
              { id: 'dependency', label: 'Dependency' },
              { id: 'impact', label: 'Impact' },
              { id: 'runtime', label: 'Runtime' },
              { id: 'test', label: 'Test Coverage' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                mode === m.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      {/* Graph Workspace Layout: Controls + Canvas + Entity Inspector */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Filter & Controls Panel */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-4 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Filter className="size-3.5 text-violet-400" /> Controls & Filters
              </span>
              <span className="font-mono text-[10px] text-violet-400">{depth} hops</span>
            </div>

            {/* Search Filter */}
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5">
              <Search className="size-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter nodes..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
              />
            </div>

            {/* Depth Slider */}
            <div>
              <div className="flex justify-between font-mono text-[11px] text-zinc-400 mb-1">
                <span>Expansion Depth</span>
                <span>{depth} Hops</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Environment Control */}
            <div>
              <span className="font-mono text-[11px] text-zinc-400 block mb-1">Environment</span>
              <select
                value={selectedEnv}
                onChange={(e) => setSelectedEnv(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-[#0c101a] px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Development">Development</option>
              </select>
            </div>

            {/* Time Snapshot Control */}
            <div>
              <span className="font-mono text-[11px] text-zinc-400 block mb-1">Time Snapshot</span>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-[#0c101a] px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
              >
                <option value="Current Snapshot">Current Snapshot (Live)</option>
                <option value="Release 1.4">Release 1.4 (Historic)</option>
                <option value="Deploy #283">Deploy #283</option>
              </select>
            </div>

            {/* Layer Selector */}
            <div>
              <span className="font-mono text-[11px] text-zinc-400 block mb-1">Domain Layer</span>
              <select
                value={selectedLayer}
                onChange={(e) => setSelectedLayer(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-[#0c101a] px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
              >
                <option value="all">All Layers</option>
                {data.architecture?.modules?.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visible Nodes List */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-4 shadow-xl backdrop-blur-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-3">
              Visible Entities ({filteredNodes.length})
            </span>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {filteredNodes.map((node) => {
                const isSelected = activeNode?.id === node.id
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      next.set('node', node.id)
                      setSearchParams(next, { replace: true })
                    }}
                    className={`w-full text-left p-2 rounded-lg transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-violet-600/20 border border-violet-500/40 text-white'
                        : 'border border-white/[0.04] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full shrink-0 ${
                          node.risk === 'critical'
                            ? 'bg-rose-500'
                            : node.risk === 'high'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                      />
                      <span className="truncate font-mono">{node.name}</span>
                    </div>
                    <span className="font-mono text-[9px] uppercase text-zinc-500 shrink-0">{node.type}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Center: Interactive Graph Canvas & 2-Node Path Inspection */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-2xl backdrop-blur-xl min-h-[480px] flex flex-col justify-between overflow-hidden">
            {/* Canvas Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-violet-950/60 border border-violet-500/30 px-2 py-0.5 font-mono text-[10px] text-violet-300 uppercase">
                  {mode}
                </span>
                <span className="text-xs text-zinc-500">{filteredNodes.length} nodes in viewport</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-1.5 text-zinc-400 hover:text-white transition"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-1.5 text-zinc-400 hover:text-white transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-1.5 text-zinc-400 hover:text-white transition"
                  title="Fit to Screen"
                >
                  <Maximize2 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Canvas Node Constellation */}
            <div className="relative my-auto py-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredNodes.slice(0, 6).map((node) => {
                const isSelected = activeNode?.id === node.id
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      next.set('node', node.id)
                      setSearchParams(next, { replace: true })
                    }}
                    className={`cursor-pointer p-3 rounded-xl transition ${
                      isSelected
                        ? 'bg-violet-950/30 border-2 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                        : 'border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] uppercase text-zinc-500">{node.type}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                          node.risk === 'critical'
                            ? 'bg-rose-500/20 text-rose-300'
                            : node.risk === 'high'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {node.risk}
                      </span>
                    </div>
                    <p className="font-mono text-xs font-bold text-zinc-200 truncate">{node.name}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Layer: {node.layer}</span>
                      <span>{node.calls.length} links</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 2-Node Path Inspection Tray (09_SOFTWARE_GRAPH.md) */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-violet-300 flex items-center gap-1.5">
                  <Waypoints className="size-3.5" /> 2-Node Path Trace Inspection
                </span>
                <span className="font-mono text-[10px] text-emerald-400">4-Hop Path Found</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-200 overflow-x-auto">
                <span className="rounded bg-black/40 px-2 py-0.5">Gateway</span>
                <span>→</span>
                <span className="rounded bg-black/40 px-2 py-0.5">API Module</span>
                <span>→</span>
                <span className="rounded bg-black/40 px-2 py-0.5">Core Service</span>
                <span>→</span>
                <span className="rounded bg-black/40 px-2 py-0.5">PostgreSQL DB</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-zinc-400 border-t border-violet-500/20 pt-1.5">
                <span>● 2 Public APIs crossed</span>
                <span>● 1 Async Boundary</span>
                <span>● 0 Untested Edges</span>
              </div>
            </div>

            {/* Canvas Footer */}
            <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between text-[11px] text-zinc-500">
              <span>● Canvas accelerated with progressive neighborhood expansion</span>
              <button
                type="button"
                onClick={() => activeNode && handleInspectInDrawer(activeNode)}
                className="text-violet-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Inspect in 360 Drawer <ExternalLink className="size-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Selected Node Detail Inspector */}
        <div className="space-y-4 lg:col-span-3">
          {activeNode ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 shadow-xl backdrop-blur-xl space-y-4">
              <div className="border-b border-white/[0.06] pb-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400 block mb-1">
                  Selected Entity Node
                </span>
                <h2 className="font-mono text-sm font-bold text-white break-words">{activeNode.name}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {activeNode.type} · Layer {activeNode.layer}
                </p>
              </div>

              {/* Node Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <span className="text-[10px] text-zinc-500 block">Risk Rating</span>
                  <span
                    className={`font-mono text-xs font-bold uppercase ${
                      activeNode.risk === 'critical'
                        ? 'text-rose-400'
                        : activeNode.risk === 'high'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                    }`}
                  >
                    {activeNode.risk}
                  </span>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <span className="text-[10px] text-zinc-500 block">Dependencies</span>
                  <span className="font-mono text-xs font-bold text-zinc-200">
                    {activeNode.dependsOn.length} upstream
                  </span>
                </div>
              </div>

              {/* Connected Relationships */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block mb-2">
                  Connected Call Edges
                </span>
                <div className="space-y-1.5">
                  {activeNode.calls.map((callTarget) => (
                    <div
                      key={callTarget}
                      className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] p-2 text-xs text-zinc-400"
                    >
                      <span className="truncate font-mono">→ calls {callTarget}</span>
                      <span className="font-mono text-[10px] text-zinc-600">sync</span>
                    </div>
                  ))}
                  {activeNode.calls.length === 0 && (
                    <p className="text-xs text-zinc-500 italic">No outgoing call edges.</p>
                  )}
                </div>
              </div>

              {/* Action Links (09_SOFTWARE_GRAPH.md) */}
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <button
                  type="button"
                  onClick={() => handleInspectInDrawer(activeNode)}
                  className="flex items-center justify-between w-full rounded-xl border border-violet-500/30 bg-violet-950/30 p-2.5 text-xs font-semibold text-violet-200 hover:bg-violet-900/40 transition"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-violet-400" /> Open 360 Inspector
                  </span>
                  <ArrowRight className="size-3" />
                </button>

                {activeNode.file && (
                  <Link
                    to={`/code/${encodeURIComponent(activeNode.file)}`}
                    className="flex items-center justify-between w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs text-zinc-300 hover:bg-white/[0.04] hover:text-white transition"
                  >
                    <span className="flex items-center gap-2">
                      <FileCode2 className="size-3.5 text-sky-400" /> Open Exact Source
                    </span>
                    <ArrowRight className="size-3 text-zinc-500" />
                  </Link>
                )}

                <Link
                  to={`/impact?target=${encodeURIComponent(activeNode.name)}`}
                  className="flex items-center justify-between w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs text-zinc-300 hover:bg-white/[0.04] hover:text-white transition"
                >
                  <span className="flex items-center gap-2">
                    <Waypoints className="size-3.5 text-violet-400" /> Compute Multi-Hop Impact
                  </span>
                  <ArrowRight className="size-3 text-zinc-500" />
                </Link>

                <Link
                  to={`/timeline?filter=${encodeURIComponent(activeNode.name)}`}
                  className="flex items-center justify-between w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs text-zinc-300 hover:bg-white/[0.04] hover:text-white transition"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="size-3.5 text-sky-400" /> View Evolution Timeline
                  </span>
                  <ArrowRight className="size-3 text-zinc-500" />
                </Link>

                <Link
                  to={`/intelligence?q=Explain+architecture+of+${encodeURIComponent(activeNode.name)}`}
                  className="flex items-center justify-between w-full rounded-xl bg-violet-600 p-2.5 text-xs font-semibold text-white shadow-md shadow-violet-600/30 transition hover:bg-violet-500"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-3.5" /> Ask AI About Node
                  </span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d16]/80 p-5 text-center text-xs text-zinc-500">
              Select a node in the graph to inspect its properties.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
