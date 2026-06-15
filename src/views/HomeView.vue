<template>
  <div class="home">
    <div class="summary">
      <van-icon name="arrow-left" class="nav" @click="changeMonth(-1)" />
      <div class="month">{{ month }}</div>
      <van-icon name="arrow" class="nav" @click="changeMonth(1)" />
    </div>
    <div class="totals">
      <div><span>支出</span><b class="expense">{{ formatMoney(summary.expense) }}</b></div>
      <div><span>收入</span><b class="income">{{ formatMoney(summary.income) }}</b></div>
      <div><span>结余</span><b>{{ formatMoney(summary.balance) }}</b></div>
    </div>
    <RecordList :records="records" @select="edit" />
    <van-button class="fab" type="primary" icon="plus" round @click="router.push('/record')" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RecordList from '@/components/RecordList.vue';
import { listRecords } from '@/api/records';
import { getSummary } from '@/api/stats';
import { formatMoney } from '@/utils/format';
import type { FinanceRecord, Summary } from '@/types';

const router = useRouter();
const now = new Date();
const month = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
const records = ref<FinanceRecord[]>([]);
const summary = ref<Summary>({ income: 0, expense: 0, balance: 0 });

async function load() {
  const [list, sum] = await Promise.all([
    listRecords({ month: month.value, pageSize: 200 }),
    getSummary(month.value),
  ]);
  records.value = list.items;
  summary.value = sum;
}

function changeMonth(delta: number) {
  const [y, m] = month.value.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  load();
}

function edit(r: FinanceRecord) {
  router.push(`/record/${r.id}`);
}

onMounted(load);
</script>

<style scoped>
.summary { display: flex; align-items: center; justify-content: center; gap: 24px; padding: 16px; background: #07c160; color: #fff; }
.summary .month { font-size: 18px; font-weight: 600; }
.nav { font-size: 18px; }
.totals { display: flex; justify-content: space-around; padding: 16px; background: #07c160; color: #fff; }
.totals span { display: block; font-size: 12px; opacity: 0.85; }
.totals b { font-size: 18px; }
.income { color: #fff; }
.expense { color: #fff; }
.fab { position: fixed; right: 16px; bottom: 70px; width: 52px; height: 52px; }
</style>
