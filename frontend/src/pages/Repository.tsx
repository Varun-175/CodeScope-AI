import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderTree,
  FolderOpen,
  Search,
  FileText,
  FileJson,
  FileCode2,
  Copy,
  Check,
  GitBranch,
  Info,
  Download,
  RefreshCw,
  Eye,
  Zap,
  AlertTriangle,
  Flame,
  ListCollapse,
  Expand,
  Minimize2,
  FileCode,
  Sparkles,
} from 'lucide-react'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { useToast } from '../contexts/ToastContext'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'

// ---------- Types ----------
type FileNode = {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  size?: string
  sizeBytes?: number
  language?: string
  lastModified?: string
  lines?: number
}

type CodeInsights = {
  loc: number
  sizeStr: string
  sizeBytes: number
  imports: string[]
  functions: string[]
  classes: string[]
  todoCount: number
  commentRatio: number
  complexityPoints: number
  complexityLabel: 'Low' | 'Moderate' | 'High'
  riskLevel: 'Low' | 'Medium' | 'High'
}

// ---------- File icon helper ----------
function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['tsx', 'ts', 'jsx', 'js'].includes(ext)) {
    return <FileCode2 className="size-4 text-blue-400" />
  }
  if (ext === 'css') return <FileCode2 className="size-4 text-pink-400" />
  if (ext === 'json') return <FileJson className="size-4 text-amber-400" />
  if (['md', 'txt'].includes(ext)) return <FileText className="size-4 text-zinc-400" />
  if (ext === 'html') return <FileCode2 className="size-4 text-orange-400" />
  if (['py', 'pyc'].includes(ext)) return <FileCode className="size-4 text-emerald-400" />
  return <File className="size-4 text-zinc-500" />
}

// ---------- Custom Syntax Highlighter ----------
function highlightCodeLine(line: string) {
  if (!line.trim()) return <span>&nbsp;</span>

  // Escape HTML entities to prevent injection
  let escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Double quotes strings, single quotes strings, template literals
  escaped = escaped.replace(/(["'`])(.*?)\1/g, '<span class="text-emerald-400">$1$2$1</span>')

  // Comments
  if (escaped.trim().startsWith('//') || escaped.trim().startsWith('#') || escaped.trim().startsWith('/*')) {
    return <span className="text-zinc-500 font-mono select-text" dangerouslySetInnerHTML={{ __html: escaped }} />
  }

  // Keywords regex matching js/py/go/rust etc
  const keywords = /\b(const|let|var|function|return|import|from|export|default|class|extends|def|if|else|for|while|try|catch|finally|async|await|type|interface|enum|public|private|protected|package|as|self|this|with|yield)\b/g
  escaped = escaped.replace(keywords, '<span class="text-violet-400 font-semibold">$1</span>')

  // Function calls and names
  escaped = escaped.replace(/\b([\w_]+)(?=\s*\()/g, '<span class="text-blue-400">$1</span>')

  // Numbers
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-amber-400">$1</span>')

  return <span className="font-mono text-zinc-300 select-text" dangerouslySetInnerHTML={{ __html: escaped }} />
}

// ---------- Client-side Code Parser ----------
function parseCodeContent(filename: string, content: string): CodeInsights {
  const lines = content.split('\n')
  const loc = lines.length
  const sizeBytes = new Blob([content]).size
  const sizeStr = sizeBytes > 1024 ? `${(sizeBytes / 1024).toFixed(1)} KB` : `${sizeBytes} B`

  let commentLines = 0
  let todoCount = 0
  const imports: string[] = []
  const functions: string[] = []
  const classes: string[] = []

  let inBlockComment = false
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  for (let line of lines) {
    const trimmed = line.trim()

    if (inBlockComment) {
      commentLines++
      if (trimmed.includes('*/')) inBlockComment = false
      continue
    }
    if (trimmed.startsWith('/*')) {
      commentLines++
      if (!trimmed.includes('*/')) inBlockComment = true
      continue
    }

    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      commentLines++
      if (trimmed.toUpperCase().includes('TODO') || trimmed.toUpperCase().includes('FIXME')) {
        todoCount++
      }
      continue
    }

    if (trimmed.toUpperCase().includes('TODO') || trimmed.toUpperCase().includes('FIXME')) {
      todoCount++
    }

    // Python Imports and Symbols
    if (ext === 'py') {
      const pyImport = trimmed.match(/^(?:from\s+([\w.]+)\s+import|import\s+([\w.,\s]+))/)
      if (pyImport) {
        imports.push((pyImport[1] || pyImport[2]).trim())
      }
      const pyFunc = trimmed.match(/^def\s+([\w_]+)\s*\(/)
      if (pyFunc) functions.push(pyFunc[1])

      const pyClass = trimmed.match(/^class\s+([\w_]+)/)
      if (pyClass) classes.push(pyClass[1])
    }
    // JS/TS Imports and Symbols
    else if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
      const jsImport = trimmed.match(/^import\s+.*?from\s+['"](.*?)['"]/)
      if (jsImport) {
        imports.push(jsImport[1])
      }
      const jsFunc = trimmed.match(/(?:function\s+([\w_]+)|const\s+([\w_]+)\s*=\s*(?:\([^)]*\)|[\w_]+)\s*=>)/)
      if (jsFunc) {
        functions.push(jsFunc[1] || jsFunc[2])
      }
      const jsClass = trimmed.match(/^class\s+([\w_]+)/)
      if (jsClass) classes.push(jsClass[1])
    }
  }

  const commentRatio = loc > 0 ? commentLines / loc : 0

  // Estimate Cyclomatic Complexity points based on branching structures
  let complexityPoints = 1
  const decisionKeywords = /\b(if|for|while|catch|case|&&|\|\|)\b/
  for (let line of lines) {
    if (decisionKeywords.test(line)) {
      complexityPoints++
    }
  }

  let complexityLabel: 'Low' | 'Moderate' | 'High' = 'Low'
  if (complexityPoints > 10 || loc > 500) complexityLabel = 'High'
  else if (complexityPoints > 5 || loc > 150) complexityLabel = 'Moderate'

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low'
  if (complexityLabel === 'High' || todoCount > 4) riskLevel = 'High'
  else if (complexityLabel === 'Moderate' || todoCount > 1) riskLevel = 'Medium'

  return {
    loc,
    sizeStr,
    sizeBytes,
    imports: Array.from(new Set(imports)).slice(0, 8),
    functions: Array.from(new Set(functions)).slice(0, 10),
    classes: Array.from(new Set(classes)).slice(0, 6),
    todoCount,
    commentRatio,
    complexityPoints,
    complexityLabel,
    riskLevel,
  }
}

// ---------- Dynamic AI summary helper ----------
function getAiFileSummary(filename: string, insights: CodeInsights): string {
  const ext = filename.split('.').pop() || ''
  const baseName = filename.split('/').pop() || ''

  if (baseName.toLowerCase() === 'readme.md') {
    return 'Project description and overview. Contains setup guidelines, dependencies listing, and usage examples.'
  }
  if (baseName.toLowerCase() === 'package.json') {
    return 'Node package configuration defining task scripts, metadata, devDependencies, and external package limits.'
  }
  if (baseName.toLowerCase() === 'requirements.txt') {
    return 'Python requirements specification mapping critical third-party dependencies to active library versions.'
  }

  let desc = `This is a ${ext.toUpperCase()} file with ${insights.loc} lines.`
  if (insights.classes.length > 0) {
    desc += ` Defines classes like [${insights.classes.slice(0, 2).join(', ')}].`
  }
  if (insights.functions.length > 0) {
    desc += ` Orchestrates logic through ${insights.functions.length} functions.`
  }
  if (insights.imports.length > 0) {
    desc += ` Relies on imports from [${insights.imports.slice(0, 2).join(', ')}].`
  }
  if (insights.riskLevel === 'High') {
    desc += ` High complexity detected (${insights.complexityPoints} points). Refactoring recommended.`
  }
  return desc
}

// ---------- Flat Tree Helper for Keyboard Navigation ----------
function getVisibleNodes(nodes: FileNode[], expandedPaths: Set<string>, result: FileNode[] = []): FileNode[] {
  for (const node of nodes) {
    result.push(node)
    if (node.type === 'directory' && expandedPaths.has(node.path) && node.children) {
      getVisibleNodes(node.children, expandedPaths, result)
    }
  }
  return result
}

// ---------- Expand all directories helper ----------
function getAllDirectories(nodes: FileNode[], paths: string[] = []): string[] {
  for (const node of nodes) {
    if (node.type === 'directory') {
      paths.push(node.path)
      if (node.children) {
        getAllDirectories(node.children, paths)
      }
    }
  }
  return paths
}

// ---------- Tree Item Component ----------
function TreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
  expandedPaths,
  onToggle,
}: {
  node: FileNode
  depth: number
  selectedPath: string | null
  onSelect: (node: FileNode) => void
  expandedPaths: Set<string>
  onToggle: (path: string) => void
}) {
  const isExpanded = expandedPaths.has(node.path)
  const isSelected = selectedPath === node.path
  const isDir = node.type === 'directory'

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isDir) onToggle(node.path)
          else onSelect(node)
        }}
        className={[
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition duration-150 outline-none',
          isSelected
            ? 'bg-zinc-800 text-white font-medium shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
            : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200',
        ].join(' ')}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
      >
        {isDir ? (
          <>
            {isExpanded ? (
              <ChevronDown className="size-3.5 shrink-0 text-zinc-500" />
            ) : (
              <ChevronRight className="size-3.5 shrink-0 text-zinc-500" />
            )}
            {isExpanded ? (
              <FolderOpen className="size-4 shrink-0 text-violet-400" />
            ) : (
              <Folder className="size-4 shrink-0 text-violet-500/80" />
            )}
          </>
        ) : (
          <>
            <span className="size-3.5 shrink-0" />
            {getFileIcon(node.name)}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isDir && isExpanded && node.children && (
        <div className="overflow-hidden transition-all duration-300">
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </>
  )
}

// ---------- Main Repository Component ----------
export function Repository() {
  const { data, status } = useRepositoryAnalysis()
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingTree, setIsLoadingTree] = useState(false)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [branchOptions, setBranchOptions] = useState<string[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')

  // Code Viewer UX states
  const [wrapLines, setWrapLines] = useState(true)
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)
  const [copiedPath, setCopiedPath] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [activeQuickInsight, setActiveQuickInsight] = useState<'summary' | 'metrics' | 'symbols'>('summary')

  const explorerRef = useRef<HTMLDivElement>(null)
  const { pushToast } = useToast()

  // Extract owner, repo, branch from context
  const repoMeta = data?.repository

  useEffect(() => {
    setSelectedBranch(repoMeta?.branch || 'main')
  }, [repoMeta?.branch, repoMeta?.owner, repoMeta?.name])

  useEffect(() => {
    if (!repoMeta?.owner || !repoMeta?.name) return
    const owner = repoMeta.owner
    const name = repoMeta.name

    async function loadBranches() {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${name}/branches`)
        if (!res.ok) return
        const branches = await res.json() as Array<{ name: string }>
        setBranchOptions(branches.map((branch) => branch.name).slice(0, 30))
      } catch {
        setBranchOptions([])
      }
    }

    loadBranches()
  }, [repoMeta?.owner, repoMeta?.name])

  // 1. Fetch Repository Tree from GitHub API when repo changes
  const fetchTree = useCallback(async () => {
    if (!repoMeta?.owner || !repoMeta?.name) return

    setIsLoadingTree(true)
    setError(null)
    setFileTree([])
    setSelectedFile(null)
    setFileContent(null)

    try {
      const owner = repoMeta.owner
      const repo = repoMeta.name
      const branch = selectedBranch || repoMeta.branch || 'main'

      const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? 'GitHub API rate limit exceeded. Please try again later or add credentials.'
            : `Failed to fetch repository details (${response.status})`
        )
      }

      const result = await response.json()
      const treeData = result.tree as Array<{ path: string; type: 'blob' | 'tree'; size?: number }>

      // Construct tree nodes recursively
      const rootNodes: FileNode[] = []
      const pathMap: Record<string, FileNode> = {}

      const sortedTree = [...treeData].sort((a, b) => a.path.localeCompare(b.path))

      for (const item of sortedTree) {
        const parts = item.path.split('/')
        const name = parts[parts.length - 1]
        const path = item.path
        const isDir = item.type === 'tree'

        const node: FileNode = {
          name,
          path,
          type: isDir ? 'directory' : 'file',
          size: item.size
            ? item.size > 1048576
              ? `${(item.size / 1048576).toFixed(1)} MB`
              : item.size > 1024
              ? `${(item.size / 1024).toFixed(1)} KB`
              : `${item.size} B`
            : undefined,
          sizeBytes: item.size,
          language: isDir ? undefined : name.split('.').pop()?.toUpperCase(),
        }

        if (parts.length === 1) {
          rootNodes.push(node)
        } else {
          const parentPath = parts.slice(0, -1).join('/')
          const parent = pathMap[parentPath]
          if (parent) {
            if (!parent.children) parent.children = []
            parent.children.push(node)
          } else {
            rootNodes.push(node)
          }
        }
        pathMap[path] = node
      }

      setFileTree(rootNodes)
      // Auto expand top directories
      const initialExpanded = new Set<string>()
      rootNodes.forEach((node) => {
        if (node.type === 'directory') initialExpanded.add(node.path)
      })
      setExpandedPaths(initialExpanded)
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading tree.')
    } finally {
      setIsLoadingTree(false)
    }
  }, [repoMeta?.owner, repoMeta?.name, repoMeta?.branch, selectedBranch])

  useEffect(() => {
    if (repoMeta?.owner && repoMeta?.name) {
      fetchTree()
    }
  }, [repoMeta?.owner, repoMeta?.name, fetchTree])

  // 2. Fetch File Content from GitHub Raw
  useEffect(() => {
    if (!selectedFile || !repoMeta) return

    const loadContent = async () => {
      setIsLoadingContent(true)
      setFileContent(null)
      setHighlightedLine(null)
      try {
        const owner = repoMeta.owner
        const repo = repoMeta.name
        const branch = selectedBranch || repoMeta.branch || 'main'
        const path = selectedFile.path

        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
        const res = await fetch(rawUrl)
        if (!res.ok) {
          throw new Error('Failed to retrieve file contents.')
        }
        const text = await res.text()
        setFileContent(text)
      } catch (err: any) {
        setFileContent(`// Error loading file contents: ${err.message}`)
      } finally {
        setIsLoadingContent(false)
      }
    }

    loadContent()
  }, [selectedFile, repoMeta, selectedBranch])

  // 3. Tree toggle helper
  function handleToggle(path: string) {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  // 4. Toolbar operations
  function handleExpandAll() {
    setExpandedPaths(new Set(getAllDirectories(fileTree)))
  }

  function handleCollapseAll() {
    setExpandedPaths(new Set())
  }

  function handleCopyPath() {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.path)
      setCopiedPath(true)
      pushToast('File path copied to clipboard', 'success')
      setTimeout(() => setCopiedPath(false), 2000)
    }
  }

  function handleDownloadFile() {
    if (selectedFile && fileContent !== null) {
      const blob = new Blob([fileContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = selectedFile.name
      link.click()
      URL.revokeObjectURL(url)
      pushToast('File download started', 'success')
    }
  }

  // 5. Code insights parser
  const insights = useMemo<CodeInsights | null>(() => {
    if (!selectedFile || fileContent === null) return null
    return parseCodeContent(selectedFile.name, fileContent)
  }, [selectedFile, fileContent])

  // AI Summary for file
  const aiSummary = useMemo(() => {
    if (!selectedFile || !insights) return ''
    return getAiFileSummary(selectedFile.name, insights)
  }, [selectedFile, insights])

  // Filtered Tree (Search)
  const filteredTree = useMemo(() => {
    if (!searchQuery) return fileTree

    const filter = (nodes: FileNode[]): FileNode[] => {
      return nodes.reduce<FileNode[]>((acc, node) => {
        if (node.type === 'file' && node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          acc.push(node)
        } else if (node.type === 'directory' && node.children) {
          const children = filter(node.children)
          if (children.length > 0) {
            acc.push({ ...node, children })
          }
        }
        return acc
      }, [])
    }
    return filter(fileTree)
  }, [fileTree, searchQuery])

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (fileTree.length === 0) return

      const visible = getVisibleNodes(fileTree, expandedPaths)
      const currentIndex = selectedFile ? visible.findIndex((n) => n.path === selectedFile.path) : -1

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const nextNode = visible[currentIndex + 1]
        if (nextNode) {
          if (nextNode.type === 'file') setSelectedFile(nextNode)
          else handleToggle(nextNode.path)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prevNode = visible[currentIndex - 1]
        if (prevNode) {
          if (prevNode.type === 'file') setSelectedFile(prevNode)
          else handleToggle(prevNode.path)
        }
      }
    },
    [fileTree, expandedPaths, selectedFile]
  )

  function handleCopyCode() {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent)
      setCopiedCode(true)
      pushToast('Code copied to clipboard', 'success')
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  // Render Breadcrumb details
  const renderBreadcrumbs = () => {
    if (!selectedFile) return null
    const parts = selectedFile.path.split('/')
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-zinc-500 font-mono">
        {parts.map((p, idx) => (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight className="size-3 text-zinc-800" />}
            <span className={idx === parts.length - 1 ? 'text-zinc-300 font-medium' : ''}>{p}</span>
          </span>
        ))}
      </div>
    )
  }

  // Skeletons for tree
  if (status === 'idle') {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80 p-8">
        <EmptyState
          title="No connected repository"
          description="Run an analysis from the dashboard to browse repository files, inspect code health, and navigate the repository tree."
          icon={FolderTree}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* File Explorer Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400">Repository Browser</span>
          </div>
          <h1 className="mt-0.5 text-base font-semibold text-white flex items-center gap-2">
            {repoMeta?.owner}/{repoMeta?.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active branch indicator */}
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-mono text-zinc-300">
            <GitBranch className="size-3.5 text-zinc-500" />
          </span>
          <select
            value={selectedBranch}
            onChange={(event) => setSelectedBranch(event.target.value)}
            className="h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs font-mono text-zinc-300 outline-none hover:border-zinc-700"
          >
            {[selectedBranch, ...branchOptions.filter((branch) => branch !== selectedBranch)].filter(Boolean).map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={fetchTree}
            disabled={isLoadingTree}
            className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-400 hover:text-white transition disabled:opacity-30"
          >
            <RefreshCw className={['size-3.5', isLoadingTree ? 'animate-spin' : ''].join(' ')} />
            Refresh
          </button>
        </div>
      </div>

      <div
        className="grid min-h-[calc(100vh-16rem)] grid-cols-1 gap-4 lg:grid-cols-12 outline-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={explorerRef}
      >
        {/* Left Side: Directory Tree Sidebar */}
        <aside className="rounded-lg border border-zinc-800 bg-zinc-950/80 flex flex-col lg:col-span-3">
          <div className="p-3 border-b border-zinc-800 space-y-3">
            {/* Search inputs */}
            <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1.5">
              <Search className="size-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files…"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white">
                  <Minimize2 className="size-3" />
                </button>
              )}
            </div>

            {/* Tree utilities */}
            <div className="flex items-center justify-between border-t border-zinc-850 pt-2 text-[10px]">
              <span className="text-zinc-500">Tree view</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-1.5 py-0.5 rounded border border-zinc-850 hover:bg-zinc-900 hover:text-white text-zinc-400 flex items-center gap-1"
                  title="Expand all folders"
                >
                  <Expand className="size-3" /> Expand
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-1.5 py-0.5 rounded border border-zinc-850 hover:bg-zinc-900 hover:text-white text-zinc-400 flex items-center gap-1"
                  title="Collapse all folders"
                >
                  <ListCollapse className="size-3" /> Collapse
                </button>
              </div>
            </div>
          </div>

          {/* Directory node list */}
          <div className="flex-1 max-h-[calc(100vh-24rem)] overflow-y-auto p-2 scrollbar-thin">
            {isLoadingTree ? (
              <LoadingState title="Loading repository tree" hint="Gathering files and folders from the selected branch" />
            ) : error ? (
              <div className="p-4 text-center text-xs text-red-400">
                <AlertTriangle className="size-5 text-red-500/80 mx-auto mb-2" />
                {error}
              </div>
            ) : filteredTree.length === 0 ? (
              <EmptyState title="No files matched" description="Try a broader search term or browse the repository manually." icon={Search} />
            ) : (
              filteredTree.map((node) => (
                <TreeItem
                  key={node.path}
                  node={node}
                  depth={0}
                  selectedPath={selectedFile?.path ?? null}
                  onSelect={(file) => setSelectedFile(file)}
                  expandedPaths={expandedPaths}
                  onToggle={handleToggle}
                />
              ))
            )}
          </div>
        </aside>

        {/* Center Section: Main Code Viewer */}
        <section className="flex flex-col lg:col-span-6 min-w-0">
          {!selectedFile ? (
            <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/85 p-8 text-center min-h-[300px]">
              <div className="mx-auto grid size-12 place-items-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-550">
                <Eye className="size-5" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-zinc-350">Select a file</h2>
              <p className="mt-1 text-xs text-zinc-500 max-w-xs leading-5">
                Browse through directory structures and select files to view syntax highlighted code and deep structural insights.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col rounded-lg border border-zinc-800 bg-zinc-950/80 overflow-hidden">
              {/* Sticky File Header */}
              <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 p-3 space-y-2 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    {renderBreadcrumbs()}
                    <h2 className="mt-1 flex items-center gap-2 text-xs font-semibold text-white font-mono truncate">
                      {getFileIcon(selectedFile.name)}
                      {selectedFile.name}
                    </h2>
                  </div>

                  {/* Top tool buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyPath}
                      className="px-2.5 py-1.5 rounded-md border border-zinc-850 hover:bg-zinc-900 text-[10px] text-zinc-400 hover:text-white transition flex items-center gap-1"
                      title="Copy relative file path"
                    >
                      {copiedPath ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                      {copiedPath ? 'Copied' : 'Copy Path'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadFile}
                      disabled={fileContent === null}
                      className="px-2.5 py-1.5 rounded-md border border-zinc-850 hover:bg-zinc-900 text-[10px] text-zinc-400 hover:text-white transition flex items-center gap-1 disabled:opacity-30"
                      title="Download raw file"
                    >
                      <Download className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub headers details */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 font-mono">
                  {selectedFile.size && (
                    <span>Size: <strong className="text-zinc-400">{selectedFile.size}</strong></span>
                  )}
                  {insights && (
                    <>
                      <span className="text-zinc-800">•</span>
                      <span>LOC: <strong className="text-zinc-400">{insights.loc}</strong></span>
                      <span className="text-zinc-800">•</span>
                      <span>Type: <strong className="text-zinc-400">{selectedFile.language || 'Plain Text'}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* View options bar */}
              <div className="flex items-center justify-between border-b border-zinc-850/60 bg-zinc-900/20 px-3 py-1.5 text-[10px]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWrapLines((v) => !v)}
                    className={['px-2 py-0.5 rounded transition', wrapLines ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'].join(' ')}
                  >
                    Wrap Lines
                  </button>
                </div>
                {fileContent !== null && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    Copy Code
                  </button>
                )}
              </div>

              {/* Real Code Area */}
              <div className="flex-1 flex max-h-[calc(100vh-28rem)] overflow-hidden">
                {isLoadingContent ? (
                  <div className="flex-1 space-y-3 p-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <div key={n} className="h-4 w-full animate-pulse rounded bg-zinc-900/60" />
                    ))}
                  </div>
                ) : fileContent !== null ? (
                  <div className="flex-1 overflow-auto flex scrollbar-thin select-text">
                    <table className="w-full border-collapse">
                      <tbody>
                        {fileContent.split('\n').map((line, i) => {
                          const isLineHighlighted = highlightedLine === i + 1
                          return (
                            <tr
                              key={i}
                              onClick={() => setHighlightedLine(i + 1)}
                              className={[
                                'transition duration-150',
                                isLineHighlighted ? 'bg-zinc-800/60 border-l-2 border-violet-500' : 'hover:bg-zinc-900/30',
                              ].join(' ')}
                            >
                              {/* Line number */}
                              <td className="w-10 select-none border-r border-zinc-850/50 px-2 py-0.5 text-right font-mono text-[10px] text-zinc-650">
                                {i + 1}
                              </td>
                              {/* Content cell */}
                              <td className="px-4 py-0.5 align-middle">
                                <pre className={['font-mono text-xs leading-5', wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'].join(' ')}>
                                  <code>{highlightCodeLine(line)}</code>
                                </pre>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-zinc-550">
                    No contents found in file.
                  </div>
                )}

                {/* Minimap Placeholder Panel */}
                <div className="w-16 border-l border-zinc-900 bg-zinc-950/20 select-none hidden md:flex flex-col items-center py-2 overflow-hidden gap-[1px]">
                  {fileContent !== null &&
                    fileContent
                      .split('\n')
                      .slice(0, 120)
                      .map((l, idx) => {
                        const len = Math.min(l.length, 60)
                        const isHighlighted = highlightedLine === idx + 1
                        return (
                          <div
                            key={idx}
                            style={{ width: `${(len / 60) * 100}%` }}
                            className={[
                              'h-[2px] min-w-[2px] rounded-sm transition max-w-[40px]',
                              isHighlighted ? 'bg-violet-500' : 'bg-zinc-850',
                            ].join(' ')}
                          />
                        )
                      })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Quick Insights Panel */}
        <aside className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 lg:col-span-3 flex flex-col space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Quick Insights</h2>
              <p className="mt-1 text-[10px] text-zinc-500">AI analysis and code health metrics</p>
            </div>
            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-500">Live</span>
          </div>

          <div className="flex gap-2">
            {([
              ['summary', 'Summary'],
              ['metrics', 'Metrics'],
              ['symbols', 'Symbols'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveQuickInsight(value)}
                className={['rounded-full px-2.5 py-1 text-[10px] transition', activeQuickInsight === value ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {!selectedFile || !insights ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-850 rounded-lg">
              <Info className="size-4 text-zinc-600 mb-2" />
              <p className="text-[10px] text-zinc-500 px-4">Select a file to inspect static code quality metrics</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-22rem)] scrollbar-thin pr-1 text-xs">
              {activeQuickInsight === 'summary' && (
                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3 space-y-1.5">
                  <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="size-3" /> AI Summary
                  </span>
                  <p className="text-[11px] leading-5 text-zinc-400">{aiSummary}</p>
                </div>
              )}

              {activeQuickInsight !== 'summary' && (
                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    <Zap className="size-3 text-amber-400" />
                    {activeQuickInsight === 'metrics' ? 'Quality Metrics' : 'Symbols'}
                  </div>

                  {activeQuickInsight === 'metrics' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-2.5">
                        <span className="block text-[9px] text-zinc-550 uppercase tracking-wider">Complexity</span>
                        <span className={['mt-1 text-sm font-semibold font-mono flex items-center gap-1', insights.complexityLabel === 'High' ? 'text-red-400' : insights.complexityLabel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'].join(' ')}>
                          <Flame className="size-3.5" />
                          {insights.complexityLabel}
                        </span>
                        <span className="block mt-0.5 text-[9px] text-zinc-500">{insights.complexityPoints} branches</span>
                      </div>

                      <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-2.5">
                        <span className="block text-[9px] text-zinc-550 uppercase tracking-wider">Risk Level</span>
                        <span className={['mt-1 text-sm font-semibold font-mono flex items-center gap-1', insights.riskLevel === 'High' ? 'text-red-400' : insights.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'].join(' ')}>
                          <AlertTriangle className="size-3.5" />
                          {insights.riskLevel}
                        </span>
                        <span className="block mt-0.5 text-[9px] text-zinc-500">{insights.todoCount} TODO tags</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {insights.functions.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Functions ({insights.functions.length})</h4>
                          <div className="max-h-24 overflow-y-auto space-y-1 rounded border border-zinc-900 p-1.5">
                            {insights.functions.map((func) => (
                              <div key={func} className="flex items-center gap-1 font-mono text-[10px] text-blue-400">
                                <span className="font-bold text-zinc-700">•</span>
                                {func}()
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {insights.classes.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Classes ({insights.classes.length})</h4>
                          <div className="max-h-24 overflow-y-auto space-y-1 rounded border border-zinc-900 p-1.5">
                            {insights.classes.map((cls) => (
                              <div key={cls} className="flex items-center gap-1 font-mono text-[10px] text-violet-400">
                                <span className="font-bold text-zinc-700">•</span>
                                {cls}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Complexity, Risk Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-2.5">
                  <span className="block text-[9px] text-zinc-550 uppercase tracking-wider">Complexity</span>
                  <span className={['mt-1 text-sm font-semibold font-mono flex items-center gap-1', insights.complexityLabel === 'High' ? 'text-red-400' : insights.complexityLabel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'].join(' ')}>
                    <Flame className="size-3.5" />
                    {insights.complexityLabel}
                  </span>
                  <span className="block mt-0.5 text-[9px] text-zinc-500">{insights.complexityPoints} branches</span>
                </div>

                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-2.5">
                  <span className="block text-[9px] text-zinc-550 uppercase tracking-wider">Risk Level</span>
                  <span className={['mt-1 text-sm font-semibold font-mono flex items-center gap-1', insights.riskLevel === 'High' ? 'text-red-400' : insights.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'].join(' ')}>
                    <AlertTriangle className="size-3.5" />
                    {insights.riskLevel}
                  </span>
                  <span className="block mt-0.5 text-[9px] text-zinc-500">{insights.todoCount} TODO tags</span>
                </div>
              </div>

              {/* LOC / Comment statistics */}
              <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-3 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-500">Lines of Code</span>
                  <span className="font-mono text-zinc-300 font-semibold">{insights.loc}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-500">Comments Ratio</span>
                  <span className="font-mono text-zinc-300 font-semibold">{(insights.commentRatio * 100).toFixed(0)}%</span>
                </div>
                {/* Visual Ratio Bar */}
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                  <div className="h-full bg-violet-500" style={{ width: `${((1 - insights.commentRatio) * 100).toFixed(0)}%` }} />
                  <div className="h-full bg-emerald-500" style={{ width: `${(insights.commentRatio * 100).toFixed(0)}%` }} />
                </div>
              </div>

              {/* Imports List */}
              {insights.imports.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Imports</h4>
                  <div className="flex flex-wrap gap-1">
                    {insights.imports.map((imp) => (
                      <span key={imp} className="rounded bg-zinc-900 px-2 py-0.5 text-[9px] font-mono text-zinc-300 border border-zinc-850 truncate max-w-[150px]">
                        {imp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Public Functions list */}
              {insights.functions.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Functions ({insights.functions.length})</h4>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 border border-zinc-900 rounded p-1.5">
                    {insights.functions.map((func) => (
                      <div key={func} className="font-mono text-[10px] text-blue-400 truncate flex items-center gap-1">
                        <span className="text-zinc-700 font-bold">•</span>
                        {func}()
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Public Classes List */}
              {insights.classes.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Classes ({insights.classes.length})</h4>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 border border-zinc-900 rounded p-1.5">
                    {insights.classes.map((cls) => (
                      <div key={cls} className="font-mono text-[10px] text-violet-400 truncate flex items-center gap-1">
                        <span className="text-zinc-700 font-bold">•</span>
                        {cls}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
