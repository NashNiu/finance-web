<template>
  <div class="cat-page">
    <van-nav-bar :title="t('category.title')" left-arrow @click-left="router.back()" />

    <!-- EXPENSE / INCOME tabs -->
    <van-tabs v-model:active="type" color="var(--qz-green)" title-active-color="var(--qz-green-deep)">
      <van-tab :title="t('common.expense')" name="EXPENSE" />
      <van-tab :title="t('common.income')" name="INCOME" />
    </van-tabs>

    <p class="hint">{{ t('category.hint') }}</p>

    <!-- first-level grid -->
    <div class="qz-card cat-card">
      <div class="cat-grid">
        <div
          v-for="cat in firstLevels"
          :key="cat.id"
          class="cat-tile"
          @click="openManage(cat)"
        >
          <div class="cat-tile__icon">
            <CategoryIcon :icon="cat.icon" :size="24" />
          </div>
          <span class="cat-tile__name">{{ cat.name }}</span>
          <span class="cat-tile__count">{{ catStore.childrenOf(cat.id).length }}</span>
          <van-icon
            v-if="cat.userId !== null"
            name="clear"
            class="cat-tile__delete"
            @click.stop="onDeleteFirst(cat.id)"
          />
        </div>

        <!-- add first-level tile -->
        <div class="cat-tile cat-tile--add" @click="openAddFirst">
          <van-icon name="plus" size="24" color="var(--qz-text-sub)" />
          <span class="cat-tile__name" style="color: var(--qz-text-sub)">{{ t('category.addFirstLevel') }}</span>
        </div>
      </div>
    </div>

    <!-- subcategory management sheet -->
    <SubcategorySheet
      v-model:show="showSheet"
      :parent="managedParent"
      :children="managedChildren"
      @add="onSheetAdd"
      @delete="onDeleteSub"
      @select="() => {}"
    />

    <!-- add subcategory -->
    <van-popup v-model:show="showAddSub" position="bottom" round>
      <AddCategoryForm
        :type="type"
        :first-levels="firstLevels"
        :parent-id="addParentId"
        @created="onSubCreated"
        @cancel="showAddSub = false"
      />
    </van-popup>

    <!-- add first-level dialog -->
    <van-dialog
      v-model:show="showAddFirst"
      :title="t('category.addFirstLevelTitle')"
      show-cancel-button
      :before-close="onAddFirstClose"
    >
      <div class="add-form">
        <van-field
          v-model="firstName"
          :label="t('category.name')"
          :placeholder="t('category.enterName')"
          maxlength="10"
          clearable
        />
        <div class="add-form__icon-label">{{ t('category.chooseIcon') }}</div>
        <div class="add-form__icons">
          <div
            v-for="ic in iconChoices"
            :key="ic"
            class="icon-choice"
            :class="{ 'icon-choice--active': firstIcon === ic }"
            @click="firstIcon = ic"
          >
            <CategoryIcon :icon="ic" :size="22" />
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { showConfirmDialog, showToast } from 'vant';
import SubcategorySheet from '@/components/SubcategorySheet.vue';
import AddCategoryForm from '@/components/AddCategoryForm.vue';
import CategoryIcon from '@/components/CategoryIcon.vue';
import { useCategoryStore } from '@/stores/categories';
import { createCategory, deleteCategory } from '@/api/categories';
import { EMOJI_CHOICES } from '@/utils/icon';
import type { Category, RecordType } from '@/types';

const router = useRouter();
const { t } = useI18n();
const catStore = useCategoryStore();

const type = ref<RecordType>('EXPENSE');
const firstLevels = computed(() => catStore.firstLevel(type.value));

// subcategory sheet
const showSheet = ref(false);
const managedParent = ref<Category | null>(null);
const managedChildren = computed(() =>
  managedParent.value ? catStore.childrenOf(managedParent.value.id) : [],
);

// add subcategory
const showAddSub = ref(false);
const addParentId = ref<number | null>(null);

// add first-level
const showAddFirst = ref(false);
const firstName = ref('');
const firstIcon = ref(EMOJI_CHOICES[0]);

const iconChoices = EMOJI_CHOICES;

function openManage(cat: Category) {
  managedParent.value = cat;
  showSheet.value = true;
}

function onSheetAdd() {
  addParentId.value = managedParent.value?.id ?? null;
  showSheet.value = false;
  showAddSub.value = true;
}

function onSubCreated() {
  showAddSub.value = false;
  // reopen the sheet so the new subcategory is visible
  if (managedParent.value) showSheet.value = true;
}

async function onDeleteSub(subId: number) {
  try {
    await showConfirmDialog({ message: t('category.deleteConfirm') });
  } catch {
    return;
  }
  try {
    await deleteCategory(subId);
    await catStore.load(true);
  } catch {
    // interceptor shows 409 (in use) toast
  }
}

function openAddFirst() {
  firstName.value = '';
  firstIcon.value = 'food-o';
  showAddFirst.value = true;
}

async function onAddFirstClose(action: string): Promise<boolean> {
  if (action === 'cancel') return true;
  if (!firstName.value.trim()) {
    showToast(t('category.enterName'));
    return false;
  }
  try {
    await createCategory({
      name: firstName.value.trim(),
      icon: firstIcon.value,
      type: type.value,
      parentId: null,
    });
    await catStore.load(true);
  } catch {
    // interceptor shows error toast
  }
  return true;
}

async function onDeleteFirst(id: number) {
  try {
    await showConfirmDialog({ message: t('category.deleteFirstConfirm') });
  } catch {
    return;
  }
  try {
    await deleteCategory(id);
    await catStore.load(true);
  } catch {
    // interceptor shows 409 (has children / in use) toast
  }
}

onMounted(() => {
  catStore.load();
});
</script>

<style scoped>
.cat-page {
  min-height: 100vh;
  background: var(--qz-bg);
}
.hint {
  margin: 0;
  padding: 12px 16px 0;
  font-size: 13px;
  color: var(--qz-text-sub);
}
.cat-card {
  margin-top: 8px;
}
.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 0;
}
.cat-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  border-radius: 10px;
  -webkit-tap-highlight-color: transparent;
}
.cat-tile:active {
  background: var(--qz-tile);
}
.cat-tile__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--qz-tile);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cat-tile__name {
  font-size: 12px;
  color: var(--qz-text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}
.cat-tile__count {
  position: absolute;
  top: 4px;
  left: 16px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--qz-green-soft);
  color: var(--qz-green-deep);
  font-size: 11px;
  line-height: 16px;
  text-align: center;
}
.cat-tile__delete {
  position: absolute;
  top: 2px;
  right: 6px;
  font-size: 16px;
  color: var(--qz-expense);
  z-index: 1;
}
.cat-tile--add {
  border: 1.5px dashed var(--qz-text-sub);
  justify-content: center;
}
.add-form {
  padding: 8px 0 12px;
}
.add-form__icon-label {
  font-size: 13px;
  color: var(--qz-text-sub);
  padding: 10px 16px 6px;
}
.add-form__icons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px;
}
.icon-choice {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--qz-tile);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: border-color 0.15s, background 0.15s;
}
.icon-choice--active {
  border-color: var(--qz-green);
  background: var(--qz-green-soft);
}
</style>
