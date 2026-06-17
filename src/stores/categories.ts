import { defineStore } from 'pinia';
import { ref } from 'vue';
import { listCategories } from '@/api/categories';
import type { Category, RecordType } from '@/types';

export const useCategoryStore = defineStore('categories', () => {
  const items = ref<Category[]>([]);
  const loaded = ref(false);

  async function load(force = false) {
    if (loaded.value && !force) return;
    items.value = await listCategories();
    loaded.value = true;
  }

  // First-level categories of a given type (一级分类).
  const firstLevel = (type: RecordType) =>
    items.value.filter((c) => c.type === type && c.parentId === null);

  // Subcategories under a first-level category (二级分类).
  const childrenOf = (parentId: number) =>
    items.value.filter((c) => c.parentId === parentId);

  const byId = (id: number | null) =>
    id === null ? undefined : items.value.find((c) => c.id === id);

  return { items, loaded, load, firstLevel, childrenOf, byId };
});
