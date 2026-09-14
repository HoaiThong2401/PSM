import React, { useMemo } from 'react';
import type { IncomeRecord, IncomeCycle, CycleSummary, DayStatus } from '../types/income';
import type { UserSettings } from '../types/settings';
import { TodayGoalHero } from '../components/dashboard/TodayGoalHero';
import { StatsOverviewGrid } from '../components/dashboard/StatsOverviewGrid';
import { MonthlySummaryWidget } from '../components/dashboard/MonthlySummaryWidget';
import { IncomeTrendChart } from '../components/dashboard/IncomeTrendChart';
import { CashVsTargetChart } from '../components/dashboard/CashVsTargetChart';
import { StatusDonutChart } from '../components/dashboard/StatusDonutChart';
import { IncomeTableView } from '../components/income/IncomeTableView';
import { getTodayISO } from '../utils/dateUtils';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface DashboardPageProps {
  records: IncomeRecord[];
  cycleRecords: IncomeRecord[];
  summary: CycleSummary;
  currentCycle?: IncomeCycle;
  settings: UserSettings;
  onOpenAddModal: (record?: IncomeRecord) => void;
  onSelectTab: (tab: 'dashboard' | 'income' | 'analytics' | 'settings') => void;
  onDeleteRecord: (id: string) => void;
  onInlineUpdate: (
    id: string,
    field: 'cash' | 'baseSalary' | 'tips' | 'bonus' | 'note' | 'status',
    val: number | string | DayStatus
  ) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  cycleRecords,
  summary,
  currentCycle,
  settings,
  onOpenAddModal,
  onSelectTab,
  onDeleteRecord,
  onInlineUpdate,
}) => {
  const todayISO = getTodayISO();
  const todayRecord = useMemo(() => {
    return cycleRecords.find((r) => r.date === todayISO);
  }, [cycleRecords, todayISO]);

  const recentRecords = useMemo(() => {
    const relevant = cycleRecords.filter(
      (r) => r.cash > 0 || r.baseSalary > 0 || r.date <= todayISO || r.status === 'processing'
    );
    return [...relevant]
      .sort((a, b) => {
        const getGroupRank = (status: DayStatus) => {
          if (status === 'processing') return 1;
          if (status !== 'not_started') return 2;
          return 3;
        };
        const rankA = getGroupRank(a.status);
        const rankB = getGroupRank(b.status);
        if (rankA !== rankB) return rankA - rankB;
        return b.date.localeCompare(a.date);
      })
      .slice(0, 7);
  }, [cycleRecords, todayISO]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <TodayGoalHero
        todayRecord={todayRecord}
        settings={settings}
        onQuickUpdateCash={() => onOpenAddModal(todayRecord)}
      />

      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Chỉ số tài chính kỳ này
        </h3>
        <StatsOverviewGrid summary={summary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeTrendChart records={cycleRecords.filter((r) => r.date <= todayISO)} />
        </div>
        <div className="lg:col-span-1">
          <MonthlySummaryWidget summary={summary} currentCycle={currentCycle} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashVsTargetChart records={cycleRecords.filter((r) => r.date <= todayISO)} />
        <StatusDonutChart summary={summary} />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Nhật ký thu nhập gần đây
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Xem nhanh và chỉnh sửa trực tiếp các ngày trong kỳ
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectTab('income')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1"
          >
            <span>Xem toàn bộ bảng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <IncomeTableView
          records={recentRecords}
          onEdit={(r) => onOpenAddModal(r)}
          onDelete={onDeleteRecord}
          onInlineUpdate={onInlineUpdate}
        />
      </div>
    </div>
  );
};
