/**
 * Returns true if the date is Friday (5), Saturday (6), or Sunday (0)
 */
export function isWeekendOrFriday(dateString: string): boolean {
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  // 0: Sunday, 5: Friday, 6: Saturday
  return day === 0 || day === 5 || day === 6;
}

/**
 * Returns Vietnamese day of week label (e.g. "Thứ 2", "Chủ nhật")
 */
export function getDayOfWeekLabel(dateString: string): string {
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[day];
}

/**
 * Formats ISO date 'YYYY-MM-DD' to Vietnamese display date 'DD/MM/YYYY'
 */
export function formatDisplayDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

/**
 * Formats ISO date to short display 'DD/MM'
 */
export function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateString;
}

/**
 * Generates all dates in ISO format between startDate and endDate (inclusive)
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Returns today's ISO date string 'YYYY-MM-DD'
 */
export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Compares two ISO date strings: returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
