import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Clock,
  ArrowUpDown,
  ShieldAlert,
  Bug,
  Copy,
  Check,
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'

type Severity = 'critical' | 'warning' | 'info' | 'suggestion'
type ReviewCategory = 'security' | 'performance' | 'style' | 'bug' | 'maintainability'

type CodeReview = {
  id: string
  title: string
  description: string
  severity: Severity
  category: ReviewCategory
  file: string
  line: number
  suggestion?: string
  createdAt: string
  rule: string
}

// ---------- Helpers ----------
const SEVERITY_CONFIG: Record<Severity, { icon: typeof AlertCircle; label: string; classes: string; badgeClasses: string }> = {
  critical: { icon: AlertCircle, label: 'Critical', classes: 'text-red-400', badgeClasses: 'border-red-900/50 bg-red-950/30 text-red-400' },
  warning: { icon: AlertTriangle, label: 'Warning', classes: 'text-amber-400', badgeClasses: 'border-amber-900/50 bg-amber-950/30 text-amber-400' },
  info: { icon: Info, label: 'Info', classes: 'text-blue-400', badgeClasses: 'border-blue-900/50 bg-blue-950/30 text-blue-400' },
  suggestion: { icon: CheckCircle2, label: 'Suggestion', classes: 'text-emerald-400', badgeClasses: 'border-emerald-900/50 bg-emerald-950/30 text-emerald-400' },
}

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  security: 'Security',
  performance: 'Performance',
  style: 'Code Style',
  bug: 'Bug',
  maintainability: 'Maintainability',
}

type SortField = 'severity' | 'createdAt' | 'file'
type SortDirection = 'asc' | 'desc'
const SEVERITY_ORDER: Severity[] = ['critical', 'warning', 'info', 'suggestion']

// ---------- Review Detail Drawer ----------
function ReviewDrawer({ review, onClose }: { review: CodeReview; onClose: () => void }) {
  const config = SEVERITY_CONFIG[review.severity]
  const SevIcon = config.icon
  const [copied, setCopied] = useState(false)
  const { pushToast } = useToast()

  function handleCopySuggestion() {
    navigator.clipboard.writeText(review.suggestion || review.description)
    setCopied(true)
    pushToast('Recommendation copied', 'success')
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-black/50" onClick={onClose} aria-label="Close" />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-zinc-800 bg-[#09090b] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${config.badgeClasses}`}>
              <SevIcon className="size-3" /> {config.label}
            </span>
            <h2 className="mt-3 text-base font-semibold text-white">{review.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-white">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Description</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{review.description}</p>
          </div>

          {review.suggestion && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Suggestion</h3>
                <button
                  type="button"
                  onClick={handleCopySuggestion}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                >
                  {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="mt-2 rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-4 text-sm leading-6 text-emerald-300">
                {review.suggestion}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Location</h3>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
              <FileCode2 className="size-4 text-blue-400" />
              <span className="text-zinc-300">{review.file}</span>
              <span className="text-zinc-600">:</span>
              <span className="text-amber-400">{review.line}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Category</h3>
              <p className="mt-2 text-sm text-zinc-300">{CATEGORY_LABELS[review.category]}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Rule</h3>
              <p className="mt-2 font-mono text-xs text-zinc-400">{review.rule}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Detected</h3>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
                <Clock className="size-3.5" /> {review.createdAt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ---------- Main Component ----------
export function CodeReviews() {
  const { data, status } = useRepositoryAnalysis()
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ReviewCategory | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('severity')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const pageSize = 5

  useEffect(() => {
    if (status === 'analyzing') {
      setIsLoading(true)
      return
    }

    const timer = window.setTimeout(() => setIsLoading(false), 400)
    return () => window.clearTimeout(timer)
  }, [data, status])

  const reviews = useMemo<CodeReview[]>(() => {
    if (!data) return []

    const issues: CodeReview[] = []

    if (!data.repository.readme) {
      issues.push({ id: 'review-readme', title: 'Missing README', description: 'The repository does not expose a README summary in the current analysis payload.', severity: 'warning', category: 'maintainability', file: 'README.md', line: 1, suggestion: 'Add a concise README with setup instructions, architecture notes, and usage examples.', createdAt: 'Current analysis', rule: 'docs/readme' })
    }

    if (!data.repository.license) {
      issues.push({ id: 'review-license', title: 'Missing License', description: 'The repository does not expose a license in the current analysis output.', severity: 'info', category: 'maintainability', file: 'LICENSE', line: 1, suggestion: 'Declare a license file so downstream users understand usage terms.', createdAt: 'Current analysis', rule: 'legal/license' })
    }

    if ((data.repository.large_files?.length ?? 0) > 0) {
      const large = data.repository.large_files?.[0]
      issues.push({ id: 'review-large-file', title: 'Large file detected', description: `${large?.path ?? 'A repository file'} is unusually large for the current codebase.`, severity: 'warning', category: 'performance', file: large?.path ?? 'src/main.py', line: large?.lines ?? 400, suggestion: 'Split large modules into smaller units or extract logic into helper components.', createdAt: 'Current analysis', rule: 'size/large-file' })
    }

    if (data.health.score < 70) {
      issues.push({ id: 'review-health', title: 'Repository health below target', description: 'The current repository analysis indicates moderate-to-low health metrics.', severity: 'warning', category: 'bug', file: data.repository.name, line: 1, suggestion: 'Address the highest-impact hotspots and improve documentation to raise internal confidence.', createdAt: 'Current analysis', rule: 'health/score' })
    }

    if (!data.repository.has_tests) {
      issues.push({ id: 'review-tests', title: 'No test coverage detected', description: 'The repository analysis did not identify a test suite in the scanned content.', severity: 'critical', category: 'bug', file: 'tests/', line: 1, suggestion: 'Introduce unit and integration tests around the highest-risk modules.', createdAt: 'Current analysis', rule: 'tests/coverage' })
    }

    if ((data.dependency_health.detected?.length ?? 0) > 10) {
      issues.push({ id: 'review-deps', title: 'Large dependency footprint', description: 'The repository depends on a broad set of packages relative to its size.', severity: 'info', category: 'performance', file: 'requirements.txt', line: 1, suggestion: 'Trim unused dependencies and prefer the smallest viable stack.', createdAt: 'Current analysis', rule: 'deps/footprint' })
    }

    if ((data.repository.functions ?? 0) > 200) {
      issues.push({ id: 'review-functions', title: 'High function count', description: 'The repository exposes a large number of functions, which can make maintenance harder.', severity: 'suggestion', category: 'maintainability', file: 'src/', line: 1, suggestion: 'Organize repeated logic into modules or classes to reduce surface area.', createdAt: 'Current analysis', rule: 'structure/function-count' })
    }

    if ((data.risks.complexity_hotspots?.length ?? 0) > 0) {
      issues.push({ id: 'review-complexity', title: 'Complexity hotspots detected', description: 'The repository analysis flagged one or more hotspots with elevated complexity.', severity: 'warning', category: 'performance', file: data.risks.complexity_hotspots?.[0]?.path ?? 'src/', line: data.risks.complexity_hotspots?.[0]?.lines ?? 1, suggestion: 'Refactor the hotspot into smaller units and add focused tests.', createdAt: 'Current analysis', rule: 'complexity/hotspot' })
    }

    if ((data.repository.import_counts?.length ?? 0) > 8) {
      issues.push({ id: 'review-imports', title: 'High import density', description: 'The repository appears to import many modules from a single area, which can increase coupling.', severity: 'info', category: 'style', file: data.repository.most_imported_module || 'src/', line: 1, suggestion: 'Reduce cross-module imports and keep dependencies closer to the feature boundary.', createdAt: 'Current analysis', rule: 'imports/cohesion' })
    }

    return issues
  }, [data])

  const filteredReviews = useMemo(() => {
    let result = [...reviews]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.file.toLowerCase().includes(q) ||
          r.rule.toLowerCase().includes(q),
      )
    }

    if (severityFilter !== 'all') {
      result = result.filter((r) => r.severity === severityFilter)
    }

    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.category === categoryFilter)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'severity') {
        cmp = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
      } else if (sortField === 'file') {
        cmp = a.file.localeCompare(b.file)
      } else {
        cmp = a.id.localeCompare(b.id)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [searchQuery, severityFilter, categoryFilter, sortField, sortDir])

  const pageCount = Math.max(1, Math.ceil(filteredReviews.length / pageSize))
  const pagedReviews = filteredReviews.slice((page - 1) * pageSize, page * pageSize)

  function resetPage() {
    setPage(1)
  }

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = sortDir === 'asc' ? ChevronUp : ChevronDown

  // Summary counts
  const counts = {
    critical: reviews.filter((r) => r.severity === 'critical').length,
    warning: reviews.filter((r) => r.severity === 'warning').length,
    info: reviews.filter((r) => r.severity === 'info').length,
    suggestion: reviews.filter((r) => r.severity === 'suggestion').length,
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="size-5 text-red-400" />
          <h1 className="text-lg font-semibold text-white">Code Reviews</h1>
          <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-500">
            {reviews.length} issues
          </span>
        </div>
      </div>

      {isLoading ? <LoadingState title="Preparing review intelligence" hint="Synthesizing issues and recommendations" /> : null}

      {!data && status !== 'analyzing' ? (
        <EmptyState title="No repository analysis yet" description="Analyze a repository to surface review findings and recommendations." icon={ShieldAlert} />
      ) : null}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.entries(counts) as [Severity, number][]).map(([severity, count]) => {
          const config = SEVERITY_CONFIG[severity]
          const Icon = config.icon
          return (
            <button
              key={severity}
              type="button"
              onClick={() => { setSeverityFilter((prev) => (prev === severity ? 'all' : severity)); resetPage() }}
              className={[
                'rounded-lg border p-4 text-left transition',
                severityFilter === severity
                  ? `${config.badgeClasses} border-opacity-100`
                  : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700',
              ].join(' ')}
            >
              <Icon className={`size-5 ${config.classes}`} />
              <p className="mt-2 font-mono text-2xl font-semibold text-white">{count}</p>
              <p className="mt-0.5 text-xs text-zinc-500 capitalize">{severity}</p>
            </button>
          )
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3">
          <Search className="size-4 text-zinc-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); resetPage() }}
            placeholder="Search issues, files, rules…"
            className="h-9 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="text-zinc-600 hover:text-zinc-300">
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={[
            'flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition',
            showFilters
              ? 'border-zinc-600 bg-zinc-800 text-white'
              : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
          ].join(' ')}
        >
          <SlidersHorizontal className="size-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
          <span className="text-xs text-zinc-500 self-center mr-2">Category:</span>
          {(['all', ...Object.keys(CATEGORY_LABELS)] as (ReviewCategory | 'all')[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setCategoryFilter(cat); resetPage() }}
              className={[
                'rounded-md border px-2.5 py-1 text-xs font-medium transition capitalize',
                categoryFilter === cat
                  ? 'border-zinc-600 bg-zinc-800 text-white'
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {filteredReviews.length === 0 ? (
        <EmptyState title="No issues matched" description={searchQuery ? 'Try adjusting the search or filter settings.' : 'Your current view is clear of issues.'} icon={Bug} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/80">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase tracking-wider text-zinc-600">
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => handleSort('severity')} className="flex items-center gap-1 hover:text-zinc-300">
                      Severity {sortField === 'severity' && <SortIcon className="size-3" />}
                      {sortField !== 'severity' && <ArrowUpDown className="size-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="hidden px-4 py-3 md:table-cell">
                    <button type="button" onClick={() => handleSort('file')} className="flex items-center gap-1 hover:text-zinc-300">
                      File {sortField === 'file' && <SortIcon className="size-3" />}
                      {sortField !== 'file' && <ArrowUpDown className="size-3" />}
                    </button>
                  </th>
                  <th className="hidden px-4 py-3 lg:table-cell">Category</th>
                  <th className="hidden px-4 py-3 sm:table-cell">
                    <button type="button" onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-zinc-300">
                      Time {sortField === 'createdAt' && <SortIcon className="size-3" />}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedReviews.map((review) => {
                  const config = SEVERITY_CONFIG[review.severity]
                  const SevIcon = config.icon
                  return (
                    <tr
                      key={review.id}
                      className="cursor-pointer border-b border-zinc-800/50 transition hover:bg-zinc-900/50"
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${config.badgeClasses}`}>
                          <SevIcon className="size-3" /> {config.label}
                        </span>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-zinc-200">{review.title}</td>
                      <td className="hidden max-w-[200px] truncate px-4 py-3 font-mono text-xs text-zinc-500 md:table-cell">{review.file}</td>
                      <td className="hidden px-4 py-3 text-xs text-zinc-500 capitalize lg:table-cell">{CATEGORY_LABELS[review.category]}</td>
                      <td className="hidden px-4 py-3 text-xs text-zinc-600 sm:table-cell">{review.createdAt}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => setSelectedReview(review)} className="rounded-md border border-zinc-800 px-2 py-1 text-[11px] text-zinc-500 hover:border-zinc-700 hover:text-white">
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500">
            <span>
              Page {page} of {pageCount} · {filteredReviews.length} matching issues
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-md border border-zinc-800 px-2 py-1 hover:bg-zinc-900 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                className="rounded-md border border-zinc-800 px-2 py-1 hover:bg-zinc-900 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedReview && (
        <ReviewDrawer review={selectedReview} onClose={() => setSelectedReview(null)} />
      )}
    </div>
  )
}
