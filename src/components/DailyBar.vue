<template>
  <div ref="el" class="bar"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import type { SpendBucket } from '@/utils/aggregate';

const props = withDefaults(
  defineProps<{ buckets: SpendBucket[]; chartType?: 'bar' | 'line' }>(),
  { chartType: 'bar' },
);

const el = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

function render() {
  if (!chart) return;
  const n = props.buckets.length;
  const step = n <= 12 ? 1 : Math.ceil(n / 6);
  const isLine = props.chartType === 'line';
  const seriesStyle = isLine
    ? {
        type: 'line' as const,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#e75a54', width: 1.5 },
        itemStyle: { color: '#e75a54' },
        areaStyle: { color: 'rgba(231, 90, 84, 0.08)' },
      }
    : {
        type: 'bar' as const,
        barWidth: n <= 12 ? 10 : 5,
        itemStyle: { color: '#e75a54', borderRadius: [2, 2, 0, 0] as [number, number, number, number] },
      };
  chart.setOption(
    {
      grid: { left: 6, right: 6, top: 10, bottom: 20 },
      tooltip: {
        trigger: 'axis',
        formatter: (p: any) => `${p[0].axisValue} 支出 ¥${p[0].data}`,
      },
      xAxis: {
        type: 'category',
        boundaryGap: !isLine,
        data: props.buckets.map((b) => b.label),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e6e8e6' } },
        axisLabel: { color: '#9a9c9f', interval: (i: number) => i % step === 0 },
      },
      yAxis: { type: 'value', show: false },
      series: [
        {
          ...seriesStyle,
          data: props.buckets.map((b) => Number(b.expense.toFixed(2))),
        },
      ],
    },
    { notMerge: true },
  );
}

onMounted(() => {
  chart = echarts.init(el.value!);
  render();
});

watch(() => props.buckets, render, { deep: true });
watch(() => props.chartType, render);

onBeforeUnmount(() => chart?.dispose());
</script>

<style scoped>
.bar {
  width: 100%;
  height: 150px;
}
</style>
