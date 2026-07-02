import { describe, it, expect } from 'vitest';
import { formatMoney, groupByDay, toDateKey, formatTime } from '@/utils/format';
import type { FinanceRecord } from '@/types';

describe('formatMoney', () => {
  it('formats with two decimals and thousands separators', () => {
    expect(formatMoney(1234.5)).toBe('1,234.50');
    expect(formatMoney('1234.5')).toBe('1,234.50');
    expect(formatMoney(0)).toBe('0.00');
  });
});

describe('timezone-independent record date/time', () => {
  // recordDate is a wall-clock instant pinned as UTC; display must read those
  // exact components regardless of the viewer's timezone. An evening record
  // must NOT roll into the next day.
  it('reads the ISO wall-clock date, not the viewer-local date', () => {
    expect(toDateKey('2026-07-02T16:47:00.000Z')).toBe('2026-07-02');
    expect(toDateKey('2026-07-02T23:30:00.000Z')).toBe('2026-07-02');
  });

  it('reads the ISO wall-clock time, not the viewer-local time', () => {
    expect(formatTime('2026-07-02T16:47:00.000Z')).toBe('16:47');
    expect(formatTime('2026-07-02T00:21:00.000Z')).toBe('00:21');
  });

  it('groups evening records under the recorded day', () => {
    const recs = [
      { id: 1, recordDate: '2026-07-02T16:47:00.000Z' },
      { id: 2, recordDate: '2026-07-02T23:30:00.000Z' },
    ] as unknown as FinanceRecord[];
    const groups = groupByDay(recs);
    expect(groups.length).toBe(1);
    expect(groups[0].date).toBe('2026-07-02');
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
