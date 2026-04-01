'use client';

import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function SecondaryButton({
  children,
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={
        'inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition-colors ' +
        'border border-slate-200 bg-white text-slate-800 ' +
        'hover:border-slate-300 hover:bg-slate-50 ' +
        'hover:cursor-pointer ' +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}