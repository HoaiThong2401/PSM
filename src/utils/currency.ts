/**
 * Formats a number to Vietnamese Dong currency format (e.g. 200.000 ₫)
 */
export function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number with dot separator (e.g. 200.000)
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Parses user input string (with dots/commas/vnd) into raw integer number
 */
export function parseVNDInput(input: string): number {
  if (!input) return 0;
  // Remove all non-digit characters
  const cleanNumber = input.replace(/[^\d]/g, '');
  const parsed = parseInt(cleanNumber, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats compact VND for small cards/charts (e.g. 1.5M ₫, 250k ₫)
 */
export function formatCompactVND(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}tr ₫`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k ₫`;
  }
  return `${amount} ₫`;
}
