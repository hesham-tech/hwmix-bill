<template>
  <v-chip
    :color="config.color"
    :size="size"
    variant="tonal"
    class="font-weight-bold text-no-wrap"
  >
    <v-icon :icon="config.icon" :size="size === 'x-small' ? 12 : 14" class="me-1" />
    {{ config.label }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: 'PENDING',
  },
  size: {
    type: String,
    default: 'small',
  },
});

const STATUS_MAP = {
  SUCCESS: { label: 'ناجحة', color: 'success', icon: 'ri-checkbox-circle-line' },
  FAILED: { label: 'فاشلة', color: 'error', icon: 'ri-close-circle-line' },
  PENDING: { label: 'معلقة', color: 'warning', icon: 'ri-time-line' },
};

const config = computed(() => {
  return STATUS_MAP[props.status] || {
    label: props.status || 'معلقة',
    color: 'warning',
    icon: 'ri-time-line',
  };
});
</script>
