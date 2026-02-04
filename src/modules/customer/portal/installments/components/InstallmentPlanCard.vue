<template>
  <v-card variant="flat" border class="plan-card rounded-md overflow-hidden mb-4">
    <div class="pa-4">
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="d-flex align-center gap-2">
          <v-avatar color="secondary-lighten-5" size="40">
            <v-icon icon="ri-calendar-todo-line" color="secondary" />
          </v-avatar>
          <div>
            <div class="text-caption text-grey">إجمالي خطة التقسيط</div>
            <div class="text-h6 font-weight-black text-secondary">{{ formatCurrency(plan.net_amount) }}</div>
          </div>
        </div>
        <v-chip :color="getStatusColor(plan.status)" size="small" variant="flat" class="font-weight-bold">
          {{ getStatusLabel(plan.status) }}
        </v-chip>
      </div>

      <v-divider class="mb-4 opacity-50" />

      <v-row no-gutters class="mb-4 text-center">
        <v-col cols="6" class="border-e">
          <div class="text-caption text-grey mb-1">عدد الأقساط</div>
          <div class="text-body-1 font-weight-bold">{{ plan.installments_count }} قسط</div>
        </v-col>
        <v-col cols="6">
          <div class="text-caption text-grey mb-1">مبلغ القسط</div>
          <div class="text-body-1 font-weight-bold text-primary">{{ formatCurrency(plan.installment_amount) }}</div>
        </v-col>
      </v-row>

      <div class="d-flex justify-space-between align-end mt-4">
        <div v-if="plan.invoice">
          <div class="text-caption text-grey">الفاتورة المرتبطة</div>
          <div class="text-body-2 font-weight-bold">#{{ plan.invoice.invoice_number }}</div>
        </div>
        <v-btn icon="ri-eye-line" variant="tonal" color="info" density="comfortable" @click="$emit('view', plan)" />
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters';

defineProps({
  plan: {
    type: Object,
    required: true,
  },
});

defineEmits(['view']);

const getStatusColor = status => {
  const colors = { active: 'success', completed: 'info', cancelled: 'error' };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = { active: 'نشط', completed: 'مكتمل', cancelled: 'ملغي' };
  return labels[status] || status;
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.border-e {
  border-inline-end: 1px solid rgba(0, 0, 0, 0.05) !important;
}
</style>
