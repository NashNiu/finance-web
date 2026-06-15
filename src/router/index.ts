import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
      meta: { hideTabbar: true, public: true },
    },
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/bills', component: () => import('@/views/BillsView.vue') },
    { path: '/reports', component: () => import('@/views/ReportsView.vue') },
    { path: '/me', component: () => import('@/views/MeView.vue') },
    {
      path: '/categories',
      component: () => import('@/views/CategoryManageView.vue'),
      meta: { hideTabbar: true },
    },
    {
      path: '/record',
      component: () => import('@/views/RecordEditView.vue'),
      meta: { hideTabbar: true },
    },
    {
      path: '/record/:id',
      component: () => import('@/views/RecordEditView.vue'),
      meta: { hideTabbar: true },
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  if (!to.meta.public && !token) return '/login';
  if (to.path === '/login' && token) return '/';
  return true;
});

export default router;
