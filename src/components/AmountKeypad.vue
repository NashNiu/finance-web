<template>
  <div class="keypad">
    <van-number-keyboard
      :show="true"
      theme="custom"
      extra-key="."
      :close-button-text="t('record.done')"
      @input="onInput"
      @delete="onDelete"
      @close="$emit('done')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [v: string]; done: [] }>();

function onInput(key: string) {
  let v = props.modelValue;
  if (key === '.' && v.includes('.')) return;
  if (v.includes('.') && v.split('.')[1]?.length >= 2) return;
  v = v + key;
  emit('update:modelValue', v);
}
function onDelete() {
  emit('update:modelValue', props.modelValue.slice(0, -1));
}
</script>

<style scoped>
/* keyboard sits inside the input dock (not fixed to the viewport) */
.keypad :deep(.van-number-keyboard) {
  position: static;
}
</style>
