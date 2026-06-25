export type PeriodMode = 'week' | 'month' | 'year' | 'custom';

export interface Period {
  mode: PeriodMode;
  start: Date; // inclusive, local midnight
  end: Date;   // exclusive, local midnight of day after last day
  label: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const atMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const md = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const DAY = 86400000;

// Monday-based start of the week containing d.
export function weekStart(d: Date): Date {
  const m = atMidnight(d);
  const dow = (m.getDay() + 6) % 7; // 0=Mon .. 6=Sun
  return addDays(m, -dow);
}

// ISO-8601 week number.
export function isoWeek(d: Date): number {
  const date = atMidnight(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day + 3); // Thursday of this week
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  const fDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - fDay + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * DAY));
}

// '本周' | '上周' | '第N周', relative to now.
export function weekNote(ws: Date, now: Date): string {
  const cur = weekStart(now);
  const diff = Math.round((ws.getTime() - cur.getTime()) / (7 * DAY));
  if (diff === 0) return '本周';
  if (diff === -1) return '上周';
  return `第${isoWeek(ws)}周`;
}

export function makePeriod(
  mode: Exclude<PeriodMode, 'custom'>,
  anchor: Date,
  now: Date = new Date(),
): Period {
  if (mode === 'week') {
    const s = weekStart(anchor);
    const last = addDays(s, 6);
    return { mode, start: s, end: addDays(s, 7), label: `${md(s)}-${md(last)} (${weekNote(s, now)})` };
  }
  if (mode === 'month') {
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    return { mode, start: new Date(y, m, 1), end: new Date(y, m + 1, 1), label: `${y}年${m + 1}月` };
  }
  // year
  const y = anchor.getFullYear();
  return { mode, start: new Date(y, 0, 1), end: new Date(y + 1, 0, 1), label: `${y}年` };
}

export function makeCustomPeriod(start: Date, end: Date): Period {
  const s = atMidnight(start);
  const lastDay = atMidnight(end);
  const sameYear = s.getFullYear() === lastDay.getFullYear();
  const label = sameYear
    ? `${md(s)}-${md(lastDay)}`
    : `${s.getFullYear()}年${md(s)}-${lastDay.getFullYear()}年${md(lastDay)}`;
  return { mode: 'custom', start: s, end: addDays(lastDay, 1), label };
}

export function toQuery(p: Period): { from: string; to: string } {
  return { from: ymd(p.start), to: ymd(addDays(p.end, -1)) };
}

export function weeksOfYear(
  year: number,
  now: Date = new Date(),
): { key: string; start: Date; end: Date; label: string }[] {
  const out: { key: string; start: Date; end: Date; label: string }[] = [];
  let ws = weekStart(new Date(year, 0, 1));
  const yearEnd = new Date(year + 1, 0, 1);
  while (ws < yearEnd) {
    const last = addDays(ws, 6);
    out.push({
      key: ymd(ws),
      start: ws,
      end: addDays(ws, 7),
      label: `${md(ws)}-${md(last)} (${weekNote(ws, now)})`,
    });
    ws = addDays(ws, 7);
  }
  return out;
}
