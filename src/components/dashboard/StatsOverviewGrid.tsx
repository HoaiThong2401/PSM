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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard
        title={t.dashboard.statTotalIncome}
        value={summary.totalIncome}
        icon={<Wallet className="w-5 h-5 stroke-[2.2]" />}
        iconBgColor="bg-indigo-50 dark:bg-indigo-950/60"
        iconColor="text-indigo-600 dark:text-indigo-400"
        changePercent={14.2}
        badgeText={t.dashboard.statAllBadge}
      />

      <StatCard
        title={t.dashboard.statTotalCash}
        value={summary.totalCash}
        icon={<Coins className="w-5 h-5 stroke-[2.2]" />}
        iconBgColor="bg-sky-50 dark:bg-sky-950/60"
        iconColor="text-sky-600 dark:text-sky-400"
        changePercent={8.5}
        badgeText={t.dashboard.statActualBadge}
      />

      <StatCard
        title={t.dashboard.statBaseSalary}
        value={summary.totalBaseSalary}
        icon={<Briefcase className="w-5 h-5 stroke-[2.2]" />}
        iconBgColor="bg-blue-50 dark:bg-blue-950/60"
        iconColor="text-blue-600 dark:text-blue-400"
        changePercent={0.0}
        badgeText={t.dashboard.statFixedBadge}
      />

      <StatCard
        title={t.dashboard.statTips}
        value={summary.totalTips}
        icon={<HeartHandshake className="w-5 h-5 stroke-[2.2]" />}
        iconBgColor="bg-amber-50 dark:bg-amber-950/60"
        iconColor="text-amber-600 dark:text-amber-400"
        changePercent={22.4}
        badgeText="Tips"
      />

      <StatCard
        title={t.dashboard.statBonus}
        value={summary.totalBonus}
        icon={<Gift className="w-5 h-5 stroke-[2.2]" />}
        iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
        iconColor="text-emerald-600 dark:text-emerald-400"
        changePercent={10.0}
        badgeText="Bonus"
      />
    </div>
  );
};
