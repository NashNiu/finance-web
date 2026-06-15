<template>
  <div ref="chartEl" class="category-donut" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import type { CategoryBreakdownItem } from '@/utils/aggregate';

const props = defineProps<{
  data: CategoryBreakdownItem[];
  centerTitle: string;
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const PALETTE = [
  '#9dbf8d',
  '#b9d3ad',
  '#8ab079',
  '#cfe0c5',
  '#7aa86a',
  '#e0ebd9',
  '#a7c98f',
];

function buildOption(): echarts.EChartsOption {
  const seriesData = props.data.map((d) => ({
    name: d.name,
    value: Number(d.amount.toFixed(2)),
  }));

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '38%',
        style: {
          text: props.centerTitle,
          textAlign: 'center',
          fill: '#1f1f1f',
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '50%',
        style: {
          text: '轻点切换',
          textAlign: 'center',
          fill: '#9a9c9f',
          fontSize: 11,
        },
      },
    ] as echarts.EChartsOption['graphic'],
    series: [
      {
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['50%', '48%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 11,
          color: '#555',
        },
        labelLine: {
          show: true,
          length: 8,
          length2: 10,
        },
        data: seriesData,
      },
    ],
  };
}

function initChart() {
  if (!chartEl.value) return;
  chart = echarts.init(chartEl.value);
  chart.setOption(buildOption());
}

function updateChart() {
  if (!chart) return;
  chart.setOption(buildOption(), { notMerge: false });
}

onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  chart?.dispose();
  chart = null;
});

watch(
  () => [props.data, props.centerTitle],
  () => {
    updateChart();
  },
  { deep: true },
);
</script>

<style scoped>
.category-donut {
  width: 100%;
  height: 260px;
}
</style>
