<template>
  <v-card variant="flat" border class="purchase-card rounded-md overflow-hidden hover-shadow transition-all mb-4">
    <div class="pa-4">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="text-caption text-grey mb-1">رقم الفاتورة</div>
          <div class="text-h6 font-weight-black text-primary">#{{ purchase.invoice_number }}</div>
        </div>
        <v-chip :color="getStatusColor(purchase.status)" size="small" variant="tonal" class="font-weight-bold px-3">
          {{ getStatusLabel(purchase.status) }}
        </v-chip>
      </div>

      <v-divider class="mb-4 opacity-50" />

      <v-row no-gutters class="mb-4">
        <v-col cols="12">
          <div class="text-caption text-grey">تاريخ الفاتورة</div>
          <div class="d-flex align-center gap-1 mt-1">
            <v-icon icon="ri-calendar-line" size="14" color="grey" />
            <span class="text-body-2 font-weight-medium">{{ formatDate(purchase.issue_date) }}</span>
          </div>
        </v-col>
      </v-row>

      <v-card variant="flat" class="bg-grey-lighten-4 rounded-md pa-3 mb-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-caption text-grey">الإجمالي</span>
          <span class="text-subtitle-1 font-weight-bold">{{ formatCurrency(purchase.net_amount) }}</span>
        </div>
        <div class="d-flex justify-space-between align-center">
          <span class="text-caption text-grey">المدفوع</span>
          <span class="text-body-2 text-success font-weight-bold">{{ formatCurrency(purchase.paid_amount) }}</span>
        </div>
      </v-card>

      <div class="d-flex justify-space-between align-center">
        <div v-if="parseFloat(purchase.remaining_amount) > 0">
          <div class="text-caption text-error font-weight-bold">متبقي: {{ formatCurrency(purchase.remaining_amount) }}</div>
        </div>
        <div v-else class="text-caption text-success font-weight-bold d-flex align-center gap-1">
          <v-icon icon="ri-checkbox-circle-fill" size="14" />
          تم السداد
        </div>

        <div class="d-flex gap-2">
          <v-btn icon="ri-eye-line" variant="tonal" color="info" density="comfortable" @click="$emit('view', purchase)" />
          <v-btn icon="ri-printer-line" variant="tonal" color="warning" density="comfortable" @click="$emit('print', purchase)" />
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  purchase: {
    type: Object,
    required: true,
  },
});

defineEmits(['view', 'print']);

const getStatusColor = status => {
  const colors = {
    draft: 'grey',
    confirmed: 'primary',
    paid: 'success',
    partially_paid: 'warning',
    canceled: 'error',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = {
    draft: 'مسودة',
    confirmed: 'مؤكدة',
    paid: 'مدفوعة',
    partially_paid: 'مدفوعة جزئياً',
    canceled: 'ملغاة',
  };
  return labels[status] || status;
};
</script>

<style scoped>
.purchase-card {
  border-color: rgba(0, 0, 0, 0.05) !important;
}
.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
</style>
