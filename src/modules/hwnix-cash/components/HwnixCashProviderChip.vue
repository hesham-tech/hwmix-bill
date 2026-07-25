<template>
  <v-chip
    :color="config.color"
    :size="size"
    variant="tonal"
    class="font-weight-medium text-no-wrap"
  >
    <v-icon :icon="config.icon" :size="size === 'x-small' ? 12 : 14" class="me-1" />
    {{ config.label }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  provider: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'small',
  },
});

const PROVIDER_MAP = {
  vodafone_cash: { label: 'فودافون كاش', color: 'red-darken-1', icon: 'ri-smartphone-line' },
  orange_cash: { label: 'اورنج كاش', color: 'orange-darken-2', icon: 'ri-smartphone-line' },
  etisalat_cash: { label: 'اتصالات كاش', color: 'green-darken-2', icon: 'ri-smartphone-line' },
  we_cash: { label: 'وي كاش', color: 'purple-darken-1', icon: 'ri-smartphone-line' },
};

const config = computed(() => {
  return PROVIDER_MAP[props.provider] || {
    label: props.provider || 'غير معروف',
    color: 'grey',
    icon: 'ri-question-line',
  };
});
</script>
