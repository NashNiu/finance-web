import { defineStore } from 'pinia';
import { ref } from 'vue';
import { listCategories } from '@/api/categories';
import type { Category } from '@/types';

export const useCategoryStore = defineStore('categories', () => {
  const items = ref<Category[]>([]);
  const loaded = ref(false);

  async function load(force = false) {
    if (loaded.value && !force) return;
    items.value = await listCategories();
    loaded.value = true;
  }

  return { items, loaded, load };
});
