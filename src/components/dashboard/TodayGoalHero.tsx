import React from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatVND } from '../../utils/currency';
import { formatDisplayDate, getDayOfWeekLabel, getTodayISO } from '../../utils/dateUtils';
import type { IncomeRecord } from '../../types/income';
import type { UserSettings } from '../../types/settings';
import { getTargetForDate } from '../../utils/calculation';

interface TodayGoalHeroProps {
  todayRecord?: IncomeRecord;
  settings: UserSettings;
  onQuickUpdateCash: (record: IncomeRecord | undefined) => void;
}

export const TodayGoalHero: React.FC<TodayGoalHeroProps> = ({
  todayRecord,
  settings,
  onQuickUpdateCash,
}) => {
  const todayISO = getTodayISO();
  const dayLabel = getDayOfWeekLabel(todayISO);
  const formattedToday = formatDisplayDate(todayISO);

  const target = todayRecord?.targetCash || getTargetForDate(todayISO, settings);
  const actualCash = todayRecord?.cash || 0;
  const percentage = target > 0 ? Math.min(Math.round((actualCash / target) * 100), 100) : 0;
  const isGoalReached = actualCash >= target && target > 0;
  const remaining = Math.max(0, target - actualCash);

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-700/40">
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide text-indigo-200 border border-white/10">
              📅 {dayLabel}, {formattedToday}
            </span>
            <Badge
              status={todayRecord?.status || 'processing'}
              size="md"
              className="bg-white/15 text-white border-white/20 backdrop-blur-md"
            />
            {isGoalReached && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 animate-pulse">
                <Sparkles className="w-3 h-3" /> Đạt chỉ tiêu!
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Tiến độ Mục tiêu Tiền mặt Hôm nay
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 leading-relaxed">
              {isGoalReached
                ? `Xuất sắc! Bạn đã vượt mục tiêu tiền mặt ngày hôm nay với ${formatVND(actualCash)}.`
                : remaining > 0
                ? `Còn thiếu ${formatVND(remaining)} nữa để hoàn thành mục tiêu ngày ${dayLabel}.`
                : 'Hãy bắt đầu ghi nhận các khoản thu nhập đầu tiên trong ngày!'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-indigo-200/70 block">Mục tiêu ngày</span>
              <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                {formatVND(target)}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-indigo-200/70 block">Tiền mặt thực tế</span>
              <span className="text-base sm:text-lg font-bold text-indigo-300 tabular-nums">
                {formatVND(actualCash)}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-indigo-200/70 block">Tổng thu nhập hôm nay</span>
              <span className="text-base sm:text-lg font-bold text-emerald-300 tabular-nums">
                {formatVND(todayRecord?.totalIncome || actualCash)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-5 bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-5 lg:min-w-[240px]">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-white/15 stroke-current"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`stroke-current transition-all duration-1000 ease-out ${
                  isGoalReached ? 'text-emerald-400' : 'text-indigo-400'
                }`}
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white tabular-nums">{percentage}%</span>
              <span className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wider">
                {isGoalReached ? 'Hoàn thành' : 'Đạt được'}
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <Button
              variant={isGoalReached ? 'success' : 'primary'}
              size="sm"
              onClick={() => {
                if (isGoalReached) handleCelebrate();
                onQuickUpdateCash(todayRecord);
              }}
              className="w-full text-xs font-bold shadow-md bg-white text-indigo-900 hover:bg-indigo-50"
            >
              {isGoalReached ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Chúc mừng! Cập nhật thêm
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5" /> Nhập thu nhập hôm nay
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
