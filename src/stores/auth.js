import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as authApi from '@/api/auth';
export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '');
    const user = ref(null);
    function setSession(t, u) {
        token.value = t;
        user.value = u;
        localStorage.setItem('token', t);
    }
    async function login(username, password) {
        const res = await authApi.login(username, password);
        setSession(res.token, res.user);
    }
    async function register(username, password) {
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
