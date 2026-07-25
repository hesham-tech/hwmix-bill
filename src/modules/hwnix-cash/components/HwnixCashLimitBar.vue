<template>
  <div class="hwnix-cash-limit-bar">
    <div class="d-flex align-center justify-space-between text-caption mb-1">
      <span class="text-grey-darken-1 font-weight-medium">{{ label }}</span>
      <span class="font-weight-bold" :class="limitExceeded ? 'text-error' : 'text-grey-darken-2'">
        {{ format(used) }} / {{ format(limit) }}
      </span>
    </div>
    <v-progress-linear
      :model-value="percent"
      :color="progressColor"
      height="6"
      rounded
      bg-color="grey-lighten-3"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  used: { type: Number, default: 0 },
  limit: { type: Number, default: 0 },
  color: { type: String, default: 'primary' },
});

const percent = computed(() => {
  if (!props.limit || props.limit <= 0) return 0;
  return Math.min(100, Math.round((props.used / props.limit) * 100));
});

const limitExceeded = computed(() => {
  return props.limit > 0 && props.used >= props.limit;
});

const progressColor = computed(() => {
  if (limitExceeded.value) return 'error';
  if (percent.value > 85) return 'warning';
  return props.color;
});

function format(val) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(val || 0);
}
</script>

<style scoped>
.hwnix-cash-limit-bar {
  min-width: 140px;
}
</style>
