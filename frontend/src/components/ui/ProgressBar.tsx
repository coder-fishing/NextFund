import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  colorClass?: string;
}

export function ProgressBar({ progress, className = '', colorClass = 'bg-emerald-500' }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`h-1.5 w-full bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
