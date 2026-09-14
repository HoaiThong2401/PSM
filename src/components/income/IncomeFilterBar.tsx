import React from 'react';
import { Search, LayoutList, Table, Download, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/Button';
import type { DayStatus, IncomeSortMode } from '../../types/income';

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
  const statusOptions: Array<{ id: DayStatus | 'all'; label: string }> = [
    { id: 'all', label: 'Tất cả' },
    { id: 'processing', label: 'Processing' },
    { id: 'success', label: 'Success' },
    { id: 'failed', label: 'Failed' },
    { id: 'not_started', label: 'Not Started' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm theo ngày (VD: 14/09, 2026-09)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onViewModeChange('table')}
              title="Xem dạng bảng"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bảng</span>
            </button>
            <button
              onClick={() => onViewModeChange('timeline')}
              title="Xem dạng thẻ"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thẻ</span>
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={onExportCSV} className="text-xs font-semibold">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </Button>

          <Button variant="primary" size="sm" onClick={onOpenAddModal} className="text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-400 dark:text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
          </span>
          {statusOptions.map((opt) => {
            const isActive = selectedStatus === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onStatusChange(opt.id)}
                className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <label htmlFor="income-sort-select" className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-400" />
            <span className="hidden md:inline">Sắp xếp:</span>
          </label>
          <select
            id="income-sort-select"
            value={sortMode}
            onChange={(e) => onSortModeChange(e.target.value as IncomeSortMode)}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-xs cursor-pointer"
          >
            <option value="processing_first">🎯 Ưu tiên Processing (Mặc định)</option>
            <option value="recently_updated">⚡ Vừa cập nhật gần đây</option>
            <option value="date_desc">📅 Mới nhất ➔ Cũ nhất</option>
            <option value="date_asc">📅 Cũ nhất ➔ Mới nhất</option>
            <option value="income_desc">💰 Thu nhập cao nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
};

