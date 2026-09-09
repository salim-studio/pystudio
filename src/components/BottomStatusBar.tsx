import React from 'react';
import { Cpu, HardDrive, Terminal, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { KernelStatus } from '../types';

interface BottomStatusBarProps {
  kernelStatus: KernelStatus | null;
  lastExecutionTime: number | null;
  cellCount: number;
  variablesCount: number;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  kernelStatus,
  lastExecutionTime,
  cellCount,
  variablesCount
}) => {
  return (
    <footer className="h-7 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 select-none z-10 font-mono">
      {/* Left side items */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
          <Terminal className="w-3 h-3 text-emerald-500" />
          <span>Python {kernelStatus?.pythonVersion || '3.10.12'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {kernelStatus?.status === 'ready' ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-500" />
          )}
          <span>Kernel: {kernelStatus?.status || 'Connected'}</span>
        </div>

        <span className="hidden sm:inline">UTF-8</span>

        <span className="hidden md:inline">
          Cells: {cellCount}
        </span>

        <span className="hidden lg:inline">
          Namespace Vars: {variablesCount}
        </span>
      </div>

      {/* Right side telemetry */}
      <div className="flex items-center gap-4">
        {lastExecutionTime !== null && (
          <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>Execution: {lastExecutionTime}s</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-purple-500" />
          <span>Memory: {kernelStatus?.memoryMb || 128} MB</span>
        </div>

        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-emerald-500" />
          <span className="hidden sm:inline">Hardware:</span>
          <span>{kernelStatus?.hardware?.device || 'CPU (Fast)'}</span>
        </div>
      </div>
    </footer>
  );
};
