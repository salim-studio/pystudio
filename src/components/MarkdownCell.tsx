import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Copy, 
  Code, 
  Eye, 
  Edit3 
} from 'lucide-react';
import { NotebookCell } from '../types';

interface MarkdownCellProps {
  cell: NotebookCell;
  index: number;
  isActive: boolean;
  totalCells: number;
  onSelect: () => void;
  onChange: (source: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onConvertToCode: () => void;
}

export const MarkdownCell: React.FC<MarkdownCellProps> = ({
  cell,
  index,
  isActive,
  totalCells,
  onSelect,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  onConvertToCode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(60, textareaRef.current.scrollHeight)}px`;
      textareaRef.current.focus();
    }
  }, [isEditing, cell.source]);

  // Clean and simple Markdown renderer for text cells
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-xl font-bold text-neutral-900 dark:text-white pt-1">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-lg font-bold text-neutral-900 dark:text-white pt-1">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-semibold text-neutral-900 dark:text-white pt-0.5">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc">
                {line.substring(2)}
              </li>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div
      onClick={onSelect}
      onDoubleClick={() => setIsEditing(true)}
      className={`group relative rounded-lg border transition-all duration-150 ${
        isActive
          ? 'border-blue-500/80 ring-1 ring-blue-500/20 shadow-xs bg-white dark:bg-neutral-900'
          : 'border-neutral-200 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Cell Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/40 dark:bg-neutral-900/40 select-none text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
            Markdown Text
          </span>
          <span className="text-[11px] text-neutral-400">
            {isEditing ? '(Editing - Click preview to finish)' : '(Double click to edit)'}
          </span>
        </div>

        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            title={isEditing ? 'Preview Markdown' : 'Edit Markdown'}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <Edit3 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onConvertToCode();
            }}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            title="Convert to Python Code"
          >
            <Code className="w-3.5 h-3.5" />
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

      {/* Body */}
      <div className="p-4">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={cell.source}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            placeholder="# Markdown Header\nWrite your notes here..."
            className="w-full bg-transparent resize-none focus:outline-hidden font-mono text-xs text-neutral-900 dark:text-neutral-100 leading-relaxed"
          />
        ) : (
          renderMarkdown(cell.source || '*Empty Markdown cell. Double click to add notes.*')
        )}
      </div>
    </div>
  );
};
