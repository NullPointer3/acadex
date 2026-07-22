import { useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { TableSkeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  keyFor,
  getSearchText,
  searchPlaceholder = 'Search...',
  onRowClick,
  loading,
  emptyState,
  pageSize = 8,
  toolbarExtra,
}: {
  columns: Column<T>[];
  rows: T[];
  keyFor: (row: T) => string;
  getSearchText?: (row: T) => string;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyState: ReactNode;
  pageSize?: number;
  toolbarExtra?: ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim() || !getSearchText) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => getSearchText(r).toLowerCase().includes(q));
  }, [rows, query, getSearchText]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  function toggleSort(col: Column<T>) {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
    setPage(0);
  }

  const showToolbar = getSearchText || toolbarExtra;

  return (
    <div>
      {showToolbar && (
        <div className="flex items-center gap-3 mb-4">
          {getSearchText && (
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 rounded-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          )}
          {toolbarExtra}
        </div>
      )}

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton cols={columns.length} />
        ) : sorted.length === 0 ? (
          emptyState
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/[0.04] text-left text-gray-500 dark:text-gray-400">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className={`px-4 py-2.5 font-medium whitespace-nowrap ${col.className ?? ''}`}>
                        {col.sortValue ? (
                          <button
                            onClick={() => toggleSort(col)}
                            className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                          >
                            {col.header}
                            {sortKey === col.key ? (
                              sortDir === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                            )}
                          </button>
                        ) : (
                          col.header
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, i) => (
                    <tr
                      key={keyFor(row)}
                      onClick={() => onRowClick?.(row)}
                      style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                      className={`animate-fade-in border-t border-gray-100 dark:border-white/5 transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.04]' : ''
                      }`}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-2.5 dark:text-gray-200 ${col.className ?? ''}`}>
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageCount > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {currentPage * pageSize + 1}-{Math.min(sorted.length, (currentPage + 1) * pageSize)} of {sorted.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-transform active:scale-90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= pageCount - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-transform active:scale-90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
