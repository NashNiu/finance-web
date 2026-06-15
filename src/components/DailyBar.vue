<template>
  <div ref="el" class="bar"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import type { DaySpend } from '@/utils/aggregate';

const props = defineProps<{ data: DaySpend[] }>();

const el = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

function render() {
  if (!chart) return;
  chart.setOption({
    grid: { left: 6, right: 6, top: 10, bottom: 20 },
    tooltip: {
      trigger: 'axis',
      formatter: (p: any) => `${p[0].axisValue} 支出 ¥${p[0].data}`,
    },
    xAxis: {
      type: 'category',
      data: props.data.map((d) => `${d.day}日`),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e6e8e6' } },
      axisLabel: {
        color: '#9a9c9f',
        interval: (i: number) => [0, 7, 14, 21, 28].includes(i),
      },
    },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'bar',
        barWidth: 5,
        itemStyle: { color: '#e75a54', borderRadius: [2, 2, 0, 0] },
        data: props.data.map((d) => Number(d.expense.toFixed(2))),
      },
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
.bar {
  width: 100%;
  height: 150px;
}
</style>
