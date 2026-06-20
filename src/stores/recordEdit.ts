import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FinanceRecord } from '@/types';

// Drives the global record popup. Lists call openDetail(record) to show a
// read-only detail first; the user then taps 编辑 (→ edit mode) or 删除.
// openNew() jumps straight to an empty editor. Lists watch `version` to reload
// after a save/delete.
export const useRecordEditStore = defineStore('recordEdit', () => {
  const show = ref(false);
  const mode = ref<'detail' | 'edit'>('edit');
  const record = ref<FinanceRecord | null>(null);
  const recordId = ref<number | null>(null);
  const version = ref(0);

  function openDetail(r: FinanceRecord) {
    record.value = r;
    recordId.value = r.id;
    mode.value = 'detail';
    show.value = true;
  }
  function openNew() {
    record.value = null;
    recordId.value = null;
    mode.value = 'edit';
    show.value = true;
  }
  function openEdit(r: FinanceRecord) {
    record.value = r;
    recordId.value = r.id;
    mode.value = 'edit';
    show.value = true;
  }
  function startEdit() {
    mode.value = 'edit';
  }
  function close() {
    show.value = false;
  }
  function notifyChanged() {
    version.value++;
  }

  return {
    show,
    mode,
    record,
    recordId,
    version,
    openDetail,
    openNew,
    openEdit,
    startEdit,
    close,
    notifyChanged,
  };
});
