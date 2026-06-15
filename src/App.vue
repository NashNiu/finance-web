<template>
  <router-view />
  <van-tabbar v-if="showTabbar" route>
    <van-tabbar-item to="/" icon="records">明细</van-tabbar-item>
    <van-tabbar-item to="/stats" icon="chart-trending-o">统计</van-tabbar-item>
    <van-tabbar-item to="/me" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const showTabbar = computed(() => !route.meta.hideTabbar);
</script>
