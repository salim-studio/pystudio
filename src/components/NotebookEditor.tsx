import React from 'react';
import { 
  Plus, 
  Code, 
  FileText, 
  Play, 
  Check, 
  FileCode, 
  X,
  PlusCircle
} from 'lucide-react';
import { Notebook, NotebookCell, Language } from '../types';
import { CodeCell } from './CodeCell';
import { MarkdownCell } from './MarkdownCell';
import { translations } from '../translations';

interface NotebookEditorProps {
  notebook: Notebook;
  openNotebooks: Notebook[];
  activeNotebookId: string;
  activeCellIndex: number;
  runningCellIndex: number | null;
  language: Language;
  onSelectNotebook: (id: string) => void;
  onCloseNotebook: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  onSelectCell: (index: number) => void;
  onUpdateCellSource: (index: number, source: string) => void;
  onRunCell: (index: number) => void;
  onRunAndSelectNext: (index: number) => void;
  onRunAndInsertBelow: (index: number) => void;
  onMoveCell: (from: number, to: number) => void;
  onDeleteCell: (index: number) => void;
  onDuplicateCell: (index: number) => void;
  onConvertCellType: (index: number, type: 'code' | 'markdown') => void;
  onAddCell: (type: 'code' | 'markdown') => void;
  onClearError?: (index: number) => void;
}

export const NotebookEditor: React.FC<NotebookEditorProps> = ({
  notebook,
  openNotebooks,
  activeNotebookId,
  activeCellIndex,
  runningCellIndex,
  language,
  onSelectNotebook,
  onCloseNotebook,
  onNewTab,
  onSelectCell,
  onUpdateCellSource,
  onRunCell,
  onRunAndSelectNext,
  onRunAndInsertBelow,
  onMoveCell,
  onDeleteCell,
  onDuplicateCell,
  onConvertCellType,
  onAddCell,
  onClearError
}) => {
  const t = translations[language];

  return (
    <div className="h-full flex flex-col bg-neutral-100/60 dark:bg-neutral-950 overflow-hidden">
      {/* Notebook Tabs Bar */}
      <div className="h-10 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 flex items-center px-2 gap-1 overflow-x-auto select-none shrink-0">
        {openNotebooks.map((nb) => {
          const isActive = nb.id === activeNotebookId;
          return (
            <div
              key={nb.id}
              onClick={() => onSelectNotebook(nb.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t text-xs font-medium cursor-pointer border-t-2 transition-all shrink-0 ${
                isActive
                  ? 'border-emerald-500 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white shadow-xs'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[160px]">{nb.title}</span>
              {nb.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              {openNotebooks.length > 1 && (
                <button
                  onClick={(e) => onCloseNotebook(nb.id, e)}
                  className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={onNewTab}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title="New Notebook Tab"
        >
          <PlusCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cells Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notebook.cells.map((cell, idx) => (
          <div key={cell.id}>
            {cell.cell_type === 'code' ? (
              <CodeCell
                cell={cell}
                index={idx}
                isActive={idx === activeCellIndex}
                isRunning={runningCellIndex === idx}
                totalCells={notebook.cells.length}
                onSelect={() => onSelectCell(idx)}
                onChange={(src) => onUpdateCellSource(idx, src)}
                onRun={() => onRunCell(idx)}
                onRunAndSelectNext={() => onRunAndSelectNext(idx)}
                onRunAndInsertBelow={() => onRunAndInsertBelow(idx)}
                onMoveUp={() => onMoveCell(idx, idx - 1)}
                onMoveDown={() => onMoveCell(idx, idx + 1)}
                onDelete={() => onDeleteCell(idx)}
                onDuplicate={() => onDuplicateCell(idx)}
                onConvertToMarkdown={() => onConvertCellType(idx, 'markdown')}
                onClearError={() => onClearError?.(idx)}
              />
            ) : (
              <MarkdownCell
                cell={cell}
                index={idx}
                isActive={idx === activeCellIndex}
                totalCells={notebook.cells.length}
                onSelect={() => onSelectCell(idx)}
                onChange={(src) => onUpdateCellSource(idx, src)}
                onMoveUp={() => onMoveCell(idx, idx - 1)}
                onMoveDown={() => onMoveCell(idx, idx + 1)}
                onDelete={() => onDeleteCell(idx)}
                onDuplicate={() => onDuplicateCell(idx)}
                onConvertToCode={() => onConvertCellType(idx, 'code')}
              />
            )}
          </div>
        ))}

        {/* Bottom Cell Addition Toolbar */}
        <div className="pt-2 pb-8 flex items-center justify-center gap-3 select-none">
          <button
            onClick={() => onAddCell('code')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 shadow-2xs hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
          >
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.addCodeCell}</span>
          </button>

          <button
            onClick={() => onAddCell('markdown')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 shadow-2xs hover:border-blue-500 dark:hover:border-blue-500 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.addMarkdownCell}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
