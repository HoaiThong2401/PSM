import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { IncomeRecord } from '../../types/income';
import { formatVND, formatCompactVND } from '../../utils/currency';
import { formatShortDate } from '../../utils/dateUtils';
import { BarChart3 } from 'lucide-react';

interface CashVsTargetChartProps {
  records: IncomeRecord[];
}

export const CashVsTargetChart: React.FC<CashVsTargetChartProps> = ({ records }) => {
  const chartData = records.map((r) => ({
    date: formatShortDate(r.date),
    cash: r.cash,
    targetCash: r.targetCash,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1">
            Ngày: {label}
          </p>
          <div className="flex justify-between gap-4 text-sky-600 dark:text-sky-400 font-semibold">
            <span>Tiền mặt thực tế:</span>
            <span className="tabular-nums text-slate-900 dark:text-slate-100">{formatVND(data.cash)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400">
            <span>Mục tiêu tiền mặt:</span>
            <span className="tabular-nums">{formatVND(data.targetCash)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-500" />
          <CardTitle>So sánh Tiền mặt Thực tế & Mục tiêu</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px] pt-2">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
            />
            <Bar name="Mục tiêu" dataKey="targetCash" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.5} />
            <Bar name="Tiền mặt thực tế" dataKey="cash" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
