<template>
  <v-card variant="flat" border class="payment-card rounded-lg overflow-hidden mb-4">
    <div class="pa-4">
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="d-flex align-center gap-2">
          <v-avatar color="success-lighten-5" size="40">
            <v-icon icon="ri-money-dollar-circle-line" color="success" />
          </v-avatar>
          <div>
            <div class="text-caption text-grey">المبلغ المسدد</div>
            <div class="text-h6 font-weight-black text-success">{{ formatCurrency(payment.amount) }}</div>
          </div>
        </div>
        <v-chip size="small" variant="flat" color="primary-lighten-5" class="text-primary font-weight-bold">
          <v-icon icon="ri-wallet-3-line" size="14" class="me-1" />
          {{ payment.payment_method?.name }}
        </v-chip>
      </div>

      <v-divider class="mb-4 opacity-50" />

      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-caption text-grey">تاريخ الدفعة</div>
          <div class="text-body-2 font-weight-medium">{{ formatDate(payment.payment_date) }}</div>
        </div>
        <div class="text-end" v-if="payment.invoice">
          <div class="text-caption text-grey">مرتبط بفاتورة</div>
          <div class="text-body-2 font-weight-bold text-primary">#{{ payment.invoice.invoice_number }}</div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters';

defineProps({
  payment: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
