import React from 'react';
import { 
  Play, 
  FastForward, 
  Square, 
  RotateCcw, 
  Save, 
  FilePlus, 
  Download, 
  Package, 
  Upload, 
  Sparkles, 
  Sun, 
  Moon, 
  Globe, 
  GraduationCap, 
  Laptop,
  FolderOpen
} from 'lucide-react';
import { KernelStatus, Language, AppMode } from '../types';
import { translations } from '../translations';

interface TopToolbarProps {
  kernelStatus: KernelStatus | null;
  isRunning: boolean;
  activeNotebookTitle: string;
  isModified: boolean;
  language: Language;
  theme: 'dark' | 'light';
  mode: AppMode;
  onLanguageChange: (lang: Language) => void;
  onThemeToggle: () => void;
  onModeToggle: () => void;
  onRunActiveCell: () => void;
  onRunAll: () => void;
  onStopKernel: () => void;
  onRestartKernel: () => void;
  onNewNotebook: () => void;
  onSaveNotebook: () => void;
  onExportNotebook: () => void;
  onOpenLibraries: () => void;
  onOpenUpload: () => void;
  onToggleAiTutor: () => void;
  isAiTutorOpen: boolean;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  kernelStatus,
  isRunning,
  activeNotebookTitle,
  isModified,
  language,
  theme,
  mode,
  onLanguageChange,
  onThemeToggle,
  onModeToggle,
  onRunActiveCell,
  onRunAll,
  onStopKernel,
  onRestartKernel,
  onNewNotebook,
  onSaveNotebook,
  onExportNotebook,
  onOpenLibraries,
  onOpenUpload,
  onToggleAiTutor,
  isAiTutorOpen
}) => {
  const t = translations[language];

  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 flex items-center justify-between gap-2 select-none z-20">
      {/* Left branding & Active notebook title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
            <span className="text-base font-mono">Py</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm tracking-tight">
                {t.appName}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                {mode === 'beginner' ? t.beginnerMode : t.proMode}
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
              {activeNotebookTitle} {isModified ? '•' : ''}
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

        {/* Notebook File actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onNewNotebook}
            title={t.newNotebook}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <FilePlus className="w-4 h-4" />
          </button>
          <button
            onClick={onSaveNotebook}
            title={t.saveNotebook}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={onExportNotebook}
            title={t.exportNotebook}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors hidden sm:flex"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Execution controls */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/70 p-1 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
        <button
          onClick={onRunActiveCell}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs disabled:opacity-50 transition-colors"
          title={`${t.runCell} (Shift+Enter)`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden md:inline">{t.runCell}</span>
        </button>

        <button
          onClick={onRunAll}
          disabled={isRunning}
          className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-colors"
          title={t.runAll}
        >
          <FastForward className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{t.runAll}</span>
        </button>

        {isRunning && (
          <button
            onClick={onStopKernel}
            className="flex items-center gap-1 px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
            title={t.stopKernel}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">{t.stopKernel}</span>
          </button>
        )}

        <button
          onClick={onRestartKernel}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
          title={t.restartKernel}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Tools & Settings */}
      <div className="flex items-center gap-1.5">
        {/* Kernel Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/50">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning
                ? 'bg-amber-500 animate-pulse'
                : kernelStatus?.status === 'ready'
                ? 'bg-emerald-500'
                : 'bg-neutral-400'
            }`}
          />
          <span className="text-[11px]">
            {isRunning ? t.kernelRunning : t.kernelReady}
          </span>
        </div>

        {/* Package Manager button */}
        <button
          onClick={onOpenLibraries}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium border border-neutral-200 dark:border-neutral-800 transition-colors"
          title={t.libraries}
        >
          <Package className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden md:inline">{t.libraries}</span>
        </button>

        {/* Upload file button */}
        <button
          onClick={onOpenUpload}
          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors hidden sm:flex"
          title={t.uploadDataset}
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* AI Tutor Toggle */}
        <button
          onClick={onToggleAiTutor}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            isAiTutorOpen
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
          }`}
          title={t.aiTutor}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.aiTutor}</span>
        </button>

        {/* Mode Toggle (Beginner / Pro) */}
        <button
          onClick={onModeToggle}
          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          title={mode === 'beginner' ? t.proMode : t.beginnerMode}
        >
          {mode === 'beginner' ? (
            <Laptop className="w-4 h-4 text-emerald-600" />
          ) : (
            <GraduationCap className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Language Switcher */}
        <div className="relative flex items-center bg-neutral-100 dark:bg-neutral-800 rounded p-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          {(['en', 'ar', 'fr'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-1.5 py-0.5 rounded text-[11px] uppercase transition-all ${
                language === lang
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                  : 'hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          title={theme === 'dark' ? t.lightMode : t.darkMode}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
