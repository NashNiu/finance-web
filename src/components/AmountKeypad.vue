<template>
  <van-number-keyboard
    :show="true"
    theme="custom"
    extra-key="."
    close-button-text="完成"
    @input="onInput"
    @delete="onDelete"
    @close="$emit('done')"
  />
</template>

<script setup lang="ts">
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
:deep(.van-number-keyboard) {
  position: static;
}
</style>
