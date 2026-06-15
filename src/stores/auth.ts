import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as authApi from '@/api/auth';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const user = ref<User | null>(null);

  function setSession(t: string, u: User) {
    token.value = t;
    user.value = u;
    localStorage.setItem('token', t);
  }

  async function login(username: string, password: string) {
    const res = await authApi.login(username, password);
    setSession(res.token, res.user);
  }

  async function register(username: string, password: string) {
    const res = await authApi.register(username, password);
    setSession(res.token, res.user);
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  }

  return { token, user, login, register, logout };
});
