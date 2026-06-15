import http from './http';
import type { Summary, CategoryStat, TrendMonth, RecordType } from '@/types';

export const getSummary = (month: string) =>
  http.get<unknown, Summary>('/stats/summary', { params: { month } });

export const getByCategory = (month: string, type: RecordType) =>
  http.get<unknown, CategoryStat[]>('/stats/by-category', {
    params: { month, type },
  });

export const getTrend = (year: number) =>
  http.get<unknown, TrendMonth[]>('/stats/trend', { params: { year } });
