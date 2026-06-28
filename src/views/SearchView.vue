<template>
  <div class="search">
    <!-- Search bar -->
    <div class="search-bar">
      <van-icon name="cross" class="search-bar__close" @click="goBack" />
      <div class="search-bar__field">
        <van-icon name="search" class="search-bar__icon" />
        <input
          ref="inputRef"
          v-model="keyword"
          class="search-bar__input"
          type="search"
          placeholder="支持分类备注金额搜索..."
          @keyup.enter="onSearch"
        />
        <button class="search-bar__btn" @click="onSearch">搜索</button>
      </div>
    </div>

    <!-- Search dimension chips -->
    <div class="search-cond">
      <span class="search-cond__label">条件：</span>
      <span
        v-for="c in conditions"
        :key="c.key"
        class="search-cond__chip"
        :class="{ 'search-cond__chip--active': active.has(c.key) }"
        role="button"
        @click="toggleCond(c.key)"
      >
        {{ c.label }}
      </span>
    </div>

    <!-- Hint card -->
    <div class="qz-card search-hint">
      <div class="search-hint__title">提示</div>
      <div class="search-hint__body">
        <van-icon name="info-o" class="search-hint__info" />
        <span>
          搜索可帮助模糊找到某笔或某批账单，如需按维度统计账单可使用报表页面，
          搜索关键词为分类、备注、金额~
        </span>
      </div>
    </div>

    <!-- Result section -->
    <div class="qz-section">
      <span class="qz-section__title">账单明细(共{{ matched.length }}笔)</span>
      <span class="qz-section__action" role="button" @click="toggleSort">
        {{ sortBy === 'time' ? '按时间' : '按金额' }}
      </span>
    </div>

    <AppLoading v-if="loading" />
    <template v-else>
      <template v-if="matched.length">
        <template v-if="sortBy === 'time'">
          <div v-for="g in dayGroups" :key="g.date" class="search-group">
            <div class="qz-day">
              <span>{{ formatDayLabel(g.date) }}</span>
              <span>支:{{ formatMoney(dayExpense(g.records)) }}</span>
            </div>
            <RecordItem v-for="r in g.records" :key="r.id" :record="r" @select="edit" />
          </div>
        </template>
        <div v-else class="search-group">
          <RecordItem v-for="r in matchedByAmount" :key="r.id" :record="r" @select="edit" />
        </div>
      </template>
      <van-empty v-else description="未发现账单哦，试着记一笔~" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RecordItem from '@/components/RecordItem.vue';
import AppLoading from '@/components/AppLoading.vue';
import { listRecords } from '@/api/records';
import { useRecordEditStore } from '@/stores/recordEdit';
import { formatMoney, formatDayLabel, groupByDay } from '@/utils/format';
import type { FinanceRecord } from '@/types';

type CondKey = 'category' | 'note' | 'amount';

const router = useRouter();
const recordEdit = useRecordEditStore();

const inputRef = ref<HTMLInputElement>();
const keyword = ref('');
const query = ref(''); // committed keyword that actually drives filtering
const records = ref<FinanceRecord[]>([]);
const loading = ref(false);
const sortBy = ref<'time' | 'amount'>('time');

const conditions: { key: CondKey; label: string }[] = [
  { key: 'category', label: '分类' },
  { key: 'note', label: '备注' },
  { key: 'amount', label: '金额' },
];
const active = ref<Set<CondKey>>(new Set(['category', 'note', 'amount']));

function toggleCond(key: CondKey) {
  const next = new Set(active.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  // never allow an empty set — fall back to all dimensions
  active.value = next.size ? next : new Set(['category', 'note', 'amount']);
}

const matched = computed<FinanceRecord[]>(() => {
  const k = query.value.trim().toLowerCase();
  if (!k) return [];
  return records.value.filter((r) => {
    if (active.value.has('category') && (r.category?.name ?? '').toLowerCase().includes(k)) {
      return true;
    }
    if (active.value.has('note') && (r.note ?? '').toLowerCase().includes(k)) return true;
    if (active.value.has('amount') && String(r.amount).includes(k)) return true;
    return false;
  });
});

const dayGroups = computed(() => groupByDay(matched.value));
const matchedByAmount = computed(() =>
  matched.value.slice().sort((a, b) => Number(b.amount) - Number(a.amount)),
);

const toggleSort = () => {
  sortBy.value = sortBy.value === 'time' ? 'amount' : 'time';
};

function dayExpense(rs: FinanceRecord[]): number {
  return rs.filter((r) => r.type === 'EXPENSE').reduce((s, r) => s + Number(r.amount), 0);
}

function onSearch() {
  query.value = keyword.value;
  inputRef.value?.blur();
}

function edit(r: FinanceRecord) {
  recordEdit.openDetail(r);
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/bills');
}

async function load() {
  loading.value = true;
  try {
    const res = await listRecords({ pageSize: 1000 });
    records.value = res.items;
  } finally {
    loading.value = false;
  }
}

// Live-filter as the user types once a search has been committed.
watch(keyword, (v) => {
  if (query.value) query.value = v;
});
watch(() => recordEdit.version, load);

onMounted(() => {
  load();
  inputRef.value?.focus();
});
</script>

<style scoped>
.search {
  min-height: 100vh;
}

/* Search bar */
.search-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--qz-bg);
}

.search-bar__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #fff;
  color: #3c4a38;
  font-size: 18px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.search-bar__field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 6px 0 12px;
  border-radius: 20px;
  background: #eef0ee;
}

.search-bar__icon {
  font-size: 17px;
  color: var(--qz-text-sub);
}

.search-bar__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--qz-text);
}

.search-bar__input::placeholder {
  color: #b3b6b1;
}

.search-bar__btn {
  flex-shrink: 0;
  height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 16px;
  background: var(--qz-green);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

/* Condition chips */
.search-cond {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px 16px 12px;
}

.search-cond__label {
  font-size: 14px;
  color: var(--qz-text-sub);
}

.search-cond__chip {
  padding: 5px 16px;
  border: 1px solid #e2e4e1;
  border-radius: 16px;
  font-size: 14px;
  color: var(--qz-text-sub);
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
}

.search-cond__chip--active {
  border-color: var(--qz-green);
  color: var(--qz-green-deep);
  background: rgba(78, 138, 58, 0.08);
}

/* Hint card */
.search-hint {
  margin-top: 0;
}

.search-hint__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.search-hint__title::before {
  content: '';
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: var(--qz-green);
}

.search-hint__body {
  display: flex;
  gap: 6px;
  padding: 12px;
  border-radius: 10px;
  background: #f5f6f5;
  font-size: 13px;
  line-height: 1.6;
  color: var(--qz-text-sub);
}

.search-hint__info {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 15px;
}

/* Results */
.search-group {
  margin-top: 4px;
}

.qz-section__action {
  cursor: pointer;
  user-select: none;
}
</style>
