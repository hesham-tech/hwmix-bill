<template>
  <v-card class="rounded-md sticky-summary pt-0 pb-0 border-dashed mb-3 shadow-sm">
    <div class="pa-2 d-flex align-center border-b border-dashed mb-1">
      <v-icon icon="ri-calculator-line" color="primary" class="me-2" size="small" />
      <span class="text-subtitle-2 font-weight-bold">ملخص الحسابات</span>
    </div>
    <v-card-text class="pa-2 pt-1">
      <v-row dense>
        <!-- Row 1: Gross & Item Discount -->
        <v-col cols="6" class="mb-1">
          <div class="d-flex flex-column">
            <span class="text-secondary text-caption">إجمالي الأصناف</span>
            <span class="font-weight-medium">{{ formatCurrency(financials.gross_amount) }}</span>
          </div>
        </v-col>
        <v-col cols="6" class="mb-1 text-left">
          <div class="d-flex flex-column align-end">
            <span class="text-error text-caption">خصم الأصناف</span>
            <span class="font-weight-medium text-error">-{{ formatCurrency(financials.total_discount) }}</span>
          </div>
        </v-col>

        <!-- Row 2: Extra Discount -->
        <v-col cols="12" class="mb-1">
          <div class="d-flex justify-space-between align-center py-0 px-2 bg-grey-lighten-4 rounded compact-row">
            <span class="text-secondary text-body-2">خصم إضافي</span>
            <AppInput
              :model-value="modelValue.header_discount"
              type="number"
              density="compact"
              hide-details
              style="max-width: 80px"
              class="centered-input"
              @update:model-value="$emit('update:prop', { key: 'header_discount', value: $event })"
            />
          </div>
        </v-col>

        <v-divider class="border-dashed my-1 w-100" />

        <!-- Row 3: Tax Section (Rate + Switch + Value) -->
        <v-col cols="12" class="mb-1">
          <v-row dense align="center">
            <v-col cols="4">
              <AppInput
                :model-value="modelValue.tax_rate"
                label="الضريبة %"
                type="number"
                density="compact"
                hide-details
                style="max-width: 80px"
                class="centered-input"
                @update:model-value="$emit('update:prop', { key: 'tax_rate', value: $event })"
              />
            </v-col>
            <v-col cols="4" class="d-flex justify-center">
              <AppSwitch
                :model-value="modelValue.tax_inclusive"
                label="شاملة"
                hide-details
                density="compact"
                color="primary"
                class="mt-0"
                @update:model-value="$emit('update:prop', { key: 'tax_inclusive', value: $event })"
              />
            </v-col>
            <v-col cols="4" class="text-left font-weight-medium text-primary">
              <div class="d-flex flex-column align-end">
                <span class="text-caption text-secondary">قيمة الضريبة</span>
                <span>{{ formatCurrency(financials.total_tax) }}</span>
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-divider class="border-opacity-50 my-1 w-100" />

        <!-- Row 4: Net Amount -->
        <v-col cols="12" class="mb-2">
          <div class="d-flex justify-space-between align-center bg-primary-lighten-5 pa-2 rounded-md border border-primary-lighten-3">
            <span class="text-body-1 font-weight-bold text-primary">صافي الفاتورة</span>
            <span class="text-h6 font-weight-black text-primary">{{ formatCurrency(financials.net_amount) }}</span>
          </div>
        </v-col>

        <!-- Row 5: Previous Balance & Total Required -->
        <v-col cols="6" class="mb-1">
          <div class="d-flex flex-column">
            <span class="text-secondary text-caption">رصيد سابق</span>
            <span class="font-weight-medium" :class="financials.previous_balance < 0 ? 'text-error' : 'text-success'">
              {{ formatCurrency(financials.previous_balance) }}
            </span>
          </div>
        </v-col>
        <v-col cols="6" class="mb-1 text-left">
          <div class="d-flex flex-column align-end border-s-dark ps-2">
            <span class="text-secondary text-caption">إجمالي المستحق</span>
            <span class="font-weight-black text-body-1">{{ formatCurrency(financials.total_balance) }}</span>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-2" />

      <div class="d-flex align-center mb-2">
        <v-icon icon="ri-wallet-3-line" color="primary" class="me-2" size="small" />
        <h3 class="text-subtitle-1 font-weight-bold mb-0">بيانات الدفع</h3>
      </div>

      <v-row dense class="mx-0">
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
            :items="cashBoxes"
            required
            :error-messages="errors.cash_box_id"
            @update:model-value="$emit('update:prop', { key: 'cash_box_id', value: $event })"
          />
        </v-col>

        <v-col cols="12">
          <v-alert variant="tonal" :color="financials.remaining_amount <= 0 ? 'success' : 'error'" class="mb-1 rounded-md" density="compact">
            <div class="d-flex justify-space-between align-center w-100 py-0">
              <span class="text-caption font-weight-bold">المبلغ المتبقي</span>
              <span class="text-body-2 font-weight-black">
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
  cashBoxes: {
    type: Array,
    default: () => [],
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  showProfit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'update:prop', 'update:showProfit']);
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

.no-border-input :deep(.v-field__outline) {
  display: none;
}

.no-border-input :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.border-s-dark {
  border-right: 2px solid rgba(var(--v-theme-primary), 0.2);
}

@media (max-width: 1264px) {
  .sticky-summary {
    position: static;
  }
}
</style>
