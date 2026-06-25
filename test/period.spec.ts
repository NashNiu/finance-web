import { describe, it, expect } from 'vitest';
import {
  weekStart, isoWeek, weekNote, makePeriod, makeCustomPeriod, toQuery, weeksOfYear,
} from '@/utils/period';

describe('weekStart', () => {
  it('returns the Monday midnight of the containing week', () => {
    // 2026-06-25 is a Thursday
    const ws = weekStart(new Date(2026, 5, 25, 13, 0));
    expect(ws.getFullYear()).toBe(2026);
    expect(ws.getMonth()).toBe(5);
    expect(ws.getDate()).toBe(22); // Monday
    expect(ws.getHours()).toBe(0);
  });
  it('keeps Monday as the same day', () => {
    expect(weekStart(new Date(2026, 5, 22)).getDate()).toBe(22);
  });
});

describe('makePeriod month', () => {
  it('spans the whole month with a YYYY年M月 label', () => {
    const p = makePeriod('month', new Date(2026, 5, 10));
    expect(p.mode).toBe('month');
    expect(p.start.getTime()).toBe(new Date(2026, 5, 1).getTime());
    expect(p.end.getTime()).toBe(new Date(2026, 6, 1).getTime());
    expect(p.label).toBe('2026年6月');
  });
});

describe('makePeriod year', () => {
  it('spans the whole year with a YYYY年 label', () => {
    const p = makePeriod('year', new Date(2026, 5, 10));
    expect(p.start.getTime()).toBe(new Date(2026, 0, 1).getTime());
    expect(p.end.getTime()).toBe(new Date(2027, 0, 1).getTime());
    expect(p.label).toBe('2026年');
  });
});

describe('makePeriod week', () => {
  const now = new Date(2026, 5, 25); // Thu of week 2026-06-22..28
  it('labels the current week 本周', () => {
    const p = makePeriod('week', new Date(2026, 5, 24), now);
    expect(p.start.getDate()).toBe(22);
    expect(p.end.getTime()).toBe(new Date(2026, 5, 29).getTime());
    expect(p.label).toBe('6月22日-6月28日 (本周)');
  });
  it('labels last week 上周', () => {
    const p = makePeriod('week', new Date(2026, 5, 16), now);
    expect(p.label).toBe('6月15日-6月21日 (上周)');
  });
  it('labels other weeks 第N周', () => {
    const p = makePeriod('week', new Date(2026, 5, 8), now);
    expect(p.label.endsWith('周)')).toBe(true);
    expect(p.label.includes('第')).toBe(true);
  });
});

describe('makeCustomPeriod', () => {
  it('makes end exclusive (last day + 1) and a same-year label', () => {
    const p = makeCustomPeriod(new Date(2026, 5, 1), new Date(2026, 5, 25));
    expect(p.mode).toBe('custom');
    expect(p.start.getTime()).toBe(new Date(2026, 5, 1).getTime());
    expect(p.end.getTime()).toBe(new Date(2026, 5, 26).getTime());
    expect(p.label).toBe('6月1日-6月25日');
  });
  it('includes years when range spans years', () => {
    const p = makeCustomPeriod(new Date(2025, 11, 30), new Date(2026, 0, 2));
    expect(p.label).toBe('2025年12月30日-2026年1月2日');
  });
});

describe('toQuery', () => {
  it('returns inclusive from/to (to = end - 1 day)', () => {
    const p = makePeriod('month', new Date(2026, 5, 10));
    expect(toQuery(p)).toEqual({ from: '2026-06-01', to: '2026-06-30' });
  });
});

describe('isoWeek', () => {
  it('matches known ISO week numbers', () => {
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1);   // 2026-01-01 Thu -> week 1
    expect(isoWeek(new Date(2026, 5, 22))).toBe(26); // 2026-06-22 Mon -> week 26
  });
});

describe('weeksOfYear', () => {
  it('lists every Monday-week intersecting the year with labels', () => {
    const ws = weeksOfYear(2026, new Date(2026, 5, 25));
    expect(ws.length).toBeGreaterThanOrEqual(52);
    expect(ws.length).toBeLessThanOrEqual(54);
    expect(ws.every((w) => /日-.*日 \(/.test(w.label))).toBe(true);
    expect(ws.some((w) => w.label.includes('本周'))).toBe(true);
  });
});
