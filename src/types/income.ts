export type DayStatus = 'success' | 'failed' | 'processing' | 'not_started';

export interface IncomeRecord {
  id: string;
  userId: string;
  date: string; // ISO format 'YYYY-MM-DD'
  cash: number; // Tiền mặt
  baseSalary: number; // Lương cơ bản
  tips: number; // Tiền bo
  bonus: number; // Tiền thưởng
  totalCash: number; // = cash
  totalIncome: number; // = cash + baseSalary + tips + bonus
  targetCash: number; // Mục tiêu tiền mặt của ngày (tính tự động hoặc ghi đè)
  status: DayStatus;
  isCustomStatus?: boolean; // Nếu user chủ động đổi trạng thái thủ công
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeCycle {
  id: string;
  label: string; // e.g. "Kỳ 09/2026 (26/08 - 25/09)"
  month: number;
  year: number;
  startDate: string; // '2026-08-26'
  endDate: string; // '2026-09-25'
}

export interface CycleSummary {
  totalIncome: number;
  totalCash: number;
  totalBaseSalary: number;
  totalTips: number;
  totalBonus: number;
  targetCashTotal: number;
  totalDays: number;
  workedDays: number;
  successDays: number;
  failedDays: number;
  processingDays: number;
  notStartedDays: number;
  averageIncomePerDay: number;
  averageCashPerDay: number;
  successRate: number; // %
}

export type IncomeSortMode =
  | 'processing_first'
  | 'recently_updated'
  | 'date_desc'
  | 'date_asc'
  | 'income_desc';

export type IncomeSortField = 'date' | 'cash' | 'totalIncome' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface IncomeFilterOptions {
  status?: DayStatus | 'all';
  searchQuery?: string;
  sortMode?: IncomeSortMode;
  sortField?: IncomeSortField;
  sortOrder?: SortOrder;
}
