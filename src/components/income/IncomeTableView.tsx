import React, { useState, useEffect, useMemo } from 'react';
import type { IncomeRecord, DayStatus } from '../../types/income';
import { IncomeTableRow } from './IncomeTableRow';
import { Card } from '../ui/Card';
import { AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { getPaginationPages } from '../../utils/pagination';

interface IncomeTableViewProps {
  records: IncomeRecord[];
  onEdit: (record: IncomeRecord) => void;
  onDelete: (id: string) => void;
  onInlineUpdate: (
    id: string,
    field: 'cash' | 'baseSalary' | 'tips' | 'bonus' | 'note' | 'status',
    val: number | string | DayStatus
  ) => void;
  initialPageSize?: number;
}

export const IncomeTableView: React.FC<IncomeTableViewProps> = ({
  records,
  onEdit,
  onDelete,
  onInlineUpdate,
  initialPageSize = 5,
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
      <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
            Không tìm thấy bản ghi thu nhập nào
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Hãy thử thay đổi điều kiện lọc hoặc thêm mới thu nhập cho ngày này.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between dark:bg-slate-900/90">
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
            <tr>
              <th className="px-4 py-3.5">Thời gian</th>
              <th className="px-4 py-3.5 text-right">Tiền mặt</th>
              <th className="px-4 py-3.5 text-right">Lương CB</th>
              <th className="px-4 py-3.5 text-right">Bo</th>
              <th className="px-4 py-3.5 text-right">Thưởng</th>
              <th className="px-4 py-3.5 text-right">Tổng tiền mặt</th>
              <th className="px-4 py-3.5 text-right">Tổng thu nhập</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50">
            {paginatedRecords.map((record) => (
              <IncomeTableRow
                key={record.id || record.date}
                record={record}
                onEdit={onEdit}
                onDelete={onDelete}
                onInlineUpdate={onInlineUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-3 sm:px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs select-none">
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
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
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

          {/* Pagination Number Pills Limit Left/Right */}
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
                className={`min-w-[28px] h-7 px-1.5 rounded-lg font-bold transition-all text-xs shrink-0 ${
                  isActive
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
    </Card>
  );
};
