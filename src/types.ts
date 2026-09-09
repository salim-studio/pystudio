export type CellType = 'code' | 'markdown';

export interface CellOutput {
  stdout?: string;
  stderr?: string;
  result?: {
    type: 'dataframe' | 'latex' | 'plotly' | 'repr' | 'text';
    value?: any;
    raw_type?: string;
    shape?: number[];
    columns?: string[];
    dtypes?: Record<string, string>;
    data?: Record<string, any>[];
    total_rows?: number;
    total_cols?: number;
    summary?: Record<string, Record<string, any>>;
    latex?: string;
    text?: string;
    figure?: any;
  } | null;
  plots?: Array<{
    format: string;
    data: string;
  }>;
  error?: {
    type: string;
    message: string;
    traceback: string;
    line?: number | null;
    suggestion?: string;
  } | null;
  elapsed_seconds?: number;
}

export interface NotebookCell {
  id: string;
  cell_type: CellType;
  source: string;
  execution_count?: number | null;
  outputs?: CellOutput[];
  output?: CellOutput;
  isEditing?: boolean;
}

export interface Notebook {
  id: string;
  title: string;
  path?: string;
  filePath?: string;
  cells: NotebookCell[];
  metadata?: Record<string, any>;
  isModified?: boolean;
}

export interface KernelVariable {
  name: string;
  type: string;
  preview: string;
  details?: {
    shape?: number[];
    columns?: string[];
    memory?: string;
  };
}

export interface KernelStatus {
  status: 'ready' | 'running' | 'starting' | 'error';
  pythonVersion: string;
  executionCount: number;
  uptimeSeconds: number;
  memoryMb: number;
  heapMb: number;
  hardware: {
    platform: string;
    arch: string;
    hasCuda: boolean;
    device: string;
  };
}

export interface PythonPackage {
  name: string;
  version: string;
  latestVersion?: string;
  category?: string;
  description?: string;
  isInstalled?: boolean;
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  updatedAt?: string;
  ext?: string;
  children?: FileItem[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  codeExample: string;
  exercise: {
    prompt: string;
    starterCode: string;
    testAssertion: string;
    expectedOutput: string;
    solution: string;
    hint: string;
  };
}

export interface Course {
  id: string;
  title: string;
  category: 'beginner' | 'datascience' | 'machinelearning' | 'deeplearning' | 'statistics';
  icon: string;
  description: string;
  totalLessons: number;
  lessons: Lesson[];
}

export interface Exercise {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  starterCode: string;
  testCode: string;
  hint: string;
  solution: string;
}

export type Language = 'en' | 'ar' | 'fr';
export type AppMode = 'beginner' | 'professional';
export type ActiveTab = 'files' | 'courses' | 'exercises' | 'datasets' | 'libraries' | 'variables' | 'aitutor';
