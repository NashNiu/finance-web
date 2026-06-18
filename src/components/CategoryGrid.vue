<template>
  <van-grid :column-num="4" :gutter="8">
    <van-grid-item
      v-for="c in filtered"
      :key="c.id"
      :text="c.name"
      :class="{ active: c.id === modelValue }"
      @click="$emit('update:modelValue', c.id)"
    >
      <template #icon>
        <CategoryIcon :icon="c.icon" :size="26" />
      </template>
    </van-grid-item>
  </van-grid>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CategoryIcon from '@/components/CategoryIcon.vue';
import type { Category, RecordType } from '@/types';

const props = defineProps<{
  categories: Category[];
  type: RecordType;
  modelValue: number | null;
}>();
defineEmits<{ 'update:modelValue': [id: number] }>();
const filtered = computed(() =>
  props.categories.filter((c) => c.type === props.type),
);
</script>

<style scoped>
.active :deep(.van-grid-item__content) { background: #e8fcef; border-radius: 8px; }
</style>
