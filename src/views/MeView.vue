<template>
  <div class="me-page">
    <!-- Profile header -->
    <div class="qz-header me-header">
      <div class="me-profile">
        <div class="me-avatar">
          <van-icon name="smile-o" size="28" color="#4a4c4f" />
        </div>
        <span class="me-username">{{ auth.user?.username || '未登录' }}</span>
        <van-icon
          name="setting-o"
          size="22"
          color="#3c4a38"
          class="me-gear"
          @click="showToast('敬请期待')"
        />
      </div>
    </div>

    <!-- 常用功能 -->
    <div class="qz-section">
      <span class="qz-section__title">常用功能</span>
    </div>
    <div class="qz-card me-group-card">
      <div class="me-grid">
        <div
          v-for="tile in commonTiles"
          :key="tile.text"
          class="me-tile"
          @click="tile.action()"
        >
          <van-icon :name="tile.icon" size="26" color="#4a4c4f" />
          <span class="me-tile__label">{{ tile.text }}</span>
        </div>
      </div>
    </div>

    <!-- 账单/资产 -->
    <div class="qz-section">
      <span class="qz-section__title">账单/资产</span>
    </div>
    <div class="qz-card me-group-card">
      <div class="me-grid">
        <div
          v-for="tile in billTiles"
          :key="tile.text"
          class="me-tile"
          @click="tile.action()"
        >
          <van-icon :name="tile.icon" size="26" color="#4a4c4f" />
          <span class="me-tile__label">{{ tile.text }}</span>
        </div>
      </div>
    </div>

    <!-- 偏好 -->
    <div class="qz-section">
      <span class="qz-section__title">偏好</span>
    </div>
    <div class="qz-card me-group-card">
      <div class="me-grid">
        <div
          v-for="tile in prefTiles"
          :key="tile.text"
          class="me-tile"
          @click="tile.action()"
        >
          <van-icon :name="tile.icon" size="26" color="#4a4c4f" />
          <span class="me-tile__label">{{ tile.text }}</span>
        </div>
      </div>
    </div>

    <!-- 其他 -->
    <div class="qz-section">
      <span class="qz-section__title">其他</span>
    </div>
    <div class="qz-card" style="padding: 0; overflow: hidden;">
      <van-cell
        v-for="item in otherItems"
        :key="item.text"
        :title="item.text"
        :icon="item.icon"
        is-link
        @click="showToast('敬请期待')"
      />
    </div>

    <!-- 退出登录 -->
    <div class="me-logout">
      <van-button block round plain type="danger" @click="onLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useAuthStore } from '@/stores/auth';
import { fetchMe } from '@/api/auth';

const auth = useAuthStore();
const router = useRouter();

const toast = () => showToast('敬请期待');

interface Tile {
  text: string;
  icon: string;
  action: () => void;
}

const commonTiles: Tile[] = [
  { text: '收支分类', icon: 'label-o', action: () => router.push('/categories') },
  { text: '多账本', icon: 'balance-list-o', action: toast },
  { text: '预算设置', icon: 'balance-o', action: toast },
  { text: '存钱', icon: 'gold-coin-o', action: toast },
  { text: '购物清单', icon: 'shopping-cart-o', action: toast },
  { text: '标签', icon: 'label-o', action: toast },
  { text: '汇率', icon: 'exchange', action: toast },
  { text: '小工具', icon: 'apps-o', action: toast },
];

const billTiles: Tile[] = [
  { text: '账单管理', icon: 'records', action: toast },
  { text: '定时记账', icon: 'clock-o', action: toast },
  { text: '账单报告', icon: 'chart-trending-o', action: toast },
  { text: '资产', icon: 'card', action: toast },
  { text: '外卖订单', icon: 'shopping-cart-o', action: toast },
  { text: '物品管理', icon: 'bag-o', action: toast },
  { text: '订阅管理', icon: 'vip-card-o', action: toast },
];

const prefTiles: Tile[] = [
  { text: '记账偏好', icon: 'setting-o', action: toast },
  { text: '个性化', icon: 'brush-o', action: toast },
  { text: '快捷指令', icon: 'apps-o', action: toast },
];

const otherItems = [
  { text: '帮助', icon: 'question-o' },
  { text: '联系客服', icon: 'service-o' },
  { text: '活动', icon: 'gift-o' },
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
