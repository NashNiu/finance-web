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
  const d = new Date(input);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ISO timestamp -> "HH:MM" (local time), used for the record-row time label.
export function formatTime(input: string): string {
  const d = new Date(input);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// "2026-06-15" -> "6月15日"; appends 今天/昨天 when applicable.
export function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const base = `${m}月${d}日`;
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yest = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const yestKey = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
  if (dateKey === todayKey) return `${base} 今天`;
  if (dateKey === yestKey) return `${base} 昨天`;
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${base} ${week[new Date(y, m - 1, d).getDay()]}`;
}

// Subtitle for a record row: "餐饮 – 午餐" (note acts as subcategory) or "餐饮".
export function recordTitle(r: FinanceRecord): string {
  const cat = r.category?.name || '未分类';
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
