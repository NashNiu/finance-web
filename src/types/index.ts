export type RecordType = 'EXPENSE' | 'INCOME';

export interface User {
  id: number;
  username: string;
}

export interface Category {
  id: number;
  userId: number | null;
  parentId: number | null; // null = first-level (一级分类); set = subcategory
  name: string;
  icon: string;
  type: RecordType;
  sortOrder: number;
}

export interface FinanceRecord {
  id: number;
  userId: number;
  categoryId: number;
  type: RecordType;
  amount: string; // Prisma Decimal serializes to string
  note: string | null;
  recordDate: string;
  createdAt: string;
  category?: Category;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryStat {
  categoryId: number;
  name: string;
  amount: number;
}

export interface TrendMonth {
  month: number;
  income: number;
  expense: number;
}
