<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ maxHeight: '60%' }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="sheet">
      <div class="sheet__head">
        <van-icon name="cross" class="sheet__close" @click="$emit('update:show', false)" />
        <span class="sheet__title">{{ parent?.name }}</span>
        <button type="button" class="sheet__add" @click="$emit('add')">
          <van-icon name="plus" size="13" />
          <span>添加</span>
        </button>
      </div>

      <div v-if="children.length" class="sub-grid">
        <div
          v-for="c in children"
          :key="c.id"
          class="sub-tile"
          @click="$emit('select', c.id)"
        >
          <div class="sub-tile__icon">
            <CategoryIcon :icon="c.icon" :size="24" />
          </div>
          <span class="sub-tile__name">{{ c.name }}</span>
          <van-icon
            v-if="c.userId !== null"
            name="clear"
            class="sub-tile__del"
            @click.stop="$emit('delete', c.id)"
          />
        </div>
      </div>

      <van-empty v-else description="暂无二级分类，点右上角添加" />
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import CategoryIcon from '@/components/CategoryIcon.vue';
import type { Category } from '@/types';

defineProps<{
  show: boolean;
  parent: Category | null;
  children: Category[];
}>();

defineEmits<{
  'update:show': [boolean];
  select: [number];
  add: [];
  delete: [number];
}>();
</script>

<style scoped>
.sheet {
  padding: 14px 16px 24px;
}
.sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.sheet__close {
  font-size: 20px;
  color: var(--qz-text-sub);
  width: 64px;
  flex-shrink: 0;
}
.sheet__title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}
.sheet__add {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 64px;
  height: 30px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  color: #fff;
  background: var(--qz-green);
  border: none;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.1s ease, opacity 0.1s ease;
}
.sheet__add:active {
  transform: scale(0.96);
  opacity: 0.9;
}
.sub-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px 4px;
}
.sub-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 6px 2px;
}
.sub-tile__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--qz-tile);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sub-tile__name {
  font-size: 12px;
  color: var(--qz-text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 56px;
}
.sub-tile__del {
  position: absolute;
  top: -2px;
  right: 6px;
  font-size: 15px;
  color: var(--qz-expense);
}
</style>
