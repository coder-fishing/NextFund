import React from 'react';

const variantColors: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  violet: 'bg-violet-100 text-violet-700 border-violet-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

// Map status to color variants
export const statusToVariant: Record<string, string> = {
  pending: 'amber',
  approved: 'emerald',
  rejected: 'red',
  active: 'blue',
  completed: 'indigo',
  cancelled: 'gray',
  manual: 'violet',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'red' | 'blue' | 'indigo' | 'violet' | 'gray' | string;
  className?: string;
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const colorClass = variantColors[variant] || variantColors.gray;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-block ${colorClass} ${className}`}>
      {children}
    </span>
  );
}
