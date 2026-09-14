import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { IncomeRecord, DayStatus } from '../../types/income';
import type { UserSettings } from '../../types/settings';
import { formatVND, parseVNDInput, formatNumber } from '../../utils/currency';
import { getDayOfWeekLabel, getTodayISO } from '../../utils/dateUtils';
import { computeDayStatus, getTargetForDate } from '../../utils/calculation';
import { Coins, Briefcase, HeartHandshake, Gift, FileText, Calendar } from 'lucide-react';

import { useLanguage } from '../../contexts/LanguageContext';

interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: IncomeRecord | null;
  settings: UserSettings;
  onSave: (data: {
    date: string;
    cash: number;
    baseSalary: number;
    tips: number;
    bonus: number;
    status?: DayStatus;
    isCustomStatus?: boolean;
    note?: string;
  }) => void;
}

export const IncomeFormModal: React.FC<IncomeFormModalProps> = ({
  isOpen,
  onClose,
  record,
  settings,
  onSave,
}) => {
  const { t, language } = useLanguage();
  const [date, setDate] = useState<string>(getTodayISO());
  const [cashStr, setCashStr] = useState<string>('');
  const [baseSalaryStr, setBaseSalaryStr] = useState<string>('');
  const [tipsStr, setTipsStr] = useState<string>('');
  const [bonusStr, setBonusStr] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<DayStatus | 'auto'>('auto');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (record) {
      setDate(record.date);
      setCashStr(record.cash ? formatNumber(record.cash) : '');
      setBaseSalaryStr(record.baseSalary ? formatNumber(record.baseSalary) : '');
      setTipsStr(record.tips ? formatNumber(record.tips) : '');
      setBonusStr(record.bonus ? formatNumber(record.bonus) : '');
      setSelectedStatus(record.isCustomStatus ? record.status : 'auto');
      setNote(record.note || '');
    } else {
      setDate(getTodayISO());
      setCashStr('');
      setBaseSalaryStr(formatNumber(settings.defaultBaseSalary));
      setTipsStr('');
      setBonusStr('');
      setSelectedStatus('auto');
      setNote('');
    }
  }, [record, settings, isOpen]);

  const handleCurrencyInput = (val: string, setter: (s: string) => void) => {
    const rawNumber = parseVNDInput(val);
    setter(rawNumber > 0 ? formatNumber(rawNumber) : '');
  };

  const cash = parseVNDInput(cashStr);
  const baseSalary = parseVNDInput(baseSalaryStr);
  const tips = parseVNDInput(tipsStr);
  const bonus = parseVNDInput(bonusStr);

  const totalCash = cash;
  const totalIncome = cash + baseSalary + tips + bonus;
  const target = getTargetForDate(date, settings);
  const autoStatus = computeDayStatus(date, totalCash, target);
  const effectiveStatus = selectedStatus === 'auto' ? autoStatus : selectedStatus;
  const dayLabel = getDayOfWeekLabel(date, language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date,
      cash,
      baseSalary,
      tips,
      bonus,
      status: effectiveStatus,
      isCustomStatus: selectedStatus !== 'auto',
      note,
    });
    onClose();
  };

  const statusOptions: Array<{ id: DayStatus | 'auto'; label: string }> = [
    { id: 'auto', label: language === 'vi' ? 'Tự động tính' : 'Auto Calculate' },
    { id: 'success', label: 'Success' },
    { id: 'processing', label: 'Processing' },
    { id: 'failed', label: 'Failed' },
    { id: 'not_started', label: 'Not Started' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? t.modal.editTitle : t.modal.addTitle}
      description={record ? t.modal.editSubtitle : t.modal.addSubtitle}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="flex-1 sm:flex-none justify-center"
          >
            {t.common.cancel}
          </Button>
          <Button
            type="submit"
            form="income-record-form"
            variant="primary"
            size="md"
            className="flex-1 sm:flex-none justify-center shadow-md shadow-indigo-500/20"
          >
            {record ? t.modal.saveChanges : t.modal.createNew}
          </Button>
        </div>
      }
    >
      <form id="income-record-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.modal.dateLabel}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          leftIcon={<Calendar className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label={t.modal.cashLabel}
            placeholder="0"
            value={cashStr}
            onChange={(e) => handleCurrencyInput(e.target.value, setCashStr)}
            leftIcon={<Coins className="w-4 h-4 text-sky-500" />}
            autoFocus
          />

          <Input
            label={t.modal.baseSalaryLabel}
            placeholder="0"
            value={baseSalaryStr}
            onChange={(e) => handleCurrencyInput(e.target.value, setBaseSalaryStr)}
            leftIcon={<Briefcase className="w-4 h-4 text-blue-500" />}
          />

          <Input
            label={t.modal.tipsLabel}
            placeholder="0"
            value={tipsStr}
            onChange={(e) => handleCurrencyInput(e.target.value, setTipsStr)}
            leftIcon={<HeartHandshake className="w-4 h-4 text-amber-500" />}
          />

          <Input
            label={t.modal.bonusLabel}
            placeholder="0"
            value={bonusStr}
            onChange={(e) => handleCurrencyInput(e.target.value, setBonusStr)}
            leftIcon={<Gift className="w-4 h-4 text-emerald-500" />}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.modal.statusLabel}
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedStatus(opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === opt.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label={t.modal.noteLabel}
          placeholder={t.modal.notePlaceholder}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          leftIcon={<FileText className="w-4 h-4" />}
        />

        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">{t.common.target} ({dayLabel}):</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{formatVND(target)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">{t.income.colTotalCash}:</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 tabular-nums">{formatVND(totalCash)}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-indigo-100 dark:border-slate-700 pt-1.5">
            <span className="font-bold text-slate-900 dark:text-slate-100">{t.income.colTotalIncome}:</span>
            <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm tabular-nums">
              {formatVND(totalIncome)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-600 dark:text-slate-400">{t.income.colStatus}:</span>
            <Badge status={effectiveStatus} size="sm" />
          </div>
        </div>
      </form>
    </Modal>
  );
};
