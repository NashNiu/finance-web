<template>
  <router-view />
  <van-tabbar v-if="showTabbar" route active-color="#6f9a5e" inactive-color="#a0a2a5">
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
