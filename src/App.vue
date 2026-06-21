<template>
  <router-view />
  <van-tabbar v-if="showTabbar" route active-color="#4e8a3a" inactive-color="#9a9c9f">
    <van-tabbar-item to="/" icon="wap-home-o">主页</van-tabbar-item>
    <van-tabbar-item to="/bills" icon="records">账单</van-tabbar-item>
    <van-tabbar-item to="/reports" icon="chart-trending-o">报表</van-tabbar-item>
    <van-tabbar-item to="/me" icon="smile-o">我的</van-tabbar-item>
  </van-tabbar>
  <RecordEditPopup />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import RecordEditPopup from '@/components/RecordEditPopup.vue';
const route = useRoute();
const showTabbar = computed(() => !route.meta.hideTabbar);
</script>

<style scoped>
/* make the active tab clearly stand out from the inactive ones */
:deep(.van-tabbar-item--active) {
  font-weight: 600;
}
:deep(.van-tabbar-item--active .van-tabbar-item__icon) {
  transform: scale(1.12);
}
:deep(.van-tabbar-item__icon),
:deep(.van-tabbar-item__text) {
  transition: transform 0.15s, color 0.15s;
}
</style>
