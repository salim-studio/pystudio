import React, { useState } from 'react';
import { 
  Terminal, 
  AlertTriangle, 
  Maximize2, 
  Download, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Variable,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { CellOutput, KernelVariable, AppMode, Language } from '../types';
import { DataFrameViewer } from './DataFrameViewer';
import { translations } from '../translations';

interface OutputPanelProps {
  output: CellOutput | null;
  cellCode?: string;
  isRunning: boolean;
  activeCellIndex: number;
  variables: KernelVariable[];
  mode: AppMode;
  language: Language;
  onAskAiDebug: (code: string, error: any) => void;
  onAskAiExplain: (code: string) => void;
  onRefreshVariables: () => void;
  onRunCell?: (index: number) => void;
  onClearError?: (index: number) => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  output,
  cellCode = '',
  isRunning,
  activeCellIndex,
  variables,
  mode,
  language,
  onAskAiDebug,
  onAskAiExplain,
  onRefreshVariables,
  onRunCell,
  onClearError,
}) => {
  const [activeTab, setActiveTab] = useState<'output' | 'variables'>('output');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedTraceback, setCopiedTraceback] = useState(false);
  const t = translations[language];

  const handleCopyTraceback = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTraceback(true);
    setTimeout(() => setCopiedTraceback(false), 2000);
  };

  const handleDownloadPlot = (dataUrl: string, idx: number) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `plot_cell_${activeCellIndex + 1}_${idx + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Beginner-friendly summary generator
  const getBeginnerSummary = (code: string) => {
    if (code.includes('import pandas') || code.includes('.read_csv')) {
      return 'Loads and structures tabular dataset with Pandas for data science analysis.';
    }
    if (code.includes('import matplotlib') || code.includes('plt.plot') || code.includes('sns.')) {
      return 'Generates high-resolution data visualization graphs and plots.';
    }
    if (code.includes('RandomForest') || code.includes('LogisticRegression') || code.includes('train_test_split')) {
      return 'Trains and evaluates a machine learning algorithm to make predictions.';
    }
    if (code.includes('import sympy') || code.includes('sp.symbols')) {
      return 'Solves symbolic algebraic equations and outputs exact mathematical expressions.';
    }
    if (code.includes('statsmodels') || code.includes('ols(')) {
      return 'Estimates an econometric regression model to test empirical hypothesis.';
    }
    if (code.includes('for ') || code.includes('while ')) {
      return 'Executes iterative loops over sequential data or conditions.';
    }
    if (code.includes('def ')) {
      return 'Defines a modular, reusable Python function.';
    }
    return 'Executes Python instructions and prints live computational results.';
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 overflow-hidden">
      {/* Header bar */}
      <div className="h-10 px-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'output'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.output}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('variables');
              onRefreshVariables();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'variables'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Variable className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.variables} ({variables.length})</span>
          </button>
        </div>

        {output?.elapsed_seconds !== undefined && (
          <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
            {output.elapsed_seconds}s
          </span>
        )}
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'variables' ? (
          /* Variables Inspector View */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                {t.variableInspector}
              </h3>
              <button
                onClick={onRefreshVariables}
                className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {variables.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs italic">
                {t.noVariables}
              </div>
            ) : (
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-600 dark:text-neutral-400">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Value / Shape</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                    {variables.map((v) => (
                      <tr key={v.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/60">
                        <td className="p-2 font-semibold text-emerald-600 dark:text-emerald-400">
                          {v.name}
                        </td>
                        <td className="p-2 text-neutral-500">
                          {v.type}
                        </td>
                        <td className="p-2 text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">
                          {v.preview}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Execution Output View */
          <div className="space-y-4">
            {isRunning ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span className="text-xs font-mono">{t.kernelRunning}</span>
              </div>
            ) : !output ? (
              <div className="p-12 text-center text-neutral-400 text-xs space-y-2">
                <Terminal className="w-8 h-8 mx-auto opacity-30 text-neutral-500" />
                <p>{t.noOutputYet}</p>
              </div>
            ) : (
              <>
                {/* 1. Beginner Mode Explanation Card */}
                {mode === 'beginner' && cellCode && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
                    <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{t.beginnerExplanation}</span>
                    </div>
                    <p className="text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                      {getBeginnerSummary(cellCode)}
                    </p>
                    <button
                      onClick={() => onAskAiExplain(cellCode)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline pt-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{t.askAiToExplain}</span>
                    </button>
                  </div>
                )}

                {/* 2. Error Display (if any) */}
                {output.error && (
                  <div className={`rounded-lg border p-3 space-y-2.5 text-xs ${
                    output.error.type === 'Notice'
                      ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30'
                      : 'border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 font-bold text-sm ${
                        output.error.type === 'Notice'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}>
                        <AlertTriangle className={`w-4 h-4 ${output.error.type === 'Notice' ? 'text-amber-600' : 'text-red-600'}`} />
                        <span>{output.error.type}</span>
                        {output.error.line && (
                          <span className="text-xs font-normal text-red-500 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">
                            Line {output.error.line}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onRunCell && (
                          <button
                            onClick={() => onRunCell(activeCellIndex)}
                            disabled={isRunning}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-[11px] shadow-xs transition-colors cursor-pointer"
                            title="Re-run Cell"
                          >
                            <RotateCcw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                            <span>Re-run Cell</span>
                          </button>
                        )}
                        {onClearError && output.error.type === 'Notice' && (
                          <button
                            onClick={() => onClearError(activeCellIndex)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-[11px] transition-colors cursor-pointer"
                            title="Dismiss Notice"
                          >
                            <span>Dismiss</span>
                          </button>
                        )}
                        <button
                          onClick={() => onAskAiDebug(cellCode, output.error)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 text-white font-medium text-[11px] shadow-xs transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{t.askAiToDebug}</span>
                        </button>
                      </div>
                    </div>

                    <div className={`font-mono text-xs ${
                      output.error.type === 'Notice'
                        ? 'text-amber-900 dark:text-amber-200'
                        : 'text-red-800 dark:text-red-300'
                    }`}>
                      {output.error.message}
                    </div>

                    {/* Suggested Solution Card */}
                    {output.error.suggestion && (
                      <div className={`p-2.5 rounded border text-[11px] space-y-1 ${
                        output.error.type === 'Notice'
                          ? 'bg-amber-100/50 dark:bg-neutral-900 border-amber-200 dark:border-amber-800/80'
                          : 'bg-white dark:bg-neutral-900 border-red-200 dark:border-red-800'
                      }`}>
                        <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {t.suggestedFix}
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {output.error.suggestion}
                        </p>
                      </div>
                    )}

                    {/* Traceback toggle/copy - only displayed if traceback exists */}
                    {Boolean(output.error.traceback) && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 uppercase font-semibold">
                          <span>Traceback</span>
                          <button
                            onClick={() => handleCopyTraceback(output.error?.traceback || '')}
                            className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
                          >
                            {copiedTraceback ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedTraceback ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-2 rounded bg-neutral-900 text-red-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-40">
                          {output.error.traceback}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Text Stdout Output */}
                {output.stdout && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                      <Terminal className="w-3 h-3" />
                      <span>Standard Output (stdout)</span>
                    </div>
                    <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-neutral-800 shadow-inner">
                      {output.stdout}
                    </pre>
                  </div>
                )}

                {/* 4. Text Stderr Output */}
                {output.stderr && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">
                      Warnings / Stderr
                    </div>
                    <pre className="p-3 rounded-lg bg-amber-950/20 text-amber-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap border border-amber-900/40">
                      {output.stderr}
                    </pre>
                  </div>
                )}

                {/* 5. DataFrame Output */}
                {output.result?.type === 'dataframe' && output.result && (
                  <div className="space-y-1">
                    <DataFrameViewer data={output.result} />
                  </div>
                )}

                {/* 6. Matplotlib / Seaborn Visualizations */}
                {output.plots && output.plots.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      <span>Visualization ({output.plots.length})</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.2))}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setZoomLevel(1)}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          title="Reset Zoom"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setZoomLevel(z => Math.min(2.0, z + 0.2))}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {output.plots.map((plot, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-xs overflow-hidden relative group"
                      >
                        <div className="overflow-auto flex justify-center">
                          <img
                            src={plot.data}
                            alt={`Plot ${idx + 1}`}
                            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                            className="transition-transform duration-150 rounded"
                          />
                        </div>

                        {/* Hover action buttons */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-neutral-900/90 p-1 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800">
                          <button
                            onClick={() => handleDownloadPlot(plot.data, idx)}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-700 dark:text-neutral-300"
                            title="Download PNG"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 7. LaTeX Math Formula Output */}
                {output.result?.type === 'latex' && (
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-2 shadow-xs">
                    <div className="text-[11px] font-semibold text-neutral-500 uppercase">
                      Mathematical Expression (LaTeX / SymPy)
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded font-serif text-lg text-center overflow-x-auto text-emerald-700 dark:text-emerald-400 font-medium">
                      $${output.result.latex || output.result.text}$$
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono text-center">
                      Text representation: {output.result.text}
                    </div>
                  </div>
                )}

                {/* 8. Standard Return Value Repr */}
                {output.result?.type === 'repr' && output.result.value && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      Result [{output.result.raw_type || 'object'}]
                    </div>
                    <pre className="p-3 rounded-lg bg-white dark:bg-neutral-900 font-mono text-xs text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 overflow-x-auto shadow-xs">
                      {output.result.value}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
