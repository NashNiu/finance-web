<template>
  <van-popup
    v-model:show="store.show"
    position="bottom"
    round
    :style="{ height: '92%' }"
  >
    <RecordEditor
      v-if="store.show"
      :key="store.recordId ?? 'new'"
      :record-id="store.recordId"
      @close="store.close()"
      @saved="onDone"
      @deleted="onDone"
    />
  </van-popup>
</template>

<script setup lang="ts">
import RecordEditor from './RecordEditor.vue';
import { useRecordEditStore } from '@/stores/recordEdit';

const store = useRecordEditStore();

function onDone() {
  store.notifyChanged();
  store.close();
}
</script>
