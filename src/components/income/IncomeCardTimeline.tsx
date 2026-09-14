import React, { useState, useEffect, useMemo } from 'react';
import type { IncomeRecord, DayStatus } from '../../types/income';
import { Card } from '../ui/Card';
import { IncomeDayCard } from './IncomeDayCard';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
} from 'lucide-react';

import { getPaginationPages } from '../../utils/pagination';

interface IncomeCardTimelineProps {
  records: IncomeRecord[];
  onEdit: (record: IncomeRecord) => void;
  onDelete: (id: string) => void;
  onInlineUpdate?: (
    id: string,
    field: 'cash' | 'baseSalary' | 'tips' | 'bonus' | 'note' | 'status',
    val: number | string | DayStatus
  ) => void;
  initialPageSize?: number;
}

export const IncomeCardTimeline: React.FC<IncomeCardTimelineProps> = ({
  records,
  onEdit,
  onDelete,
  onInlineUpdate,
  initialPageSize = 6,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [records.length]);

  const totalPages = Math.ceil(records.length / pageSize) || 1;

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, currentPage, pageSize]);

  const paginationPages = useMemo(() => {
    return getPaginationPages(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const startRecordIndex = records.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecordIndex = Math.min(currentPage * pageSize, records.length);

  if (records.length === 0) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3 dark:bg-slate-900/90 dark:border-slate-800">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Không tìm thấy bản ghi thu nhập nào
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hãy thử thay đổi điều kiện lọc hoặc thêm mới thu nhập cho ngày này.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedRecords.map((record) => (
          <IncomeDayCard
            key={record.id || record.date}
            record={record}
            onEdit={onEdit}
            onDelete={onDelete}
            onInlineUpdate={onInlineUpdate}
          />
        ))}
      </div>

      <div className="px-3 sm:px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs select-none">
        <div className="w-full md:w-auto flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
          <span className="text-[11px] sm:text-xs">
            Hiển thị <span className="font-bold text-slate-800 dark:text-slate-200">{startRecordIndex}-{endRecordIndex}</span> / <span className="font-bold text-slate-800 dark:text-slate-200">{records.length}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value={6}>6 thẻ</option>
              <option value={12}>12 thẻ</option>
              <option value={records.length}>Tất cả</option>
            </select>
          </div>
        </div>

        <div className="w-full md:w-auto flex items-center justify-center gap-1 overflow-x-auto py-0.5 max-w-full">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            title="Trang đầu"
            className="hidden sm:flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            title="Trang trước"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {paginationPages.map((item, idx) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="min-w-[16px] text-center text-slate-400 dark:text-slate-500 font-bold select-none px-0.5 text-xs shrink-0"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(item);
            const isActive = currentPage === pageNum;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[28px] h-7 px-1.5 rounded-lg font-bold transition-all text-xs shrink-0 ${isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            title="Trang sau"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            title="Trang cuối"
            className="hidden sm:flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
