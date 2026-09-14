import React from 'react';
import { Card } from '../ui/Card';
import { formatVND } from '../../utils/currency';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  changePercent?: number; // e.g. +12.5% vs previous cycle
  subtitle?: string;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  changePercent,
  subtitle,
  badgeText,
}) => {
  return (
    <Card className="p-5 relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-200 dark:bg-slate-900/90 dark:border-slate-800/80">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {title}
            </span>
            {badgeText && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {badgeText}
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
            {formatVND(value)}
          </h3>
        </div>

        {/* Compact Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${iconBgColor} ${iconColor}`}
        >
          {icon}
        </div>
      </div>

      {/* Footer / Change rate */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        {changePercent !== undefined ? (
          <div className="flex items-center gap-1 font-semibold">
            {changePercent > 0 ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">+{changePercent}%</span>
              </>
            ) : changePercent < 0 ? (
              <>
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-600 dark:text-rose-400">{changePercent}%</span>
              </>
            ) : (
              <>
                <Minus className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">0%</span>
              </>
            )}
            <span className="text-slate-400 dark:text-slate-400 font-normal">so với kỳ trước</span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-400">{subtitle || 'Chu kỳ hiện tại'}</span>
        )}
      </div>
    </Card>
  );
};
