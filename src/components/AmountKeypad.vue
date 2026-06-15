<template>
  <div>
    <div class="display">{{ modelValue || '0.00' }}</div>
    <van-number-keyboard
      :show="true"
      theme="custom"
      extra-key="."
      close-button-text="完成"
      @input="onInput"
      @delete="onDelete"
      @close="$emit('done')"
    />
  </div>
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
.display { text-align: right; font-size: 32px; padding: 16px; font-weight: 600; }
</style>
