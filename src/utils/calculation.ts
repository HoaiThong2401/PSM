import type { DayStatus, IncomeRecord, CycleSummary } from '../types/income';
import type { UserSettings } from '../types/settings';
import { isWeekendOrFriday, compareDates, getTodayISO } from './dateUtils';

/**
 * Determines target cash for a specific date based on business rules & user settings
 */
export function getTargetForDate(dateString: string, settings: UserSettings): number {
  return isWeekendOrFriday(dateString) ? settings.weekendTargetCash : settings.weekdayTargetCash;
}

/**
 * Computes the status of an income day record based on business rules:
 * - Future date: not_started
 * - Today with 0 cash: processing
 * - Reached target (cash >= target): success
 * - Today with 0 < cash < target: processing
 * - Past date with cash < target: failed
 */
export function computeDayStatus(dateString: string, cash: number, targetCash: number): DayStatus {
  const today = getTodayISO();
  const dateComparison = compareDates(dateString, today);

  if (dateComparison > 0) {
    return 'not_started';
  }

  if (cash >= targetCash && targetCash > 0) {
    return 'success';
  }

  if (dateComparison === 0) {
    return 'processing';
  }

  return 'failed';
}

/**
 * Cycles to the next status for quick toggle:
 * processing -> success -> failed -> not_started -> processing
 */
export function getNextStatus(current: DayStatus): DayStatus {
  const flow: Record<DayStatus, DayStatus> = {
    processing: 'success',
    success: 'failed',
    failed: 'not_started',
    not_started: 'processing',
  };
  return flow[current] || 'processing';
}

/**
 * Computes calculated fields for an income record
 */
export function computeRecordTotals(
  record: Omit<IncomeRecord, 'totalCash' | 'totalIncome' | 'status'> & { status?: DayStatus },
  settings: UserSettings
): IncomeRecord {
  const targetCash = record.targetCash || getTargetForDate(record.date, settings);
  const totalCash = Number(record.cash) || 0;
  const totalIncome =
    totalCash +
    (Number(record.baseSalary) || 0) +
    (Number(record.tips) || 0) +
    (Number(record.bonus) || 0);

  // If user explicitly provided a custom status, honor it, otherwise compute automatically
  const status = record.isCustomStatus && record.status
    ? record.status
    : computeDayStatus(record.date, totalCash, targetCash);

  return {
    ...record,
    cash: totalCash,
    baseSalary: Number(record.baseSalary) || 0,
    tips: Number(record.tips) || 0,
    bonus: Number(record.bonus) || 0,
    targetCash,
    totalCash,
    totalIncome,
    status,
    isCustomStatus: record.isCustomStatus || false,
  };
}

/**
 * Computes aggregated statistics for a list of cycle records
 */
export function calculateCycleSummary(records: IncomeRecord[]): CycleSummary {
  const totalDays = records.length;
  let totalIncome = 0;
  let totalCash = 0;
  let totalBaseSalary = 0;
  let totalTips = 0;
  let totalBonus = 0;
  let targetCashTotal = 0;
  let successDays = 0;
  let failedDays = 0;
  let processingDays = 0;
  let notStartedDays = 0;
  let workedDays = 0;

  records.forEach((r) => {
    totalIncome += r.totalIncome;
    totalCash += r.cash;
    totalBaseSalary += r.baseSalary;
    totalTips += r.tips;
    totalBonus += r.bonus;
    targetCashTotal += r.targetCash;

    if (r.status === 'success') {
      successDays++;
      workedDays++;
    } else if (r.status === 'failed') {
      failedDays++;
      if (r.cash > 0 || r.baseSalary > 0) workedDays++;
    } else if (r.status === 'processing') {
      processingDays++;
      if (r.cash > 0 || r.baseSalary > 0) workedDays++;
    } else {
      notStartedDays++;
    }
  });

  const passedDays = successDays + failedDays + (processingDays > 0 ? 1 : 0);
  const averageIncomePerDay = passedDays > 0 ? Math.round(totalIncome / passedDays) : 0;
  const averageCashPerDay = passedDays > 0 ? Math.round(totalCash / passedDays) : 0;
  const successRate = passedDays > 0 ? Math.round((successDays / passedDays) * 100) : 0;

  return {
    totalIncome,
    totalCash,
    totalBaseSalary,
    totalTips,
    totalBonus,
    targetCashTotal,
    totalDays,
    workedDays,
    successDays,
    failedDays,
    processingDays,
    notStartedDays,
    averageIncomePerDay,
    averageCashPerDay,
    successRate,
  };
}
