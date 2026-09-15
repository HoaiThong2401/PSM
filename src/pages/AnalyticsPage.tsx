import React, { useState, useMemo } from 'react';
import type { IncomeRecord, IncomeCycle, CycleSummary } from '../types/income';
import type { UserSettings } from '../types/settings';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatVND, formatCompactVND } from '../utils/currency';
import { calculateCycleSummary, computeRecordTotals } from '../utils/calculation';
import { generateDateRange, formatDisplayDate } from '../utils/dateUtils';
import {
  Trophy,
  TrendingUp,
  Calendar,
  Layers,
  ArrowRight,
  BarChart3,
  Target,
  DollarSign,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

import { useLanguage } from '../contexts/LanguageContext';

interface AnalyticsPageProps {
  allRecords: IncomeRecord[];
  cycles: IncomeCycle[];
  settings: UserSettings;
  selectedCycleId: string;
  onSelectCycle: (cycleId: string) => void;
  onSelectTab: (tab: 'dashboard' | 'income' | 'analytics' | 'settings') => void;
}

interface CycleAnalyticsItem {
  cycle: IncomeCycle;
  summary: CycleSummary;
  shortLabel: string;
  fullLabel: string;
  growthMoM: number | null; // % tăng trưởng so với kỳ liền trước
  daysWithIncome: number;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  allRecords,
  cycles,
  settings,
  selectedCycleId,
  onSelectCycle,
  onSelectTab,
}) => {
  const { t } = useLanguage();

  const cycleAnalyticsList = useMemo<CycleAnalyticsItem[]>(() => {
    const sortedChronological = [...cycles].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const items: CycleAnalyticsItem[] = [];

    sortedChronological.forEach((c, idx) => {
      const allDates = generateDateRange(c.startDate, c.endDate);
      const cycleRecords = allDates.map((d) => {
        const existing = allRecords.find((r) => r.date === d);
        if (existing) return existing;
        return computeRecordTotals(
          {
            id: `virt_${d}`,
            userId: '',
            date: d,
            cash: 0,
            baseSalary: 0,
            tips: 0,
            bonus: 0,
            targetCash: 0,
            status: 'not_started' as const,
            createdAt: '',
            updatedAt: '',
          },
          settings
        );
      });

      const summary = calculateCycleSummary(cycleRecords);
      const daysWithIncome = cycleRecords.filter((r) => r.totalIncome > 0).length;

      let growthMoM: number | null = null;
      if (idx > 0) {
        const prevSummary = items[idx - 1].summary;
        if (prevSummary.totalIncome > 0) {
          growthMoM = Math.round(((summary.totalIncome - prevSummary.totalIncome) / prevSummary.totalIncome) * 100);
        } else if (summary.totalIncome > 0) {
          growthMoM = 100;
        }
      }

      items.push({
        cycle: c,
        summary,
        shortLabel: `${t.header.cyclePrefix} ${String(c.month).padStart(2, '0')}/${String(c.year).slice(2)}`,
        fullLabel: `${t.header.cyclePrefix} ${String(c.month).padStart(2, '0')}/${c.year}`,
        growthMoM,
        daysWithIncome,
      });
    });

    return items;
  }, [allRecords, cycles, settings, t]);

  // Chỉ lấy các chu kỳ có dữ liệu (hoặc tối thiểu các chu kỳ gần nhất)
  const activeCycles = useMemo<CycleAnalyticsItem[]>(() => {
    const withData = cycleAnalyticsList.filter((item) => item.summary.totalIncome > 0 || item.cycle.id === selectedCycleId);
    return withData.length > 0 ? withData : cycleAnalyticsList.slice(-4);
  }, [cycleAnalyticsList, selectedCycleId]);

  // 2. Thống kê toàn thời gian (All-Time Stats)
  const allTimeStats = useMemo<{
    totalIncome: number;
    totalCash: number;
    totalBaseSalary: number;
    totalTips: number;
    totalBonus: number;
    totalWorkedDays: number;
    totalSuccessDays: number;
    bestCycle: CycleAnalyticsItem | null;
    avgIncomePerCycle: number;
    allTimeSuccessRate: number;
    cycleCount: number;
  }>(() => {
    let totalIncome = 0;
    let totalCash = 0;
    let totalBaseSalary = 0;
    let totalTips = 0;
    let totalBonus = 0;
    let totalWorkedDays = 0;
    let totalSuccessDays = 0;
    let bestCycle: CycleAnalyticsItem | null = null;

    activeCycles.forEach((item) => {
      const s = item.summary;
      totalIncome += s.totalIncome;
      totalCash += s.totalCash;
      totalBaseSalary += s.totalBaseSalary;
      totalTips += s.totalTips;
      totalBonus += s.totalBonus;
      totalWorkedDays += s.workedDays;
      totalSuccessDays += s.successDays;

      if (!bestCycle || s.totalIncome > bestCycle.summary.totalIncome) {
        bestCycle = item;
      }
    });

    const cycleCount = activeCycles.length || 1;
    const avgIncomePerCycle = Math.round(totalIncome / cycleCount);
    const allTimeSuccessRate = totalWorkedDays > 0 ? Math.round((totalSuccessDays / totalWorkedDays) * 100) : 0;

    return {
      totalIncome,
      totalCash,
      totalBaseSalary,
      totalTips,
      totalBonus,
      totalWorkedDays,
      totalSuccessDays,
      bestCycle,
      avgIncomePerCycle,
      allTimeSuccessRate,
      cycleCount,
    };
  }, [activeCycles]);

  // 3. State phục vụ bộ so sánh đối đầu 2 kỳ (Head-to-Head Comparison)
  const [cycleAId, setCycleAId] = useState<string>(() => {
    return activeCycles[activeCycles.length - 1]?.cycle.id || cycles[0]?.id || '';
  });
  const [cycleBId, setCycleBId] = useState<string>(() => {
    return activeCycles[Math.max(0, activeCycles.length - 2)]?.cycle.id || cycles[1]?.id || '';
  });

  const cycleA = useMemo(() => cycleAnalyticsList.find((c) => c.cycle.id === cycleAId), [cycleAnalyticsList, cycleAId]);
  const cycleB = useMemo(() => cycleAnalyticsList.find((c) => c.cycle.id === cycleBId), [cycleAnalyticsList, cycleBId]);

  // 4. Phân tích thứ trong tuần toàn thời gian (Day-of-Week Intelligence across all cycles)
  const dayOfWeekStats = useMemo(() => {
    const days = [
      { day: t.days.monday, sum: 0, count: 0 },
      { day: t.days.tuesday, sum: 0, count: 0 },
      { day: t.days.wednesday, sum: 0, count: 0 },
      { day: t.days.thursday, sum: 0, count: 0 },
      { day: t.days.friday, sum: 0, count: 0 },
      { day: t.days.saturday, sum: 0, count: 0 },
      { day: t.days.sunday, sum: 0, count: 0 },
    ];

    allRecords.forEach((r) => {
      if (r.totalIncome > 0) {
        const d = new Date(r.date);
        const dayIdx = (d.getDay() + 6) % 7; // Thứ 2 là 0, CN là 6
        if (days[dayIdx]) {
          days[dayIdx].sum += r.totalIncome;
          days[dayIdx].count += 1;
        }
      }
    });

    return days.map((d) => ({
      day: d.day,
      avgIncome: d.count > 0 ? Math.round(d.sum / d.count) : 0,
      totalIncome: d.sum,
      workCount: d.count,
    }));
  }, [allRecords, t]);

  // Chart data cho Biểu đồ so sánh đa chu kỳ
  const multiCycleChartData = useMemo(() => {
    return activeCycles.map((item) => ({
      name: item.shortLabel,
      fullLabel: item.fullLabel,
      totalIncome: item.summary.totalIncome,
      cash: item.summary.totalCash,
      baseSalary: item.summary.totalBaseSalary,
      tipsBonus: item.summary.totalTips + item.summary.totalBonus,
      successRate: item.summary.successRate,
      workedDays: item.summary.workedDays,
      growth: item.growthMoM,
    }));
  }, [activeCycles]);

  const handleNavigateToCycle = (cycleId: string) => {
    onSelectCycle(cycleId);
    onSelectTab('dashboard');
  };

  return (
    <div className="space-y-5 sm:space-y-7 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{t.analytics.pageTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {t.analytics.pageSubtitle}
          </p>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Tổng thu nhập */}
        <Card className="p-3.5 sm:p-5 relative overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {t.analytics.allTimeTotal}
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-base sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums block truncate">
              {formatVND(allTimeStats.totalIncome)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              {`${t.analytics.accumulatedAcross} ${allTimeStats.cycleCount} ${t.analytics.cyclesCount}`}
            </span>
          </div>
        </Card>

        {/* Card 2: Bình quân mỗi kỳ */}
        <Card className="p-3.5 sm:p-5 relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {t.analytics.avgPerCycle}
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums block truncate">
              {formatVND(allTimeStats.avgIncomePerCycle)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              {`${t.analytics.totalWorkedShifts} ${allTimeStats.totalWorkedDays} ${t.analytics.shiftsWorked}`}
            </span>
          </div>
        </Card>

        {/* Card 3: Kỳ doanh thu đỉnh nhất */}
        <Card className="p-3.5 sm:p-5 relative overflow-hidden bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-amber-100 dark:border-amber-900/50">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {t.analytics.bestCycle}
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums block truncate">
              {allTimeStats.bestCycle ? formatVND(allTimeStats.bestCycle.summary.totalIncome) : '0 ₫'}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-400 block mt-0.5 truncate">
              🏆 {allTimeStats.bestCycle ? allTimeStats.bestCycle.fullLabel : '-'}
            </span>
          </div>
        </Card>

        {/* Card 4: Tỷ lệ đạt mục tiêu chung */}
        <Card className="p-3.5 sm:p-5 relative overflow-hidden bg-gradient-to-br from-purple-50/80 via-white to-pink-50/40 dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 border-purple-100 dark:border-purple-900/50">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {t.analytics.overallHitRate}
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-base sm:text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums block truncate">
              {allTimeStats.allTimeSuccessRate}%
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
              {`${allTimeStats.totalSuccessDays} ${t.analytics.successfulDays}`}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Chart: Biểu đồ Cột So Sánh Thu Nhập Giữa Các Kỳ */}
      <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{t.analytics.chartTitle}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.analytics.chartSubtitle}
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={multiCycleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                tickFormatter={(val) => formatCompactVND(val)}
              />
              <Tooltip
                formatter={(val: any, name: any) => {
                  const labelMap: Record<string, string> = {
                    cash: t.income.colCash,
                    baseSalary: t.income.colBaseSalary,
                    tipsBonus: t.analytics.colTipsBonus,
                    totalIncome: t.income.colTotalIncome,
                  };
                  return [formatVND(Number(val) || 0), labelMap[name] || name];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                }}
              />
              <Legend
                content={() => (
                  <div className="pt-2.5">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-1.5 sm:gap-5 text-[11px] sm:text-xs">
                      {[
                        { key: 'cash', label: t.income.colCash, color: '#0ea5e9', isLine: false },
                        { key: 'baseSalary', label: t.income.colBaseSalary, color: '#6366f1', isLine: false },
                        { key: 'tipsBonus', label: t.analytics.colTipsBonus, color: '#10b981', isLine: false },
                        { key: 'totalIncome', label: t.income.colTotalIncome, color: '#f59e0b', isLine: true },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-center sm:justify-start gap-1.5 py-1 px-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 sm:bg-transparent dark:sm:bg-transparent text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          {item.isLine ? (
                            <div className="flex items-center gap-0.5 shrink-0">
                              <span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="w-1.5 h-1.5 rounded-full border border-white dark:border-slate-900" style={{ backgroundColor: item.color }} />
                              <span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
                            </div>
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                          )}
                          <span className="truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />
              <Bar dataKey="cash" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} maxBarSize={40} />
              <Bar dataKey="baseSalary" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} maxBarSize={40} />
              <Bar dataKey="tipsBonus" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line
                type="monotone"
                dataKey="totalIncome"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Head-to-Head 2-Cycle Comparison Tool */}
      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{t.analytics.headToHeadTitle}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.analytics.headToHeadSubtitle}
            </p>
          </div>
        </div>

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
              🔵 {t.analytics.cycleA}
            </label>
            <select
              value={cycleAId}
              onChange={(e) => setCycleAId(e.target.value)}
              className="w-full p-2 sm:p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
            >
              {cycleAnalyticsList.map((c) => (
                <option key={`a_${c.cycle.id}`} value={c.cycle.id}>
                  {c.fullLabel} ({formatCompactVND(c.summary.totalIncome)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
              🟣 {t.analytics.cycleB}
            </label>
            <select
              value={cycleBId}
              onChange={(e) => setCycleBId(e.target.value)}
              className="w-full p-2 sm:p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
            >
              {cycleAnalyticsList.map((c) => (
                <option key={`b_${c.cycle.id}`} value={c.cycle.id}>
                  {c.fullLabel} ({formatCompactVND(c.summary.totalIncome)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Result Cards */}
        {cycleA && cycleB && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
            {/* Box 1: Tổng thu nhập */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                {t.income.colTotalIncome}
              </span>
              <div className="flex items-baseline justify-between gap-1">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">{cycleA.shortLabel}</span>
                  <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 tabular-nums truncate block">
                    {formatVND(cycleA.summary.totalIncome)}
                  </span>
                </div>
                <div className="text-right min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">{cycleB.shortLabel}</span>
                  <span className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400 tabular-nums truncate block">
                    {formatVND(cycleB.summary.totalIncome)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] sm:text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">{t.analytics.difference}</span>
                {(() => {
                  const diff = cycleA.summary.totalIncome - cycleB.summary.totalIncome;
                  const isPositive = diff >= 0;
                  return (
                    <span className={`tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isPositive ? `+${formatVND(diff)}` : formatVND(diff)}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Box 2: Tiền mặt thực nhận */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                {t.income.colCash}
              </span>
              <div className="flex items-baseline justify-between gap-1">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">{cycleA.shortLabel}</span>
                  <span className="text-sm sm:text-base font-black text-sky-600 dark:text-sky-400 tabular-nums truncate block">
                    {formatVND(cycleA.summary.totalCash)}
                  </span>
                </div>
                <div className="text-right min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">{cycleB.shortLabel}</span>
                  <span className="text-sm sm:text-base font-black text-sky-600 dark:text-sky-400 tabular-nums truncate block">
                    {formatVND(cycleB.summary.totalCash)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] sm:text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">{t.analytics.diffCash}</span>
                {(() => {
                  const diff = cycleA.summary.totalCash - cycleB.summary.totalCash;
                  const isPositive = diff >= 0;
                  return (
                    <span className={`tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isPositive ? `+${formatVND(diff)}` : formatVND(diff)}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Box 3: Tỷ lệ đạt mục tiêu & Số ngày làm */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                {t.analytics.successRateAndShifts}
              </span>
              <div className="flex items-baseline justify-between gap-1">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">{cycleA.shortLabel}</span>
                  <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums truncate block">
                    {cycleA.summary.successRate}% ({cycleA.summary.workedDays} {t.analytics.shifts})
                  </span>
                </div>
                <div className="text-right min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block truncate">{cycleB.shortLabel}</span>
                  <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums truncate block">
                    {cycleB.summary.successRate}% ({cycleB.summary.workedDays} {t.analytics.shifts})
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] sm:text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">{t.analytics.diffRate}</span>
                {(() => {
                  const diff = cycleA.summary.successRate - cycleB.summary.successRate;
                  const isPositive = diff >= 0;
                  return (
                    <span className={`tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isPositive ? `+${diff}%` : `${diff}%`}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Day of Week Intelligence (Grid layout: 2 cols on mobile, 7 cols on desktop) */}
      <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{t.analytics.dayOfWeekTitle}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.analytics.dayOfWeekSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 pt-1">
          {dayOfWeekStats.map((item, idx) => {
            const isHighest = item.avgIncome > 0 && Math.max(...dayOfWeekStats.map((d) => d.avgIncome)) === item.avgIncome;
            const isSunday = idx === dayOfWeekStats.length - 1;

            return (
              <div
                key={item.day}
                className={`p-3 sm:p-3.5 rounded-2xl border text-center transition-all ${
                  isSunday ? 'col-span-2 sm:col-span-1 lg:col-span-1' : 'col-span-1'
                } ${isHighest
                  ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/60'
                  }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.day}</span>
                  {isHighest && <span className="text-xs" title="Highest">👑</span>}
                </div>
                <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 block mt-1 sm:mt-1.5 tabular-nums">
                  {formatVND(item.avgIncome)}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {item.workCount} {t.analytics.shiftsCount}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Comprehensive Multi-Cycle Performance Table */}
      <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{t.analytics.tableTitle}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.analytics.tableSubtitle}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead className="bg-slate-50/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
              <tr>
                <th className="px-3 sm:px-4 py-3">{t.analytics.colCycle}</th>
                <th className="px-3 sm:px-4 py-3 text-right">{t.analytics.colShifts}</th>
                <th className="px-3 sm:px-4 py-3 text-right">{t.income.colCash}</th>
                <th className="px-3 sm:px-4 py-3 text-right">{t.income.colBaseSalary}</th>
                <th className="px-3 sm:px-4 py-3 text-right">{t.analytics.colTipsBonus}</th>
                <th className="px-3 sm:px-4 py-3 text-right">{t.income.colTotalIncome}</th>
                <th className="px-3 sm:px-4 py-3 text-right">{t.analytics.colGrowth}</th>
                <th className="px-3 sm:px-4 py-3 text-center">{t.analytics.colHitRate}</th>
                <th className="px-3 sm:px-4 py-3 text-right">{t.analytics.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50">
              {[...activeCycles]
                .reverse()
                .map((item) => {
                  const s = item.summary;
                  const isSelected = item.cycle.id === selectedCycleId;
                  const isBest = allTimeStats.bestCycle?.cycle.id === item.cycle.id;

                  return (
                    <tr
                      key={item.cycle.id}
                      onClick={() => handleNavigateToCycle(item.cycle.id)}
                      className={`hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''
                        }`}
                    >
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {item.fullLabel}
                          </span>
                          {isBest && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[9px] sm:text-[10px] font-black">
                              {t.analytics.top1}
                            </span>
                          )}
                          {isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-[9px] sm:text-[10px] font-bold">
                              {t.analytics.currentViewing}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDisplayDate(item.cycle.startDate)} - {formatDisplayDate(item.cycle.endDate)}
                        </span>
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap text-xs sm:text-sm tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                        {s.workedDays} / {s.totalDays}
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap text-xs sm:text-sm tabular-nums text-sky-600 dark:text-sky-400 font-bold">
                        {formatVND(s.totalCash)}
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap text-xs sm:text-sm tabular-nums text-indigo-600 dark:text-indigo-300 font-medium">
                        {formatVND(s.totalBaseSalary)}
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap text-xs sm:text-sm tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatVND(s.totalTips + s.totalBonus)}
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap text-xs sm:text-sm font-black tabular-nums text-slate-900 dark:text-white">
                        {formatVND(s.totalIncome)}
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap text-xs font-bold tabular-nums">
                        {item.growthMoM !== null ? (
                          <span className={item.growthMoM >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                            {item.growthMoM >= 0 ? `+${item.growthMoM}%` : `${item.growthMoM}%`}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          {s.successRate}%
                        </span>
                      </td>

                      <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigateToCycle(item.cycle.id)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 h-8 px-2 sm:px-3"
                        >
                          <span>{t.analytics.btnOpenCycle}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
