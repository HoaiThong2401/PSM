import type { IncomeRecord } from '../types/income';
import { DEFAULT_USER_SETTINGS } from '../types/settings';
import { computeRecordTotals } from '../utils/calculation';

export const INITIAL_USER = {
  id: 'demo_user',
  email: 'demo@local.storage',
  name: 'Tài khoản Demo',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Demo',
  role: 'Demo',
};

const rawCycle09Records: Array<{
  date: string;
  cash: number;
  baseSalary: number;
  tips: number;
  bonus: number;
  status?: 'processing' | 'success' | 'failed' | 'not_started';
  isCustomStatus?: boolean;
  note?: string;
}> = [
  { date: '2026-08-26', cash: 194980, baseSalary: 204000, tips: 0, bonus: 0, status: 'success', isCustomStatus: true },
  { date: '2026-08-27', cash: 345290, baseSalary: 204000, tips: 0, bonus: 0, status: 'success', isCustomStatus: true },
  { date: '2026-08-28', cash: 61040, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-08-29', cash: 7240, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-08-30', cash: 7240, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-08-31', cash: 7240, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-01', cash: 7240, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-02', cash: 7240, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-03', cash: 190430, baseSalary: 204000, tips: 0, bonus: 0, status: 'success', isCustomStatus: true },
  { date: '2026-09-04', cash: 247850, baseSalary: 204000, tips: 0, bonus: 272500, status: 'success', isCustomStatus: true },
  { date: '2026-09-05', cash: 237610, baseSalary: 204000, tips: 79000, bonus: 65080, status: 'success', isCustomStatus: true },
  { date: '2026-09-06', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-07', cash: 0, baseSalary: 0, tips: 44000, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-08', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-09', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-10', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-11', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-12', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-13', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-14', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'failed', isCustomStatus: true },
  { date: '2026-09-15', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'processing', isCustomStatus: true },
  { date: '2026-09-16', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
  { date: '2026-09-17', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
  { date: '2026-09-18', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
  { date: '2026-09-19', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
  { date: '2026-09-20', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
  { date: '2026-09-21', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
  { date: '2026-09-22', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
  { date: '2026-09-23', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
  { date: '2026-09-24', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
  { date: '2026-09-25', cash: 0, baseSalary: 0, tips: 0, bonus: 0, status: 'not_started', isCustomStatus: true },
];

export const INITIAL_INCOME_RECORDS: IncomeRecord[] = rawCycle09Records.map((r, index) =>
  computeRecordTotals(
    {
      id: `rec_202609_${String(index + 1).padStart(2, '0')}`,
      userId: INITIAL_USER.id,
      date: r.date,
      cash: r.cash,
      baseSalary: r.baseSalary,
      tips: r.tips,
      bonus: r.bonus,
      targetCash: 0,
      status: r.status,
      isCustomStatus: r.isCustomStatus,
      note: r.note || '',
      createdAt: `${r.date}T08:00:00.000Z`,
      updatedAt: `${r.date}T22:00:00.000Z`,
    },
    DEFAULT_USER_SETTINGS
  )
);
