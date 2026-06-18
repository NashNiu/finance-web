<template>
  <RecordEditor
    :record-id="routeId"
    @close="goBack"
    @saved="goBack"
    @deleted="goBack"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RecordEditor from '@/components/RecordEditor.vue';

const route = useRoute();
const router = useRouter();
const routeId = computed(() => Number(route.params.id) || null);

function goBack() {
  router.back();
}
</script>
