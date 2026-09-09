import React, { useState, useMemo } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Columns,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useDensity } from '../../contexts/DensityContext'

export interface Column<T> {
  key: string
  header: string
  accessor: (item: T) => React.ReactNode
  sortable?: boolean
  sortValue?: (item: T) => string | number
  width?: string
  hideByDefault?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  searchPlaceholder?: string
  searchFilter?: (item: T, query: string) => boolean
  onRowClick?: (item: T) => void
  renderExpandedRow?: (item: T) => React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Filter records...',
  searchFilter,
  onRowClick,
  renderExpandedRow,
  emptyTitle = 'No records found',
  emptyDescription = 'No records match the current filter or criteria.',
}: DataTableProps<T>) {
  const { density } = useDensity()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    return new Set(
      columns.filter((c) => !c.hideByDefault).map((c) => c.key)
    )
  })
  const [showColumnPicker, setShowColumnPicker] = useState(false)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else {
        setSortKey(null)
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const toggleRowExpansion = (key: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = new Set(expandedRows)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    setExpandedRows(next)
  }

  const toggleColumnVisibility = (key: string) => {
    const next = new Set(visibleColumns)
    if (next.has(key)) {
      if (next.size > 1) next.delete(key)
    } else {
      next.add(key)
    }
    setVisibleColumns(next)
  }

  // Filtered & Sorted items
  const processedData = useMemo(() => {
    let result = [...data]

    if (searchQuery.trim() && searchFilter) {
      result = result.filter((item) => searchFilter(item, searchQuery.trim()))
    }

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      if (col && col.sortValue) {
        result.sort((a, b) => {
          const valA = col.sortValue!(a)
          const valB = col.sortValue!(b)
          if (valA < valB) return sortDirection === 'asc' ? -1 : 1
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1
          return 0
        })
      }
    }

    return result
  }, [data, searchQuery, searchFilter, sortKey, sortDirection, columns])

  const activeColumns = columns.filter((c) => visibleColumns.has(c.key))

  const rowPadding =
    density === 'ultra-compact'
      ? 'px-3 py-1.5 text-xs'
      : density === 'compact'
        ? 'px-4 py-2.5 text-xs'
        : 'px-4 py-3.5 text-sm'

  return (
    <div className="w-full space-y-3">
      {/* Controls: Search & Column Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {searchFilter && (
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 transition focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
          </div>
        )}

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setShowColumnPicker(!showColumnPicker)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06]"
          >
            <Columns className="size-3.5 text-zinc-400" />
            <span>Columns ({visibleColumns.size}/{columns.length})</span>
          </button>

          {showColumnPicker && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-transparent cursor-default"
                onClick={() => setShowColumnPicker(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-white/[0.08] bg-[#0c101a] p-2 shadow-2xl backdrop-blur-xl">
                <span className="block px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  Toggle Columns
                </span>
                <div className="space-y-1 mt-1">
                  {columns.map((c) => (
                    <label
                      key={c.key}
                      className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-zinc-300 hover:bg-white/[0.04] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(c.key)}
                        onChange={() => toggleColumnVisibility(c.key)}
                        className="rounded border-zinc-700 bg-zinc-900 text-violet-600 focus:ring-0"
                      />
                      <span>{c.header}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0a0d16]/70 backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              {renderExpandedRow && <th className="w-8 px-2 py-2" />}
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 select-none"
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1.5 hover:text-white transition"
                    >
                      <span>{col.header}</span>
                      {sortKey === col.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="size-3 text-violet-400" />
                        ) : (
                          <ArrowDown className="size-3 text-violet-400" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 text-zinc-600" />
                      )}
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {processedData.length > 0 ? (
              processedData.map((item) => {
                const key = keyExtractor(item)
                const isExpanded = expandedRows.has(key)
                return (
                  <React.Fragment key={key}>
                    <tr
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`transition ${
                        onRowClick
                          ? 'cursor-pointer hover:bg-white/[0.03]'
                          : 'hover:bg-white/[0.01]'
                      } ${isExpanded ? 'bg-white/[0.02]' : ''}`}
                    >
                      {renderExpandedRow && (
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={(e) => toggleRowExpansion(key, e)}
                            className="rounded p-1 text-zinc-500 hover:text-zinc-200 transition"
                          >
                            {isExpanded ? (
                              <ChevronDown className="size-3.5" />
                            ) : (
                              <ChevronRight className="size-3.5" />
                            )}
                          </button>
                        </td>
                      )}
                      {activeColumns.map((col) => (
                        <td key={col.key} className={rowPadding}>
                          {col.accessor(item)}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && renderExpandedRow && (
                      <tr className="bg-black/40 border-b border-white/[0.04]">
                        <td
                          colSpan={activeColumns.length + (renderExpandedRow ? 1 : 0)}
                          className="p-4"
                        >
                          {renderExpandedRow(item)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={activeColumns.length + (renderExpandedRow ? 1 : 0)}
                  className="p-8 text-center text-zinc-500"
                >
                  <p className="text-sm font-semibold text-zinc-300">{emptyTitle}</p>
                  <p className="text-xs text-zinc-500 mt-1">{emptyDescription}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
