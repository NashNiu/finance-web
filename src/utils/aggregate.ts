import type { FinanceRecord, RecordType } from '@/types';

export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
}

export interface DaySpend {
  day: number; // 1..N
  date: string; // YYYY-MM-DD
  expense: number;
  income: number;
}

export interface CategoryBreakdownItem {
  categoryId: number;
  name: string;
  icon: string;
  type: RecordType;
  amount: number;
  count: number;
  percent: number; // 0..100, share of the selected type's total
}

const num = (v: string | number) => (typeof v === 'string' ? parseFloat(v) : v);

export function sumMonth(records: FinanceRecord[]): MonthSummary {
  let income = 0;
  let expense = 0;
  for (const r of records) {
    if (r.type === 'INCOME') income += num(r.amount);
    else expense += num(r.amount);
  }
  return { income, expense, balance: income - expense };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// One entry per day of the month, with summed income/expense.
export function dailySpend(
  records: FinanceRecord[],
  year: number,
  month: number,
): DaySpend[] {
  const n = daysInMonth(year, month);
  const out: DaySpend[] = Array.from({ length: n }, (_, i) => ({
    day: i + 1,
    date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    expense: 0,
    income: 0,
  }));
  for (const r of records) {
    const d = new Date(r.recordDate).getDate();
    if (d >= 1 && d <= n) {
      if (r.type === 'INCOME') out[d - 1].income += num(r.amount);
      else out[d - 1].expense += num(r.amount);
    }
  }
  return out;
}

// Per-category totals for one type, sorted by amount desc, with percent + count.
export function categoryBreakdown(
  records: FinanceRecord[],
  type: RecordType,
): CategoryBreakdownItem[] {
  const map = new Map<number, CategoryBreakdownItem>();
  let total = 0;
  for (const r of records) {
    if (r.type !== type) continue;
    const amt = num(r.amount);
    total += amt;
    const existing = map.get(r.categoryId);
    if (existing) {
      existing.amount += amt;
      existing.count += 1;
    } else {
      map.set(r.categoryId, {
        categoryId: r.categoryId,
        name: r.category?.name || '未分类',
        icon: r.category?.icon || 'records',
        type,
        amount: amt,
        count: 1,
        percent: 0,
      });
    }
  }
  const items = Array.from(map.values());
  for (const it of items) it.percent = total > 0 ? (it.amount / total) * 100 : 0;
  return items.sort((a, b) => b.amount - a.amount);
}

// Average daily expense across days that have any activity (matches the app).
export function avgDailyExpense(records: FinanceRecord[]): number {
  const days = new Set<string>();
  let expense = 0;
  for (const r of records) {
    if (r.type === 'EXPENSE') {
      expense += num(r.amount);
      days.add(new Date(r.recordDate).toISOString().slice(0, 10));
    }
  }
  return days.size > 0 ? expense / days.size : 0;
}
