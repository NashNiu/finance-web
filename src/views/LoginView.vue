<template>
  <div class="login">
    <img class="brand-logo" src="/logo-mark.svg" :alt="t('login.appName')" />
    <h2 class="title">{{ (isLogin ? t('login.signIn') : t('login.signUp')) + t('login.appName') }}</h2>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="username"
          name="username"
          :label="t('login.username')"
          :placeholder="t('login.usernamePlaceholder')"
          :rules="[{ required: true, message: t('login.usernameRequired') }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          :label="t('login.password')"
          :placeholder="t('login.passwordPlaceholder')"
          :rules="[{ required: true, message: t('login.passwordRequired') }]"
        />
      </van-cell-group>
      <div class="actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          {{ isLogin ? t('login.signIn') : t('login.signUp') }}
        </van-button>
        <van-button round block plain type="primary" @click="isLogin = !isLogin">
          {{ isLogin ? t('login.toRegister') : t('login.toLogin') }}
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
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
    showToast(t('login.success'));
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
