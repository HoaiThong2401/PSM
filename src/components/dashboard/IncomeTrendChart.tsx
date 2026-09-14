import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { IncomeRecord } from '../../types/income';
import { formatVND, formatCompactVND } from '../../utils/currency';
import { formatShortDate } from '../../utils/dateUtils';
import { TrendingUp } from 'lucide-react';

interface IncomeTrendChartProps {
  records: IncomeRecord[];
}

export const IncomeTrendChart: React.FC<IncomeTrendChartProps> = ({ records }) => {
  const chartData = records.map((r) => ({
    date: formatShortDate(r.date),
    fullDate: r.date,
    totalIncome: r.totalIncome,
    cash: r.cash,
    baseSalary: r.baseSalary,
    tips: r.tips,
    bonus: r.bonus,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1">
            Ngày: {label}
          </p>
          <div className="flex justify-between gap-4">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Tổng thu nhập:</span>
            <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">{formatVND(data.totalIncome)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400">
            <span>Tiền mặt:</span>
            <span className="tabular-nums">{formatVND(data.cash)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400">
            <span>Lương cơ bản:</span>
            <span className="tabular-nums">{formatVND(data.baseSalary)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400">
            <span>Tiền bo:</span>
            <span className="tabular-nums">{formatVND(data.tips)}</span>
          </div>
          {data.bonus > 0 && (
            <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Thưởng:</span>
              <span className="tabular-nums">{formatVND(data.bonus)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <CardTitle>Xu hướng Thu nhập Hằng ngày</CardTitle>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-600 dark:text-zinc-400">Tổng thu nhập</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px] pt-2">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.15)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(val) => formatCompactVND(val)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="totalIncome"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#incomeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
