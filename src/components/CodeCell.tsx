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
  onConvertToMarkdown
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
    </div>
  );
};
