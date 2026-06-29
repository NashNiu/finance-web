<template>
  <div class="me-page">
    <!-- Profile header -->
    <div class="qz-header me-header">
      <div class="me-profile">
        <div class="me-avatar">
          <van-icon name="smile-o" size="28" color="#4a4c4f" />
        </div>
        <span class="me-username">{{ auth.user?.username || t('me.notLoggedIn') }}</span>
        <van-icon
          name="setting-o"
          size="22"
          color="#3c4a38"
          class="me-gear"
          @click="toast"
        />
      </div>
    </div>

    <!-- 常用功能 -->
    <div class="qz-section">
      <span class="qz-section__title">{{ t('me.common') }}</span>
    </div>
    <div class="qz-card me-group-card">
      <div class="me-grid">
        <div
          v-for="tile in commonTiles"
          :key="tile.key"
          class="me-tile"
          @click="tile.action()"
        >
          <van-icon :name="tile.icon" size="26" color="#4a4c4f" />
          <span class="me-tile__label">{{ t('me.' + tile.key) }}</span>
        </div>
      </div>
    </div>

    <!-- 账单/资产 -->
    <div class="qz-section">
      <span class="qz-section__title">{{ t('me.billsAssets') }}</span>
    </div>
    <div class="qz-card me-group-card">
      <div class="me-grid">
        <div
          v-for="tile in billTiles"
          :key="tile.key"
          class="me-tile"
          @click="tile.action()"
        >
          <van-icon :name="tile.icon" size="26" color="#4a4c4f" />
          <span class="me-tile__label">{{ t('me.' + tile.key) }}</span>
        </div>
      </div>
    </div>

    <!-- 偏好 -->
    <div class="qz-section">
      <span class="qz-section__title">{{ t('me.preferences') }}</span>
    </div>
    <div class="qz-card me-group-card">
      <div class="me-grid">
        <div
          v-for="tile in prefTiles"
          :key="tile.key"
          class="me-tile"
          @click="tile.action()"
        >
          <van-icon :name="tile.icon" size="26" color="#4a4c4f" />
          <span class="me-tile__label">{{ t('me.' + tile.key) }}</span>
        </div>
      </div>
    </div>

    <!-- 其他 -->
    <div class="qz-section">
      <span class="qz-section__title">{{ t('me.others') }}</span>
    </div>
    <div class="qz-card" style="padding: 0; overflow: hidden;">
      <van-cell
        v-for="item in otherItems"
        :key="item.key"
        :title="t('me.' + item.key)"
        :icon="item.icon"
        is-link
        @click="toast"
      />
    </div>

    <!-- 退出登录 -->
    <div class="me-logout">
      <van-button block round plain type="danger" @click="onLogout">{{ t('me.logout') }}</van-button>
    </div>

    <!-- Language picker -->
    <van-action-sheet
      v-model:show="showLang"
      :actions="langActions"
      :title="t('me.languageTitle')"
      :cancel-text="t('common.cancel')"
      close-on-click-action
      @select="onSelectLang"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { fetchMe } from '@/api/auth';
import { setLocale, currentLocale, type AppLocale } from '@/i18n';

const auth = useAuthStore();
const router = useRouter();
const { t } = useI18n();

const toast = () => showToast(t('common.comingSoon'));

interface Tile {
  key: string;
  icon: string;
  action: () => void;
}

// Language switcher
const showLang = ref(false);
const langActions = computed(() => [
  { name: '中文', value: 'zh-CN' as AppLocale, color: currentLocale() === 'zh-CN' ? '#4e8a3a' : undefined },
  { name: 'English', value: 'en' as AppLocale, color: currentLocale() === 'en' ? '#4e8a3a' : undefined },
]);
function onSelectLang(action: { value: AppLocale }) {
  setLocale(action.value);
}

const commonTiles: Tile[] = [
  { key: 'categories', icon: 'label-o', action: () => router.push('/categories') },
  { key: 'multiBook', icon: 'balance-list-o', action: toast },
  { key: 'budget', icon: 'balance-o', action: toast },
  { key: 'saving', icon: 'gold-coin-o', action: toast },
  { key: 'shoppingList', icon: 'shopping-cart-o', action: toast },
  { key: 'tags', icon: 'label-o', action: toast },
  { key: 'rate', icon: 'exchange', action: toast },
  { key: 'widgets', icon: 'apps-o', action: toast },
];

const billTiles: Tile[] = [
  { key: 'billManage', icon: 'records', action: toast },
  { key: 'scheduled', icon: 'clock-o', action: toast },
  { key: 'billReport', icon: 'chart-trending-o', action: toast },
  { key: 'assets', icon: 'card', action: toast },
  { key: 'takeoutOrders', icon: 'shopping-cart-o', action: toast },
  { key: 'itemManage', icon: 'bag-o', action: toast },
  { key: 'subscriptions', icon: 'vip-card-o', action: toast },
];

const prefTiles: Tile[] = [
  { key: 'recordPref', icon: 'setting-o', action: toast },
  { key: 'personalize', icon: 'brush-o', action: toast },
  { key: 'shortcuts', icon: 'apps-o', action: toast },
  { key: 'language', icon: 'font-o', action: () => (showLang.value = true) },
];

const otherItems = [
  { key: 'help', icon: 'question-o' },
  { key: 'contact', icon: 'service-o' },
  { key: 'activity', icon: 'gift-o' },
];

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
.me-page {
  padding-bottom: 80px;
}

/* Header / profile bar */
.me-header {
  padding: 20px 18px 28px;
}

.me-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.me-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.me-username {
  font-size: 18px;
  font-weight: 700;
  color: #1f2e1a;
  flex: 1;
}

.me-gear {
  position: absolute;
  right: 0;
  cursor: pointer;
}

/* Function group card — tighter padding */
.me-group-card {
  padding: 8px !important;
}

/* 4-column icon grid */
.me-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px 0;
}

.me-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 4px 10px;
  border-radius: 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}

.me-tile:active {
  background: var(--qz-tile);
}

.me-tile__label {
  font-size: 12px;
  color: var(--qz-text);
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
}

/* Logout */
.me-logout {
  padding: 24px 16px 16px;
}
</style>
