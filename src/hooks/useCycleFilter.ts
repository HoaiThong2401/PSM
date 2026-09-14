import { useState, useMemo } from 'react';
import type { IncomeRecord, IncomeCycle, CycleSummary } from '../types/income';
import type { UserSettings } from '../types/settings';
import { calculateCycleSummary } from '../utils/calculation';
import { generateDateRange, formatDisplayDate } from '../utils/dateUtils';

export function getCycleRange(year: number, month: number, cutoffDay: number): { startDate: string; endDate: string } {
  const startMonth = month === 1 ? 12 : month - 1;
  const startYear = month === 1 ? year - 1 : year;
  const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(cutoffDay).padStart(2, '0')}`;

  const endDay = cutoffDay - 1;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

export function useCycleFilter(records: IncomeRecord[], settings: UserSettings) {
  const availableCycles = useMemo<IncomeCycle[]>(() => {
    const cycles: IncomeCycle[] = [];
    const baseDate = new Date();
    const baseYear = baseDate.getFullYear();
    const baseMonth = baseDate.getMonth() + 1;

    for (let offset = -3; offset <= 2; offset++) {
      let targetMonth = baseMonth + offset;
      let targetYear = baseYear;

      if (targetMonth < 1) {
        targetMonth += 12;
        targetYear -= 1;
      } else if (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
      }

      const { startDate, endDate } = getCycleRange(targetYear, targetMonth, settings.cycleStartDay);
      const label = `Kỳ ${String(targetMonth).padStart(2, '0')}/${targetYear} (${formatDisplayDate(startDate).slice(0, 5)} - ${formatDisplayDate(endDate).slice(0, 5)})`;

      cycles.push({
        id: `cycle_${targetYear}_${targetMonth}`,
        label,
        month: targetMonth,
        year: targetYear,
        startDate,
        endDate,
      });
    }

    return cycles;
  }, [settings.cycleStartDay]);

  const defaultCycleId = useMemo(() => {
    const now = new Date();
    return `cycle_${now.getFullYear()}_${now.getMonth() + 1}`;
  }, []);

  const [selectedCycleId, setSelectedCycleId] = useState<string>(defaultCycleId);

  const currentCycle = useMemo(() => {
    return availableCycles.find((c) => c.id === selectedCycleId) || availableCycles[3] || availableCycles[0];
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
