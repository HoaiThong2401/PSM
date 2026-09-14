import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { CycleSummary, IncomeCycle } from '../../types/income';
import { formatVND } from '../../utils/currency';
import { CheckCircle2, XCircle, Clock, CalendarDays, Zap } from 'lucide-react';

interface MonthlySummaryWidgetProps {
  summary: CycleSummary;
  currentCycle?: IncomeCycle;
}

export const MonthlySummaryWidget: React.FC<MonthlySummaryWidgetProps> = ({
  summary,
  currentCycle,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <CardTitle>Tổng kết Kỳ {currentCycle ? `Tháng ${currentCycle.month}/${currentCycle.year}` : ''}</CardTitle>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
          {summary.totalDays} ngày tổng cộng
        </span>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 block">
              TB thu nhập / ngày
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatVND(summary.averageIncomePerDay)}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 block">
              TB tiền mặt / ngày
            </span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {formatVND(summary.averageCashPerDay)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Tỷ lệ hoàn thành mục tiêu</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{summary.successRate}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
            {summary.totalDays > 0 && (
              <>
                <div
                  style={{ width: `${(summary.successDays / summary.totalDays) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Success: ${summary.successDays} ngày`}
                />
                <div
                  style={{ width: `${(summary.processingDays / summary.totalDays) * 100}%` }}
                  className="bg-sky-500 h-full"
                  title={`Processing: ${summary.processingDays} ngày`}
                />
                <div
                  style={{ width: `${(summary.failedDays / summary.totalDays) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`Failed: ${summary.failedDays} ngày`}
                />
                <div
                  style={{ width: `${(summary.notStartedDays / summary.totalDays) * 100}%` }}
                  className="bg-slate-300 dark:bg-slate-700 h-full"
                  title={`Not started: ${summary.notStartedDays} ngày`}
                />
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/40 flex flex-col items-center text-center shadow-xs">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Success</span>
            </div>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5 tabular-nums">
              {summary.successDays}
            </span>
          </div>

          <div className="p-2.5 rounded-xl border border-rose-100 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-950/40 flex flex-col items-center text-center shadow-xs">
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <XCircle className="w-3.5 h-3.5" />
              <span>Failed</span>
            </div>
            <span className="text-lg font-black text-rose-700 dark:text-rose-300 mt-0.5 tabular-nums">
              {summary.failedDays}
            </span>
          </div>

          <div className="p-2.5 rounded-xl border border-sky-100 dark:border-sky-800/40 bg-sky-50/40 dark:bg-sky-950/40 flex flex-col items-center text-center shadow-xs">
            <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Processing</span>
            </div>
            <span className="text-lg font-black text-sky-700 dark:text-sky-300 mt-0.5 tabular-nums">
              {summary.processingDays}
            </span>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col items-center text-center shadow-xs">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Not Started</span>
            </div>
            <span className="text-lg font-black text-slate-700 dark:text-slate-200 mt-0.5 tabular-nums">
              {summary.notStartedDays}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
