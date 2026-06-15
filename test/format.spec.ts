import { describe, it, expect } from 'vitest';
import { formatMoney, groupByDay } from '@/utils/format';
import type { FinanceRecord } from '@/types';

describe('formatMoney', () => {
  it('formats with two decimals and thousands separators', () => {
    expect(formatMoney(1234.5)).toBe('1,234.50');
    expect(formatMoney('1234.5')).toBe('1,234.50');
    expect(formatMoney(0)).toBe('0.00');
  });
});

describe('groupByDay', () => {
  it('groups records by their record date descending', () => {
    const recs = [
      { id: 1, recordDate: '2026-06-10T00:00:00.000Z' },
      { id: 2, recordDate: '2026-06-10T00:00:00.000Z' },
      { id: 3, recordDate: '2026-06-09T00:00:00.000Z' },
    ] as unknown as FinanceRecord[];
    const groups = groupByDay(recs);
    expect(groups.length).toBe(2);
    expect(groups[0].date).toBe('2026-06-10');
    expect(groups[0].records.length).toBe(2);
    expect(groups[1].date).toBe('2026-06-09');
  });
});
