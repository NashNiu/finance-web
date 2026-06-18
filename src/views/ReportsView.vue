<template>
  <div class="reports-page">
    <!-- ===== HEADER ===== -->
    <div class="qz-header">
      <div class="header-row header-row--top">
        <!-- toggle centered -->
        <div class="header-center">
          <div class="qz-toggle">
            <span
              class="qz-toggle__item"
              :class="{ 'qz-toggle__item--active': mode === 'report' }"
              @click="mode = 'report'"
            >报表</span>
            <span
              class="qz-toggle__item"
              :class="{ 'qz-toggle__item--active': mode === 'calendar' }"
              @click="mode = 'calendar'"
            >日历</span>
          </div>
        </div>
        <!-- right icon -->
        <van-icon name="like-o" class="header-icon-right" @click="showToast('收藏')" />
      </div>

      <!-- month selector row -->
      <div class="header-row header-row--month">
        <div class="month-selector" @click="showMonthPicker = true">
          <span class="month-label">{{ year }}年{{ monthNum }}月</span>
          <van-icon name="arrow-down" class="month-arrow" />
        </div>
        <span class="filter-btn" @click="showToast('筛选')">筛选</span>
      </div>
    </div>

    <!-- ===== REPORT MODE ===== -->
    <template v-if="mode === 'report'">
      <!-- Card 1: type selector + donut -->
      <div class="qz-card qz-card--overlap">
        <!-- Type radio row -->
        <div class="type-row">
          <!-- Expense option -->
          <div
            class="type-option"
            :class="{ 'type-option--active': type === 'EXPENSE' }"
            @click="type = 'EXPENSE'"
          >
            <span class="type-dot" :class="{ 'type-dot--active': type === 'EXPENSE' }" />
            <span class="type-option__label">月支出</span>
            <span class="type-option__amount qz-amount-expense">
              ¥{{ formatMoney(summary.expense) }}
            </span>
          </div>

          <!-- Income option -->
          <div
            class="type-option"
            :class="{ 'type-option--active': type === 'INCOME' }"
            @click="type = 'INCOME'"
          >
            <span
              class="type-dot"
              :class="{ 'type-dot--active': type === 'INCOME', 'type-dot--income': type === 'INCOME' }"
            />
            <span class="type-option__label">月收入</span>
            <span class="type-option__amount qz-amount-income">
              ¥{{ formatMoney(summary.income) }}
            </span>
          </div>

          <!-- Other (disabled) -->
          <div class="type-option type-option--disabled" @click="showToast('暂不支持')">
            <span class="type-dot" />
            <span class="type-option__label">其他</span>
            <span class="type-option__amount">¥0.00</span>
          </div>

          <!-- Gear icon -->
          <van-icon name="setting-o" class="type-gear" @click="showToast('设置')" />
        </div>

        <!-- Donut chart -->
        <CategoryDonut
          :data="breakdown"
          :center-title="type === 'EXPENSE' ? '支出大类' : '收入大类'"
        />

        <!-- Sub-toggle row: 切换小类 / 环形·面积 -->
        <div class="chart-ctrl-row">
          <span class="chart-ctrl-left" @click="showToast('切换小类')">
            切换小类
            <van-icon name="replay" class="chart-ctrl-icon" />
          </span>
          <div class="qz-toggle chart-view-toggle">
            <span class="qz-toggle__item qz-toggle__item--active">环形</span>
            <span class="qz-toggle__item" @click="showToast('面积图')">面积</span>
          </div>
        </div>
      </div>

      <!-- Breakdown list -->
      <div class="breakdown-list">
        <van-empty v-if="breakdown.length === 0" description="暂无数据" />
        <div
          v-for="item in breakdown"
          :key="item.categoryId"
          class="breakdown-row"
        >
          <!-- Icon tile -->
          <div class="brow__icon">
            <van-icon :name="item.icon" />
          </div>

          <!-- Middle: name + percent + progress -->
          <div class="brow__mid">
            <div class="brow__top-line">
              <span class="brow__name">{{ item.name }}</span>
              <span class="brow__pct">{{ item.percent.toFixed(2) }}%</span>
            </div>
            <div class="brow__track">
              <div
                class="brow__fill"
                :style="{ width: item.percent + '%' }"
              />
            </div>
          </div>

          <!-- Right: amount + count -->
          <div class="brow__right">
            <span :class="item.type === 'EXPENSE' ? 'qz-amount-expense' : 'qz-amount-income'">
              ¥{{ formatMoney(item.amount) }}
            </span>
            <span class="brow__count">{{ item.count }}笔</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== CALENDAR MODE ===== -->
    <template v-else>
      <!-- Card: tabs + calendar grid -->
      <div class="qz-card qz-card--overlap">
        <!-- Cal tabs: 支出 / 收入 / 收支 / 结余 -->
        <div class="cal-tabs">
          <span
            v-for="tab in CAL_TABS"
            :key="tab.key"
            class="cal-tab"
            :class="{ 'cal-tab--active': calTab === tab.key }"
            @click="calTab = tab.key as CalTab"
          >{{ tab.label }}</span>
        </div>

        <!-- Weekday headers -->
        <div class="cal-weekdays">
          <span v-for="w in WEEKDAYS" :key="w" class="cal-wd">{{ w }}</span>
        </div>

        <!-- Calendar grid -->
        <div class="cal-grid">
          <!-- Leading blank cells -->
          <div
            v-for="n in leadingBlanks"
            :key="'b' + n"
            class="cal-cell cal-cell--blank"
          />

          <!-- Day cells -->
          <div
            v-for="ds in daySpends"
            :key="ds.date"
            class="cal-cell"
            :class="{ 'cal-cell--selected': ds.date === selectedDate }"
            :style="dayCellStyle(ds)"
            @click="selectedDate = ds.date"
          >
            <span class="cal-day-num">{{ ds.day }}</span>
            <span
              v-if="calCellValue(ds) !== 0"
              class="cal-day-val"
              :class="calCellClass(ds)"
            >{{ calCellLabel(ds) }}</span>
          </div>
        </div>
      </div>

      <!-- Summary card -->
      <div class="qz-card summary-card">
        <span class="qz-amount-expense">月支出: ¥{{ formatMoney(summary.expense) }}</span>
        <span class="qz-amount-expense">日均支出: ¥{{ formatMoney(avgDailyExpense(records)) }}</span>
      </div>

      <!-- Selected-day bill section -->
      <div class="qz-section">
        <span class="qz-section__title">
          {{ formatDayLabel(selectedDate) }}账单
          <span class="qz-amount-expense"> 支出¥{{ formatMoney(selectedDayExpense) }}</span>
        </span>
        <span class="qz-section__action" @click="recordEdit.openNew()">记一笔</span>
      </div>

      <div class="day-records-wrap">
        <van-empty v-if="selectedDayRecords.length === 0" description="暂无记录" />
        <RecordItem
          v-for="r in selectedDayRecords"
          :key="r.id"
          :record="r"
          @select="recordEdit.open(r.id)"
        />
      </div>
    </template>

    <!-- Month picker popup -->
    <van-popup v-model:show="showMonthPicker" position="bottom" round>
      <van-date-picker
        v-model="pickerValue"
        :columns-type="['year', 'month']"
        title="选择月份"
        @confirm="onMonthConfirm"
        @cancel="showMonthPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { showToast } from 'vant';

import { listRecords } from '@/api/records';
import { useRecordEditStore } from '@/stores/recordEdit';
import {
  sumMonth,
  categoryBreakdown,
  dailySpend,
  avgDailyExpense,
  type CategoryBreakdownItem,
  type DaySpend,
} from '@/utils/aggregate';
import { formatMoney, formatDayLabel } from '@/utils/format';
import type { FinanceRecord, RecordType } from '@/types';

import CategoryDonut from '@/components/CategoryDonut.vue';
import RecordItem from '@/components/RecordItem.vue';

// ── record editor popup ──────────────────────────────────────────────────────
const recordEdit = useRecordEditStore();

// ── state ───────────────────────────────────────────────────────────────────
const mode = ref<'report' | 'calendar'>('report');
const type = ref<RecordType>('EXPENSE');

// current month YYYY-MM
const today = new Date();
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const month = ref<string>(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
);

type CalTab = 'expense' | 'income' | 'net' | 'balance';
const calTab = ref<CalTab>('expense');

// selected date: today if within the current displayed month, else day 1
const defaultSelected = computed<string>(() => {
  if (todayKey.startsWith(month.value)) return todayKey;
  return `${month.value}-01`;
});
const selectedDate = ref<string>(defaultSelected.value);

// month picker popup
const showMonthPicker = ref(false);
const pickerValue = ref<string[]>([
  String(today.getFullYear()),
  String(today.getMonth() + 1).padStart(2, '0'),
]);

// ── derived year/month ───────────────────────────────────────────────────────
const year = computed(() => Number(month.value.split('-')[0]));
const monthNum = computed(() => Number(month.value.split('-')[1]));

// ── data ────────────────────────────────────────────────────────────────────
const records = ref<FinanceRecord[]>([]);

async function loadRecords() {
  const res = await listRecords({ month: month.value, pageSize: 300 });
  records.value = res.items;
}

onMounted(loadRecords);
watch(month, loadRecords);
watch(() => recordEdit.version, loadRecords);

// ── aggregates ───────────────────────────────────────────────────────────────
const summary = computed(() => sumMonth(records.value));
const breakdown = computed<CategoryBreakdownItem[]>(() =>
  categoryBreakdown(records.value, type.value),
);
const daySpends = computed<DaySpend[]>(() =>
  dailySpend(records.value, year.value, monthNum.value),
);

// ── calendar helpers ─────────────────────────────────────────────────────────
const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const CAL_TABS = [
  { key: 'expense', label: '支出' },
  { key: 'income', label: '收入' },
  { key: 'net', label: '收支' },
  { key: 'balance', label: '结余' },
] as const;

// Leading blank cells for Monday-first grid
const leadingBlanks = computed<number>(() => {
  const d = new Date(year.value, monthNum.value - 1, 1);
  return (d.getDay() + 6) % 7; // Sun=0 → Mon-first offset
});

const maxExpense = computed(() =>
  Math.max(...daySpends.value.map((d) => d.expense), 0),
);
const maxIncome = computed(() =>
  Math.max(...daySpends.value.map((d) => d.income), 0),
);

function calCellValue(ds: DaySpend): number {
  switch (calTab.value) {
    case 'expense': return ds.expense;
    case 'income': return ds.income;
    case 'net': return ds.expense;
    case 'balance': return ds.income - ds.expense;
  }
}

function calCellLabel(ds: DaySpend): string {
  const v = calCellValue(ds);
  if (v === 0) return '';
  switch (calTab.value) {
    case 'expense': return `-${v.toFixed(2)}`;
    case 'income': return `+${v.toFixed(2)}`;
    case 'net': return `-${ds.expense.toFixed(2)}`;
    case 'balance': {
      const b = ds.income - ds.expense;
      return b >= 0 ? `+${b.toFixed(2)}` : `${b.toFixed(2)}`;
    }
  }
}

function calCellClass(ds: DaySpend): string {
  switch (calTab.value) {
    case 'expense': return 'cal-val--expense';
    case 'income': return 'cal-val--income';
    case 'net': return 'cal-val--expense';
    case 'balance': return (ds.income - ds.expense) >= 0 ? 'cal-val--income' : 'cal-val--expense';
  }
}

function dayCellStyle(ds: DaySpend): Record<string, string> {
  switch (calTab.value) {
    case 'expense': {
      if (ds.expense === 0 || maxExpense.value === 0) return { background: '#fdeceb' };
      const alpha = 0.08 + (ds.expense / maxExpense.value) * 0.77;
      return { background: `rgba(231,90,84,${alpha.toFixed(2)})` };
    }
    case 'income': {
      if (ds.income === 0 || maxIncome.value === 0) return { background: '#eef7f1' };
      const alpha = 0.08 + (ds.income / maxIncome.value) * 0.77;
      return { background: `rgba(79,165,112,${alpha.toFixed(2)})` };
    }
    case 'net': {
      if (ds.expense === 0 || maxExpense.value === 0) return { background: '#fdeceb' };
      const alpha = 0.08 + (ds.expense / maxExpense.value) * 0.77;
      return { background: `rgba(231,90,84,${alpha.toFixed(2)})` };
    }
    case 'balance': {
      const b = ds.income - ds.expense;
      if (b === 0) return { background: '#f4f5f4' };
      if (b > 0) {
        const maxB = Math.max(
          ...daySpends.value.map((d) => Math.max(d.income - d.expense, 0)),
          1,
        );
        const alpha = 0.08 + (b / maxB) * 0.6;
        return { background: `rgba(79,165,112,${alpha.toFixed(2)})` };
      } else {
        const maxLoss = Math.max(
          ...daySpends.value.map((d) => Math.max(d.expense - d.income, 0)),
          1,
        );
        const alpha = 0.08 + (-b / maxLoss) * 0.6;
        return { background: `rgba(231,90,84,${alpha.toFixed(2)})` };
      }
    }
  }
}

// ── selected day ──────────────────────────────────────────────────────────────
const selectedDayRecords = computed<FinanceRecord[]>(() =>
  records.value.filter((r) => r.recordDate.slice(0, 10) === selectedDate.value),
);

const selectedDayExpense = computed<number>(() =>
  selectedDayRecords.value
    .filter((r) => r.type === 'EXPENSE')
    .reduce((s, r) => s + parseFloat(r.amount), 0),
);

// reset selectedDate when month changes
watch(month, () => {
  selectedDate.value = defaultSelected.value;
});

// ── month picker ──────────────────────────────────────────────────────────────
function onMonthConfirm({ selectedValues }: { selectedValues: string[] }) {
  const y = selectedValues[0];
  const m = String(selectedValues[1]).padStart(2, '0');
  month.value = `${y}-${m}`;
  pickerValue.value = [y, m];
  showMonthPicker.value = false;
}
</script>

<style scoped>
/* ── page ── */
.reports-page {
  min-height: 100vh;
  background: var(--qz-bg);
  padding-bottom: 60px;
}

/* ── header rows ── */
.header-row {
  display: flex;
  align-items: center;
}
.header-row--top {
  justify-content: center;
  position: relative;
  margin-bottom: 10px;
}
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}
.header-icon-right {
  position: absolute;
  right: 0;
  font-size: 20px;
  color: #3a4a36;
  cursor: pointer;
}
.header-row--month {
  justify-content: space-between;
  margin-top: 4px;
}
.month-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.month-label {
  font-size: 15px;
  font-weight: 600;
  color: #1f2e1a;
}
.month-arrow {
  font-size: 14px;
  color: #3a4a36;
}
.filter-btn {
  font-size: 13px;
  color: #3a4a36;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  padding: 3px 12px;
  cursor: pointer;
}

/* ── type selector row ── */
.type-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.type-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border-radius: 10px;
  cursor: pointer;
  background: var(--qz-tile);
  transition: background 0.15s;
}
.type-option--active {
  background: var(--qz-green-soft);
}
.type-option--disabled {
  opacity: 0.5;
  cursor: default;
}
.type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  margin-bottom: 2px;
}
.type-dot--active {
  background: var(--qz-expense);
}
.type-dot--active.type-dot--income {
  background: var(--qz-income);
}
.type-option__label {
  font-size: 11px;
  color: var(--qz-text-sub);
}
.type-option__amount {
  font-size: 13px;
  font-weight: 600;
  color: var(--qz-text);
}
.type-gear {
  font-size: 20px;
  color: var(--qz-text-sub);
  cursor: pointer;
  margin-left: 4px;
  flex-shrink: 0;
}

/* ── chart control row ── */
.chart-ctrl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.chart-ctrl-left {
  font-size: 13px;
  color: var(--qz-text-sub);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.chart-ctrl-icon {
  font-size: 14px;
}

/* ── breakdown list ── */
.breakdown-list {
  margin: 0 12px;
  background: #fff;
  border-radius: var(--qz-radius);
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}
.breakdown-row {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid var(--qz-line);
  gap: 12px;
}
.breakdown-row:last-child {
  border-bottom: none;
}
.brow__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--qz-tile);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6b6d70;
  flex-shrink: 0;
}
.brow__mid {
  flex: 1;
  min-width: 0;
}
.brow__top-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.brow__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--qz-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brow__pct {
  font-size: 12px;
  color: var(--qz-text-sub);
  flex-shrink: 0;
  margin-left: 6px;
}
.brow__track {
  height: 4px;
  background: #eef0ee;
  border-radius: 2px;
  overflow: hidden;
}
.brow__fill {
  height: 100%;
  background: var(--qz-green);
  border-radius: 2px;
  transition: width 0.4s ease;
}
.brow__right {
  text-align: right;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.brow__right span:first-child {
  font-size: 15px;
  font-weight: 600;
}
.brow__count {
  font-size: 11px;
  color: var(--qz-text-sub);
}

/* ── calendar tabs ── */
.cal-tabs {
  display: flex;
  border-bottom: 1px solid var(--qz-line);
  margin-bottom: 10px;
}
.cal-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  color: var(--qz-text-sub);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.cal-tab--active {
  color: var(--qz-green-deep);
  border-bottom-color: var(--qz-green-deep);
  font-weight: 600;
}

/* ── calendar weekday header ── */
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.cal-wd {
  text-align: center;
  font-size: 11px;
  color: var(--qz-text-sub);
  padding: 2px 0;
}

/* ── calendar grid ── */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}
.cal-cell {
  border-radius: 8px;
  padding: 4px 2px;
  min-height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: background 0.15s;
  border: 2px solid transparent;
}
.cal-cell--blank {
  background: transparent !important;
  cursor: default;
  border-color: transparent !important;
}
.cal-cell--selected {
  border-color: var(--qz-green-deep) !important;
}
.cal-day-num {
  font-size: 13px;
  font-weight: 600;
  color: var(--qz-text);
  line-height: 1.3;
}
.cal-day-val {
  font-size: 9px;
  line-height: 1.2;
  margin-top: 2px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
}
.cal-val--expense {
  color: var(--qz-expense);
}
.cal-val--income {
  color: var(--qz-income);
}

/* ── summary card ── */
.summary-card {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
}

/* ── day records ── */
.day-records-wrap {
  background: #fff;
  margin: 0 12px;
  border-radius: var(--qz-radius);
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}
</style>
