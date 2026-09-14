import { useState, useMemo, useEffect } from 'react';
import type { IncomeRecord, IncomeCycle, CycleSummary } from '../types/income';
import type { UserSettings } from '../types/settings';
import { calculateCycleSummary } from '../utils/calculation';
import { generateDateRange, formatDisplayDate } from '../utils/dateUtils';

export function getCycleRange(year: number, month: number, cutoffDay: number = 26): { startDate: string; endDate: string } {
  const safeCutoff = typeof cutoffDay === 'number' && cutoffDay >= 2 && cutoffDay <= 28 ? cutoffDay : 26;
  const startMonth = month === 1 ? 12 : month - 1;
  const startYear = month === 1 ? year - 1 : year;
  const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(safeCutoff).padStart(2, '0')}`;

  const endDay = safeCutoff - 1;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

export function useCycleFilter(records: IncomeRecord[], settings: UserSettings) {
  const availableCycles = useMemo<IncomeCycle[]>(() => {
    const cycleMap = new Map<string, IncomeCycle>();
    const baseDate = new Date();
    const baseYear = baseDate.getFullYear();
    const baseMonth = baseDate.getMonth() + 1;

    // 1. Tạo các chu kỳ gần thời điểm hiện tại
    for (let offset = -4; offset <= 3; offset++) {
      let targetMonth = baseMonth + offset;
      let targetYear = baseYear;

      while (targetMonth < 1) {
        targetMonth += 12;
        targetYear -= 1;
      }
      while (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
      }

      const { startDate, endDate } = getCycleRange(targetYear, targetMonth, settings.cycleStartDay);
      const label = `Kỳ ${String(targetMonth).padStart(2, '0')}/${targetYear} (${formatDisplayDate(startDate).slice(0, 5)} - ${formatDisplayDate(endDate).slice(0, 5)})`;
      const id = `cycle_${targetYear}_${targetMonth}`;

      cycleMap.set(id, {
        id,
        label,
        month: targetMonth,
        year: targetYear,
        startDate,
        endDate,
      });
    }

    // 2. Quét qua tất cả records trong database để tự tạo chu kỳ nếu thuộc năm/tháng khác
    records.forEach((r) => {
      if (!r.date) return;
      const parts = r.date.split('-');
      if (parts.length < 3) return;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (isNaN(y) || isNaN(m) || isNaN(d)) return;

      let cycleMonth = m;
      let cycleYear = y;
      const safeCutoff = typeof settings.cycleStartDay === 'number' && settings.cycleStartDay >= 2 && settings.cycleStartDay <= 28 ? settings.cycleStartDay : 26;
      if (d >= safeCutoff) {
        cycleMonth += 1;
        if (cycleMonth > 12) {
          cycleMonth = 1;
          cycleYear += 1;
        }
      }

      const id = `cycle_${cycleYear}_${cycleMonth}`;
      if (!cycleMap.has(id)) {
        const { startDate, endDate } = getCycleRange(cycleYear, cycleMonth, settings.cycleStartDay);
        const label = `Kỳ ${String(cycleMonth).padStart(2, '0')}/${cycleYear} (${formatDisplayDate(startDate).slice(0, 5)} - ${formatDisplayDate(endDate).slice(0, 5)})`;
        cycleMap.set(id, {
          id,
          label,
          month: cycleMonth,
          year: cycleYear,
          startDate,
          endDate,
        });
      }
    });

    return Array.from(cycleMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [records, settings.cycleStartDay]);

  const defaultCycleId = useMemo(() => {
    const now = new Date();
    return `cycle_${now.getFullYear()}_${now.getMonth() + 1}`;
  }, []);

  const [selectedCycleId, setSelectedCycleId] = useState<string>(defaultCycleId);

  // Tự động chuyển tới chu kỳ có dữ liệu nếu chu kỳ hiện tại trống
  useEffect(() => {
    if (records.length > 0) {
      const currentHasData = records.some((r) => {
        const c = availableCycles.find((cy) => cy.id === selectedCycleId);
        return c && r.date >= c.startDate && r.date <= c.endDate && (r.cash > 0 || r.baseSalary > 0);
      });

      if (!currentHasData) {
        for (const cycle of availableCycles) {
          const hasData = records.some(
            (r) => r.date >= cycle.startDate && r.date <= cycle.endDate && (r.cash > 0 || r.baseSalary > 0)
          );
          if (hasData) {
            setSelectedCycleId(cycle.id);
            break;
          }
        }
      }
    }
  }, [records, availableCycles, selectedCycleId]);

  const currentCycle = useMemo(() => {
    return availableCycles.find((c) => c.id === selectedCycleId) || availableCycles[0];
  }, [availableCycles, selectedCycleId]);

  const cycleRecords = useMemo(() => {
    if (!currentCycle) return [];
    const allDates = generateDateRange(currentCycle.startDate, currentCycle.endDate);

    return allDates.map((date) => {
      const existing = records.find((r) => r.date === date);
      if (existing) return existing;

      return {
        id: `virtual_${date}`,
        userId: '',
        date,
        cash: 0,
        baseSalary: 0,
        tips: 0,
        bonus: 0,
        totalCash: 0,
        totalIncome: 0,
        targetCash: 0,
        status: 'not_started' as const,
        createdAt: '',
        updatedAt: '',
      };
    });
  }, [records, currentCycle]);

  const cycleSummary = useMemo<CycleSummary>(() => {
    return calculateCycleSummary(cycleRecords);
  }, [cycleRecords]);

  return {
    availableCycles,
    selectedCycleId,
    setSelectedCycleId,
    currentCycle,
    cycleRecords,
    cycleSummary,
  };
}
