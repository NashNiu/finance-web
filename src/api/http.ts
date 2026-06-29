import axios from 'axios';
import { showToast } from 'vant';
import { t } from '@/i18n';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) return body.data;
      showToast(body.message || t('common.requestFailed'));
      return Promise.reject(new Error(body.message));
    }
    return body;
  },
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message || t('common.networkError');
    if (status === 401) {
      localStorage.removeItem('token');
      if (location.hash !== '#/login') location.assign('#/login');
    } else {
      showToast(msg);
    }
    return Promise.reject(error);
  },
);

export default http;
