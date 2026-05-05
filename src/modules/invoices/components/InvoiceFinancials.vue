<template>
    <v-row dense class="mt-2 no-gutters w-100">
      <!-- Card 1: Input Fields (Stacked Vertically) - 50% Width -->
      <v-col cols="12" md="6" class="pa-1">
        <v-card variant="outlined" class="rounded-md bg-surface border-opacity-100 h-100 shadow-sm">
          <div class="pa-2 d-flex align-center bg-neutral-lighten-5 border-b">
            <v-icon icon="ri-edit-box-line" color="primary" class="me-2" size="16" />
            <span class="text-xxs font-weight-bold">تعديلات الفاتورة والمدفوع</span>
          </div>
          
          <v-card-text class="pa-3">
            <div>
              <!-- Row 1: Cash Box -->
              <div class="input-item">
                <CashBoxSelector
                  :model-value="modelValue.cash_box_id"
                  :items="cashBoxes"
                  label="خزنة التحصيل"
                  density="compact"
                  required
                  hide-details
                  :error-messages="errors.cash_box_id"
                  @update:model-value="$emit('update:prop', { key: 'cash_box_id', value: $event })"
                />
              </div>

              <!-- Row 2: Combined Paid Amount & Previous Balance -->
              <div class="input-item">
                <v-row dense no-gutters align="center">
                  <v-col cols="8" class="pe-2">
                    <AppInput
                      :model-value="modelValue.paid_amount"
                      label="المبلغ المدفوع (ج.م)"
                      type="number"
                      density="compact"
                      hide-details
                      prefix="ج.م"
                      class="font-weight-black success-field"
                      @update:model-value="$emit('update:prop', { key: 'paid_amount', value: $event })"
                    />
                  </v-col>
                  <v-col cols="4">
                    <div class="d-flex align-center justify-center border rounded-md bg-neutral-lighten-5 px-1" style="height: 28px">
                      <span class="text-xxxs font-weight-bold me-1">السابق؟</span>
                      <AppSwitch
                        :model-value="modelValue.include_previous_balance"
                        hide-details
                        density="compact"
                        color="success"
                        @update:model-value="$emit('update:prop', { key: 'include_previous_balance', value: $event })"
                      />
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Row 3: Header Discount Row -->
              <div class="input-item">
                <AppInput
                  :model-value="modelValue.header_discount"
                  label="خصم إضافي للفاتورة"
                  type="number"
                  density="compact"
                  hide-details
                  prefix="ج.م"
                  class="centered-input"
                  @update:model-value="$emit('update:prop', { key: 'header_discount', value: $event })"
                />
              </div>

              <!-- Row 4: Tax Row -->
              <div class="input-item">
                <v-row dense no-gutters align="center">
                  <v-col cols="8" class="pe-2">
                    <AppInput
                      :model-value="modelValue.tax_rate"
                      label="نسبة الضريبة (%)"
                      type="number"
                      density="compact"
                      hide-details
                      prefix="%"
                      class="centered-input"
                      @update:model-value="$emit('update:prop', { key: 'tax_rate', value: $event })"
                    />
                  </v-col>
                  <v-col cols="4">
                    <div class="d-flex align-center justify-center border rounded-md bg-neutral-lighten-5 px-1" style="height: 28px">
                      <span class="text-xxs font-weight-bold me-1">شاملة؟</span>
                      <AppSwitch
                        :model-value="modelValue.tax_inclusive"
                        hide-details
                        density="compact"
                        color="primary"
                        @update:model-value="$emit('update:prop', { key: 'tax_inclusive', value: $event })"
                      />
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Row 5: Notes Row -->
              <div class="input-item">
                <AppTextarea
                  :model-value="modelValue.notes"
                  label="ملاحظات الفاتورة"
                  placeholder="اكتب ملاحظاتك..."
                  rows="1"
                  auto-grow
                  density="compact"
                  hide-details
                  class="text-xxs-area"
                  @update:model-value="$emit('update:prop', { key: 'notes', value: $event })"
                />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Card 2: Financial Summary - 50% Width -->
      <v-col cols="12" md="6" class="pa-1">
        <v-card variant="outlined" class="rounded-md bg-neutral-lighten-5 border-opacity-100 h-100 shadow-sm overflow-hidden">
          <div class="pa-2 d-flex align-center border-b bg-white">
            <v-icon icon="ri-calculator-line" color="primary" class="me-2" size="16" />
            <span class="text-xxs font-weight-bold">ملخص الحسابات (نهائي)</span>
          </div>
          
          <div class="pa-3">
            <div class="financial-rows d-flex flex-column gap-2">
              <div class="d-flex justify-space-between dashed-row-light">
                <span class="text-xxs text-secondary">إجمالي الأصناف</span>
                <span class="text-xxs font-weight-bold">{{ formatCurrency(financials.gross_amount) }}</span>
              </div>
              
              <div class="d-flex justify-space-between dashed-row-light text-error">
                <span class="text-xxs">خصم الأصناف</span>
                <span class="text-xxs font-weight-bold">-{{ formatCurrency(financials.total_discount) }}</span>
              </div>

              <div v-if="financials.header_discount > 0" class="d-flex justify-space-between dashed-row-light text-error">
                <span class="text-xxs">خصم إضافي</span>
                <span class="text-xxs font-weight-bold">-{{ formatCurrency(financials.header_discount) }}</span>
              </div>

              <div class="d-flex justify-space-between dashed-row-light">
                <span class="text-xxs text-secondary">الضريبة</span>
                <span class="text-xxs font-weight-bold text-primary">+{{ formatCurrency(financials.total_tax) }}</span>
              </div>

              <!-- Net Amount Focus -->
              <div class="bg-primary px-3 py-2 rounded-md my-2 d-flex justify-space-between align-center border border-white">
                <span class="text-xxs font-weight-bold text-white uppercase ls-1">صافي الفاتورة</span>
                <span class="text-h6 font-weight-black text-white line-height-1">{{ formatCurrency(financials.net_amount) }}</span>
              </div>

              <div class="d-flex justify-space-between align-center dashed-row-light">
                <span class="text-xxs text-secondary">رصيد سابق</span>
                <AppBalanceDisplay :amount="financials.previous_balance" perspective="admin" value-class="text-xxs font-weight-bold" hide-label />
              </div>

              <div class="d-flex justify-space-between align-center dashed-row-light">
                <span class="text-caption font-weight-black">إجمالي المستحق</span>
                <AppBalanceDisplay :amount="financials.total_balance" perspective="admin" value-class="text-subtitle-2 font-weight-black" hide-label />
              </div>

              <v-divider class="my-1 border-opacity-25" />

            <div :class="['pa-2 rounded-md text-center font-weight-bold text-xxs mt-2 border border-dashed', financials.remaining_amount <= 0 ? 'bg-success text-white border-success' : 'bg-error-lighten-5 text-error border-error']">
              {{ financials.remaining_amount <= 0 ? 'الفاتورة مدفوعة بالكامل' : `المتبقي للتحصيل: ${formatCurrency(financials.remaining_amount)}` }}
            </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
</template>

<script setup>
import CashBoxSelector from './CashBoxSelector.vue';
import AppBalanceDisplay from '@/components/common/AppBalanceDisplay.vue';
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
.dashed-row-light {
  border-bottom: 1px dashed rgba(var(--v-theme-on-surface), 0.1);
  padding-bottom: 4px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.text-xxs-switch :deep(.v-label) {
  font-size: 10px !important;
}

.text-xxs-area :deep(.v-field__input) {
  font-size: 10px !important;
  min-height: 28px !important;
}

.success-field :deep(.v-field__outline) {
  --v-field-border-color: rgb(var(--v-theme-success)) !important;
}

.ls-1 {
  letter-spacing: 0.5px;
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

.sticky-summary {
  position: sticky;
  top: 170px;
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
