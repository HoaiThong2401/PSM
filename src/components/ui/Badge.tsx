import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { DayStatus } from '../../types/income';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'failed' | 'processing' | 'not_started' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  status?: DayStatus;
  showIcon?: boolean;
  interactive?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  status,
  showIcon = true,
  interactive = false,
  children,
  ...props
}) => {
  const effectiveVariant = status || variant;

  const baseStyles =
    'inline-flex items-center font-semibold rounded-full tracking-wide transition-all duration-200 select-none backdrop-blur-md';

  const variants = {
    default:
      'bg-slate-100/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/60 shadow-sm',
    outline:
      'border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 bg-transparent',
    success:
      'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/60 shadow-sm shadow-emerald-500/10 hover:shadow-emerald-500/20',
    failed:
      'bg-rose-50/90 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300/80 dark:border-rose-700/60 shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20',
    processing:
      'bg-sky-50/90 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-300/80 dark:border-sky-700/60 shadow-sm shadow-sky-500/10 hover:shadow-sky-500/20',
    not_started:
      'bg-slate-100/80 dark:bg-zinc-800/70 text-slate-600 dark:text-zinc-400 border border-slate-200/90 dark:border-zinc-700/50 shadow-sm',
  };

  const sizes = {
    sm: 'text-[10px] px-2.5 py-0.5 gap-1.5 font-bold',
    md: 'text-xs px-3 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  const statusIcons: Record<DayStatus, React.ReactNode> = {
    success: (
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
      </span>
    ),
    failed: (
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
      </span>
    ),
    processing: (
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.8)]" />
      </span>
    ),
    not_started: (
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-400 dark:bg-zinc-500" />
      </span>
    ),
  };

  const statusLabels: Record<DayStatus, string> = {
    success: 'Success',
    failed: 'Failed',
    processing: 'Processing',
    not_started: 'Not Started',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform'
    : '';

  return (
    <span
      className={twMerge(
        clsx(
          baseStyles,
          variants[effectiveVariant as keyof typeof variants] || variants.default,
          sizes[size],
          interactiveStyles,
          className
        )
      )}
      {...props}
    >
      {showIcon && status && statusIcons[status]}
      <span>{children || (status ? statusLabels[status] : '')}</span>
    </span>
  );
};
