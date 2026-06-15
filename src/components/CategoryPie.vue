<template>
  <div ref="el" class="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import type { CategoryStat } from '@/types';

const props = defineProps<{ data: CategoryStat[] }>();
const el = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

function render() {
  if (!chart) return;
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: props.data.map((d) => ({ name: d.name, value: d.amount })),
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
.chart { width: 100%; height: 280px; }
</style>
