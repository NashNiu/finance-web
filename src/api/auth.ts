import http from './http';
import type { User } from '@/types';

export interface AuthResult {
  token: string;
  user: User;
}

export const register = (username: string, password: string) =>
  http.post<unknown, AuthResult>('/auth/register', { username, password });

export const login = (username: string, password: string) =>
  http.post<unknown, AuthResult>('/auth/login', { username, password });

export const fetchMe = () => http.get<unknown, User>('/auth/me');
