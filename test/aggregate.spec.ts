import { describe, it, expect } from 'vitest';
import { bucketSpend } from '@/utils/aggregate';
import { makePeriod, makeCustomPeriod } from '@/utils/period';
import type { FinanceRecord } from '@/types';

const rec = (date: string, amount: number, type: 'EXPENSE' | 'INCOME') =>
  ({ id: Math.floor(Math.random() * 1e9), recordDate: date, amount, type, categoryId: 1 } as unknown as FinanceRecord);

describe('bucketSpend day buckets', () => {
  it('produces one bucket per day across a week and sums expense/income', () => {
    const now = new Date(2026, 5, 25);
    const p = makePeriod('week', new Date(2026, 5, 24), now); // 6/22..6/28
    const buckets = bucketSpend(
      [rec('2026-06-22T10:00:00', 10, 'EXPENSE'), rec('2026-06-22T12:00:00', 5, 'EXPENSE'), rec('2026-06-24T09:00:00', 8, 'INCOME')],
      p,
    );
    expect(buckets.length).toBe(7);
    expect(buckets[0].label).toBe('6月22日');
    expect(buckets[0].expense).toBe(15);
    expect(buckets[2].income).toBe(8);
  });

  it('ignores records outside the range', () => {
    const p = makeCustomPeriod(new Date(2026, 5, 1), new Date(2026, 5, 3));
    const buckets = bucketSpend([rec('2026-06-05T10:00:00', 99, 'EXPENSE')], p);
    expect(buckets.length).toBe(3);
    expect(buckets.reduce((s, b) => s + b.expense, 0)).toBe(0);
  });
});

describe('bucketSpend year buckets', () => {
  it('produces 12 month buckets and sums into the right month', () => {
    const p = makePeriod('year', new Date(2026, 0, 1));
    const buckets = bucketSpend(
      [rec('2026-03-10T10:00:00', 20, 'EXPENSE'), rec('2026-03-15T10:00:00', 5, 'EXPENSE'), rec('2025-03-15T10:00:00', 999, 'EXPENSE')],
      p,
    );
    expect(buckets.length).toBe(12);
    expect(buckets[0].label).toBe('1月');
    expect(buckets[2].label).toBe('3月');
    expect(buckets[2].expense).toBe(25); // 2025 record excluded
  });
});
