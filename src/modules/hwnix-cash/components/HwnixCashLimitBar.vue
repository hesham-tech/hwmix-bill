<template>
  <div class="hwnix-cash-limit-bar">
    <div class="d-flex align-center justify-space-between text-caption mb-1">
      <span class="text-grey-darken-1 font-weight-medium d-flex align-center gap-1">
        <v-icon :icon="icon" size="12" :color="progressColor" />
        {{ label }}
      </span>
      <div class="d-flex align-center gap-1">
        <span class="font-weight-bold font-mono" :class="limitExceeded ? 'text-error font-weight-black' : 'text-grey-darken-2'">
          {{ format(used) }} / {{ format(limit) }} ج.م
        </span>
        <v-chip
          :color="progressColor"
          size="x-small"
          variant="flat"
          class="font-weight-bold ms-1"
          style="font-size: 10px; height: 16px; padding: 0 4px;"
        >
          {{ percent }}%
        </v-chip>
      </div>
    </div>
    <v-tooltip :text="tooltipText" location="top">
      <template #activator="{ props: tooltipProps }">
        <div v-bind="tooltipProps">
          <v-progress-linear
            :model-value="percent"
            :color="progressColor"
            height="7"
            rounded
            bg-color="grey-lighten-3"
            class="elevation-1"
          />
        </div>
      </template>
    </v-tooltip>
    <div v-if="alertTriggered && !limitExceeded" class="text-caption text-warning font-weight-bold mt-1 d-flex align-center gap-1" style="font-size: 10px;">
      <v-icon icon="ri-error-warning-line" size="10" color="warning" />
      <span>بلغ حد التنبيه ({{ alertType === 'percentage' ? alertValue + '%' : format(alertValue) + ' ج.م' }})</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  used: { type: Number, default: 0 },
  limit: { type: Number, default: 0 },
  alertType: { type: String, default: 'percentage' },
  alertValue: { type: Number, default: 80 },
  icon: { type: String, default: 'ri-dashboard-line' },
  color: { type: String, default: 'primary' },
});

const percent = computed(() => {
  if (!props.limit || props.limit <= 0) return 0;
  return Math.min(100, Math.round(((props.used || 0) / props.limit) * 100 * 10) / 10);
});

const remaining = computed(() => {
  if (!props.limit || props.limit <= 0) return 0;
  return Math.max(0, props.limit - (props.used || 0));
});

const limitExceeded = computed(() => {
  return props.limit > 0 && props.used >= props.limit;
});

const alertThresholdAmount = computed(() => {
  if (!props.limit || props.limit <= 0) return 0;
  if (props.alertType === 'amount') {
    return props.alertValue || 0;
  }
  return ((props.alertValue || 80) / 100) * props.limit;
});

const alertTriggered = computed(() => {
  return props.limit > 0 && alertThresholdAmount.value > 0 && props.used >= alertThresholdAmount.value;
});

const progressColor = computed(() => {
  if (limitExceeded.value) return 'error';
  if (alertTriggered.value) return 'warning';
  return props.color;
});

const tooltipText = computed(() => {
  const alertDesc = props.alertType === 'percentage' ? `${props.alertValue}%` : `${format(props.alertValue)} ج.م`;
  return `المتبقي المتاح: ${format(remaining.value)} ج.م | عتبة التنبيه: ${alertDesc}`;
});

function format(val) {
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(val || 0);
}
</script>

<style scoped>
.hwnix-cash-limit-bar {
  min-width: 150px;
}
</style>
