import http from './http';
import type { Category, RecordType } from '@/types';

export const listCategories = () =>
  http.get<unknown, Category[]>('/categories');

export const createCategory = (data: {
  name: string;
  icon: string;
  type: RecordType;
}) => http.post<unknown, Category>('/categories', data);

export const deleteCategory = (id: number) =>
  http.delete<unknown, { id: number }>(`/categories/${id}`);
