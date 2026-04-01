'use client';

import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function PrimaryButton({
  children,
  className,
  loading,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white transition-colors " +
        "bg-emerald-600 hover:bg-emerald-500 " +
        "shadow-md shadow-emerald-500/40 " +
        "disabled:opacity-50 disabled:cursor-not-allowed " +
        "hover: cursor-pointer " +
        className
      }
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}