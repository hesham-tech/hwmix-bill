<template>
  <v-chip :color="config.color" :variant="variant" :size="size" class="font-weight-bold px-3 border-sm" style="border-style: solid !important">
    <v-icon v-if="config.icon" :icon="config.icon" start size="14" />
    {{ config.label }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
  variant: { type: String, default: 'tonal' },
  size: { type: String, default: 'small' },
});

const config = computed(() => {
  const map = {
    // Invoice/Purchase Statuses
    draft: { label: 'قيد المراجعة', color: 'grey', icon: 'ri-file-edit-line' },
    confirmed: { label: 'مؤكدة', color: 'primary', icon: 'ri-checkbox-circle-line' },
    paid: { label: 'مدفوعة بالكامل', color: 'success', icon: 'ri-verified-badge-line' },
    partially_paid: { label: 'مدفوعة جزئياً', color: 'warning', icon: 'ri-pie-chart-line' },
    unpaid: { label: 'غير مدفوعة', color: 'error', icon: 'ri-error-warning-line' },
    canceled: { label: 'ملغاة', color: 'error', icon: 'ri-close-circle-line' },

    // Installment Statuses
    pending: { label: 'بانتظار السداد', color: 'orange', icon: 'ri-time-line' },
    overdue: { label: 'متأخر', color: 'error', icon: 'ri-error-warning-line' },
    active: { label: 'نشطة', color: 'primary', icon: 'ri-play-circle-line' },
    completed: { label: 'مكتملة', color: 'success', icon: 'ri-checkbox-circle-fill' },
  };

  return map[props.status] || { label: props.status, color: 'grey', icon: '' };
});
</script>
