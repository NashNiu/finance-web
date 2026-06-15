<template>
  <div class="cat-page">
    <van-nav-bar
      title="收支分类"
      left-arrow
      @click-left="router.back()"
    />

    <!-- EXPENSE / INCOME tabs -->
    <van-tabs v-model:active="activeTab" color="var(--qz-green)" title-active-color="var(--qz-green-deep)">
      <van-tab title="支出" name="EXPENSE" />
      <van-tab title="收入" name="INCOME" />
    </van-tabs>

    <!-- Category grid card -->
    <div class="qz-card cat-card">
      <div class="cat-grid">
        <!-- Existing categories -->
        <div
          v-for="cat in filtered"
          :key="cat.id"
          class="cat-tile"
        >
          <van-icon :name="cat.icon" size="26" color="#4a4c4f" />
          <span class="cat-tile__name">{{ cat.name }}</span>
          <!-- Delete badge for user-owned categories -->
          <van-icon
            v-if="cat.userId !== null"
            name="clear"
            class="cat-tile__delete"
            @click.stop="onDelete(cat.id)"
          />
        </div>

        <!-- Add tile -->
        <div class="cat-tile cat-tile--add" @click="openAdd">
          <van-icon name="plus" size="24" color="var(--qz-text-sub)" />
          <span class="cat-tile__name" style="color: var(--qz-text-sub);">添加</span>
        </div>
      </div>
    </div>

    <!-- Add category dialog -->
    <van-dialog
      v-model:show="showAddDialog"
      title="添加分类"
      show-cancel-button
      :before-close="onDialogClose"
    >
      <div class="add-form">
        <van-field
          v-model="newName"
          label="名称"
          placeholder="请输入分类名称"
          maxlength="10"
          clearable
        />
        <div class="add-form__icon-label">选择图标</div>
        <div class="add-form__icons">
          <div
            v-for="ic in iconChoices"
            :key="ic"
            class="icon-choice"
            :class="{ 'icon-choice--active': chosenIcon === ic }"
            @click="chosenIcon = ic"
          >
            <van-icon :name="ic" size="22" color="#4a4c4f" />
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { useCategoryStore } from '@/stores/categories';
import { createCategory, deleteCategory } from '@/api/categories';
import type { RecordType } from '@/types';

const router = useRouter();
const catStore = useCategoryStore();

const type = ref<RecordType>('EXPENSE');

// activeTab drives van-tabs; it mirrors type directly
const activeTab = type;

const filtered = computed(() =>
  catStore.items.filter((c) => c.type === type.value)
);

// Add dialog state
const showAddDialog = ref(false);
const newName = ref('');
const chosenIcon = ref('food-o');

const iconChoices = [
  'food-o',
  'shopping-cart-o',
  'gift-o',
  'smile-o',
  'medal-o',
  'flower-o',
  'more-o',
  'cash-back-record',
];

function openAdd() {
  newName.value = '';
  chosenIcon.value = 'food-o';
  showAddDialog.value = true;
}

async function onDialogClose(action: string): Promise<boolean> {
  if (action === 'cancel') {
    return true;
  }
  // confirm action
  if (!newName.value.trim()) {
    showToast('请输入分类名称');
    return false;
  }
  try {
    await createCategory({
      name: newName.value.trim(),
      icon: chosenIcon.value,
      type: type.value,
    });
    await catStore.load(true);
    newName.value = '';
  } catch {
    // http interceptor shows error toast
  }
  return true;
}

async function onDelete(id: number) {
  try {
    await showConfirmDialog({ message: '删除该分类？' });
  } catch {
    // user cancelled
    return;
  }
  try {
    await deleteCategory(id);
    await catStore.load(true);
  } catch {
    // http interceptor shows error toast (e.g. 409 in use)
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

.cat-card {
  margin-top: 12px;
}

/* 4-column grid */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px 0;
}

.cat-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 4px 10px;
  border-radius: 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}

.cat-tile:active {
  background: var(--qz-tile);
}

.cat-tile__name {
  font-size: 12px;
  color: var(--qz-text);
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}

/* Delete badge */
.cat-tile__delete {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 16px;
  color: var(--qz-expense);
  line-height: 1;
  z-index: 1;
}

/* Add tile — dashed border */
.cat-tile--add {
  border: 1.5px dashed var(--qz-text-sub);
  border-radius: 10px;
}

/* Add dialog form */
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
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.15s, background 0.15s;
}

.icon-choice--active {
  border-color: var(--qz-green);
  background: var(--qz-green-soft);
}
</style>
