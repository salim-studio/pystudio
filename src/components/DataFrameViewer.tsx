import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Info
} from 'lucide-react';

interface DataFrameViewerProps {
  data: {
    shape?: number[];
    columns?: string[];
    dtypes?: Record<string, string>;
    data?: Record<string, any>[];
    total_rows?: number;
    total_cols?: number;
    summary?: Record<string, Record<string, any>>;
  };
}

export const DataFrameViewer: React.FC<DataFrameViewerProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const columns = data.columns || (data.data && data.data[0] ? Object.keys(data.data[0]) : []);
  const rawRows = data.data || [];

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rawRows;
    const q = searchQuery.toLowerCase();
    return rawRows.filter(row => 
      Object.values(row).some(val => 
        String(val ?? '').toLowerCase().includes(q)
      )
    );
  }, [rawRows, searchQuery]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // Paginated rows
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handleCopy = () => {
    if (!columns.length || !rawRows.length) return;
    const header = columns.join('\t');
    const body = rawRows.map(r => columns.map(c => r[c] ?? '').join('\t')).join('\n');
    navigator.clipboard.writeText(`${header}\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!columns.length || !rawRows.length) return;
    const header = columns.map(c => `"${c}"`).join(',');
    const body = rawRows.map(r => columns.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dataframe_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs text-xs">
      {/* Table Header Bar */}
      <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            DataFrame ({data.total_rows ?? rawRows.length} rows × {data.total_cols ?? columns.length} cols)
          </span>
          {data.summary && Object.keys(data.summary).length > 0 && (
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-700 text-[11px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 transition-colors"
            >
              <Info className="w-3 h-3" />
              <span>{showStats ? 'Hide Stats' : 'Describe'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search table..."
              className="pl-7 pr-2 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-emerald-500 w-36 text-xs"
            />
          </div>

          {/* Copy & Export */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Copy as TSV"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Drawer */}
      {showStats && data.summary && (
        <div className="p-3 bg-neutral-100/70 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          <div className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Descriptive Statistics (df.describe())</span>
          </div>
          <table className="w-full text-[11px] text-left">
            <thead>
              <tr className="border-b border-neutral-300 dark:border-neutral-700 font-semibold text-neutral-600 dark:text-neutral-400">
                <th className="p-1">Stat</th>
                {Object.keys(data.summary).map(col => (
                  <th key={col} className="p-1">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['count', 'mean', 'std', 'min', '25%', '50%', '70%', 'max'].map(stat => (
                <tr key={stat} className="border-b border-neutral-200 dark:border-neutral-800/50">
                  <td className="p-1 font-mono font-medium text-neutral-500">{stat}</td>
                  {Object.keys(data.summary!).map(col => (
                    <td key={col} className="p-1 font-mono text-neutral-700 dark:text-neutral-300">
                      {data.summary![col]?.[stat] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-100 dark:bg-neutral-800 sticky top-0 z-10 select-none">
            <tr>
              <th className="p-2 border-b border-neutral-200 dark:border-neutral-700 text-neutral-500 font-mono w-10 text-center">
                #
              </th>
              {columns.map((col) => {
                const isSorted = sortColumn === col;
                const dtype = data.dtypes?.[col];
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="p-2 border-b border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span>{col}</span>
                        {dtype && (
                          <span className="ml-1 text-[10px] text-neutral-400 font-normal">
                            ({dtype})
                          </span>
                        )}
                      </div>
                      {isSorted ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-emerald-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-neutral-400 opacity-40 hover:opacity-100 shrink-0" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center text-neutral-400 italic">
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={idx}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="p-2 text-center text-neutral-400 text-[11px]">
                      {rowNum}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="p-2 text-neutral-800 dark:text-neutral-200 truncate max-w-xs"
                      >
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-3 py-1.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span>Showing {paginatedRows.length} of {sortedRows.length} rows</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 px-1 py-0.5 text-xs text-neutral-800 dark:text-neutral-200"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-xs px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
