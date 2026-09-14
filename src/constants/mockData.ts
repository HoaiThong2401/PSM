import type { IncomeRecord } from '../types/income';
import { DEFAULT_USER_SETTINGS } from '../types/settings';
import { computeRecordTotals } from '../utils/calculation';

export const INITIAL_USER = {
  id: 'user_google_1029384756',
  email: 'thong.finance@gmail.com',
  name: 'Nguyễn Văn Thông',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Freelancer / Staff',
};

const rawCycle09Records: Array<{
  date: string;
  cash: number;
  baseSalary: number;
  tips: number;
  bonus: number;
  note?: string;
}> = [
  { date: '2026-08-26', cash: 220000, baseSalary: 200000, tips: 40000, bonus: 0, note: 'Khởi đầu kỳ mới thuận lợi' },
  { date: '2026-08-27', cash: 200000, baseSalary: 200000, tips: 20000, bonus: 0 },
  { date: '2026-08-28', cash: 270000, baseSalary: 200000, tips: 60000, bonus: 50000, note: 'Thứ 6 đông khách, được bo nhiều' },
  { date: '2026-08-29', cash: 310000, baseSalary: 200000, tips: 85000, bonus: 50000, note: 'Thứ 7 doanh thu cao' },
  { date: '2026-08-30', cash: 260000, baseSalary: 200000, tips: 45000, bonus: 0 },
  { date: '2026-08-31', cash: 180000, baseSalary: 200000, tips: 10000, bonus: 0, note: 'Hụt mục tiêu 20k' },
  { date: '2026-09-01', cash: 210000, baseSalary: 200000, tips: 35000, bonus: 0 },
  { date: '2026-09-02', cash: 350000, baseSalary: 300000, tips: 120000, bonus: 100000, note: 'Nghỉ lễ 2/9 - Lương x1.5 + thưởng lễ' },
  { date: '2026-09-03', cash: 205000, baseSalary: 200000, tips: 25000, bonus: 0 },
  { date: '2026-09-04', cash: 280000, baseSalary: 200000, tips: 70000, bonus: 0 },
  { date: '2026-09-05', cash: 290000, baseSalary: 200000, tips: 90000, bonus: 50000 },
  { date: '2026-09-06', cash: 255000, baseSalary: 200000, tips: 50000, bonus: 0 },
  { date: '2026-09-07', cash: 190000, baseSalary: 200000, tips: 15000, bonus: 0, note: 'Trời mưa vắng khách' },
  { date: '2026-09-08', cash: 215000, baseSalary: 200000, tips: 30000, bonus: 0 },
  { date: '2026-09-09', cash: 225000, baseSalary: 200000, tips: 40000, bonus: 0 },
  { date: '2026-09-10', cash: 200000, baseSalary: 200000, tips: 20000, bonus: 0 },
  { date: '2026-09-11', cash: 275000, baseSalary: 200000, tips: 65000, bonus: 30000 },
  { date: '2026-09-12', cash: 320000, baseSalary: 200000, tips: 95000, bonus: 50000, note: 'Đạt kỷ lục bo' },
  { date: '2026-09-13', cash: 260000, baseSalary: 200000, tips: 40000, bonus: 0 },
  { date: '2026-09-14', cash: 160000, baseSalary: 200000, tips: 30000, bonus: 0, note: 'Hôm nay: đang kiếm thêm buổi tối' },
  { date: '2026-09-15', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-16', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-17', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-18', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-19', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-20', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-21', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-22', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-23', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-24', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
  { date: '2026-09-25', cash: 0, baseSalary: 0, tips: 0, bonus: 0 },
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
      note: r.note || '',
      createdAt: `${r.date}T08:00:00.000Z`,
      updatedAt: `${r.date}T22:00:00.000Z`,
    },
    DEFAULT_USER_SETTINGS
  )
);
