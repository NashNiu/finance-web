<template>
  <div>
    <div v-for="group in groups" :key="group.date" class="day-group">
      <div class="day-header">{{ group.date }}</div>
      <van-cell
        v-for="r in group.records"
        :key="r.id"
        :title="r.category?.name || '未分类'"
        :label="r.note || ''"
        is-link
        @click="$emit('select', r)"
      >
        <template #icon>
          <van-icon :name="r.category?.icon || 'records'" class="cat-icon" />
        </template>
        <template #value>
          <span :class="r.type === 'INCOME' ? 'income' : 'expense'">
            {{ r.type === 'INCOME' ? '+' : '-' }}{{ formatMoney(r.amount) }}
          </span>
        </template>
      </van-cell>
    </div>
    <van-empty v-if="groups.length === 0" description="本月暂无记录" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { groupByDay, formatMoney } from '@/utils/format';
import type { FinanceRecord } from '@/types';

const props = defineProps<{ records: FinanceRecord[] }>();
defineEmits<{ select: [record: FinanceRecord] }>();
const groups = computed(() => groupByDay(props.records));
</script>

<style scoped>
.day-header { padding: 8px 16px; color: #969799; font-size: 13px; background: #f7f8fa; }
.cat-icon { margin-right: 8px; font-size: 20px; color: #07c160; }
.income { color: #07c160; }
.expense { color: #ee0a24; }
</style>
