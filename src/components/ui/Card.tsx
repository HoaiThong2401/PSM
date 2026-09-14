import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200';

  const variants = {
    default:
      'bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-md dark:shadow-black/20',
    glass:
      'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-md dark:shadow-xl dark:shadow-black/30',
    interactive:
      'bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 cursor-pointer dark:hover:shadow-indigo-500/10',
    bordered: 'bg-transparent border border-slate-200 dark:border-slate-800',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={twMerge('px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between', className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={twMerge('text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight', className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={twMerge('text-xs text-slate-500 dark:text-slate-400 mt-0.5', className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={twMerge('p-6', className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={twMerge('px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between', className)} {...props} />
);

