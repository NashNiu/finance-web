<template>
  <div ref="el" class="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import type { TrendMonth } from '@/types';

const props = defineProps<{ data: TrendMonth[] }>();
const el = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

function render() {
  if (!chart) return;
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['支出', '收入'] },
    xAxis: { type: 'category', data: props.data.map((d) => `${d.month}月`) },
    yAxis: { type: 'value' },
    series: [
      { name: '支出', type: 'bar', data: props.data.map((d) => d.expense) },
      { name: '收入', type: 'bar', data: props.data.map((d) => d.income) },
    ],
  });
}

onMounted(() => {
  chart = echarts.init(el.value!);
  render();
});
watch(() => props.data, render, { deep: true });
onBeforeUnmount(() => chart?.dispose());
</script>

<style scoped>
.chart { width: 100%; height: 280px; }
</style>
