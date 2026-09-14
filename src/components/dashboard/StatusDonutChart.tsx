import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import type { CycleSummary } from '../../types/income';
import { PieChart as PieIcon } from 'lucide-react';

interface StatusDonutChartProps {
  summary: CycleSummary;
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ summary }) => {
  const data = [
    { name: 'Success', value: summary.successDays, color: '#10b981' },
    { name: 'Processing', value: summary.processingDays, color: '#0ea5e9' },
    { name: 'Failed', value: summary.failedDays, color: '#f43f5e' },
    { name: 'Not started', value: summary.notStartedDays, color: '#64748b' },
  ].filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const total = summary.totalDays || 1;
      const percentage = Math.round((entry.value / total) * 100);
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.payload.color }} />
            {entry.name}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">{entry.value}</span> ngày ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-emerald-500" />
          <CardTitle>Phân bố Trạng thái Ngày</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px] flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-xs text-slate-400">Chưa có dữ liệu</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
