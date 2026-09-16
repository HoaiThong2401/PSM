import React from 'react';
import { Search, LayoutList, Table, Download, Plus, ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/Button';
import type { DayStatus, IncomeSortMode } from '../../types/income';

import { useLanguage } from '../../contexts/LanguageContext';

interface IncomeFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: DayStatus | 'all';
  onStatusChange: (status: DayStatus | 'all') => void;
  sortMode: IncomeSortMode;
  onSortModeChange: (mode: IncomeSortMode) => void;
  viewMode: 'table' | 'timeline';
  onViewModeChange: (mode: 'table' | 'timeline') => void;
  onExportCSV: () => void;
  onOpenAddModal: () => void;
}

export const IncomeFilterBar: React.FC<IncomeFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  sortMode,
  onSortModeChange,
  viewMode,
  onViewModeChange,
  onExportCSV,
  onOpenAddModal,
}) => {
  const { t } = useLanguage();

  const statusOptions: Array<{
    id: DayStatus | 'all';
    label: string;
    dotColor: string;
    activeClass: string;
  }> = [
    {
      id: 'all',
      label: t.income.filterAll,
      dotColor: 'bg-indigo-500',
      activeClass: 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30',
    },
    {
      id: 'processing',
      label: t.income.filterProcessing,
      dotColor: 'bg-sky-500',
      activeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/40 ring-1 ring-sky-500/30 font-bold',
    },
    {
      id: 'success',
      label: t.income.filterSuccess,
      dotColor: 'bg-emerald-500',
      activeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/30 font-bold',
    },
    {
      id: 'failed',
      label: t.income.filterFailed,
      dotColor: 'bg-rose-500',
      activeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 ring-1 ring-rose-500/30 font-bold',
    },
    {
      id: 'not_started',
      label: t.income.filterNotStarted,
      dotColor: 'bg-slate-400',
      activeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/40 ring-1 ring-slate-500/30 font-bold',
    },
  ];

  return (
    <div className="space-y-3.5 select-none">
      {/* Top Row: Search + View Switcher + Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder={t.income.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200/80 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>

        {/* Right Controls: Segmented View Switcher & Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          {/* Segmented Control (Cards vs Table) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onViewModeChange('timeline')}
              title={t.income.cardView}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>{t.income.cardView}</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              title={t.income.tableView}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{t.income.tableView}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              className="text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.income.exportCsv}</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAddModal}
              className="text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-3.5 h-3.5 mr-0.5" />
              <span>{t.income.addNew}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Status Filter Badges + Sort Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
        {/* Status Filter Pills with colored dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs no-scrollbar py-0.5">
          {statusOptions.map((opt) => {
            const isActive = selectedStatus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStatusChange(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap border shrink-0 ${
                  isActive
                    ? opt.activeClass
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs shrink-0">
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <select
              id="income-sort-select"
              value={sortMode}
              onChange={(e) => onSortModeChange(e.target.value as IncomeSortMode)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs cursor-pointer appearance-none"
            >
              <option value="processing_first">{t.income.sortProcessingFirst}</option>
              <option value="recently_updated">{t.income.sortRecentlyUpdated}</option>
              <option value="date_desc">{t.income.sortDateDesc}</option>
              <option value="date_asc">{t.income.sortDateAsc}</option>
              <option value="income_desc">{t.income.sortIncomeDesc}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
