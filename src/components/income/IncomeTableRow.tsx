import React, { useState } from 'react';
import type { IncomeRecord, DayStatus } from '../../types/income';
import { Badge } from '../ui/Badge';
import { formatVND, parseVNDInput } from '../../utils/currency';
import { formatDisplayDate, getDayOfWeekLabel } from '../../utils/dateUtils';
import { getNextStatus } from '../../utils/calculation';
import { Edit2, Trash2, Check, X } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

interface IncomeTableRowProps {
  record: IncomeRecord;
  onEdit: (record: IncomeRecord) => void;
  onDelete: (id: string) => void;
  onInlineUpdate: (
    id: string,
    field: 'cash' | 'baseSalary' | 'tips' | 'bonus' | 'note' | 'status',
    val: number | string | DayStatus
  ) => void;
}

export const IncomeTableRow: React.FC<IncomeTableRowProps> = ({
  record,
  onEdit,
  onDelete,
  onInlineUpdate,
}) => {
  const { language } = useLanguage();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const dayOfWeek = getDayOfWeekLabel(record.date, language);
  const isWeekend = dayOfWeek === 'Thứ 6' || dayOfWeek === 'Thứ 7' || dayOfWeek === 'Chủ nhật' || dayOfWeek === 'Fri' || dayOfWeek === 'Sat' || dayOfWeek === 'Sun';

  const startInlineEdit = (field: 'cash' | 'baseSalary' | 'tips' | 'bonus', currentVal: number) => {
    setEditingField(field);
    setTempValue(currentVal ? String(currentVal) : '');
  };

  const saveInlineEdit = (field: 'cash' | 'baseSalary' | 'tips' | 'bonus') => {
    const num = parseVNDInput(tempValue);
    onInlineUpdate(record.id, field, num);
    setEditingField(null);
  };

  const cancelInlineEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleToggleStatus = () => {
    const next = getNextStatus(record.status);
    onInlineUpdate(record.id, 'status', next);
  };

  const rowTint =
    record.status === 'success'
      ? 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30'
      : record.status === 'failed'
      ? 'hover:bg-rose-50/40 dark:hover:bg-rose-950/30'
      : record.status === 'processing'
      ? 'hover:bg-sky-50/40 dark:hover:bg-sky-950/30'
      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40';

  const handleRowClick = () => {
    // If user is editing a field inline, do not open modal
    if (editingField) return;
    onEdit(record);
  };

  return (
    <tr
      onClick={handleRowClick}
      className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors group cursor-pointer ${rowTint}`}
    >
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {formatDisplayDate(record.date)}
          </span>
          <span
            className={`text-[11px] font-medium ${
              isWeekend ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400 dark:text-slate-400'
            }`}
          >
            {dayOfWeek}
          </span>
        </div>
      </td>

      <td
        className="px-4 py-3.5 text-right whitespace-nowrap"
        onClick={(e) => {
          if (editingField) e.stopPropagation();
        }}
      >
        {editingField === 'cash' ? (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              autoFocus
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveInlineEdit('cash');
                if (e.key === 'Escape') cancelInlineEdit();
              }}
              className="w-24 text-right text-xs py-1 px-1.5 border rounded border-indigo-500 focus:outline-none dark:bg-slate-800 dark:text-slate-100"
            />
            <button onClick={() => saveInlineEdit('cash')} className="text-emerald-500 p-0.5">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={cancelInlineEdit} className="text-rose-500 p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              startInlineEdit('cash', record.cash);
            }}
            title="Nhấp đúp hoặc nhấp để sửa nhanh tiền mặt inline"
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 tabular-nums text-xs sm:text-sm hover:underline underline-offset-2"
          >
            {formatVND(record.cash)}
          </span>
        )}
      </td>

      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs sm:text-sm tabular-nums text-slate-600 dark:text-slate-300">
        {formatVND(record.baseSalary)}
      </td>

      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs sm:text-sm tabular-nums text-amber-600 dark:text-amber-400 font-medium">
        {record.tips > 0 ? formatVND(record.tips) : '-'}
      </td>

      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs sm:text-sm tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
        {record.bonus > 0 ? formatVND(record.bonus) : '-'}
      </td>

      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs sm:text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
        {formatVND(record.totalCash)}
      </td>

      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs sm:text-sm font-black tabular-nums text-indigo-600 dark:text-indigo-400">
        {formatVND(record.totalIncome)}
      </td>

      {/* Interactive Status Badge */}
      <td
        className="px-4 py-3.5 whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus();
          }}
          title="Nhấp để chuyển đổi nhanh trạng thái (Success / Failed / Processing / Not Started)"
          className="focus:outline-none"
        >
          <Badge status={record.status} size="sm" interactive />
        </button>
      </td>

      <td
        className="px-4 py-3.5 text-right whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
            title="Chỉnh sửa chi tiết"
            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
            title="Xóa bản ghi"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
