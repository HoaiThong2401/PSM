import React from 'react';
import { Card } from '../ui/Card';
import { formatVND } from '../../utils/currency';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface StatCardProps {
  title: string;
  mobileTitle?: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  changePercent?: number; // e.g. +12.5% vs previous cycle
  subtitle?: string;
  badgeText?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  mobileTitle,
  value,
  icon,
  iconBgColor,
  iconColor,
  changePercent,
  subtitle,
  badgeText,
  className = '',
}) => {
  const { language } = useLanguage();

  return (
    <Card className={`p-3.5 sm:p-5 relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-200 dark:bg-slate-900/90 dark:border-slate-800/80 ${className}`}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {mobileTitle ? (
                <>
                  <span className="inline sm:hidden">{mobileTitle}</span>
                  <span className="hidden sm:inline">{title}</span>
                </>
              ) : (
                title
              )}
            </span>
            {badgeText && (
              <span className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                {badgeText}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums tracking-tight truncate">
            {formatVND(value)}
          </h3>
        </div>

        {/* Compact Icon */}
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${iconBgColor} ${iconColor}`}
        >
          {icon}
        </div>
      </div>

      {/* Footer / Change rate */}
      <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 dark:text-slate-400">
        {changePercent !== undefined ? (
          <div className="flex items-center gap-1 font-semibold flex-wrap">
            {changePercent > 0 ? (
              <>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
                <span className="text-emerald-600 dark:text-emerald-400">+{changePercent}%</span>
              </>
            ) : changePercent < 0 ? (
              <>
                <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 shrink-0" />
                <span className="text-rose-600 dark:text-rose-400">{changePercent}%</span>
              </>
            ) : (
              <>
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">0%</span>
              </>
            )}
            <span className="text-slate-400 dark:text-slate-400 font-normal">
              {language === 'vi' ? 'so với kỳ trước' : 'vs prev cycle'}
            </span>
          </div>
        ) : (
          <span>
            {subtitle || (language === 'vi' ? 'Chu kỳ hiện tại' : 'Current cycle')}
          </span>
        )}
      </div>
    </Card>
  );
};
