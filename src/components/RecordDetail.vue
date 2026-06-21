<template>
  <div class="detail">
    <div class="detail__head">
      <van-icon name="cross" class="detail__close" @click="$emit('close')" />
      <span class="detail__title">账单详情</span>
      <div class="detail__actions">
        <span class="act act--edit" @click="$emit('edit')">编辑</span>
        <span class="act act--del" @click="onDelete">删除</span>
      </div>
    </div>

    <div
      class="detail__amount"
      :class="record.type === 'INCOME' ? 'qz-amount-income' : 'qz-amount-expense'"
    >
      {{ record.type === 'INCOME' ? '+' : '-' }}{{ formatMoney(record.amount) }}
    </div>

    <van-cell-group inset class="detail__cells">
      <van-cell title="分类">
        <template #value>
          <span class="cat-val">
            <CategoryIcon :icon="record.category?.icon" :size="18" />
            {{ record.category?.name || '未分类' }}
          </span>
        </template>
      </van-cell>
      <van-cell title="类型" :value="record.type === 'INCOME' ? '收入' : '支出'" />
      <van-cell title="日期" :value="toDateKey(record.recordDate)" />
      <van-cell title="时间" :value="formatTime(record.recordDate)" />
      <van-cell title="备注" :value="record.note || '无'" />
      <van-cell title="账本" value="个人" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant';
import CategoryIcon from '@/components/CategoryIcon.vue';
import { deleteRecord } from '@/api/records';
import { formatMoney, formatTime, toDateKey } from '@/utils/format';
import type { FinanceRecord } from '@/types';

const props = defineProps<{ record: FinanceRecord }>();
const emit = defineEmits<{ close: []; edit: []; deleted: [] }>();

async function onDelete() {
  try {
    await showConfirmDialog({ title: '删除', message: '确定删除这条记录？' });
  } catch {
    return; // cancelled
  }
  await deleteRecord(props.record.id);
  showToast('已删除');
  emit('deleted');
}
</script>

<style scoped>
.detail {
  background: var(--qz-bg);
  min-height: 320px;
  padding-bottom: 24px;
}
.detail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: #fff;
}
.detail__title {
  font-size: 17px;
  font-weight: 600;
}
.detail__close {
  font-size: 20px;
  color: var(--qz-text);
  width: 80px;
}
.detail__actions {
  width: 80px;
  display: flex;
  justify-content: flex-end;
  gap: 14px;
}
.act {
  font-size: 15px;
}
.act--edit {
  color: var(--qz-green-deep);
}
.act--del {
  color: var(--qz-expense);
}
.detail__amount {
  text-align: center;
  font-size: 40px;
  font-weight: 700;
  padding: 26px 0 22px;
}
.detail__cells {
  margin-top: 0;
}
.cat-val {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
