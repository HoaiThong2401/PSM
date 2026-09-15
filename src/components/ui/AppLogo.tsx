import React from 'react';
import { CircleDollarSign } from 'lucide-react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  badge?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className = '',
  badge = true,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg shadow-sm',
    md: 'w-10 h-10 rounded-xl shadow-lg shadow-indigo-500/25',
    lg: 'w-12 h-12 rounded-2xl shadow-xl shadow-indigo-500/30',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const badgeSizes = {
    sm: 'w-2.5 h-2.5 -top-0.5 -right-0.5 border',
    md: 'w-3.5 h-3.5 -top-1 -right-1 border-2',
    lg: 'w-4 h-4 -top-1 -right-1 border-2',
  };

  return (
    <div
      className={`relative bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <CircleDollarSign className={`${iconSizes[size]} stroke-[2.2]`} />
      {badge && (
        <span
          className={`absolute ${badgeSizes[size]} rounded-full bg-emerald-500 border-white dark:border-slate-900 flex items-center justify-center shadow-xs`}
        >
          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
        </span>
      )}
    </div>
  );
};
