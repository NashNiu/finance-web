<template>
  <div class="login">
    <img class="brand-logo" src="/logo-mark.svg" alt="小青账" />
    <h2 class="title">{{ isLogin ? '登录' : '注册' }}小青账</h2>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="username"
          name="username"
          label="用户名"
          placeholder="字母数字下划线，3-20位"
          :rules="[{ required: true, message: '请输入用户名' }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="6-32位"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>
      <div class="actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          {{ isLogin ? '登录' : '注册' }}
        </van-button>
        <van-button round block plain type="primary" @click="isLogin = !isLogin">
          {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const isLogin = ref(true);
const username = ref('');
const password = ref('');
const loading = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    if (isLogin.value) await auth.login(username.value, password.value);
    else await auth.register(username.value, password.value);
    showToast('成功');
    router.replace('/');
  } catch {
    // error toast handled by interceptor
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login { padding: 60px 0; }
.brand-logo { display: block; width: 76px; height: 76px; margin: 0 auto 12px; }
.title { text-align: center; margin-bottom: 24px; color: #8ab079; }
.actions { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
</style>
