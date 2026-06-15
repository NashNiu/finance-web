import { defineStore } from 'pinia';
import { ref } from 'vue';
import { listCategories } from '@/api/categories';
export const useCategoryStore = defineStore('categories', () => {
    const items = ref([]);
    const loaded = ref(false);
    async function load(force = false) {
        if (loaded.value && !force)
            return;
        items.value = await listCategories();
        loaded.value = true;
    }
    return { items, loaded, load };
});
