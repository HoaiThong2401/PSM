import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatVND } from '../../utils/currency';
import { formatShortDate, getDayOfWeekLabel, getTodayISO } from '../../utils/dateUtils';
import type { IncomeRecord } from '../../types/income';
import type { UserSettings } from '../../types/settings';
import { getTargetForDate } from '../../utils/calculation';

import { useLanguage } from '../../contexts/LanguageContext';

interface TodayGoalHeroProps {
  todayRecord?: IncomeRecord;
  settings: UserSettings;
  onQuickUpdateCash: (record: IncomeRecord | undefined) => void;
}

export const TodayGoalHero: React.FC<TodayGoalHeroProps> = ({
  todayRecord,
  settings,
  onQuickUpdateCash,
}) => {
  const { t, language } = useLanguage();
  const todayISO = getTodayISO();
  const dayLabel = getDayOfWeekLabel(todayISO, language);
  const formattedToday = formatShortDate(todayISO);

  const target = todayRecord?.targetCash || getTargetForDate(todayISO, settings);
  const actualCash = todayRecord ? todayRecord.cash : 0;
  const todayTips = todayRecord ? todayRecord.tips : 0;
  const todayTotalIncome = todayRecord ? todayRecord.totalIncome : (actualCash + todayTips);
  const percentage = target > 0 ? Math.min(Math.round((actualCash / target) * 100), 100) : 0;
  const isGoalReached = (actualCash >= target && target > 0) || todayRecord?.status === 'success';
  const remaining = Math.max(0, target - actualCash);

  const handleOpenInput = () => {
    onQuickUpdateCash(todayRecord);
  };

  return (
    <div
      onClick={handleOpenInput}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-indigo-50/70 to-blue-50/50 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white p-4.5 sm:p-8 shadow-xl shadow-indigo-100/80 dark:shadow-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 hover:border-indigo-300 dark:hover:border-indigo-600/60 transition-all duration-200 cursor-pointer group active:scale-[0.998]"
    >
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur-md text-xs font-bold tracking-wide text-indigo-700 dark:text-indigo-200 border border-indigo-200/80 dark:border-white/10 shadow-xs shrink-0">
              <span>📅</span>
              <span>{dayLabel}, {formattedToday}</span>
            </span>
            <Badge
              status={todayRecord?.status || 'processing'}
              size="md"
              className="shrink-0"
            />
            {isGoalReached && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30 animate-pulse shrink-0">
                <Sparkles className="w-3 h-3" /> {t.dashboard.goalAchievedPill}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {t.dashboard.todayHeroTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-indigo-200/80 mt-1 leading-relaxed">
              {isGoalReached
                ? `${t.dashboard.goalReachedDesc} ${formatVND(actualCash)}.`
                : remaining > 0
                ? `${t.dashboard.goalMissingDesc} ${formatVND(remaining)}.`
                : t.dashboard.goalStartDesc}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-1">
            <div className="bg-white/90 dark:bg-white/5 border border-indigo-100/80 dark:border-white/10 rounded-2xl p-2.5 sm:p-3 backdrop-blur-sm shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-indigo-200/70 block truncate">{t.dashboard.todayTarget}</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums block mt-0.5 truncate">
                {formatVND(target)}
              </span>
            </div>
            <div className="bg-white/90 dark:bg-white/5 border border-indigo-100/80 dark:border-white/10 rounded-2xl p-2.5 sm:p-3 backdrop-blur-sm shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-indigo-200/70 block truncate">{t.dashboard.actualCash}</span>
              <span className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-300 tabular-nums block mt-0.5 truncate">
                {formatVND(actualCash)}
              </span>
            </div>
            <div className="bg-white/90 dark:bg-white/5 border border-indigo-100/80 dark:border-white/10 rounded-2xl p-2.5 sm:p-3 backdrop-blur-sm shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-indigo-200/70 block truncate">{t.dashboard.todayTips}</span>
              <span className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-300 tabular-nums block mt-0.5 truncate">
                {formatVND(todayTips)}
              </span>
            </div>
            <div className="bg-white/90 dark:bg-white/5 border border-indigo-100/80 dark:border-white/10 rounded-2xl p-2.5 sm:p-3 backdrop-blur-sm shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-indigo-200/70 block truncate">{t.dashboard.totalTodayIncome}</span>
              <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-300 tabular-nums block mt-0.5 truncate">
                {formatVND(todayTotalIncome)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-5 bg-white/80 dark:bg-white/10 border border-indigo-100 dark:border-white/15 backdrop-blur-md rounded-2xl p-5 lg:min-w-[240px] shadow-sm">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-slate-200 dark:text-white/15 stroke-current"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`stroke-current transition-all duration-1000 ease-out ${
                  isGoalReached ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'
                }`}
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{percentage}%</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-indigo-200 uppercase tracking-wider">
                {isGoalReached ? t.dashboard.completed : t.dashboard.achieved}
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <Button
              variant={isGoalReached ? 'success' : 'primary'}
              size="sm"
              onClick={(e) => {
                e?.stopPropagation();
                handleOpenInput();
              }}
              className="w-full text-xs font-bold shadow-md bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-white dark:text-indigo-900 dark:hover:bg-indigo-50"
            >
              {isGoalReached ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {t.dashboard.celebrateBtn}
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5" /> {t.dashboard.addIncomeBtn}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
