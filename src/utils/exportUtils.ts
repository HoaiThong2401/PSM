import * as XLSX from 'xlsx';
import type { IncomeRecord } from '../types/income';
import type { UserSettings } from '../types/settings';
import { formatDisplayDate } from './dateUtils';

/**
 * Exports income records to an Excel (.xlsx) file
 */
export function exportToExcel(
  records: IncomeRecord[],
  fileName = 'thu-nhap-ca-nhan.xlsx'
): void {
  const data = records.map((r) => ({
    'Ngày': formatDisplayDate(r.date),
    'Lương cơ bản (đ)': r.baseSalary,
    'Tiền mặt (đ)': r.cash,
    'Tiền bo (đ)': r.tips,
    'Tiền thưởng (đ)': r.bonus,
    'Tổng tiền mặt (đ)': r.totalCash,
    'Tổng thu nhập (đ)': r.totalIncome,
    'Mục tiêu ngày (đ)': r.targetCash,
    'Trạng thái':
      r.status === 'success'
        ? 'Đạt mục tiêu'
        : r.status === 'failed'
        ? 'Chưa đạt'
        : r.status === 'processing'
        ? 'Đang tiến hành'
        : 'Chưa bắt đầu',
    'Ghi chú': r.note || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto set column widths for nice readability
  worksheet['!cols'] = [
    { wch: 14 }, // Ngày
    { wch: 18 }, // Lương cơ bản
    { wch: 15 }, // Tiền mặt
    { wch: 14 }, // Tiền bo
    { wch: 16 }, // Tiền thưởng
    { wch: 18 }, // Tổng tiền mặt
    { wch: 18 }, // Tổng thu nhập
    { wch: 18 }, // Mục tiêu ngày
    { wch: 16 }, // Trạng thái
    { wch: 30 }, // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Thu nhập');

  const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
}

/**
 * Exports settings and configuration to an Excel (.xlsx) file
 */
export function exportSettingsToExcel(
  settings: UserSettings,
  fileName = 'cai-dat-tai-chinh.xlsx'
): void {
  const settingsData = [
    { 'Mục cài đặt': 'Mục tiêu ngày thường (Thứ 2 - Thứ 5)', 'Giá trị': `${settings.weekdayTargetCash.toLocaleString('vi-VN')} đ` },
    { 'Mục cài đặt': 'Mục tiêu cuối tuần (Thứ 6 - Chủ Nhật)', 'Giá trị': `${settings.weekendTargetCash.toLocaleString('vi-VN')} đ` },
    { 'Mục cài đặt': 'Ngày bắt đầu chu kỳ tính lương', 'Giá trị': `Ngày ${settings.cycleStartDay} hàng tháng` },
    { 'Mục cài đặt': 'Lương cơ bản mặc định', 'Giá trị': `${settings.defaultBaseSalary.toLocaleString('vi-VN')} đ` },
    { 'Mục cài đặt': 'Đơn vị tiền tệ', 'Giá trị': settings.currency || 'VND' },
    { 'Mục cài đặt': 'Giao diện', 'Giá trị': settings.theme === 'dark' ? 'Tối (Dark)' : 'Sáng (Light)' },
    { 'Mục cài đặt': 'Ngôn ngữ', 'Giá trị': settings.language === 'en' ? 'English' : 'Tiếng Việt' },
    { 'Mục cài đặt': 'Thời điểm xuất', 'Giá trị': new Date().toLocaleString('vi-VN') },
  ];

  const worksheet = XLSX.utils.json_to_sheet(settingsData);
  worksheet['!cols'] = [{ wch: 45 }, { wch: 35 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cài đặt');

  const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
}

/**
 * Backwards compatibility aliases
 */
export const exportToCSV = exportToExcel;
export const exportToJSON = (data: unknown, fileName = 'salary-backup.xlsx') => {
  if (typeof data === 'object' && data !== null && 'settings' in data) {
    exportSettingsToExcel((data as { settings: UserSettings }).settings, fileName);
  } else {
    exportToExcel([], fileName);
  }
};
