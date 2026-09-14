import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import type { IncomeCycle } from '../../types/income';

interface CycleSelectorProps {
  cycles: IncomeCycle[];
  selectedCycleId: string;
  onSelectCycle: (cycleId: string) => void;
  className?: string;
}

export const CycleSelector: React.FC<CycleSelectorProps> = ({
  cycles,
  selectedCycleId,
  onSelectCycle,
  className = '',
}) => {
  return (
    <div className={`relative inline-flex items-center min-w-0 max-w-full ${className}`}>
      <div className="absolute left-2 sm:left-3 pointer-events-none text-indigo-500 shrink-0">
        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      <select
        value={selectedCycleId}
        onChange={(e) => onSelectCycle(e.target.value)}
        className="w-full appearance-none bg-white dark:bg-zinc-800/90 text-slate-800 dark:text-zinc-100 text-xs sm:text-sm font-semibold pl-7 sm:pl-9 pr-6 sm:pr-8 py-1.5 sm:py-2 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm hover:border-slate-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer truncate"
      >
        {cycles.map((cycle) => (
          <option key={cycle.id} value={cycle.id} className="dark:bg-zinc-900">
            {cycle.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 sm:right-2.5 pointer-events-none text-slate-400 dark:text-zinc-500 shrink-0">
        <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </div>
    </div>
  );
};
