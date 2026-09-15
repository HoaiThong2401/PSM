import React from 'react';
import type { IncomeRecord, DayStatus } from '../../types/income';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatVND, formatCompactVND } from '../../utils/currency';
import { formatDisplayDate, getDayOfWeekLabel } from '../../utils/dateUtils';
import { getNextStatus } from '../../utils/calculation';
import { Edit2, Trash2 } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

interface IncomeDayCardProps {
  record: IncomeRecord;
  onEdit: (record: IncomeRecord) => void;
  onDelete: (id: string) => void;
  onInlineUpdate?: (
    id: string,
    field: 'cash' | 'baseSalary' | 'tips' | 'bonus' | 'note' | 'status',
    val: number | string | DayStatus
  ) => void;
}

export const IncomeDayCard: React.FC<IncomeDayCardProps> = ({
  record,
  onEdit,
  onDelete,
  onInlineUpdate,
}) => {
  const { t, language } = useLanguage();
  const dayOfWeek = getDayOfWeekLabel(record.date, language);
  const isWeekend = dayOfWeek === 'Thứ 6' || dayOfWeek === 'Thứ 7' || dayOfWeek === 'Chủ nhật' || dayOfWeek === 'Fri' || dayOfWeek === 'Sat' || dayOfWeek === 'Sun';
  const targetPercent =
    record.targetCash > 0 ? Math.min(100, Math.round((record.cash / record.targetCash) * 100)) : 0;

  const handleToggleStatus = () => {
    if (onInlineUpdate) {
      const next = getNextStatus(record.status);
      onInlineUpdate(record.id, 'status', next);
    }
  };

  return (
    <Card
      onClick={() => onEdit(record)}
      className="p-3 sm:p-5 flex flex-col justify-between hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-200 group bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl dark:shadow-md dark:shadow-black/20 cursor-pointer"
    >
      <div className="space-y-2.5 sm:space-y-3">
        {/* Header: Date + Status Badge */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-2 sm:pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
              {formatDisplayDate(record.date)}
            </span>
            <span
              className={`text-[10px] sm:text-[11px] px-1 sm:px-1.5 py-0.5 rounded-md font-semibold whitespace-nowrap ${isWeekend
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
            >
              {dayOfWeek}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus();
            }}
            title="Nhấp để chuyển đổi trạng thái"
            className="focus:outline-none shrink-0"
          >
            <Badge status={record.status} size="sm" interactive className="whitespace-nowrap text-[10px] sm:text-xs" />
          </button>
        </div>

        {/* Grand Total Highlight */}
        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 via-sky-50/40 to-transparent dark:from-indigo-950/60 dark:via-slate-800/40 dark:to-transparent border border-indigo-100/50 dark:border-indigo-800/40 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 block truncate">
              {t.income.colTotalIncome}
            </span>
            <span className="text-sm sm:text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums truncate block">
              {formatVND(record.totalIncome)}
            </span>
          </div>
        </div>

        {/* 2x2 Breakdown Grid */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
          {/* Tiền mặt */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] sm:text-[10px] text-sky-600 dark:text-sky-400 block truncate font-medium">
              {t.income.colCash}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs tabular-nums truncate block">
              {formatVND(record.cash)}
            </span>
          </div>

          {/* Lương cơ bản */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-400 block truncate font-medium">
              {t.income.colBaseSalary}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs tabular-nums truncate block">
              {formatVND(record.baseSalary)}
            </span>
          </div>

          {/* Tiền Bo */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 block truncate font-medium">
              {t.income.colTips}
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs tabular-nums truncate block">
              {record.tips > 0 ? formatVND(record.tips) : '-'}
            </span>
          </div>

          {/* Tiền Thưởng */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 block truncate font-medium">
              {t.income.colBonus}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-xs tabular-nums truncate block">
              {record.bonus > 0 ? formatVND(record.bonus) : '-'}
            </span>
          </div>
        </div>

        {/* Progress bar vs target */}
        <div className="space-y-1 pt-0.5">
          <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate">{t.common.target}: {formatCompactVND(record.targetCash)}</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0 ml-1">{targetPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${targetPercent}%` }}
              className={`h-full rounded-full ${record.status === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
            />
          </div>
        </div>

        {/* Note if available */}
        {record.note && (
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50/50 dark:bg-slate-800/50 p-1.5 sm:p-2 rounded-lg border border-slate-100 dark:border-slate-800 truncate">
            💬 {record.note}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(record);
          }}
          className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1"
        >
          <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(record.id);
          }}
          className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
          title={t.common.delete}
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </Card>
  );
};
