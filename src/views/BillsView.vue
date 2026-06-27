<template>
  <div class="bills">
    <!-- Header -->
    <div class="qz-header">
      <div class="bills-topbar">
        <div class="bills-topbar__month" @click="showPeriod = true">
          <span class="bills-topbar__month-text">{{ period.label }}</span>
          <van-icon name="arrow-down" size="13" class="bills-topbar__arrow" />
        </div>
        <span class="bills-topbar__title">账单</span>
        <van-icon name="search" class="bills-topbar__search" @click="showToast('敬请期待')" />
      </div>
    </div>

    <!-- Summary card overlapping header -->
    <div class="qz-card qz-card--overlap">
      <!-- Mode selector row -->
      <div class="bills-mode-row">
        <div class="bills-mode-row__options">
          <div
            class="bills-option"
            :class="{ 'bills-option--active': viewMode === 'expense' }"
            @click="viewMode = 'expense'"
          >
            <span class="bills-option__dot" :class="viewMode === 'expense' ? 'bills-option__dot--filled' : 'bills-option__dot--hollow'"></span>
            <span class="bills-option__label">{{ unitLabel }}支出</span>
            <span class="bills-option__amount qz-amount-expense">¥{{ formatMoney(summary.expense) }}</span>
          </div>
          <div
            class="bills-option"
            :class="{ 'bills-option--active': viewMode === 'income' }"
            @click="viewMode = 'income'"
          >
            <span class="bills-option__dot" :class="viewMode === 'income' ? 'bills-option__dot--filled' : 'bills-option__dot--hollow'"></span>
            <span class="bills-option__label">{{ unitLabel }}收入</span>
            <span class="bills-option__amount qz-amount-income">¥{{ formatMoney(summary.income) }}</span>
          </div>
        </div>
        <van-icon name="setting-o" class="bills-mode-row__gear" @click="showSettings = true" />
      </div>

      <!-- Selected bucket subtitle -->
      <div class="bills-day-sub" v-if="selectedBucket">
        {{ selectedBucket.label }}
        支出¥{{ formatMoney(selectedBucket.expense) }}
        收入¥{{ formatMoney(selectedBucket.income) }}
      </div>

      <!-- Bar / line chart -->
      <DailyBar :buckets="buckets" :chart-type="chartType" />
    </div>

    <!-- Balance row card -->
    <div class="qz-card bills-balance-card">
      <div class="bills-balance-row">
        <span class="bills-balance-row__left">
          {{ unitLabel }}结余：
          <span :class="summary.balance < 0 ? 'qz-amount-expense' : 'qz-amount-income'">
            ¥{{ formatMoney(summary.balance) }}
          </span>
        </span>
        <span class="bills-balance-row__right">
          日均支出：
          <span class="qz-amount-expense">¥{{ formatMoney(avgDailyExpense(records)) }}</span>
        </span>
      </div>
    </div>

    <!-- Bill detail section -->
    <div class="qz-section">
      <span class="qz-section__title">账单明细</span>
      <span class="qz-section__action" role="button" @click="toggleSort">
        {{ sortBy === 'time' ? '按时间' : '按金额' }}
      </span>
    </div>

    <AppLoading v-if="loading" />
    <template v-else>
      <template v-if="sortBy === 'time'">
        <div v-for="g in dayGroups" :key="g.date" class="bills-group">
          <div class="qz-day">
            <span>{{ formatDayLabel(g.date) }}</span>
            <span>支:{{ formatMoney(dayExpense(g.records)) }}</span>
          </div>
          <RecordItem
            v-for="r in g.records"
            :key="r.id"
            :record="r"
            @select="edit"
          />
        </div>
      </template>
      <div v-else class="bills-group">
        <RecordItem
          v-for="r in recordsByAmount"
          :key="r.id"
          :record="r"
          @select="edit"
        />
      </div>

      <van-empty v-if="records.length === 0" description="暂无账单" />
    </template>

    <PeriodPicker v-model:show="showPeriod" :period="period" @confirm="onPeriodConfirm" />

    <!-- Bills page settings -->
    <van-popup
      v-model:show="showSettings"
      position="bottom"
      round
      :style="{ maxHeight: '70%' }"
    >
      <div class="settings">
        <div class="settings__bar">
          <van-icon name="cross" class="settings__close" @click="showSettings = false" />
          <span class="settings__title">账单页面设置</span>
        </div>
        <div class="settings__group">
          <div class="settings__group-label">账单页面</div>
          <div class="settings__card">
            <div class="settings__row" role="button" @click="showChartType = true">
              <van-icon name="bar-chart-o" class="settings__row-icon" />
              <div class="settings__row-main">
                <div class="settings__row-title">统计图类型</div>
                <div class="settings__row-desc">账单页面统计图类型</div>
              </div>
              <span class="settings__row-value">{{ chartType === 'line' ? '折线' : '柱状' }}</span>
              <van-icon name="arrow" class="settings__row-arrow" />
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- Chart type chooser -->
    <van-popup v-model:show="showChartType" position="bottom" round>
      <div class="settings">
        <div class="settings__bar">
          <van-icon name="cross" class="settings__close" @click="showChartType = false" />
          <span class="settings__title">统计图类型</span>
        </div>
        <div class="settings__group">
          <div
            class="chart-opt"
            :class="{ 'chart-opt--active': chartType === 'line' }"
            role="button"
            @click="setChartType('line')"
          >
            <div class="chart-opt__head">
              <van-icon name="chart-trending-o" class="chart-opt__icon" />
              <span class="chart-opt__label">折线</span>
              <van-icon
                :name="chartType === 'line' ? 'checked' : 'circle'"
                class="settings__radio"
                :class="{ 'settings__radio--on': chartType === 'line' }"
              />
            </div>
            <svg
              class="chart-opt__preview"
              :viewBox="`0 0 ${PREVIEW_W} ${PREVIEW_H}`"
              preserveAspectRatio="none"
            >
              <polygon :points="previewArea" fill="rgba(231, 90, 84, 0.1)" />
              <polyline
                :points="previewLine"
                fill="none"
                stroke="#e75a54"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
                vector-effect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div
            class="chart-opt"
            :class="{ 'chart-opt--active': chartType === 'bar' }"
            role="button"
            @click="setChartType('bar')"
          >
            <div class="chart-opt__head">
              <van-icon name="bar-chart-o" class="chart-opt__icon" />
              <span class="chart-opt__label">柱状</span>
              <van-icon
                :name="chartType === 'bar' ? 'checked' : 'circle'"
                class="settings__radio"
                :class="{ 'settings__radio--on': chartType === 'bar' }"
              />
            </div>
            <svg
              class="chart-opt__preview"
              :viewBox="`0 0 ${PREVIEW_W} ${PREVIEW_H}`"
              preserveAspectRatio="none"
            >
              <rect
                v-for="(bar, i) in previewBars"
                :key="i"
                :x="bar.x"
                :y="bar.y"
                :width="bar.w"
                :height="bar.h"
                rx="1"
                fill="#e75a54"
              />
            </svg>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { showToast } from 'vant';
import DailyBar from '@/components/DailyBar.vue';
import RecordItem from '@/components/RecordItem.vue';
import PeriodPicker from '@/components/PeriodPicker.vue';
import AppLoading from '@/components/AppLoading.vue';
import { listRecords } from '@/api/records';
import { useRecordEditStore } from '@/stores/recordEdit';
import { formatMoney, formatDayLabel, groupByDay } from '@/utils/format';
import { sumMonth, bucketSpend, avgDailyExpense, type SpendBucket, type MonthSummary } from '@/utils/aggregate';
import { makePeriod, toQuery, type Period } from '@/utils/period';
import type { FinanceRecord } from '@/types';

const recordEdit = useRecordEditStore();

// Period state
const now = new Date();
const period = ref<Period>(makePeriod('month', now, now));
const showPeriod = ref(false);

// Data
const records = ref<FinanceRecord[]>([]);
const summary = ref<MonthSummary>({ income: 0, expense: 0, balance: 0 });
const buckets = ref<SpendBucket[]>([]);

// View state
const viewMode = ref<'expense' | 'income'>('expense');
const sortBy = ref<'time' | 'amount'>('time');
const loading = ref(true);

// Settings
const CHART_TYPE_KEY = 'bills.chartType';
const showSettings = ref(false);
const showChartType = ref(false);
const chartType = ref<'bar' | 'line'>(
  localStorage.getItem(CHART_TYPE_KEY) === 'line' ? 'line' : 'bar',
);

function setChartType(type: 'bar' | 'line') {
  chartType.value = type;
  localStorage.setItem(CHART_TYPE_KEY, type);
  showChartType.value = false;
}

// Mini preview charts for the chart-type chooser.
const PREVIEW_W = 280;
const PREVIEW_H = 56;
const PREVIEW_SAMPLE = [4, 9, 5, 13, 7, 4, 10, 6, 3, 8, 5, 11, 6, 4, 7, 3];

const previewValues = computed(() => {
  const vals = buckets.value.map((b) => b.expense);
  return vals.some((v) => v > 0) ? vals : PREVIEW_SAMPLE;
});
const previewMax = computed(() => Math.max(...previewValues.value, 1));

const previewLine = computed(() => {
  const vals = previewValues.value;
  const n = vals.length;
  if (n === 1) return `0,${PREVIEW_H} ${PREVIEW_W},${PREVIEW_H}`;
  return vals
    .map((v, i) => {
      const x = (i / (n - 1)) * PREVIEW_W;
      const y = PREVIEW_H - (v / previewMax.value) * (PREVIEW_H - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
});
const previewArea = computed(
  () => `0,${PREVIEW_H} ${previewLine.value} ${PREVIEW_W},${PREVIEW_H}`,
);

const previewBars = computed(() => {
  const vals = previewValues.value;
  const n = vals.length;
  const gap = n > 24 ? 1 : 3;
  const bw = Math.max((PREVIEW_W - gap * (n - 1)) / n, 1);
  return vals.map((v, i) => {
    const h = Math.max((v / previewMax.value) * (PREVIEW_H - 4), 1);
    return { x: i * (bw + gap), y: PREVIEW_H - h, w: bw, h };
  });
});

// Computed
const unitLabel = computed(() =>
  ({ week: '周', month: '月', year: '年', custom: '' }[period.value.mode]),
);

const selectedBucket = computed<SpendBucket | null>(() => {
  if (!buckets.value.length) return null;
  return buckets.value.find((b) => b.expense > 0) ?? buckets.value[0] ?? null;
});

const dayGroups = computed(() => groupByDay(records.value));

const recordsByAmount = computed(() =>
  records.value.slice().sort((a, b) => Number(b.amount) - Number(a.amount)),
);

const toggleSort = () => {
  sortBy.value = sortBy.value === 'time' ? 'amount' : 'time';
};

function dayExpense(rs: FinanceRecord[]): number {
  return rs
    .filter((r) => r.type === 'EXPENSE')
    .reduce((s, r) => s + Number(r.amount), 0);
}

function edit(r: FinanceRecord) {
  recordEdit.openDetail(r);
}

// Load data
async function load() {
  loading.value = true;
  try {
    const { from, to } = toQuery(period.value);
    const res = await listRecords({ from, to, pageSize: 1000 });
    records.value = res.items;
    summary.value = sumMonth(res.items);
    buckets.value = bucketSpend(res.items, period.value);
  } finally {
    loading.value = false;
  }
}

function onPeriodConfirm(p: Period) {
  period.value = p;
}

watch(period, load);
watch(() => recordEdit.version, load);
onMounted(load);
</script>

<style scoped>
/* Header topbar */
.bills-topbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
}

.bills-topbar__title {
  font-size: 17px;
  font-weight: 600;
  color: #1f1f1f;
}

.bills-topbar__month {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.bills-topbar__month-text {
  font-size: 15px;
  font-weight: 500;
  color: #3c4a38;
}

.bills-topbar__arrow {
  color: #3c4a38;
}

.bills-topbar__search {
  position: absolute;
  right: 0;
  font-size: 20px;
  color: #1f1f1f;
  cursor: pointer;
}

/* Mode selector row */
.bills-mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.bills-mode-row__options {
  display: flex;
  gap: 20px;
}

.bills-mode-row__gear {
  font-size: 18px;
  color: var(--qz-text-sub);
  cursor: pointer;
}

.bills-option {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.15s;
}

.bills-option--active {
  opacity: 1;
}

.bills-option__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bills-option__dot--filled {
  background: var(--qz-green);
}

.bills-option__dot--hollow {
  border: 1.5px solid var(--qz-green);
  background: transparent;
}

.bills-option__label {
  font-size: 13px;
  color: var(--qz-text-sub);
}

.bills-option__amount {
  font-size: 15px;
  font-weight: 600;
}

/* Day subtitle */
.bills-day-sub {
  font-size: 12px;
  color: var(--qz-text-sub);
  margin-bottom: 8px;
}

/* Balance row card */
.bills-balance-card {
  margin-top: 8px;
}

.bills-balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--qz-text-sub);
}

.bills-balance-row__left,
.bills-balance-row__right {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

/* Day group */
.bills-group {
  margin-top: 4px;
}

.qz-section__action {
  cursor: pointer;
  user-select: none;
}

/* Settings popup */
.settings {
  padding: 0 0 calc(20px + env(safe-area-inset-bottom));
  background: var(--qz-bg);
}

.settings__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
}

.settings__close {
  position: absolute;
  left: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #eef0ee;
  color: #6b6f6a;
  font-size: 16px;
  cursor: pointer;
}

.settings__title {
  font-size: 18px;
  font-weight: 700;
}

.settings__group {
  padding: 4px 12px;
}

.settings__group-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 4px;
  font-size: 15px;
  font-weight: 600;
}

.settings__group-label::before {
  content: '';
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: var(--qz-green);
}

.settings__card {
  background: var(--qz-card);
  border-radius: 14px;
  overflow: hidden;
}

.settings__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
}

.settings__row + .settings__row {
  border-top: 1px solid #f0f1f0;
}

.settings__row-icon {
  font-size: 22px;
  color: var(--qz-text-sub);
}

.settings__row-main {
  flex: 1;
  min-width: 0;
}

.settings__row-title {
  font-size: 16px;
  font-weight: 500;
}

.settings__row-desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--qz-text-sub);
}

.settings__row-value {
  font-size: 14px;
  color: var(--qz-text-sub);
}

.settings__row-arrow {
  color: #c2c5c0;
}

.settings__row--option .settings__row-title {
  flex: 1;
}

.settings__radio {
  font-size: 22px;
  color: #c2c5c0;
}

.settings__radio--on {
  color: var(--qz-green-deep);
}

/* Chart-type option card with preview */
.chart-opt {
  background: var(--qz-card);
  border: 1.5px solid transparent;
  border-radius: 14px;
  padding: 12px 16px 14px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.chart-opt--active {
  border-color: var(--qz-green);
}

.chart-opt__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-opt__icon {
  font-size: 22px;
  color: var(--qz-text-sub);
}

.chart-opt__label {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.chart-opt__preview {
  display: block;
  width: 100%;
  height: 56px;
  margin-top: 10px;
}
</style>
