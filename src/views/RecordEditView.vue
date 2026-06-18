<template>
  <div class="edit">
    <van-nav-bar :title="isEdit ? '编辑' : '记一笔'" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon v-if="isEdit" name="delete-o" @click="onDelete" />
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="type" @change="onTypeChange">
      <van-tab title="支出" name="EXPENSE" />
      <van-tab title="收入" name="INCOME" />
    </van-tabs>

    <!-- first-level (一级分类) grid -->
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

    <van-popup v-model:show="showDate" position="bottom">
      <van-date-picker
        :model-value="datePickerValue"
        @confirm="onDateConfirm"
        @cancel="showDate = false"
      />
    </van-popup>

    <!-- 二级分类 sheet -->
    <SubcategorySheet
      v-model:show="showSheet"
      :parent="sheetParent"
      :children="sheetChildren"
      @select="onSelectSub"
      @add="onSheetAdd"
      @delete="onDeleteSub"
    />

    <!-- add 二级分类 -->
    <van-popup v-model:show="showAdd" position="bottom" round>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import CategoryGrid from '@/components/CategoryGrid.vue';
import SubcategorySheet from '@/components/SubcategorySheet.vue';
import AddCategoryForm from '@/components/AddCategoryForm.vue';
import AmountKeypad from '@/components/AmountKeypad.vue';
import { useCategoryStore } from '@/stores/categories';
import { deleteCategory } from '@/api/categories';
import { createRecord, updateRecord, deleteRecord, getRecord } from '@/api/records';
import type { Category, RecordType } from '@/types';

const route = useRoute();
const router = useRouter();
const catStore = useCategoryStore();

const id = computed(() => Number(route.params.id) || null);
const isEdit = computed(() => id.value !== null);

const type = ref<RecordType>('EXPENSE');
const categoryId = ref<number | null>(null); // final leaf (subcategory, or first-level if it has none)
const selectedFirstLevelId = ref<number | null>(null);
const amount = ref('');
const note = ref('');
const today = new Date();
const recordDate = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
);
const showDate = ref(false);
const datePickerValue = computed(() => recordDate.value.split('-'));

// subcategory sheet
const showSheet = ref(false);
const sheetParent = ref<Category | null>(null);
const sheetChildren = computed(() =>
  sheetParent.value ? catStore.childrenOf(sheetParent.value.id) : [],
);

// add subcategory
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
    // 二级可选：no subcategories → record directly on the first-level
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
  // auto-select the freshly added subcategory
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
    const rec = await getRecord(id.value!);
    if (rec) {
      type.value = rec.type;
      categoryId.value = rec.categoryId;
      const cat = catStore.byId(rec.categoryId);
      selectedFirstLevelId.value = cat?.parentId ?? rec.categoryId;
      amount.value = String(Number(rec.amount));
      note.value = rec.note || '';
      recordDate.value = rec.recordDate.slice(0, 10);
    }
  }
});
</script>

<style scoped>
.edit { padding-bottom: 280px; }
.picked {
  padding: 10px 16px;
  font-size: 14px;
  color: var(--qz-text-sub);
}
.picked b { color: var(--qz-green-deep); }
</style>
