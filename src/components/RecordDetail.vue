<template>
  <div class="detail">
    <div class="detail__head">
      <van-icon name="cross" class="detail__close" @click="$emit('close')" />
      <span class="detail__title">{{ t('record.detailTitle') }}</span>
      <div class="detail__actions">
        <span class="act act--edit" @click="$emit('edit')">{{ t('common.edit') }}</span>
        <span class="act act--del" @click="onDelete">{{ t('common.delete') }}</span>
      </div>
    </div>

    <div
      class="detail__amount"
      :class="record.type === 'INCOME' ? 'qz-amount-income' : 'qz-amount-expense'"
    >
      {{ record.type === 'INCOME' ? '+' : '-' }}{{ formatMoney(record.amount) }}
    </div>

    <van-cell-group inset class="detail__cells">
      <van-cell :title="t('record.category')">
        <template #value>
          <span class="cat-val">
            <CategoryIcon :icon="record.category?.icon" :size="18" />
            {{ record.category?.name || t('common.uncategorized') }}
          </span>
        </template>
      </van-cell>
      <van-cell :title="t('record.type')" :value="record.type === 'INCOME' ? t('common.income') : t('common.expense')" />
      <van-cell :title="t('record.date')" :value="toDateKey(record.recordDate)" />
      <van-cell :title="t('record.time')" :value="formatTime(record.recordDate)" />
      <van-cell :title="t('record.note')" :value="record.note || t('record.empty')" />
      <van-cell :title="t('record.ledger')" :value="t('common.personal')" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { showConfirmDialog, showToast } from 'vant';
import CategoryIcon from '@/components/CategoryIcon.vue';
import { deleteRecord } from '@/api/records';
import { formatMoney, formatTime, toDateKey } from '@/utils/format';
import type { FinanceRecord } from '@/types';

const { t } = useI18n();

const props = defineProps<{ record: FinanceRecord }>();
const emit = defineEmits<{ close: []; edit: []; deleted: [] }>();

async function onDelete() {
  try {
    await showConfirmDialog({ title: t('common.deleteTitle'), message: t('common.confirmDeleteRecord') });
  } catch {
    return; // cancelled
  }
  await deleteRecord(props.record.id);
  showToast(t('common.deleted'));
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
