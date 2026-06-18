<template>
  <div class="ri" @click="$emit('select', record)">
    <div class="ri__icon">
      <CategoryIcon :icon="record.category?.icon" :size="22" />
    </div>
    <div class="ri__main">
      <div class="ri__title">{{ recordTitle(record) }}</div>
      <div class="ri__time">{{ formatTime(record.createdAt) }}</div>
    </div>
    <div class="ri__right">
      <div :class="record.type === 'INCOME' ? 'qz-amount-income' : 'qz-amount-expense'">
        {{ record.type === 'INCOME' ? '+' : '-' }}{{ formatMoney(record.amount) }}
      </div>
      <div class="ri__ledger">个人</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryIcon from '@/components/CategoryIcon.vue';
import { formatMoney, formatTime, recordTitle } from '@/utils/format';
import type { FinanceRecord } from '@/types';

defineProps<{ record: FinanceRecord }>();
defineEmits<{ select: [record: FinanceRecord] }>();
</script>

<style scoped>
.ri {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
}
.ri__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--qz-tile);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #6b6d70;
  margin-right: 12px;
  flex-shrink: 0;
}
.ri__main {
  flex: 1;
  min-width: 0;
}
.ri__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--qz-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ri__time {
  font-size: 12px;
  color: var(--qz-text-sub);
  margin-top: 3px;
}
.ri__right {
  text-align: right;
  font-size: 16px;
  font-weight: 600;
}
.ri__ledger {
  font-size: 11px;
  color: var(--qz-text-sub);
  font-weight: 400;
  margin-top: 3px;
}
</style>
