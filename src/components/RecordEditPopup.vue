<template>
  <van-popup
    v-model:show="store.show"
    position="bottom"
    round
    :style="{ height: store.mode === 'edit' ? '92%' : 'auto', maxHeight: '92%' }"
  >
    <RecordDetail
      v-if="store.show && store.mode === 'detail' && store.record"
      :record="store.record"
      @close="store.close()"
      @edit="store.startEdit()"
      @deleted="onDone"
    />
    <RecordEditor
      v-else-if="store.show"
      :key="store.recordId ?? 'new'"
      :record-id="store.recordId"
      @close="store.close()"
      @saved="onDone"
      @deleted="onDone"
    />
  </van-popup>
</template>

<script setup lang="ts">
import RecordDetail from './RecordDetail.vue';
import RecordEditor from './RecordEditor.vue';
import { useRecordEditStore } from '@/stores/recordEdit';

const store = useRecordEditStore();

function onDone() {
  store.notifyChanged();
  store.close();
}
</script>
