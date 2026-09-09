import React, { useRef, useEffect } from 'react';
import { 
  Play, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Copy, 
  FileText, 
  CornerDownRight, 
  Check, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { NotebookCell } from '../types';

interface CodeCellProps {
  cell: NotebookCell;
  index: number;
  isActive: boolean;
  isRunning: boolean;
  totalCells: number;
  onSelect: () => void;
  onChange: (source: string) => void;
  onRun: () => void;
  onRunAndSelectNext: () => void;
  onRunAndInsertBelow: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onConvertToMarkdown: () => void;
  onClearError?: () => void;
}

export const CodeCell: React.FC<CodeCellProps> = ({
  cell,
  index,
  isActive,
  isRunning,
  totalCells,
  onSelect,
  onChange,
  onRun,
  onRunAndSelectNext,
  onRunAndInsertBelow,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  onConvertToMarkdown,
  onClearError
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(64, textareaRef.current.scrollHeight)}px`;
    }
  }, [cell.source]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onRunAndSelectNext();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onRun();
    } else if (e.key === 'Enter' && e.altKey) {
      e.preventDefault();
      onRunAndInsertBelow();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const nextVal = value.substring(0, start) + '    ' + value.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lines = cell.source.split('\n');

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-lg border transition-all duration-150 ${
        isActive
          ? 'border-emerald-500/80 dark:border-emerald-500/80 ring-1 ring-emerald-500/20 shadow-xs bg-white dark:bg-neutral-900'
          : 'border-neutral-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Cell Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/40 select-none text-xs">
        <div className="flex items-center gap-2">
          {/* Execution Prompt Symbol e.g. [1] or [*] */}
          <span className="font-mono text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 min-w-[32px]">
            {isRunning ? '[*]' : cell.execution_count ? `[${cell.execution_count}]` : '[ ]'}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Python
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRun();
            }}
            disabled={isRunning}
            className="p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors"
            title="Run Cell (Ctrl+Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onConvertToMarkdown();
            }}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            title="Convert to Markdown"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 disabled:opacity-20 transition-colors"
            title="Move Up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalCells - 1}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 disabled:opacity-20 transition-colors"
            title="Move Down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            title="Duplicate Cell"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={totalCells <= 1}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 disabled:opacity-20 transition-colors"
            title="Delete Cell"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body with line numbers */}
      <div className="flex font-mono text-xs leading-relaxed p-2">
        {/* Line numbers column */}
        <div className="select-none text-right pr-3 text-neutral-400 dark:text-neutral-600 min-w-[28px] border-r border-neutral-200/60 dark:border-neutral-800/60 pt-0.5">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code textarea */}
        <div className="flex-1 pl-3">
          <textarea
            ref={textareaRef}
            value={cell.source}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="# Write Python code here... (Shift+Enter to run)"
            spellCheck={false}
            className="w-full bg-transparent resize-none focus:outline-hidden text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-mono leading-relaxed"
          />
        </div>
      </div>

      {/* Running Spinner Indicator */}
      {isRunning && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-500 text-xs font-mono">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span>Executing cell...</span>
        </div>
      )}

      {/* Inline Cell Output */}
      {cell.output && !isRunning && (
        <div className="border-t border-neutral-100 dark:border-neutral-800/60 p-3 space-y-2.5 text-xs bg-neutral-50/30 dark:bg-neutral-900/30 rounded-b-lg">
          {/* Error display */}
          {cell.output.error && (
            <div className={`p-2.5 rounded font-mono text-xs space-y-1 ${
              cell.output.error.type === 'Notice'
                ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>{cell.output.error.type === 'Notice' ? '⚠️ Notice' : `❌ ${cell.output.error.type}`}</span>
                  {cell.output.error.line && (
                    <span className="text-[10px] px-1 bg-red-200 dark:bg-red-900/60 rounded">
                      Line {cell.output.error.line}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {onClearError && cell.output.error.type === 'Notice' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearError();
                      }}
                      className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-sans text-[11px] font-medium transition-colors cursor-pointer"
                      title="Dismiss notice"
                    >
                      Dismiss
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRun();
                    }}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Run Cell"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Run</span>
                  </button>
                </div>
              </div>
              <div className={`font-medium ${cell.output.error.type === 'Notice' ? 'text-amber-700 dark:text-amber-300' : 'text-red-600 dark:text-red-400'}`}>
                {cell.output.error.message}
              </div>
              {cell.output.error.suggestion && (
                <div className="text-[11px] text-neutral-600 dark:text-neutral-300 font-sans pt-1 border-t border-neutral-200/60 dark:border-neutral-800/40">
                  💡 {cell.output.error.suggestion}
                </div>
              )}
            </div>
          )}

          {/* Stdout */}
          {cell.output.stdout && (
            <pre className="p-2.5 rounded bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 border border-neutral-800">
              {cell.output.stdout}
            </pre>
          )}

          {/* Stderr */}
          {cell.output.stderr && (
            <pre className="p-2 rounded bg-amber-950/20 text-amber-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap border border-amber-900/40">
              {cell.output.stderr}
            </pre>
          )}

          {/* Matplotlib / Seaborn plots */}
          {cell.output.plots && cell.output.plots.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {cell.output.plots.map((plot, i) => (
                <div key={i} className="rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 shadow-2xs">
                  <img src={plot.data} alt={`Plot ${i + 1}`} className="max-h-96 rounded object-contain mx-auto" />
                </div>
              ))}
            </div>
          )}

          {/* DataFrame or Text representation */}
          {cell.output.result && cell.output.result.type === 'dataframe' && (
            <div className="overflow-x-auto rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-neutral-100 dark:bg-neutral-800 font-semibold">
                  <tr>
                    {cell.output.result.columns?.slice(0, 8).map((col: string) => (
                      <th key={col} className="p-1.5 border-b border-neutral-200 dark:border-neutral-700 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {cell.output.result.data?.slice(0, 5).map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      {cell.output.result?.columns?.slice(0, 8).map((col: string) => (
                        <td key={col} className="p-1.5 whitespace-nowrap text-neutral-700 dark:text-neutral-300">{String(row[col])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {cell.output.result.total_rows && (
                <div className="p-1.5 text-[10px] text-neutral-500 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
                  Showing {Math.min(5, cell.output.result.total_rows)} of {cell.output.result.total_rows} rows × {cell.output.result.total_cols} columns (full view in side panel)
                </div>
              )}
            </div>
          )}

          {cell.output.result && cell.output.result.type === 'repr' && cell.output.result.value && (
            <div className="font-mono text-xs text-emerald-700 dark:text-emerald-400 bg-neutral-100/70 dark:bg-neutral-900/70 p-2 rounded border border-neutral-200/60 dark:border-neutral-800">
              Out[{cell.execution_count || cell.output.execution_count || ''}]: {cell.output.result.value}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
