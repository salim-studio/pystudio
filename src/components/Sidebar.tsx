import React, { useState } from 'react';
import { 
  FolderTree, 
  BookOpen, 
  CheckSquare, 
  Database, 
  Package, 
  Variable, 
  Sparkles, 
  FileCode, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Upload, 
  CheckCircle, 
  Circle,
  Play,
  RotateCcw,
  Search,
  ExternalLink,
  Award,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import { ActiveTab, FileItem, Course, Lesson, Exercise, KernelVariable, Language, AppMode } from '../types';
import { coursesData } from '../data/coursesData';
import { exercisesData } from '../data/exercisesData';
import { translations } from '../translations';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  filesTree: FileItem[];
  variables: KernelVariable[];
  language: Language;
  mode: AppMode;
  onOpenFile: (path: string) => void;
  onNewNotebook: () => void;
  onOpenUpload: () => void;
  onOpenLibraries: () => void;
  onLoadLessonToNotebook: (lesson: Lesson) => void;
  onLoadExerciseToNotebook: (exercise: Exercise) => void;
  onOpenDataset: (path: string) => void;
  onGenerateEDA: (path: string) => void;
  onRefreshFiles: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  filesTree,
  variables,
  language,
  mode,
  onOpenFile,
  onNewNotebook,
  onOpenUpload,
  onOpenLibraries,
  onLoadLessonToNotebook,
  onLoadExerciseToNotebook,
  onOpenDataset,
  onGenerateEDA,
  onRefreshFiles
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('python-beginner');
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'workspace/notebooks': true,
    'workspace/data': true,
    'workspace/scripts': true
  });
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(['py-01']));
  const [userStreak] = useState(5);

  const t = translations[language];

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const selectedCourse = coursesData.find(c => c.id === selectedCourseId) || coursesData[0];

  const renderFileTreeItem = (item: FileItem, depth: number = 0) => {
    if (item.type === 'directory') {
      const isExpanded = !!expandedFolders[item.path];
      return (
        <div key={item.path}>
          <div
            onClick={() => toggleFolder(item.path)}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.name}</span>
          </div>
          {isExpanded && item.children && (
            <div>
              {item.children.map(child => renderFileTreeItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isNotebook = item.ext === '.ipynb';
    const isCsv = item.ext === '.csv';
    const isPy = item.ext === '.py';

    return (
      <div
        key={item.path}
        onClick={() => onOpenFile(item.path)}
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer select-none"
        style={{ paddingLeft: `${depth * 12 + 18}px` }}
      >
        {isNotebook ? (
          <FileCode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : isCsv ? (
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        )}
        <span className="truncate">{item.name}</span>
      </div>
    );
  };

  return (
    <div className="h-full flex bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 select-none">
      {/* 1. Left Icon Activity Bar */}
      <div className="w-12 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center py-3 gap-3 shrink-0">
        <button
          onClick={() => onSelectTab('files')}
          className={`p-2 rounded-lg transition-colors ${
            activeTab === 'files'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={t.files}
        >
          <FolderTree className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTab('courses')}
          className={`p-2 rounded-lg transition-colors ${
            activeTab === 'courses'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={t.courses}
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTab('exercises')}
          className={`p-2 rounded-lg transition-colors ${
            activeTab === 'exercises'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={t.exercises}
        >
          <CheckSquare className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTab('datasets')}
          className={`p-2 rounded-lg transition-colors ${
            activeTab === 'datasets'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={t.datasets}
        >
          <Database className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTab('libraries')}
          className={`p-2 rounded-lg transition-colors ${
            activeTab === 'libraries'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={t.libraries}
        >
          <Package className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTab('variables')}
          className={`p-2 rounded-lg transition-colors ${
            activeTab === 'variables'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-2xs'
              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={t.variables}
        >
          <Variable className="w-4 h-4" />
        </button>

        {/* Streak indicator */}
        <div className="mt-auto flex flex-col items-center gap-1 text-[10px] text-amber-500 font-bold">
          <Flame className="w-4 h-4 fill-current" />
          <span>{userStreak}d</span>
        </div>
      </div>

      {/* 2. Secondary Tab Drawer */}
      <div className="w-64 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
        {/* Tab 1: Files Explorer */}
        {activeTab === 'files' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                {t.files}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={onNewNotebook}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  title={t.newNotebook}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenUpload}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  title={t.uploadDataset}
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filesTree.map(item => renderFileTreeItem(item))}
            </div>
          </div>
        )}

        {/* Tab 2: Courses & Lessons */}
        {activeTab === 'courses' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                {t.courses}
              </span>

              {/* Course Selector Dropdown */}
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full text-xs rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
              >
                {coursesData.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {selectedCourse.description}
              </div>
            </div>

            {/* Lessons List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {selectedCourse.lessons.map((lesson) => {
                const isCompleted = completedLessons.has(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => onLoadLessonToNotebook(lesson)}
                    className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-xs space-y-1 group transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
                        {isCompleted ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <Play className="w-3 h-3 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 pl-5">
                      {lesson.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Exercises */}
        {activeTab === 'exercises' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  {t.exercises}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                  CS50 Style
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Solve coding challenges with automated unit test assertions.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {exercisesData.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => onLoadExerciseToNotebook(ex)}
                  className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer text-xs space-y-1.5 transition-all group bg-neutral-50/50 dark:bg-neutral-800/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {ex.title}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        ex.difficulty === 'Easy'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : ex.difficulty === 'Medium'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {ex.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 line-clamp-2">
                    {ex.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                    <span>{ex.category}</span>
                    <span className="text-emerald-600 font-medium group-hover:underline flex items-center gap-0.5">
                      Solve <Play className="w-2.5 h-2.5 fill-current" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Datasets Explorer */}
        {activeTab === 'datasets' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                {t.datasets}
              </span>
              <button
                onClick={onOpenUpload}
                className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {[
                { name: 'students.csv', path: 'workspace/data/students.csv', rows: '20 rows', desc: 'Study hours, attendance, GPA' },
                { name: 'sales.csv', path: 'workspace/data/sales.csv', rows: '15 rows', desc: 'Regional electronics & furniture' }
              ].map((ds) => (
                <div
                  key={ds.name}
                  className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
                        {ds.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {ds.rows} • {ds.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => onOpenDataset(ds.path)}
                      className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors text-center"
                    >
                      {t.openAsDataFrame}
                    </button>
                    <button
                      onClick={() => onGenerateEDA(ds.path)}
                      className="px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300"
                      title={t.generateEDA}
                    >
                      EDA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Libraries Panel */}
        {activeTab === 'libraries' && (
          <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                {t.libraries}
              </span>
              <button
                onClick={onOpenLibraries}
                className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                <span>Full Manager</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[11px] text-neutral-500">
              Core preinstalled scientific packages in Python 3.10 kernel.
            </p>

            <div className="space-y-1.5 overflow-y-auto flex-1">
              {[
                { name: 'numpy', ver: '2.2.6', cat: 'Arrays & Math' },
                { name: 'pandas', ver: '2.3.3', cat: 'DataFrames' },
                { name: 'matplotlib', ver: '3.10.9', cat: 'Plotting' },
                { name: 'seaborn', ver: '0.13.2', cat: 'Statistical Plots' },
                { name: 'scikit-learn', ver: '1.7.2', cat: 'Machine Learning' },
                { name: 'statsmodels', ver: '0.15.0', cat: 'Econometrics' },
                { name: 'sympy', ver: '1.14.0', cat: 'Symbolic Math' },
                { name: 'scipy', ver: '1.15.3', cat: 'Scientific Computing' }
              ].map((lib) => (
                <div
                  key={lib.name}
                  className="p-2 rounded border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {lib.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      {lib.cat}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    v{lib.ver}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenLibraries}
              className="w-full py-2 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              + Install New PyPI Package
            </button>
          </div>
        )}

        {/* Tab 6: Variables Inspector */}
        {activeTab === 'variables' && (
          <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
            <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              {t.variables} ({variables.length})
            </span>

            {variables.length === 0 ? (
              <div className="text-xs text-neutral-400 italic text-center pt-8">
                {t.noVariables}
              </div>
            ) : (
              <div className="space-y-1 overflow-y-auto flex-1 font-mono text-xs">
                {variables.map((v) => (
                  <div
                    key={v.name}
                    className="p-2 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {v.name}
                      </span>
                      <span className="text-[10px] text-neutral-400">{v.type}</span>
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate">
                      {v.preview}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
