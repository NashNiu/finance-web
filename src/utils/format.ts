import type { FinanceRecord } from '@/types';

export function formatMoney(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return (isNaN(n) ? 0 : n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// "2026-06-15T..." or Date -> "2026-06-15" (local date part of ISO)
export function toDateKey(input: string): string {
  return new Date(input).toISOString().slice(0, 10);
}

export interface DayGroup {
  date: string;
  records: FinanceRecord[];
}

export function groupByDay(records: FinanceRecord[]): DayGroup[] {
  const map = new Map<string, FinanceRecord[]>();
  for (const r of records) {
    const key = toDateKey(r.recordDate);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, records]) => ({ date, records }));
}
