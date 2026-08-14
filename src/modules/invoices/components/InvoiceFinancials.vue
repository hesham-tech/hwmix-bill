<template>
  <!-- الملخص المالي وحقول الدفع — مضغوط وواضح -->
  <div class="invoice-financials">
    <div class="financials-grid">

      <!-- ═══ العمود الأيسر: حقول الإدخال ═══ -->
      <div class="fin-inputs">

        <!-- خزنة التحصيل -->
        <div class="fin-field-row">
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

        <!-- الرصيد السابق + مفتاح الاحتساب (غير متاح في التقسيط) -->
        <div v-if="!isInstallment" class="fin-field-row">
          <div class="balance-toggle-row">
            <div class="balance-display">
              <span class="balance-label">رصيد {{ isPurchase ? 'المورد' : 'العميل' }}</span>
              <AppBalanceDisplay
                :amount="financials.previous_balance"
                perspective="admin"
                value-class="text-xs font-weight-black"
                hide-label
              />
            </div>
            <div class="toggle-wrap">
              <span class="toggle-label">احتساب الرصيد</span>
              <AppSwitch
                :model-value="modelValue.include_previous_balance"
                hide-details
                density="compact"
                color="success"
                @update:model-value="$emit('update:prop', { key: 'include_previous_balance', value: $event })"
              />
            </div>
          </div>
        </div>

        <!-- الضريبة -->
        <div v-if="!isInstallment" class="fin-field-row">
          <div class="two-col-row">
            <AppInput
              :model-value="modelValue.tax_rate"
              label="نسبة الضريبة %"
              type="number"
              density="compact"
              hide-details
              prefix="%"
              class="centered-input"
              @update:model-value="$emit('update:prop', { key: 'tax_rate', value: $event })"
            />
            <div class="toggle-wrap">
              <span class="toggle-label">تفعيل الضريبة</span>
              <AppSwitch
                :model-value="modelValue.tax_inclusive"
                hide-details
                density="compact"
                color="primary"
                @update:model-value="$emit('update:prop', { key: 'tax_inclusive', value: $event })"
              />
            </div>
          </div>
        </div>

        <!-- خصم إضافي -->
        <div v-if="!isInstallment" class="fin-field-row">
          <AppInput
            :model-value="modelValue.header_discount"
            label="خصم إضافي على الفاتورة"
            type="number"
            density="compact"
            hide-details
            prefix="ج.م"
            class="centered-input"
            @update:model-value="$emit('update:prop', { key: 'header_discount', value: $event })"
          />
        </div>

        <!-- ملاحظات -->
        <div class="fin-field-row fin-field-row--notes">
          <AppTextarea
            :model-value="modelValue.notes"
            label="ملاحظات"
            placeholder="اكتب ملاحظاتك..."
            rows="1"
            auto-grow
            density="compact"
            hide-details
            class="notes-area"
            @update:model-value="$emit('update:prop', { key: 'notes', value: $event })"
          />
        </div>
      </div>

      <!-- ═══ العمود الأيمن: ملخص مالي + المدفوع ═══ -->
      <div class="fin-summary">

        <!-- ─── بنود الحساب (صغيرة وخفيفة) ─── -->
        <div class="calc-rows">
          <!-- إجمالي الأصناف -->
          <div class="calc-row">
            <span class="calc-label">إجمالي الأصناف</span>
            <span class="calc-value">{{ formatCurrency(financials.gross_amount) }}</span>
          </div>

          <!-- خصم الأصناف (مشروط) -->
          <div v-if="financials.total_discount > 0" class="calc-row calc-row--discount">
            <span class="calc-label">خصم الأصناف</span>
            <span class="calc-value">−{{ formatCurrency(financials.total_discount) }}</span>
          </div>

          <!-- خصم إضافي (مشروط) -->
          <div v-if="financials.header_discount > 0" class="calc-row calc-row--discount">
            <span class="calc-label">خصم إضافي</span>
            <span class="calc-value">−{{ formatCurrency(financials.header_discount) }}</span>
          </div>

          <!-- الضريبة (مشروطة) -->
          <div v-if="financials.total_tax > 0" class="calc-row calc-row--tax">
            <span class="calc-label">الضريبة {{ modelValue.tax_rate }}%</span>
            <span class="calc-value">+{{ formatCurrency(financials.total_tax) }}</span>
          </div>
        </div>

        <!-- ─── صافي الفاتورة (بارز) ─── -->
        <div class="net-amount-block">
          <span class="net-label">صافي الفاتورة</span>
          <span class="net-value">{{ formatCurrency(financials.net_amount) }}</span>
        </div>

        <!-- رصيد سابق (مشروط) -->
        <div v-if="modelValue.include_previous_balance && financials.previous_balance !== 0" class="calc-row">
          <span class="calc-label text-secondary">رصيد سابق</span>
          <div>
            <AppBalanceDisplay
              :amount="financials.previous_balance"
              perspective="admin"
              value-class="text-xs font-weight-bold"
              hide-label
            />
          </div>
        </div>

        <!-- إجمالي المستحق -->
        <div v-if="modelValue.include_previous_balance && financials.previous_balance !== 0" class="calc-row calc-row--due">
          <span class="calc-label font-weight-bold">إجمالي المستحق</span>
          <span class="calc-value font-weight-black">{{ formatCurrency(financials.total_balance) }}</span>
        </div>

        <v-divider class="my-2 border-opacity-15" />

        <!-- ─── المبلغ المدفوع (العنصر الأبرز بعد الإجمالي) ─── -->
        <div v-if="!isInstallment" class="paid-block">
          <div class="paid-label-row">
            <v-icon icon="ri-money-dollar-circle-line" size="14" color="success" class="me-1" />
            <span class="paid-label">المبلغ المدفوع</span>
            <!-- زر دفع كامل -->
            <v-tooltip text="دفع كامل المستحق" location="top">
              <template #activator="{ props: tt }">
                <v-btn
                  v-bind="tt"
                  variant="text"
                  color="success"
                  size="x-small"
                  icon="ri-check-double-line"
                  class="ms-auto"
                  @click="$emit('update:prop', { key: 'paid_amount', value: financials.total_balance })"
                />
              </template>
            </v-tooltip>
          </div>
          <AppInput
            :model-value="modelValue.paid_amount"
            type="number"
            density="compact"
            hide-details
            prefix="ج.م"
            class="paid-input font-weight-black"
            :class="{ 'paid-input--overpaid': modelValue.paid_amount > financials.total_balance && financials.total_balance > 0 }"
            @update:model-value="$emit('update:prop', { key: 'paid_amount', value: $event })"
          />
          <!-- تلميح الدفع الزائد -->
          <div
            v-if="modelValue.paid_amount > financials.total_balance && financials.total_balance > 0"
            class="overpaid-hint"
          >
            <v-icon icon="ri-information-line" size="12" class="me-1" />
            المبلغ الزائد ({{ formatCurrency(modelValue.paid_amount - financials.total_balance) }}) سيُرحَّل لرصيد {{ isPurchase ? 'المورد' : 'العميل' }}
          </div>
        </div>

        <!-- ─── المتبقي (النتيجة النهائية) ─── -->
        <div
          class="remaining-block"
          :class="financials.remaining_amount <= 0 ? 'remaining-block--paid' : 'remaining-block--due'"
        >
          <div class="remaining-label">
            {{ financials.remaining_amount <= 0
              ? 'الفاتورة مسددة بالكامل'
              : (isPurchase ? 'المتبقي للمورد' : 'المتبقي على العميل')
            }}
          </div>
          <div class="remaining-value">
            {{ financials.remaining_amount <= 0
              ? '✓'
              : formatCurrency(Math.abs(financials.remaining_amount))
            }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// الملخص المالي للفاتورة — مضغوط مع إبراز التسلسل: إجمالي → مدفوع → متبقي
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
  isPurchase: {
    type: Boolean,
    default: false,
  },
  isInstallment: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'update:prop', 'update:showProfit']);
</script>

<style scoped>
/* ════════════════════════════════════════
   INVOICE FINANCIALS — Compact & Clear
   ════════════════════════════════════════ */

.invoice-financials {
  border: 1px solid rgba(var(--v-border-color), 0.2);
  border-radius: 8px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.financials-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
}

/* ═══ العمود الأيسر: حقول الإدخال ═══ */
.fin-inputs {
  padding: 10px 12px;
  border-inline-end: 1px solid rgba(var(--v-border-color), 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fin-field-row {
  display: flex;
  flex-direction: column;
}

.fin-field-row--notes {
  flex: 1;
}

/* صف التبديل (switch + label) */
.balance-toggle-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.balance-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-border-color), 0.15);
  border-radius: 6px;
  padding: 3px 8px;
  min-height: 32px;
  justify-content: center;
}

.balance-label {
  font-size: 9px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.5);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-border-color), 0.15);
  border-radius: 6px;
  padding: 2px 8px;
  min-height: 32px;
  flex-shrink: 0;
}

.toggle-label {
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.two-col-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

:deep(.notes-area .v-field__input) {
  font-size: 11px !important;
  min-height: 28px !important;
}

/* ═══ العمود الأيمن: الملخص ═══ */
.fin-summary {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(var(--v-theme-on-surface), 0.015);
}

/* ─── بنود الحساب ─── */
.calc-rows {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 3px;
  border-bottom: 1px dashed rgba(var(--v-border-color), 0.12);
}

.calc-label {
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), 0.55);
  font-weight: 500;
}

.calc-value {
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.calc-row--discount .calc-value {
  color: rgb(var(--v-theme-error));
}

.calc-row--tax .calc-value {
  color: rgb(var(--v-theme-primary));
}

.calc-row--due {
  border-bottom: none;
}

/* ─── صافي الفاتورة (بارز) ─── */
.net-amount-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgb(var(--v-theme-primary));
  border-radius: 6px;
  padding: 6px 12px;
  margin: 4px 0;
}

.net-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.net-value {
  font-size: 18px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

/* ─── المبلغ المدفوع ─── */
.paid-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.paid-label-row {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--v-theme-success));
}

.paid-label {
  font-size: 11px;
  font-weight: 700;
}

/* حقل المدفوع — أكبر وأوضح */
.paid-input :deep(.v-field) {
  border-color: rgba(var(--v-theme-success), 0.5) !important;
  background: rgba(var(--v-theme-success), 0.04) !important;
}

.paid-input :deep(.v-field__input) {
  font-size: 18px !important;
  font-weight: 900 !important;
  color: rgb(var(--v-theme-success)) !important;
  text-align: center;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  min-height: 40px !important;
}

.paid-input--overpaid :deep(.v-field) {
  border-color: rgba(var(--v-theme-warning), 0.6) !important;
  background: rgba(var(--v-theme-warning), 0.04) !important;
}

.paid-input--overpaid :deep(.v-field__input) {
  color: rgb(var(--v-theme-warning)) !important;
}

/* تلميح الدفع الزائد */
.overpaid-hint {
  font-size: 9.5px;
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.08);
  border: 1px solid rgba(var(--v-theme-warning), 0.25);
  border-radius: 5px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  font-weight: 500;
  line-height: 1.4;
}

/* ─── المتبقي (النتيجة النهائية) ─── */
.remaining-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  padding: 8px 12px;
  border: 1.5px dashed;
  margin-top: 4px;
}

.remaining-block--paid {
  background: rgba(var(--v-theme-success), 0.06);
  border-color: rgba(var(--v-theme-success), 0.3);
  color: rgb(var(--v-theme-success));
}

.remaining-block--due {
  background: rgba(var(--v-theme-error), 0.05);
  border-color: rgba(var(--v-theme-error), 0.25);
  color: rgb(var(--v-theme-error));
}

.remaining-label {
  font-size: 10.5px;
  font-weight: 700;
}

.remaining-value {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

/* ─── centered-input ─── */
:deep(.centered-input .v-field__input) {
  text-align: center;
}

/* ═══ Responsive ═══ */
@media (max-width: 768px) {
  .financials-grid {
    grid-template-columns: 1fr;
  }

  .fin-inputs {
    border-inline-end: none;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.15);
  }

  .net-value {
    font-size: 16px;
  }

  .remaining-value {
    font-size: 18px;
  }
}
</style>
