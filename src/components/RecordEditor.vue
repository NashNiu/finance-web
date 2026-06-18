<template>
  <div class="editor">
    <!-- header -->
    <div class="editor__head">
      <van-icon name="cross" class="editor__close" @click="$emit('close')" />
      <span class="editor__title">{{ isEdit ? '编辑' : '记一笔' }}</span>
      <van-icon
        v-if="isEdit"
        name="delete-o"
        class="editor__del"
        @click="onDelete"
      />
      <span v-else class="editor__del-placeholder" />
    </div>

    <van-tabs v-model:active="type" @change="onTypeChange">
      <van-tab title="支出" name="EXPENSE" />
      <van-tab title="收入" name="INCOME" />
    </van-tabs>

    <!-- scrollable body (keypad is teleported to viewport bottom) -->
    <div class="editor__body">
      <CategoryGrid
        :categories="firstLevels"
        :type="type"
        :model-value="selectedFirstLevelId"
        @update:model-value="onPickFirstLevel"
      />

      <div v-if="selectedName" class="picked">
        已选：<b>{{ pickedFirstLevelName }}</b>
        <template v-if="pickedFirstLevelName !== selectedName"> / {{ selectedName }}</template>
      </div>

      <van-cell title="日期" :value="recordDate" is-link @click="showDate = true" />
      <van-field v-model="note" label="备注" placeholder="点此添加备注" />
    </div>

    <van-popup v-model:show="showDate" position="bottom" teleport="body">
      <van-date-picker
        :model-value="datePickerValue"
        @confirm="onDateConfirm"
        @cancel="showDate = false"
      />
    </van-popup>

    <SubcategorySheet
      v-model:show="showSheet"
      :parent="sheetParent"
      :children="sheetChildren"
      @select="onSelectSub"
      @add="onSheetAdd"
      @delete="onDeleteSub"
    />

    <van-popup v-model:show="showAdd" position="bottom" round teleport="body">
      <AddCategoryForm
        :type="type"
        :first-levels="firstLevels"
        :parent-id="addParentId"
        @created="onAddCreated"
        @cancel="showAdd = false"
      />
    </van-popup>

    <AmountKeypad v-model="amount" @done="onSave" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { showToast, showConfirmDialog } from 'vant';
import CategoryGrid from '@/components/CategoryGrid.vue';
import SubcategorySheet from '@/components/SubcategorySheet.vue';
import AddCategoryForm from '@/components/AddCategoryForm.vue';
import AmountKeypad from '@/components/AmountKeypad.vue';
import { useCategoryStore } from '@/stores/categories';
import { deleteCategory } from '@/api/categories';
import { createRecord, updateRecord, deleteRecord, getRecord } from '@/api/records';
import type { Category, RecordType } from '@/types';

const props = defineProps<{ recordId: number | null }>();
const emit = defineEmits<{ close: []; saved: []; deleted: [] }>();

const catStore = useCategoryStore();

const isEdit = computed(() => props.recordId !== null);

const type = ref<RecordType>('EXPENSE');
const categoryId = ref<number | null>(null);
const selectedFirstLevelId = ref<number | null>(null);
const amount = ref('');
const note = ref('');
const today = new Date();
const recordDate = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
);
const showDate = ref(false);
const datePickerValue = computed(() => recordDate.value.split('-'));

const showSheet = ref(false);
const sheetParent = ref<Category | null>(null);
const sheetChildren = computed(() =>
  sheetParent.value ? catStore.childrenOf(sheetParent.value.id) : [],
);

const showAdd = ref(false);
const addParentId = ref<number | null>(null);

const firstLevels = computed(() => catStore.firstLevel(type.value));
const selectedName = computed(() => catStore.byId(categoryId.value)?.name ?? '');
const pickedFirstLevelName = computed(
  () => catStore.byId(selectedFirstLevelId.value)?.name ?? '',
);

function onTypeChange() {
  categoryId.value = null;
  selectedFirstLevelId.value = null;
  showSheet.value = false;
}

function onPickFirstLevel(firstId: number) {
  selectedFirstLevelId.value = firstId;
  const children = catStore.childrenOf(firstId);
  if (children.length > 0) {
    sheetParent.value = catStore.byId(firstId) ?? null;
    showSheet.value = true;
  } else {
    categoryId.value = firstId;
  }
}

function onSelectSub(subId: number) {
  categoryId.value = subId;
  showSheet.value = false;
}

function onSheetAdd() {
  addParentId.value = sheetParent.value?.id ?? selectedFirstLevelId.value;
  showSheet.value = false;
  showAdd.value = true;
}

function onAddCreated(cat: Category) {
  showAdd.value = false;
  selectedFirstLevelId.value = cat.parentId ?? cat.id;
  categoryId.value = cat.id;
}

async function onDeleteSub(subId: number) {
  try {
    await showConfirmDialog({ message: '删除该分类？' });
  } catch {
    return;
  }
  try {
    await deleteCategory(subId);
    await catStore.load(true);
    if (categoryId.value === subId) categoryId.value = null;
  } catch {
    // interceptor shows 409 (in use) toast
  }
}

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
  if (isEdit.value) await updateRecord(props.recordId!, payload);
  else await createRecord(payload);
  showToast('已保存');
  emit('saved');
}

async function onDelete() {
  await showConfirmDialog({ title: '删除', message: '确定删除这条记录？' });
  await deleteRecord(props.recordId!);
  showToast('已删除');
  emit('deleted');
}

async function loadRecord() {
  await catStore.load();
  if (!isEdit.value) return;
  const rec = await getRecord(props.recordId!);
  if (!rec) return;
  type.value = rec.type;
  categoryId.value = rec.categoryId;
  const cat = catStore.byId(rec.categoryId);
  selectedFirstLevelId.value = cat?.parentId ?? rec.categoryId;
  amount.value = String(Number(rec.amount));
  note.value = rec.note || '';
  recordDate.value = rec.recordDate.slice(0, 10);
}

onMounted(loadRecord);
// re-init when reused for a different record (e.g. global popup)
watch(
  () => props.recordId,
  () => {
    type.value = 'EXPENSE';
    categoryId.value = null;
    selectedFirstLevelId.value = null;
    amount.value = '';
    note.value = '';
    loadRecord();
  },
);
</script>

<style scoped>
.editor {
  background: var(--qz-bg);
  min-height: 100%;
  padding-bottom: 300px; /* room for the fixed number keyboard */
}
.editor__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: #fff;
}
.editor__title {
  font-size: 17px;
  font-weight: 600;
}
.editor__close,
.editor__del {
  font-size: 20px;
  color: var(--qz-text);
}
.editor__del {
  color: var(--qz-expense);
}
.editor__del-placeholder {
  width: 20px;
}
.editor__body {
  background: #fff;
}
.picked {
  padding: 10px 16px;
  font-size: 14px;
  color: var(--qz-text-sub);
}
.picked b {
  color: var(--qz-green-deep);
}
</style>
