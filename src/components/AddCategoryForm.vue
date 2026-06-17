<template>
  <div class="add-cat">
    <div class="add-cat__head">
      <span class="add-cat__title">添加{{ parentId ? '子' : '' }}分类</span>
      <van-icon name="cross" class="add-cat__close" @click="$emit('cancel')" />
    </div>

    <!-- 一级分类 selector -->
    <div class="field-label">一级分类</div>
    <div class="chips">
      <span
        v-for="p in firstLevels"
        :key="p.id"
        class="chip"
        :class="{ 'chip--active': p.id === selectedParentId }"
        @click="selectedParentId = p.id"
      >
        <van-icon :name="p.icon" size="15" />
        {{ p.name }}
      </span>
    </div>

    <!-- name -->
    <van-field
      v-model="name"
      label="分类名称"
      placeholder="请输入分类名称"
      maxlength="10"
      clearable
    />

    <!-- icon grid -->
    <div class="field-label">选择图标</div>
    <div class="icons">
      <div
        v-for="ic in iconChoices"
        :key="ic"
        class="icon-choice"
        :class="{ 'icon-choice--active': ic === chosenIcon }"
        @click="chosenIcon = ic"
      >
        <van-icon :name="ic" size="22" color="#4a4c4f" />
      </div>
    </div>

    <van-button
      class="add-cat__save"
      type="primary"
      block
      :loading="saving"
      @click="onSave"
    >
      保存
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from 'vant';
import { createCategory } from '@/api/categories';
import { useCategoryStore } from '@/stores/categories';
import type { Category, RecordType } from '@/types';

const props = defineProps<{
  type: RecordType;
  // first-level categories to choose a parent from
  firstLevels: Category[];
  // preselected parent (when adding a subcategory from the record sheet)
  parentId?: number | null;
}>();

const emit = defineEmits<{ created: [Category]; cancel: [] }>();

const catStore = useCategoryStore();

const selectedParentId = ref<number | null>(
  props.parentId ?? props.firstLevels[0]?.id ?? null,
);
const name = ref('');
const chosenIcon = ref('food-o');
const saving = ref(false);

const iconChoices = [
  'food-o',
  'shopping-cart-o',
  'gift-o',
  'smile-o',
  'medal-o',
  'flower-o',
  'cash-back-record',
  'shop-o',
  'home-o',
  'logistics',
  'music-o',
  'phone-o',
  'friends-o',
  'bookmark-o',
  'gem-o',
  'fire-o',
  'video-o',
  'coupon-o',
  'gold-coin-o',
  'balance-o',
  'bag-o',
  'todo-list-o',
  'plus',
  'ellipsis',
];

async function onSave() {
  if (!name.value.trim()) return showToast('请输入分类名称');
  if (!selectedParentId.value) return showToast('请选择一级分类');
  saving.value = true;
  try {
    const cat = await createCategory({
      name: name.value.trim(),
      icon: chosenIcon.value,
      type: props.type,
      parentId: selectedParentId.value,
    });
    await catStore.load(true);
    showToast('已添加');
    name.value = '';
    emit('created', cat);
  } catch {
    // http interceptor shows the error toast
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.add-cat {
  padding: 16px 16px 20px;
}
.add-cat__head {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 12px;
}
.add-cat__title {
  font-size: 17px;
  font-weight: 600;
}
.add-cat__close {
  position: absolute;
  right: 0;
  font-size: 20px;
  color: var(--qz-text-sub);
}
.field-label {
  font-size: 13px;
  color: var(--qz-text-sub);
  padding: 14px 0 8px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 14px;
  background: var(--qz-tile);
  font-size: 13px;
  color: var(--qz-text);
}
.chip--active {
  background: var(--qz-green-soft);
  color: var(--qz-green-deep);
}
.icons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.icon-choice {
  width: 44px;
  height: 44px;
  border-radius: 10px;
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
.add-cat__save {
  margin-top: 22px;
  height: 46px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
}
</style>
