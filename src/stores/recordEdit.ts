import { defineStore } from 'pinia';
import { ref } from 'vue';

// Drives the global record editor popup. Lists call open(id) / openNew() to show
// it; they watch `version` to reload after a save/delete.
export const useRecordEditStore = defineStore('recordEdit', () => {
  const show = ref(false);
  const recordId = ref<number | null>(null);
  const version = ref(0);

  function openNew() {
    recordId.value = null;
    show.value = true;
  }
  function open(id: number) {
    recordId.value = id;
    show.value = true;
  }
  function close() {
    show.value = false;
  }
  function notifyChanged() {
    version.value++;
  }

  return { show, recordId, version, openNew, open, close, notifyChanged };
});
