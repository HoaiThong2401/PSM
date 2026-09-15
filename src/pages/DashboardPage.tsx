import React, { useMemo } from 'react';
import type { IncomeRecord, IncomeCycle, CycleSummary } from '../types/income';
import type { UserSettings } from '../types/settings';
import { TodayGoalHero } from '../components/dashboard/TodayGoalHero';
import { StatsOverviewGrid } from '../components/dashboard/StatsOverviewGrid';
import { MonthlySummaryWidget } from '../components/dashboard/MonthlySummaryWidget';
import { IncomeTrendChart } from '../components/dashboard/IncomeTrendChart';
import { CashVsTargetChart } from '../components/dashboard/CashVsTargetChart';
import { StatusDonutChart } from '../components/dashboard/StatusDonutChart';
import { getTodayISO } from '../utils/dateUtils';

import { useLanguage } from '../contexts/LanguageContext';

interface DashboardPageProps {
  cycleRecords: IncomeRecord[];
  summary: CycleSummary;
  currentCycle?: IncomeCycle;
  settings: UserSettings;
  onOpenAddModal: (record?: IncomeRecord) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  cycleRecords,
  summary,
  currentCycle,
  settings,
  onOpenAddModal,
}) => {
  const { t } = useLanguage();
  const todayISO = getTodayISO();
  const todayRecord = useMemo(() => {
    return (
      cycleRecords.find((r) => r.date === todayISO) ||
      cycleRecords.find((r) => r.status === 'processing') ||
      cycleRecords.find((r) => r.cash > 0) ||
      cycleRecords[0]
    );
  }, [cycleRecords, todayISO]);


  const chartRecords = useMemo(() => {
    const active = cycleRecords.filter(
      (r) => r.cash > 0 || r.baseSalary > 0 || r.tips > 0 || r.bonus > 0 || r.status !== 'not_started' || r.date <= todayISO
    );
    return active.length > 0 ? active : cycleRecords;
  }, [cycleRecords, todayISO]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <TodayGoalHero
        todayRecord={todayRecord}
        settings={settings}
        onQuickUpdateCash={() => onOpenAddModal()}
      />

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          {t.dashboard.metricsTitle}
        </h3>
        <StatsOverviewGrid summary={summary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeTrendChart records={chartRecords} />
        </div>
        <div className="lg:col-span-1">
          <MonthlySummaryWidget summary={summary} currentCycle={currentCycle} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashVsTargetChart records={chartRecords} />
        <StatusDonutChart summary={summary} />
      </div>
    </div>
  );
};
