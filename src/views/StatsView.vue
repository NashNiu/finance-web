<template>
  <div class="stats">
    <van-nav-bar title="统计" />
    <div class="controls">
      <van-icon name="arrow-left" @click="changeMonth(-1)" />
      <span>{{ month }}</span>
      <van-icon name="arrow" @click="changeMonth(1)" />
    </div>
    <van-tabs v-model:active="type" @change="loadPie">
      <van-tab title="支出" name="EXPENSE" />
      <van-tab title="收入" name="INCOME" />
    </van-tabs>
    <CategoryPie :data="pie" />
    <h3 class="sub">{{ year }}年趋势</h3>
    <TrendBar :data="trend" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CategoryPie from '@/components/CategoryPie.vue';
import TrendBar from '@/components/TrendBar.vue';
import { getByCategory, getTrend } from '@/api/stats';
import type { CategoryStat, TrendMonth, RecordType } from '@/types';

const now = new Date();
const month = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
const year = computed(() => Number(month.value.split('-')[0]));
const type = ref<RecordType>('EXPENSE');
const pie = ref<CategoryStat[]>([]);
const trend = ref<TrendMonth[]>([]);

async function loadPie() {
  pie.value = await getByCategory(month.value, type.value);
}
async function loadTrend() {
  trend.value = await getTrend(year.value);
}
function changeMonth(delta: number) {
  const [y, m] = month.value.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  loadPie();
  loadTrend();
}

onMounted(() => {
  loadPie();
  loadTrend();
});
</script>

<style scoped>
.controls { display: flex; justify-content: center; align-items: center; gap: 24px; padding: 12px; }
.sub { padding: 8px 16px; margin: 0; color: #323233; }
</style>
