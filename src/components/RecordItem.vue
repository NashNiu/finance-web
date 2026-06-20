<template>
  <van-swipe-cell ref="cellRef" :name="record.id" @open="onOpen">
    <!-- the record row -->
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

    <!-- swipe-left reveals edit / delete -->
    <template #right>
      <div class="swipe-actions">
        <div class="swipe-act swipe-act--edit" @click="onEdit">编辑</div>
        <div class="swipe-act swipe-act--del" @click="onDelete">删除</div>
      </div>
    </template>

    <!-- opposite swipe: listened, no action yet -->
    <template #left>
      <div class="swipe-actions">
        <div class="swipe-act swipe-act--reserved" @click="cellRef?.close('cell')">迁移</div>
      </div>
    </template>
  </van-swipe-cell>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showConfirmDialog, showToast, type SwipeCellInstance } from 'vant';
import CategoryIcon from '@/components/CategoryIcon.vue';
import { deleteRecord } from '@/api/records';
import { useRecordEditStore } from '@/stores/recordEdit';
import { formatMoney, formatTime, recordTitle } from '@/utils/format';
import type { FinanceRecord } from '@/types';

const props = defineProps<{ record: FinanceRecord }>();
defineEmits<{ select: [record: FinanceRecord] }>();

const recordEdit = useRecordEditStore();
const cellRef = ref<SwipeCellInstance>();

// reserved hook for swipe-direction listening; left side has no action yet
function onOpen({ position }: { position: 'left' | 'right' | 'cell' | 'outside' }) {
  if (position === 'left') {
    // 监听到反方向滑动，暂不做操作
  }
}

function onEdit() {
  cellRef.value?.close('cell');
  recordEdit.openEdit(props.record);
}

async function onDelete() {
  try {
    await showConfirmDialog({ title: '删除', message: '确定删除这条记录？' });
  } catch {
    cellRef.value?.close('cell');
    return;
  }
  await deleteRecord(props.record.id);
  showToast('已删除');
  cellRef.value?.close('cell');
  recordEdit.notifyChanged();
}
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

/* swipe actions */
.swipe-actions {
  display: flex;
  height: 100%;
}
.swipe-act {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 15px;
  color: #fff;
}
.swipe-act--edit {
  background: var(--qz-green);
}
.swipe-act--del {
  background: var(--qz-expense);
}
.swipe-act--reserved {
  background: var(--qz-text-sub);
}
</style>
