<template>
  <div class="home">
    <div class="qz-header">
      <div class="topbar">
        <img class="topbar__logo" src="/app-icon.svg" alt="" aria-hidden="true" />
        <span class="topbar__title">阿牛记账</span>
        <!-- <div class="topbar__icons">
          <van-icon name="balance-list-o" @click="toast" />
          <van-icon name="records-o" @click="toast" />
        </div> -->
      </div>

      <div class="ov">
        <div class="ov__label">
          本月支出(元)
          <!-- <van-icon name="exchange" size="13" /> -->
        </div>
        <div class="ov__amount-row">
          <span class="ov__amount">{{ (visible ? '¥' : '') + masked(summary.expense) }}</span>
          <van-icon
            :name="visible ? 'eye-o' : 'closed-eye'"
            class="ov__eye"
            @click="visible = !visible"
          />
        </div>
        <div class="ov__sub">
          <span>本月收入 {{ masked(summary.income) }}</span>
          <span>月结余 {{ masked(summary.balance) }}</span>
        </div>
        <!-- <div class="dots"><i /><i class="on" /><i /></div> -->
      </div>
    </div>

    <van-button class="qz-cta" type="primary" block @click="recordEdit.openNew()">
      记一笔
    </van-button>

    <div class="qz-section">
      <span class="qz-section__title">近3日账单</span>
      <span class="qz-section__action" role="button" @click="toggleSort">
        {{ sortBy === 'time' ? '按时间' : '按金额' }}
      </span>
    </div>

    <template v-if="sortBy === 'time'">
      <div v-for="g in recentDays" :key="g.date" class="group">
        <div class="qz-day">
          <span>{{ formatDayLabel(g.date) }}</span>
          <span>支:{{ formatMoney(dayExpense(g.records)) }}</span>
        </div>
        <RecordItem v-for="r in g.records" :key="r.id" :record="r" @select="edit" />
      </div>
    </template>
    <div v-else class="group">
      <RecordItem v-for="r in recordsByAmount" :key="r.id" :record="r" @select="edit" />
    </div>
    <van-empty v-if="recentDays.length === 0" description="近3日暂无账单" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { showToast } from 'vant';
import RecordItem from '@/components/RecordItem.vue';
import { listRecords } from '@/api/records';
import { getSummary } from '@/api/stats';
import { useRecordEditStore } from '@/stores/recordEdit';
import { formatMoney, formatDayLabel, groupByDay } from '@/utils/format';
import type { FinanceRecord, Summary } from '@/types';

const recordEdit = useRecordEditStore();
const now = new Date();
const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const summary = ref<Summary>({ income: 0, expense: 0, balance: 0 });
const recentDays = ref<{ date: string; records: FinanceRecord[] }[]>([]);
const visible = ref(true);
const sortBy = ref<'time' | 'amount'>('time');

const recordsByAmount = computed(() =>
  recentDays.value
    .flatMap((g) => g.records)
    .slice()
    .sort((a, b) => Number(b.amount) - Number(a.amount)),
);

const toggleSort = () => {
  sortBy.value = sortBy.value === 'time' ? 'amount' : 'time';
};

const masked = (v: number) => (visible.value ? formatMoney(v) : '****');
const dayExpense = (rs: FinanceRecord[]) =>
  rs.filter((r) => r.type === 'EXPENSE').reduce((s, r) => s + Number(r.amount), 0);
const toast = () => showToast('敬请期待');

function edit(r: FinanceRecord) {
  recordEdit.openDetail(r);
}

async function load() {
  const [sum, list] = await Promise.all([
    getSummary(month),
    listRecords({ pageSize: 50 }),
  ]);
  summary.value = sum;
  recentDays.value = groupByDay(list.items).slice(0, 3);
}

onMounted(load);
watch(() => recordEdit.version, load);
</script>

<style scoped>
.topbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
}
.topbar__logo {
  width: 22px;
  height: 22px;
  margin-right: 7px;
  border-radius: 6px;
}
.topbar__title {
  font-size: 17px;
  font-weight: 600;
}
.topbar__icons {
  position: absolute;
  right: 0;
  display: flex;
  gap: 16px;
  font-size: 20px;
}
.ov {
  padding: 16px 0 4px;
}
.ov__label {
  font-size: 14px;
  color: #3c4a38;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ov__amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0 14px;
}
.ov__amount {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -1px;
}
.ov__eye {
  font-size: 20px;
  color: #3c4a38;
}
.ov__sub {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #3c4a38;
}
.dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
}
.dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}
.dots i.on {
  background: rgba(255, 255, 255, 0.95);
  width: 16px;
  border-radius: 3px;
}
.group {
  margin-top: 4px;
}
.qz-section__action {
  cursor: pointer;
  user-select: none;
}
</style>
