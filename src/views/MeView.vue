<template>
  <div class="me">
    <van-nav-bar title="我的" />
    <van-cell-group inset class="profile">
      <van-cell title="用户名" :value="auth.user?.username || '-'" />
    </van-cell-group>
    <div class="logout">
      <van-button round block type="danger" @click="onLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { fetchMe } from '@/api/auth';

const auth = useAuthStore();
const router = useRouter();

async function onLogout() {
  auth.logout();
  router.replace('/login');
}

onMounted(async () => {
  if (!auth.user) {
    try {
      auth.user = await fetchMe();
    } catch {
      // interceptor handles 401
    }
  }
});
</script>

<style scoped>
.profile { margin-top: 16px; }
.logout { padding: 24px 16px; }
</style>
