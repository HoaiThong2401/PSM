import React, { useState, useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import type { IncomeRecord, DayStatus, IncomeSortMode } from '../types/income';
import { IncomeFilterBar } from '../components/income/IncomeFilterBar';
import { IncomeTableView } from '../components/income/IncomeTableView';
import { IncomeCardTimeline } from '../components/income/IncomeCardTimeline';
import { exportToExcel } from '../utils/exportUtils';
import { formatDisplayDate, getTodayISO } from '../utils/dateUtils';

import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DayStatus | 'all'>('all');
  const [sortMode, setSortMode] = useState<IncomeSortMode>('processing_first');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>(() => {
    const saved = localStorage.getItem('psm_income_view_mode');
    return saved === 'table' || saved === 'timeline' ? saved : 'timeline';
  });

  const handleViewModeChange = (mode: 'table' | 'timeline') => {
    setViewMode(mode);
    localStorage.setItem('psm_income_view_mode', mode);
  };

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

    const todayISO = getTodayISO();
    const processingRecord = filtered.find((r) => r.status === 'processing');
    const pivotDate = processingRecord ? processingRecord.date : todayISO;

    return [...filtered].sort((a, b) => {
      if (sortMode === 'processing_first') {
        const getGroup = (r: IncomeRecord) => {
          if (r.status === 'processing' || r.date === pivotDate) return 1;
          if (r.date < pivotDate) return 2;
          return 3;
        };

        const groupA = getGroup(a);
        const groupB = getGroup(b);

        if (groupA !== groupB) {
          return groupA - groupB;
        }

        // Nhóm 1: Ngày đang diễn ra (Processing / Hôm nay: 16)
        if (groupA === 1) return 0;
        // Nhóm 2: Các ngày đã qua trong chu kỳ (giảm dần từ hôm qua trở về trước: 15, 14, 13...)
        if (groupA === 2) return b.date.localeCompare(a.date);
        // Nhóm 3: Các ngày tiếp theo trong chu kỳ (tăng dần: 17, 18, 19... 25)
        return a.date.localeCompare(b.date);
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
    exportToExcel(processedRecords, `thu-nhap-ky-${new Date().toISOString().slice(0, 7)}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{t.income.pageTitle}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
          {t.income.pageSubtitle}
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
        onViewModeChange={handleViewModeChange}
        onExportCSV={handleExportCSV}
        onOpenAddModal={() => onOpenAddModal()}
      />

      {viewMode === 'table' ? (
        <IncomeTableView
          records={processedRecords}
          onEdit={onOpenAddModal}
          onDelete={onDeleteRecord}
          onInlineUpdate={onInlineUpdate}
        />
      ) : (
        <IncomeCardTimeline
          records={processedRecords}
          onEdit={onOpenAddModal}
          onDelete={onDeleteRecord}
          onInlineUpdate={onInlineUpdate}
        />
      )}
    </div>
  );
};

