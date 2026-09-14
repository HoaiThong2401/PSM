import type { IncomeRecord } from '../types/income';
import { formatDisplayDate } from './dateUtils';

/**
 * Exports income records to CSV file
 */
export function exportToCSV(records: IncomeRecord[], fileName = 'thu-nhap-ca-nhan.csv'): void {
  const headers = [
    'Thời gian',
    'Tiền mặt',
    'Lương CB',
    'Bo',
    'Thưởng',
    'Tổng tiền mặt',
    'Tổng thu nhập',
    'Mục tiêu',
    'Trạng thái',
    'Ghi chú',
  ];

  const rows = records.map((r) => [
    formatDisplayDate(r.date),
    r.cash,
    r.baseSalary,
    r.tips,
    r.bonus,
    r.totalCash,
    r.totalIncome,
    r.targetCash,
    r.status,
    `"${(r.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports data to JSON for backup
 */
export function exportToJSON(data: unknown, fileName = 'salary-backup.json'): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
