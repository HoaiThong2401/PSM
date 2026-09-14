import React, { useMemo } from 'react';
import type { IncomeRecord, CycleSummary } from '../types/income';
import { Card } from '../components/ui/Card';
import { formatVND } from '../utils/currency';
import { formatDisplayDate, getDayOfWeekLabel, isWeekendOrFriday } from '../utils/dateUtils';
import { Trophy, Calendar, PieChart } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

interface AnalyticsPageProps {
  cycleRecords: IncomeRecord[];
  summary: CycleSummary;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ cycleRecords, summary }) => {
  const { t, language } = useLanguage();
  const topEarningDays = useMemo(() => {
    return [...cycleRecords]
      .filter((r) => r.totalIncome > 0)
      .sort((a, b) => b.totalIncome - a.totalIncome)
      .slice(0, 3);
  }, [cycleRecords]);

  const { weekdayAvg, weekendAvg, weekdayCount, weekendCount } = useMemo(() => {
    let weekdaySum = 0,
      weekdayCnt = 0,
      weekendSum = 0,
      weekendCnt = 0;

    cycleRecords.forEach((r) => {
      if (r.cash > 0 || r.baseSalary > 0) {
        if (isWeekendOrFriday(r.date)) {
          weekendSum += r.totalIncome;
          weekendCnt++;
        } else {
          weekdaySum += r.totalIncome;
          weekdayCnt++;
        }
      }
    });

    return {
      weekdayAvg: weekdayCnt > 0 ? Math.round(weekdaySum / weekdayCnt) : 0,
      weekendAvg: weekendCnt > 0 ? Math.round(weekendSum / weekendCnt) : 0,
      weekdayCount: weekdayCnt,
      weekendCount: weekendCnt,
    };
  }, [cycleRecords]);

  const total = summary.totalIncome || 1;
  const cashPct = Math.round((summary.totalCash / total) * 100);
  const baseSalaryPct = Math.round((summary.totalBaseSalary / total) * 100);
  const tipsPct = Math.round((summary.totalTips / total) * 100);
  const bonusPct = Math.round((summary.totalBonus / total) * 100);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
          {t.analytics.pageTitle}
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          {t.analytics.pageSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {language === 'vi' ? 'Top 3 Ngày Thu Nhập Cao Nhất' : 'Top 3 Highest Income Days'}
            </h3>
          </div>
          <div className="space-y-2.5">
            {topEarningDays.map((record, index) => (
              <div
                key={record.id || record.date}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0
                        ? 'bg-amber-500 shadow-md shadow-amber-500/30'
                        : index === 1
                        ? 'bg-slate-400'
                        : 'bg-amber-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      {getDayOfWeekLabel(record.date, language)}, {formatDisplayDate(record.date)}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                      {t.income.colCash}: {formatVND(record.cash)} | {t.income.colTips}: {formatVND(record.tips)}
                    </p>
                  </div>
                </div>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm tabular-nums">
                  {formatVND(record.totalIncome)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {language === 'vi' ? 'So Sánh Ngày Thường vs Cuối Tuần' : 'Weekdays vs Weekends Comparison'}
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-zinc-800/60 border border-indigo-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
                  {language === 'vi' ? `Trung bình Thứ 2 - Thứ 5 (${weekdayCount} ngày)` : `Avg Mon - Thu (${weekdayCount} days)`}
                </span>
                <span className="text-xs text-slate-400">
                  {language === 'vi' ? 'Mục tiêu: 200.000 ₫/ngày' : 'Target: 200,000 ₫/day'}
                </span>
              </div>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {formatVND(weekdayAvg)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-zinc-800/60 border border-amber-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
                  {language === 'vi' ? `Trung bình Thứ 6 - CN (${weekendCount} ngày)` : `Avg Fri - Sun (${weekendCount} days)`}
                </span>
                <span className="text-xs text-slate-400">
                  {language === 'vi' ? 'Mục tiêu: 250.000 ₫/ngày' : 'Target: 250,000 ₫/day'}
                </span>
              </div>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {formatVND(weekendAvg)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-sky-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            {t.analytics.incomeStructure}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-zinc-800/60 border border-indigo-100 dark:border-zinc-700">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold block">
              {t.income.colCash} ({cashPct}%)
            </span>
            <span className="text-base font-black text-slate-900 dark:text-zinc-100 tabular-nums">
              {formatVND(summary.totalCash)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-zinc-800/60 border border-blue-100 dark:border-zinc-700">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block">
              {t.income.colBaseSalary} ({baseSalaryPct}%)
            </span>
            <span className="text-base font-black text-slate-900 dark:text-zinc-100 tabular-nums">
              {formatVND(summary.totalBaseSalary)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-zinc-800/60 border border-amber-100 dark:border-zinc-700">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block">
              {t.income.colTips} ({tipsPct}%)
            </span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {formatVND(summary.totalTips)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-zinc-800/60 border border-emerald-100 dark:border-zinc-700">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
              {t.income.colBonus} ({bonusPct}%)
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatVND(summary.totalBonus)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
