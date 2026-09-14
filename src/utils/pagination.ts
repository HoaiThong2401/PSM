/**
 * Generates symmetric pagination items with 2 boundary pages on each side (1 2 ... N-1 N).
 * Example:
 * - total = 8, current = 1 -> [1, 2, '...', 7, 8]
 * - total = 8, current = 4 -> [1, 2, '...', 4, '...', 7, 8]
 * - total = 5, current = 1 -> [1, 2, 3, 4, 5]
 */
export function getPaginationPages(current: number, total: number): (number | string)[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(2);
  pages.add(total - 1);
  pages.add(total);

  if (current >= 1 && current <= total) {
    pages.add(current);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | string)[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...');
    }
    result.push(sorted[i]);
  }

  return result;
}
