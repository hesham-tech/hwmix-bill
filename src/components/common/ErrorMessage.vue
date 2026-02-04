<template>
  <v-alert v-if="message" :type="type" :variant="variant" :closable="closable" :density="density" class="error-message" @click:close="$emit('close')">
    <div class="d-flex align-center">
      <v-icon :icon="icon" class="me-2" />
      <div>
        <div class="text-body-1 font-weight-medium">{{ title }}</div>
        <div class="text-body-2">{{ message }}</div>
      </div>
    </div>
  </v-alert>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'error',
    validator: value => ['success', 'info', 'warning', 'error'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'tonal',
  },
  closable: {
    type: Boolean,
    default: true,
  },
  density: {
    type: String,
    default: 'default',
  },
});

defineEmits(['close']);

const icon = computed(() => {
  const icons = {
    success: 'ri-checkbox-circle-line',
    info: 'ri-information-line',
    warning: 'ri-error-warning-line',
    error: 'ri-close-circle-line',
  };
  return icons[props.type];
});
</script>
