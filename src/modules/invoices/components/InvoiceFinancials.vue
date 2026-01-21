<template>
  <v-card class="rounded-lg sticky-summary pt-4 border-dashed mb-6" prepend-icon="ri-calculator-line" title="ملخص الحسابات">
    <v-card-text>
      <v-row dense>
        <v-col cols="12" class="d-flex justify-space-between align-center mb-1">
          <span class="text-secondary text-body-2">المبلغ الإجمالي (قبل الخصم)</span>
          <span class="font-weight-medium">{{ formatCurrency(financials.gross_amount) }}</span>
        </v-col>

        <v-col cols="12" class="d-flex justify-space-between align-center text-error mb-1">
          <span class="text-body-2">خصم الأصناف</span>
          <span class="font-weight-medium">-{{ formatCurrency(financials.total_discount) }}</span>
        </v-col>

        <v-col cols="12">
          <v-row dense align="center">
            <v-col cols="6">
              <span class="text-secondary text-body-2">خصم إضافي</span>
            </v-col>
            <v-col cols="6" class="d-flex justify-end">
              <AppInput
                :model-value="modelValue.header_discount"
                type="number"
                density="compact"
                hide-details
                style="max-width: 90px"
                class="centered-input"
                @update:model-value="$emit('update:prop', { key: 'header_discount', value: $event })"
              />
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" class="d-flex justify-space-between align-center text-error mb-2">
          <span class="text-body-2">إجمالي الخصم</span>
          <span class="font-weight-bold">-{{ formatCurrency((financials.total_discount || 0) + (modelValue.header_discount || 0)) }}</span>
        </v-col>

        <v-divider class="border-dashed my-2" />

        <v-col cols="12" class="d-flex justify-space-between align-center mb-1">
          <span class="text-secondary text-body-2">المبلغ الخاضع للضريبة</span>
          <span class="font-weight-medium">{{ formatCurrency(financials.taxable_amount) }}</span>
        </v-col>

        <v-col cols="12">
          <v-row dense align="center">
            <v-col cols="6">
              <span class="text-secondary text-body-2">الضريبة (%)</span>
            </v-col>
            <v-col cols="6" class="d-flex justify-end">
              <AppInput
                :model-value="modelValue.tax_rate"
                type="number"
                density="compact"
                hide-details
                suffix="%"
                style="max-width: 80px"
                class="centered-input"
                @update:model-value="$emit('update:prop', { key: 'tax_rate', value: $event })"
              />
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" class="d-flex justify-space-between align-center text-primary mb-2">
          <span class="text-body-2">قيمة الضريبة</span>
          <span class="font-weight-medium">{{ formatCurrency(financials.total_tax) }}</span>
        </v-col>

        <v-divider class="border-opacity-50 my-2" />

        <v-col cols="12">
          <div class="d-flex justify-space-between align-center bg-primary-lighten-5 pa-3 rounded-lg border border-primary-lighten-3">
            <span class="text-subtitle-1 font-weight-bold text-primary">المبلغ الصافي</span>
            <span class="text-h5 font-weight-black text-primary">{{ formatCurrency(financials.net_amount) }}</span>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <div class="d-flex align-center mb-4">
        <v-icon icon="ri-wallet-3-line" color="primary" class="me-2" />
        <h3 class="text-h6 font-weight-bold mb-0">بيانات الدفع</h3>
      </div>

      <v-row dense>
        <v-col cols="12">
          <AppInput
            :model-value="modelValue.paid_amount"
            label="المبلغ المدفوع"
            type="number"
            prepend-inner-icon="ri-cash-line"
            class="font-weight-bold"
            @update:model-value="$emit('update:prop', { key: 'paid_amount', value: $event })"
          />
        </v-col>
        <v-col cols="12" v-if="modelValue.paid_amount > 0">
          <CashBoxSelector
            :model-value="modelValue.cash_box_id"
            required
            :error-messages="errors.cash_box_id"
            @update:model-value="$emit('update:prop', { key: 'cash_box_id', value: $event })"
          />
        </v-col>

        <v-col cols="12">
          <v-alert variant="tonal" :color="financials.remaining_amount <= 0 ? 'success' : 'error'" class="mb-4 rounded-lg" density="compact">
            <div class="d-flex justify-space-between align-center w-100">
              <span class="text-body-2 font-weight-bold">المبلغ المتبقي</span>
              <span class="text-h6 font-weight-black">
                {{ formatCurrency(financials.remaining_amount) }}
              </span>
            </div>
          </v-alert>
        </v-col>

        <v-col cols="12">
          <AppTextarea
            :model-value="modelValue.notes"
            label="ملاحظات"
            rows="2"
            placeholder="أدخل أي ملاحظات إضافية هنا..."
            prepend-inner-icon="ri-sticky-note-2-line"
            @update:model-value="$emit('update:prop', { key: 'notes', value: $event })"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import CashBoxSelector from './CashBoxSelector.vue';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  financials: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'update:prop']);
</script>

<style scoped>
.sticky-summary {
  position: sticky;
  top: 170px;
}

.border-dashed {
  border-style: dashed !important;
}

.centered-input :deep(input) {
  text-align: center;
}

@media (max-width: 1264px) {
  .sticky-summary {
    position: static;
  }
}
</style>
