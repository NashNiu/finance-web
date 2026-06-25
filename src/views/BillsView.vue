<template>
  <div class="bills">
    <!-- Header -->
    <div class="qz-header">
      <div class="bills-topbar">
        <div class="bills-topbar__month" @click="showPicker = true">
          <span class="bills-topbar__month-text">{{ year }}年{{ monthNum }}月</span>
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
            <span class="bills-option__label">月支出</span>
            <span class="bills-option__amount qz-amount-expense">¥{{ formatMoney(summary.expense) }}</span>
          </div>
          <div
            class="bills-option"
            :class="{ 'bills-option--active': viewMode === 'income' }"
            @click="viewMode = 'income'"
          >
            <span class="bills-option__dot" :class="viewMode === 'income' ? 'bills-option__dot--filled' : 'bills-option__dot--hollow'"></span>
            <span class="bills-option__label">月收入</span>
            <span class="bills-option__amount qz-amount-income">¥{{ formatMoney(summary.income) }}</span>
          </div>
        </div>
        <van-icon name="setting-o" class="bills-mode-row__gear" @click="showToast('敬请期待')" />
      </div>

      <!-- Selected day subtitle -->
      <div class="bills-day-sub" v-if="selectedDay">
        {{ selectedDay.day }}日
        支出¥{{ formatMoney(selectedDay.expense) }}
        收入¥{{ formatMoney(selectedDay.income) }}
      </div>

      <!-- Bar chart -->
      <DailyBar :data="daily" />
    </div>

    <!-- Balance row card -->
    <div class="qz-card bills-balance-card">
      <div class="bills-balance-row">
        <span class="bills-balance-row__left">
          月结余：
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

    <van-empty v-if="records.length === 0" description="本月暂无账单" />

    <!-- Month picker popup -->
    <van-popup v-model:show="showPicker" position="bottom" round>
      <van-date-picker
        v-model="pickerValue"
        :columns-type="['year', 'month']"
        title="选择月份"
        @confirm="onPickerConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { showToast } from 'vant';
import DailyBar from '@/components/DailyBar.vue';
import RecordItem from '@/components/RecordItem.vue';
import { listRecords } from '@/api/records';
import { useRecordEditStore } from '@/stores/recordEdit';
import { formatMoney, formatDayLabel, groupByDay } from '@/utils/format';
import { sumMonth, dailySpend, avgDailyExpense } from '@/utils/aggregate';
import type { FinanceRecord } from '@/types';
import type { DaySpend, MonthSummary } from '@/utils/aggregate';

const recordEdit = useRecordEditStore();

// Current month state
const now = new Date();
const month = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
);

const year = computed(() => parseInt(month.value.split('-')[0]));
const monthNum = computed(() => parseInt(month.value.split('-')[1]));

// Data
const records = ref<FinanceRecord[]>([]);
const summary = ref<MonthSummary>({ income: 0, expense: 0, balance: 0 });
const daily = ref<DaySpend[]>([]);

// View state
const viewMode = ref<'expense' | 'income'>('expense');
const sortBy = ref<'time' | 'amount'>('time');
const showPicker = ref(false);
const pickerValue = ref([String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0')]);

// Computed
const dayGroups = computed(() => groupByDay(records.value));

const recordsByAmount = computed(() =>
  records.value.slice().sort((a, b) => Number(b.amount) - Number(a.amount)),
);

const toggleSort = () => {
  sortBy.value = sortBy.value === 'time' ? 'amount' : 'time';
};

const selectedDay = computed<DaySpend | null>(() => {
  if (!daily.value.length) return null;
  // Find first day with expense, else fall back to day 1
  const withExpense = daily.value.find((d) => d.expense > 0);
  return withExpense ?? daily.value[0] ?? null;
});

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
  const res = await listRecords({ month: month.value, pageSize: 300 });
  records.value = res.items;
  summary.value = sumMonth(res.items);
  daily.value = dailySpend(res.items, year.value, monthNum.value);
}

// Month picker confirm
function onPickerConfirm({ selectedValues }: { selectedValues: string[] }) {
  const [y, m] = selectedValues;
  month.value = `${y}-${m.padStart(2, '0')}`;
  pickerValue.value = [y, m.padStart(2, '0')];
  showPicker.value = false;
}

watch(month, load);
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
</style>
