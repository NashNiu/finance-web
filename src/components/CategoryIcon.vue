<template>
  <span
    v-if="isEmojiIcon(icon)"
    class="cat-emoji"
    :style="{ fontSize: size + 'px', lineHeight: 1 }"
    >{{ icon }}</span
  >
  <van-icon v-else :name="icon || 'records'" :size="size" />
</template>

<script setup lang="ts">
import { isEmojiIcon } from '@/utils/icon';

withDefaults(defineProps<{ icon: string | null | undefined; size?: number }>(), {
  size: 22,
});
</script>

<style scoped>
.cat-emoji {
  display: inline-block;
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
}
</style>
