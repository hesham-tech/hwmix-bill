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
  const p = (props.provider || '').toLowerCase();
  if (p.includes('vodafone') || p.includes('فودافون')) {
    return { label: 'فودافون كاش', color: 'red-darken-1', icon: 'ri-smartphone-line' };
  }
  if (p.includes('orange') || p.includes('اورنج') || p.includes('أورنج')) {
    return { label: 'أورنج كاش', color: 'orange-darken-2', icon: 'ri-smartphone-line' };
  }
  if (p.includes('etisalat') || p.includes('اتصالات')) {
    return { label: 'اتصالات كاش', color: 'green-darken-2', icon: 'ri-smartphone-line' };
  }
  if (p.includes('we') || p.includes('وي')) {
    return { label: 'وي كاش', color: 'purple-darken-1', icon: 'ri-smartphone-line' };
  }
  return PROVIDER_MAP[props.provider] || {
    label: props.provider || 'عام',
    color: 'primary',
    icon: 'ri-sim-card-line',
  };
});
</script>
