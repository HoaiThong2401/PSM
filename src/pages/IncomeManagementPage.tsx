import React, { useState, useMemo } from 'react';
import type { IncomeRecord, DayStatus, IncomeSortMode } from '../types/income';
import { IncomeFilterBar } from '../components/income/IncomeFilterBar';
import { IncomeTableView } from '../components/income/IncomeTableView';
import { IncomeCardTimeline } from '../components/income/IncomeCardTimeline';
import { exportToCSV } from '../utils/exportUtils';
import { formatDisplayDate } from '../utils/dateUtils';

interface IncomeManagementPageProps {
  cycleRecords: IncomeRecord[];
  onOpenAddModal: (record?: IncomeRecord) => void;
  onDeleteRecord: (id: string) => void;
  onInlineUpdate: (
    id: string,
    field: 'cash' | 'baseSalary' | 'tips' | 'bonus' | 'note' | 'status',
    val: number | string | DayStatus
  ) => void;
}

export const IncomeManagementPage: React.FC<IncomeManagementPageProps> = ({
  cycleRecords,
  onOpenAddModal,
  onDeleteRecord,
  onInlineUpdate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DayStatus | 'all'>('all');
  const [sortMode, setSortMode] = useState<IncomeSortMode>('processing_first');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  const processedRecords = useMemo(() => {
    const filtered = cycleRecords.filter((record) => {
      if (selectedStatus !== 'all' && record.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const displayDate = formatDisplayDate(record.date).toLowerCase();
        const note = (record.note || '').toLowerCase();
        const rawDate = record.date.toLowerCase();
        return displayDate.includes(query) || rawDate.includes(query) || note.includes(query);
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'processing_first') {
        const getGroupRank = (status: DayStatus) => {
          if (status === 'processing') return 1;
          if (status !== 'not_started') return 2;
          return 3;
        };

        const rankA = getGroupRank(a.status);
        const rankB = getGroupRank(b.status);

        if (rankA !== rankB) {
          return rankA - rankB;
        }
        return b.date.localeCompare(a.date);
      }
      if (sortMode === 'recently_updated') {
        const timeA = a.updatedAt || a.createdAt || a.date;
        const timeB = b.updatedAt || b.createdAt || b.date;
        return timeB.localeCompare(timeA);
      }
      if (sortMode === 'date_desc') {
        return b.date.localeCompare(a.date);
      }
      if (sortMode === 'date_asc') {
        return a.date.localeCompare(b.date);
      }
      if (sortMode === 'income_desc') {
        return b.totalIncome - a.totalIncome;
      }
      return 0;
    });
  }, [cycleRecords, selectedStatus, searchQuery, sortMode]);

  const handleExportCSV = () => {
    exportToCSV(processedRecords, `thu-nhap-ky-${new Date().toISOString().slice(0, 7)}.csv`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
          Quản lý Thu nhập Theo Ngày
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Theo dõi, tra cứu, chỉnh sửa inline và xuất dữ liệu chi tiết từng ngày trong kỳ
        </p>
      </div>

      <IncomeFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportCSV={handleExportCSV}
        onOpenAddModal={() => onOpenAddModal()}
      />

      {viewMode === 'table' ? (
        <div className="hidden sm:block">
          <IncomeTableView
            records={processedRecords}
            onEdit={onOpenAddModal}
            onDelete={onDeleteRecord}
            onInlineUpdate={onInlineUpdate}
          />
        </div>
      ) : null}

      <div className={viewMode === 'table' ? 'sm:hidden' : 'block'}>
        <IncomeCardTimeline
          records={processedRecords}
          onEdit={onOpenAddModal}
          onDelete={onDeleteRecord}
          onInlineUpdate={onInlineUpdate}
        />
      </div>
    </div>
  );
};

