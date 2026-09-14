import React from 'react';
import type { IncomeRecord, DayStatus } from '../../types/income';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatVND } from '../../utils/currency';
import { formatDisplayDate, getDayOfWeekLabel } from '../../utils/dateUtils';
import { getNextStatus } from '../../utils/calculation';
import { Edit2, Trash2 } from 'lucide-react';

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
  const dayOfWeek = getDayOfWeekLabel(record.date);
  const isWeekend = dayOfWeek === 'Thứ 6' || dayOfWeek === 'Thứ 7' || dayOfWeek === 'Chủ nhật';
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
      className="p-5 flex flex-col justify-between hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-200 group bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl dark:shadow-md dark:shadow-black/20 cursor-pointer"
    >
      <div className="space-y-3">
        {/* Header: Date + Status Badge */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {formatDisplayDate(record.date)}
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                isWeekend
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
            className="focus:outline-none"
          >
            <Badge status={record.status} size="sm" interactive />
          </button>
        </div>

        {/* Grand Total Highlight */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 via-sky-50/40 to-transparent dark:from-indigo-950/60 dark:via-slate-800/40 dark:to-transparent border border-indigo-100/50 dark:border-indigo-800/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
              Tổng thu nhập ngày
            </span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
              {formatVND(record.totalIncome)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 dark:text-slate-400 block">Tiền mặt</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {formatVND(record.cash)}
            </span>
          </div>
        </div>

        {/* Breakdown 3 sub-metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-400 block">Lương CB</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs tabular-nums">
              {formatVND(record.baseSalary)}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-amber-500 block">Tiền Bo</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-xs tabular-nums">
              {record.tips > 0 ? formatVND(record.tips) : '-'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-emerald-500 block">Thưởng</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs tabular-nums">
              {record.bonus > 0 ? formatVND(record.bonus) : '-'}
            </span>
          </div>
        </div>

        {/* Progress bar vs target */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Mục tiêu: {formatVND(record.targetCash)}</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{targetPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${targetPercent}%` }}
              className={`h-full rounded-full ${
                record.status === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
            />
          </div>
        </div>

        {/* Note if available */}
        {record.note && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50/50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 truncate">
            💬 {record.note}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(record);
          }}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(record.id);
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
          title="Xóa bản ghi"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};
