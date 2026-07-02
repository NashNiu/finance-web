import type { FinanceRecord } from '@/types';
import { currentLocale, t } from '@/i18n';

const EN_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const EN_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Locale-aware "month + day": "6月15日" (zh) / "Jun 15" (en).
export function monthDayLabel(month1to12: number, day: number): string {
  return currentLocale() === 'en'
    ? `${EN_MONTHS[month1to12 - 1]} ${day}`
    : `${month1to12}月${day}日`;
}

export function formatMoney(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return (isNaN(n) ? 0 : n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// recordDate is a wall-clock instant pinned as UTC (e.g. "2026-06-15T16:47:00.000Z").
// Read its calendar components verbatim from the ISO string so the displayed day
// and time never shift with the viewer's timezone.
// "2026-06-15T16:47:00.000Z" -> "2026-06-15"
export function toDateKey(input: string): string {
  if (typeof input === 'string' && input.length >= 10 && input[4] === '-') {
    return input.slice(0, 10);
  }
  // Fallback for non-ISO inputs: read UTC components (values are stored as UTC).
  const d = new Date(input);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

// "2026-06-15T16:47:00.000Z" -> "16:47"
export function formatTime(input: string): string {
  if (typeof input === 'string' && input.length >= 16 && input[10] === 'T') {
    return input.slice(11, 16);
  }
  const d = new Date(input);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

// "2026-06-15" -> "6月15日 今天" (zh) / "Jun 15 Today" (en).
export function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const base = monthDayLabel(m, d);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yest = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const yestKey = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
  if (dateKey === todayKey) return `${base} ${t('common.today')}`;
  if (dateKey === yestKey) return `${base} ${t('common.yesterday')}`;
  const dow = new Date(y, m - 1, d).getDay();
  const weekday = currentLocale() === 'en'
    ? EN_WEEK[dow]
    : ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dow];
  return `${base} ${weekday}`;
}

// Subtitle for a record row: "餐饮 – 午餐" (note acts as subcategory) or "餐饮".
export function recordTitle(r: FinanceRecord): string {
  const cat = r.category?.name || t('common.uncategorized');
  return r.note ? `${cat} – ${r.note}` : cat;
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
