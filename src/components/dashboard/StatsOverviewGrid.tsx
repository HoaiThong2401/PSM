import React from 'react';
import { StatCard } from './StatCard';
import type { CycleSummary } from '../../types/income';
import {
  Wallet,
  Coins,
  Briefcase,
  HeartHandshake,
  Gift,
} from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

interface StatsOverviewGridProps {
  summary: CycleSummary;
}

export const StatsOverviewGrid: React.FC<StatsOverviewGridProps> = ({ summary }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Row 1: Tổng thu nhập (Hero trên mobile 2 cột), Thực thu (1 cột), Cố định (1 cột) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/50"
          title={t.dashboard.statTotalIncome}
          mobileTitle={t.income.colTotalIncome}
          value={summary.totalIncome}
          icon={<Wallet className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />}
          iconBgColor="bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
          iconColor=""
          changePercent={14.2}
          badgeText={t.dashboard.statAllBadge}
        />

        <StatCard
          className="col-span-1"
          title={t.dashboard.statTotalCash}
          mobileTitle={t.dashboard.statActualBadge}
          value={summary.totalCash}
          icon={<Coins className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />}
          iconBgColor="bg-sky-50 dark:bg-sky-950/60"
          iconColor="text-sky-600 dark:text-sky-400"
          changePercent={8.5}
          badgeText={t.dashboard.statActualBadge}
        />

        <StatCard
          className="col-span-1"
          title={t.dashboard.statBaseSalary}
          mobileTitle={t.dashboard.statFixedBadge}
          value={summary.totalBaseSalary}
          icon={<Briefcase className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
          iconColor="text-blue-600 dark:text-blue-400"
          changePercent={0.0}
          badgeText={t.dashboard.statFixedBadge}
        />
      </div>

      {/* Row 2: Bo, Thưởng (2 cột trên cả mobile và desktop) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          title={t.dashboard.statTips}
          mobileTitle={t.income.colTips}
          value={summary.totalTips}
          icon={<HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
          iconColor="text-amber-600 dark:text-amber-400"
          changePercent={22.4}
          badgeText="Tips"
        />

        <StatCard
          title={t.dashboard.statBonus}
          mobileTitle={t.income.colBonus}
          value={summary.totalBonus}
          icon={<Gift className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
          iconColor="text-emerald-600 dark:text-emerald-400"
          changePercent={10.0}
          badgeText="Bonus"
        />
      </div>
    </div>
  );
};
