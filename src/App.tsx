import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Notebook, 
  NotebookCell, 
  KernelStatus, 
  KernelVariable, 
  ActiveTab, 
  FileItem, 
  Language, 
  AppMode, 
  Lesson, 
  Exercise 
} from './types';
import { TopToolbar } from './components/TopToolbar';
import { BottomStatusBar } from './components/BottomStatusBar';
import { Sidebar } from './components/Sidebar';
import { NotebookEditor } from './components/NotebookEditor';
import { OutputPanel } from './components/OutputPanel';
import { PackageManagerModal } from './components/PackageManagerModal';
import { UploadDatasetModal } from './components/UploadDatasetModal';
import { AITutorDrawer } from './components/AITutorDrawer';
import { safeFetch } from './lib/api';

// Initial default notebook
const INITIAL_NOTEBOOK: Notebook = {
  id: 'nb-welcome',
  title: '01_Welcome_to_Python.ipynb',
  filePath: 'workspace/notebooks/01_Welcome_to_Python.ipynb',
  isModified: false,
  cells: [
    {
      id: 'c1',
      cell_type: 'markdown',
      source: '# 🐍 Welcome to Python Learning Studio\nThis is an interactive Python learning environment powered by a real, persistent Python 3.10 kernel.\n- Run cells with **Shift + Enter** or click the Play button.\n- Variables and imported modules remain in memory across all cells.\n- High-resolution Matplotlib graphs, Pandas DataFrames, and LaTeX math formulas are automatically rendered.'
    },
    {
      id: 'c2',
      cell_type: 'code',
      source: `# 1. Python Basics & Variables\nname = "Python Studio"\nversion = "3.10"\nfeatures = ["NumPy", "Pandas", "Matplotlib", "Scikit-Learn", "Statsmodels"]\n\nprint(f"Welcome to {name} (Kernel: Python {version})!")\nprint(f"Preloaded scientific modules: {', '.join(features)}")`
    },
    {
      id: 'c3',
      cell_type: 'code',
      source: `import pandas as pd\nimport numpy as np\n\n# 2. Interactive Pandas DataFrame\ndf = pd.read_csv('workspace/data/students.csv')\nprint(f"Loaded student performance dataset with shape: {df.shape}")\ndf`
    },
    {
      id: 'c4',
      cell_type: 'code',
      source: `import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# 3. High-Resolution Statistical Plot\nplt.figure(figsize=(7, 4))\nsns.scatterplot(data=df, x='study_hours', y='final_grade', hue='passed_exam', palette={1: '#10b981', 0: '#ef4444'}, s=80)\nplt.title('Final Exam Grade vs. Study Hours', fontsize=12, fontweight='bold')\nplt.xlabel('Study Hours per Week')\nplt.ylabel('Final Grade (%)')\nplt.grid(True, linestyle='--', alpha=0.5)\nplt.tight_layout()\nplt.show()`
    },
    {
      id: 'c5',
      cell_type: 'code',
      source: `import sympy as sp\n\n# 4. Symbolic Mathematics & LaTeX Expressions\nx = sp.symbols('x')\nfunc = sp.sin(x)**2 * sp.exp(x)\nintegral = sp.integrate(func, x)\nprint("Symbolic Integral Result:")\nintegral`
    }
  ]
};

export default function App() {
  // Theme & Language & Mode
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<AppMode>('beginner');

  // Notebooks state
  const [openNotebooks, setOpenNotebooks] = useState<Notebook[]>([INITIAL_NOTEBOOK]);
  const [activeNotebookId, setActiveNotebookId] = useState<string>('nb-welcome');
  const [activeCellIndex, setActiveCellIndex] = useState<number>(1);
  const [runningCellIndex, setRunningCellIndex] = useState<number | null>(null);

  // Kernel & Telemetry state
  const [kernelStatus, setKernelStatus] = useState<KernelStatus | null>(null);
  const [variables, setVariables] = useState<KernelVariable[]>([]);
  const [lastExecutionTime, setLastExecutionTime] = useState<number | null>(null);
  const [executionCounter, setExecutionCounter] = useState<number>(0);

  // Sidebar & Modals state
  const [sidebarTab, setSidebarTab] = useState<ActiveTab>('courses');
  const [filesTree, setFilesTree] = useState<FileItem[]>([]);
  const [isPackageManagerOpen, setIsPackageManagerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);

  // AI Tutor contextual state
  const [aiContextCode, setAiContextCode] = useState<string>('');
  const [aiContextError, setAiContextError] = useState<any>(null);

  // Get active notebook
  const activeNotebook = openNotebooks.find(n => n.id === activeNotebookId) || openNotebooks[0];
  const activeCell = activeNotebook?.cells[activeCellIndex];

  // Sync theme with DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync RTL direction when Arabic is selected
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [language]);

  // Initial data loading (Kernel status, variables, files tree)
  const fetchKernelStatus = async () => {
    try {
      const res = await safeFetch<KernelStatus>('/api/kernel/status', undefined, 5000);
      if (res.ok && res.data) {
        setKernelStatus(res.data);
      }
    } catch {
      // safe fallback
    }
  };

  const fetchVariables = async () => {
    try {
      const res = await safeFetch<{ variables: KernelVariable[] }>('/api/kernel/variables', undefined, 5000);
      if (res.ok && res.data?.variables) {
        setVariables(res.data.variables);
      }
    } catch {
      // safe fallback
    }
  };

  const fetchFilesTree = async () => {
    try {
      const res = await safeFetch<{ tree: FileItem[] }>('/api/files/tree', undefined, 5000);
      if (res.ok && res.data?.tree) {
        setFilesTree(res.data.tree);
      }
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    fetchKernelStatus();
    fetchFilesTree();
    fetchVariables();
    const interval = setInterval(() => {
      fetchKernelStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update cell source
  const handleUpdateCellSource = (idx: number, source: string) => {
    setOpenNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const updatedCells = [...nb.cells];
      updatedCells[idx] = { ...updatedCells[idx], source };
      return { ...nb, cells: updatedCells, isModified: true };
    }));
  };

  // Run a single cell
  const handleRunCell = async (cellIdx: number) => {
    if (!activeNotebook) return;
    const targetCell = activeNotebook.cells[cellIdx];
    if (!targetCell || targetCell.cell_type !== 'code') return;

    setRunningCellIndex(cellIdx);
    const nextCount = executionCounter + 1;
    setExecutionCounter(nextCount);

    try {
      const res = await safeFetch<any>('/api/kernel/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: targetCell.source })
      }, 45000, 3);

      let output: any;
      if (res.ok && res.data) {
        output = res.data.data || res.data;
      } else {
        output = {
          execution_count: nextCount,
          stdout: '',
          stderr: '',
          result: null,
          plots: [],
          error: {
            type: 'Notice',
            message: res.error || 'Server response could not be loaded.',
            suggestion: 'If the server was restarting or timed out, simply re-run this cell.'
          },
          elapsed_seconds: 0
        };
      }

      setLastExecutionTime(output.elapsed_seconds || 0.05);

      // Save output to cell
      setOpenNotebooks(prev => prev.map(nb => {
        if (nb.id !== activeNotebookId) return nb;
        const updatedCells = [...nb.cells];
        updatedCells[cellIdx] = {
          ...updatedCells[cellIdx],
          output,
          execution_count: output.execution_count || nextCount
        };
        return { ...nb, cells: updatedCells };
      }));

      // Set AI context if there is an error
      if (output.error) {
        setAiContextCode(targetCell.source);
        setAiContextError(output.error);
      }

      // Refresh variable inspector
      fetchVariables();
      fetchKernelStatus();
    } catch (e: any) {
      console.error('Execution notice:', e);
    } finally {
      setRunningCellIndex(null);
    }
  };

  // Run cell and select next
  const handleRunAndSelectNext = async (cellIdx: number) => {
    await handleRunCell(cellIdx);
    if (cellIdx < activeNotebook.cells.length - 1) {
      setActiveCellIndex(cellIdx + 1);
    } else {
      // Add new code cell at the end
      handleAddCell('code');
      setActiveCellIndex(cellIdx + 1);
    }
  };

  // Run cell and insert below
  const handleRunAndInsertBelow = async (cellIdx: number) => {
    await handleRunCell(cellIdx);
    handleAddCell('code', cellIdx + 1);
    setActiveCellIndex(cellIdx + 1);
  };

  // Run all cells sequentially
  const handleRunAll = async () => {
    if (!activeNotebook) return;
    for (let i = 0; i < activeNotebook.cells.length; i++) {
      if (activeNotebook.cells[i].cell_type === 'code') {
        setActiveCellIndex(i);
        await handleRunCell(i);
      }
    }
  };

  // Add cell
  const handleAddCell = (type: 'code' | 'markdown', atIndex?: number) => {
    setOpenNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const newCell: NotebookCell = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        cell_type: type,
        source: type === 'code' ? '' : '### Notes\nEnter notes here...'
      };
      const updatedCells = [...nb.cells];
      const insertAt = atIndex !== undefined ? atIndex : updatedCells.length;
      updatedCells.splice(insertAt, 0, newCell);
      return { ...nb, cells: updatedCells, isModified: true };
    }));
    if (atIndex !== undefined) {
      setActiveCellIndex(atIndex);
    } else {
      setActiveCellIndex(activeNotebook.cells.length);
    }
  };

  // Move cell
  const handleMoveCell = (from: number, to: number) => {
    if (to < 0 || to >= activeNotebook.cells.length) return;
    setOpenNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const updated = [...nb.cells];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return { ...nb, cells: updated, isModified: true };
    }));
    setActiveCellIndex(to);
  };

  // Delete cell
  const handleDeleteCell = (idx: number) => {
    if (activeNotebook.cells.length <= 1) return;
    setOpenNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const updated = [...nb.cells];
      updated.splice(idx, 1);
      return { ...nb, cells: updated, isModified: true };
    }));
    setActiveCellIndex(Math.max(0, idx - 1));
  };

  // Duplicate cell
  const handleDuplicateCell = (idx: number) => {
    setOpenNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const original = nb.cells[idx];
      const dup: NotebookCell = {
        ...original,
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        execution_count: undefined,
        output: undefined
      };
      const updated = [...nb.cells];
      updated.splice(idx + 1, 0, dup);
      return { ...nb, cells: updated, isModified: true };
    }));
    setActiveCellIndex(idx + 1);
  };

  // Convert cell type (code <-> markdown)
  const handleConvertCellType = (idx: number, type: 'code' | 'markdown') => {
    setOpenNotebooks(prev => prev.map(nb => {
      if (nb.id !== activeNotebookId) return nb;
      const updated = [...nb.cells];
      updated[idx] = {
        ...updated[idx],
        cell_type: type,
        output: undefined,
        execution_count: undefined
      };
      return { ...nb, cells: updated, isModified: true };
    }));
  };

  // New Notebook
  const handleNewNotebook = () => {
    const newId = `nb-${Date.now()}`;
    const newNb: Notebook = {
      id: newId,
      title: `Untitled_${openNotebooks.length + 1}.ipynb`,
      isModified: true,
      cells: [
        {
          id: 'c1',
          cell_type: 'code',
          source: '# Welcome to your new Python notebook!\nimport numpy as np\nimport pandas as pd\n\nprint("Kernel is ready.")'
        }
      ]
    };
    setOpenNotebooks(prev => [...prev, newNb]);
    setActiveNotebookId(newId);
    setActiveCellIndex(0);
  };

  // Save Notebook
  const handleSaveNotebook = async () => {
    if (!activeNotebook) return;
    try {
      const fileName = activeNotebook.title.endsWith('.ipynb')
        ? activeNotebook.title
        : `${activeNotebook.title}.ipynb`;
      const filePath = activeNotebook.filePath || `workspace/notebooks/${fileName}`;

      const res = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath,
          notebookData: {
            cells: activeNotebook.cells
          }
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setOpenNotebooks(prev => prev.map(nb => {
          if (nb.id !== activeNotebookId) return nb;
          return { ...nb, isModified: false, filePath };
        }));
        fetchFilesTree();
      }
    } catch (e) {
      console.error('Failed to save notebook:', e);
    }
  };

  // Export Notebook
  const handleExportNotebook = () => {
    if (!activeNotebook) return;
    const jsonStr = JSON.stringify({
      cells: activeNotebook.cells.map(c => ({
        cell_type: c.cell_type,
        execution_count: c.execution_count || null,
        metadata: {},
        source: c.source.split('\n').map(l => l + '\n')
      })),
      metadata: {
        kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
        language_info: { name: 'python', version: '3.10.12' }
      },
      nbformat: 4,
      nbformat_minor: 5
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeNotebook.title.endsWith('.ipynb') ? activeNotebook.title : `${activeNotebook.title}.ipynb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Close notebook tab
  const handleCloseNotebook = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openNotebooks.length <= 1) return;
    const remaining = openNotebooks.filter(n => n.id !== id);
    setOpenNotebooks(remaining);
    if (activeNotebookId === id) {
      setActiveNotebookId(remaining[0].id);
      setActiveCellIndex(0);
    }
  };

  // Restart Kernel
  const handleRestartKernel = async () => {
    try {
      await fetch('/api/kernel/restart', { method: 'POST' });
      await fetchKernelStatus();
      await fetchVariables();
      setLastExecutionTime(null);
    } catch (e) {
      console.error('Failed to restart kernel:', e);
    }
  };

  // Stop / Interrupt Kernel
  const handleStopKernel = async () => {
    try {
      await fetch('/api/kernel/stop', { method: 'POST' });
      setRunningCellIndex(null);
    } catch (e) {
      console.error('Failed to stop kernel:', e);
    }
  };

  // Open file from explorer
  const handleOpenFile = async (path: string) => {
    try {
      const res = await fetch(`/api/files/read?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.status === 'success') {
        if (path.endsWith('.ipynb')) {
          const cells: NotebookCell[] = (data.content.cells || []).map((c: any, i: number) => ({
            id: `c_${i}_${Date.now()}`,
            cell_type: c.cell_type === 'markdown' ? 'markdown' : 'code',
            source: Array.isArray(c.source) ? c.source.join('') : (c.source || '')
          }));

          const nbTitle = path.split('/').pop() || 'notebook.ipynb';
          const newNb: Notebook = {
            id: `nb-${Date.now()}`,
            title: nbTitle,
            filePath: path,
            isModified: false,
            cells: cells.length > 0 ? cells : [{ id: 'c1', cell_type: 'code', source: '' }]
          };

          setOpenNotebooks(prev => [...prev, newNb]);
          setActiveNotebookId(newNb.id);
          setActiveCellIndex(0);
        } else if (path.endsWith('.csv')) {
          // Open CSV dataset directly as a new cell in active notebook
          handleOpenDataset(path);
        }
      }
    } catch (e) {
      console.error('Failed to open file:', e);
    }
  };

  // Open dataset as DataFrame in active notebook
  const handleOpenDataset = (csvPath: string) => {
    const code = `import pandas as pd\n\n# Load dataset\ndf = pd.read_csv('${csvPath}')\nprint(f"Dataset summary: {df.shape[0]} rows, {df.shape[1]} columns")\ndf.head(10)`;
    handleAddCell('code');
    setTimeout(() => {
      const newIdx = activeNotebook.cells.length;
      handleUpdateCellSource(newIdx, code);
      handleRunCell(newIdx);
    }, 50);
  };

  // Generate automated EDA report
  const handleGenerateEDA = (csvPath: string) => {
    const code = `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Automated Exploratory Data Analysis (EDA)\ndf = pd.read_csv('${csvPath}')\nprint("=== Dataset Information ===")\nprint(df.info())\n\nprint("\\n=== Summary Statistics ===")\ndisplay = df.describe()\n\n# Generate distribution histograms\nnum_cols = df.select_dtypes(include=[np.number]).columns.tolist()\nif num_cols:\n    plt.figure(figsize=(8, 4))\n    df[num_cols].hist(figsize=(8, 4), bins=10, edgecolor='black')\n    plt.suptitle('Numerical Feature Distributions', fontsize=12, fontweight='bold')\n    plt.tight_layout()\n    plt.show()\n\ndf`;
    handleAddCell('code');
    setTimeout(() => {
      const newIdx = activeNotebook.cells.length;
      handleUpdateCellSource(newIdx, code);
      handleRunCell(newIdx);
    }, 50);
  };

  // Load lesson into active notebook
  const handleLoadLessonToNotebook = (lesson: Lesson) => {
    const cells: NotebookCell[] = [
      {
        id: `c_md_${Date.now()}`,
        cell_type: 'markdown',
        source: `# ${lesson.title}\n\n${lesson.description}\n\n### Objective\nRun the code below to see how this Python concept works in practice.`
      },
      {
        id: `c_code_${Date.now()}`,
        cell_type: 'code',
        source: lesson.codeExample
      }
    ];

    const lessonNb: Notebook = {
      id: `nb-lesson-${lesson.id}-${Date.now()}`,
      title: `${lesson.title}.ipynb`,
      isModified: false,
      cells
    };

    setOpenNotebooks(prev => [...prev, lessonNb]);
    setActiveNotebookId(lessonNb.id);
    setActiveCellIndex(1);
    setTimeout(() => {
      handleRunCell(1);
    }, 100);
  };

  // Load exercise into active notebook
  const handleLoadExerciseToNotebook = (exercise: Exercise) => {
    const cells: NotebookCell[] = [
      {
        id: `c_ex_md_${Date.now()}`,
        cell_type: 'markdown',
        source: `# 🎯 Challenge: ${exercise.title} [${exercise.difficulty}]\n\n${exercise.description}\n\n> **Hint:** ${exercise.hint}`
      },
      {
        id: `c_ex_code_${Date.now()}`,
        cell_type: 'code',
        source: `${exercise.starterCode}\n# Run Automated Unit Tests\n${exercise.testCode}`
      }
    ];

    const exNb: Notebook = {
      id: `nb-ex-${exercise.id}-${Date.now()}`,
      title: `Exercise_${exercise.title}.ipynb`,
      isModified: false,
      cells
    };

    setOpenNotebooks(prev => [...prev, exNb]);
    setActiveNotebookId(exNb.id);
    setActiveCellIndex(1);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
      {/* 1. Top Navigation & Execution Toolbar */}
      <TopToolbar
        kernelStatus={kernelStatus}
        isRunning={runningCellIndex !== null}
        activeNotebookTitle={activeNotebook?.title || 'Notebook'}
        isModified={!!activeNotebook?.isModified}
        language={language}
        theme={theme}
        mode={mode}
        onLanguageChange={setLanguage}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onModeToggle={() => setMode(m => m === 'beginner' ? 'pro' : 'beginner')}
        onRunActiveCell={() => handleRunCell(activeCellIndex)}
        onRunAll={handleRunAll}
        onStopKernel={handleStopKernel}
        onRestartKernel={handleRestartKernel}
        onNewNotebook={handleNewNotebook}
        onSaveNotebook={handleSaveNotebook}
        onExportNotebook={handleExportNotebook}
        onOpenLibraries={() => setIsPackageManagerOpen(true)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onToggleAiTutor={() => setIsAiTutorOpen(o => !o)}
        isAiTutorOpen={isAiTutorOpen}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Activity bar & Drawer */}
        <Sidebar
          activeTab={sidebarTab}
          onSelectTab={setSidebarTab}
          filesTree={filesTree}
          variables={variables}
          language={language}
          mode={mode}
          onOpenFile={handleOpenFile}
          onNewNotebook={handleNewNotebook}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenLibraries={() => setIsPackageManagerOpen(true)}
          onLoadLessonToNotebook={handleLoadLessonToNotebook}
          onLoadExerciseToNotebook={handleLoadExerciseToNotebook}
          onOpenDataset={handleOpenDataset}
          onGenerateEDA={handleGenerateEDA}
          onRefreshFiles={fetchFilesTree}
        />

        {/* Center: Notebook Code & Markdown Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-neutral-200 dark:border-neutral-800">
          {activeNotebook && (
            <NotebookEditor
              notebook={activeNotebook}
              openNotebooks={openNotebooks}
              activeNotebookId={activeNotebookId}
              activeCellIndex={activeCellIndex}
              runningCellIndex={runningCellIndex}
              language={language}
              onSelectNotebook={setActiveNotebookId}
              onCloseNotebook={handleCloseNotebook}
              onNewTab={handleNewNotebook}
              onSelectCell={setActiveCellIndex}
              onUpdateCellSource={handleUpdateCellSource}
              onRunCell={handleRunCell}
              onRunAndSelectNext={handleRunAndSelectNext}
              onRunAndInsertBelow={handleRunAndInsertBelow}
              onMoveCell={handleMoveCell}
              onDeleteCell={handleDeleteCell}
              onDuplicateCell={handleDuplicateCell}
              onConvertCellType={handleConvertCellType}
              onAddCell={handleAddCell}
            />
          )}
        </div>

        {/* Right: Dedicated Output & Results Panel */}
        <div className="w-[380px] lg:w-[460px] xl:w-[500px] shrink-0 hidden md:flex flex-col">
          <OutputPanel
            output={activeCell?.output || null}
            cellCode={activeCell?.source || ''}
            isRunning={runningCellIndex === activeCellIndex}
            activeCellIndex={activeCellIndex}
            variables={variables}
            mode={mode}
            language={language}
            onAskAiDebug={(code, err) => {
              setAiContextCode(code);
              setAiContextError(err);
              setIsAiTutorOpen(true);
            }}
            onAskAiExplain={(code) => {
              setAiContextCode(code);
              setIsAiTutorOpen(true);
            }}
            onRefreshVariables={fetchVariables}
            onRunCell={handleRunCell}
          />
        </div>

        {/* AI Tutor Slide-over Drawer */}
        <AITutorDrawer
          isOpen={isAiTutorOpen}
          onClose={() => setIsAiTutorOpen(false)}
          language={language}
          mode={mode}
          currentCode={aiContextCode || activeCell?.source || ''}
          currentError={aiContextError || activeCell?.output?.error || null}
          onInsertCodeToCell={(code) => {
            handleAddCell('code');
            setTimeout(() => {
              handleUpdateCellSource(activeNotebook.cells.length, code);
            }, 50);
          }}
        />
      </div>

      {/* 3. Bottom Status Bar */}
      <BottomStatusBar
        kernelStatus={kernelStatus}
        lastExecutionTime={lastExecutionTime}
        cellCount={activeNotebook?.cells.length || 0}
        variablesCount={variables.length}
      />

      {/* Modals */}
      <PackageManagerModal
        isOpen={isPackageManagerOpen}
        onClose={() => setIsPackageManagerOpen(false)}
        language={language}
      />

      <UploadDatasetModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        language={language}
        onUploadSuccess={(filename, path) => {
          fetchFilesTree();
          handleOpenDataset(path);
        }}
      />
    </div>
  );
}
