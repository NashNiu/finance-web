import http from './http';
import type { FinanceRecord, Paginated, RecordType } from '@/types';

export interface RecordQuery {
  month?: string;
  from?: string;
  to?: string;
  type?: RecordType;
  categoryId?: number;
  page?: number;
  pageSize?: number;
}

export interface RecordPayload {
  categoryId: number;
  type: RecordType;
  amount: number;
  note?: string;
  recordDate: string;
}

export const listRecords = (q: RecordQuery) =>
  http.get<unknown, Paginated<FinanceRecord>>('/records', { params: q });

export const getRecord = (id: number) =>
  http.get<unknown, FinanceRecord>(`/records/${id}`);

export const createRecord = (data: RecordPayload) =>
  http.post<unknown, FinanceRecord>('/records', data);

export const updateRecord = (id: number, data: Partial<RecordPayload>) =>
  http.patch<unknown, FinanceRecord>(`/records/${id}`, data);

export const deleteRecord = (id: number) =>
  http.delete<unknown, { id: number }>(`/records/${id}`);
