<template>
  <div class="edit">
    <van-nav-bar :title="isEdit ? '编辑' : '记一笔'" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon v-if="isEdit" name="delete-o" @click="onDelete" />
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="type" @change="categoryId = null">
      <van-tab title="支出" name="EXPENSE" />
      <van-tab title="收入" name="INCOME" />
    </van-tabs>

    <CategoryGrid :categories="catStore.items" :type="type" v-model="categoryId" />

    <van-cell title="日期" :value="recordDate" is-link @click="showDate = true" />
    <van-field v-model="note" label="备注" placeholder="点此添加备注" />

    <van-popup v-model:show="showDate" position="bottom">
      <van-date-picker
        :model-value="datePickerValue"
        @confirm="onDateConfirm"
        @cancel="showDate = false"
      />
    </van-popup>

    <AmountKeypad v-model="amount" @done="onSave" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import CategoryGrid from '@/components/CategoryGrid.vue';
import AmountKeypad from '@/components/AmountKeypad.vue';
import { useCategoryStore } from '@/stores/categories';
import { createRecord, updateRecord, deleteRecord, listRecords } from '@/api/records';
import type { RecordType } from '@/types';

const route = useRoute();
const router = useRouter();
const catStore = useCategoryStore();

const id = computed(() => Number(route.params.id) || null);
const isEdit = computed(() => id.value !== null);

const type = ref<RecordType>('EXPENSE');
const categoryId = ref<number | null>(null);
const amount = ref('');
const note = ref('');
const today = new Date();
const recordDate = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
);
const showDate = ref(false);
const datePickerValue = computed(() => recordDate.value.split('-'));

function onDateConfirm(e: { selectedValues: string[] }) {
  recordDate.value = e.selectedValues.join('-');
  showDate.value = false;
}

async function onSave() {
  if (!categoryId.value) return showToast('请选择分类');
  const amt = parseFloat(amount.value);
  if (!amt || amt <= 0) return showToast('请输入金额');
  const payload = {
    categoryId: categoryId.value,
    type: type.value,
    amount: amt,
    note: note.value,
    recordDate: recordDate.value,
  };
  if (isEdit.value) await updateRecord(id.value!, payload);
  else await createRecord(payload);
  showToast('已保存');
  router.back();
}

async function onDelete() {
  await showConfirmDialog({ title: '删除', message: '确定删除这条记录？' });
  await deleteRecord(id.value!);
  showToast('已删除');
  router.back();
}

onMounted(async () => {
  await catStore.load();
  if (isEdit.value) {
    const list = await listRecords({ pageSize: 200 });
    const rec = list.items.find((r) => r.id === id.value);
    if (rec) {
      type.value = rec.type;
      categoryId.value = rec.categoryId;
      amount.value = String(Number(rec.amount));
      note.value = rec.note || '';
      recordDate.value = rec.recordDate.slice(0, 10);
    }
  }
});
</script>

<style scoped>
.edit { padding-bottom: 280px; }
</style>
