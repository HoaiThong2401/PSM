import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { IncomeCycle } from '../../types/income';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDisplayDate } from '../../utils/dateUtils';

interface CycleSelectorProps {
  cycles: IncomeCycle[];
  selectedCycleId: string;
  onSelectCycle: (cycleId: string) => void;
  className?: string;
  compact?: boolean;
}

export const CycleSelector: React.FC<CycleSelectorProps> = ({
  cycles,
  selectedCycleId,
  onSelectCycle,
  className = '',
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = cycles.findIndex((c) => c.id === selectedCycleId);
  const currentCycle = (currentIndex >= 0 ? cycles[currentIndex] : cycles[0]) || null;

  // cycles are sorted newest first (index 0 = newest, index length-1 = oldest)
  const hasOlder = currentIndex >= 0 && currentIndex < cycles.length - 1;
  const hasNewer = currentIndex > 0;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasOlder) {
      onSelectCycle(cycles[currentIndex + 1].id);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNewer) {
      onSelectCycle(cycles[currentIndex - 1].id);
    }
  };

  const handleSelect = (id: string) => {
    onSelectCycle(id);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!currentCycle) return null;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const cycleTitle = `${t.header.cyclePrefix} ${String(currentCycle.month).padStart(2, '0')}/${currentCycle.year}`;

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Sleek Compact Pill (Same style across desktop & mobile) */}
      <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-white dark:bg-slate-800/90 p-0.5 sm:p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        {/* Previous Cycle Button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={!hasOlder}
          title={t.header.prevCycle}
          className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-all disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Center Cycle Name (Click to open dropdown - No downward chevron) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 active:scale-95 transition-all cursor-pointer gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {cycleTitle}
          </span>
        </button>

        {/* Next Cycle Button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!hasNewer}
          title={t.header.nextCycle}
          className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-all disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Popover Dropdown (Clean, positioned under the pill) */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-72 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-scale-in">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {t.header.selectCycleTitle}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {cycles.length} {t.header.cyclePrefix.toLowerCase()}
            </span>
          </div>

          <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
            {cycles.map((c) => {
              const isSelected = c.id === selectedCycleId;
              const isCurrent = c.month === currentMonth && c.year === currentYear;
              const formattedRange = c.startDate && c.endDate
                ? `${formatDisplayDate(c.startDate)} - ${formatDisplayDate(c.endDate)}`
                : '';

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c.id)}
                  className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 font-semibold border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs'
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">
                          {t.header.cyclePrefix} {String(c.month).padStart(2, '0')}/{c.year}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300/50 dark:border-emerald-800/50">
                            {t.header.currentCycle}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {formattedRange}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
