<template>
  <AppDialog
    v-model="internalValue"
    title="تمت عملية التحصيل بنجاح"
    icon="ri-checkbox-circle-fill"
    max-width="500"
    variant="success"
    hide-actions
    persistent
  >
    <div class="success-content py-4 no-print">
      <!-- Premium Success Header -->
      <div class="text-center">
        <div class="success-icon-container">
          <div class="icon-pulse"></div>
          <v-icon icon="ri-checkbox-circle-fill" size="80" color="success" />
        </div>
        <h2 class="text-h4 font-weight-bold text-slate-900 mb-1">تمت العملية بنجاح!</h2>
      </div>

      <!-- High-End Apple Style Receipt (UI Only) -->
      <div class="premium-receipt shadow-xl mx-auto">
        <!-- Top Wave/Curve for Receipt Feel -->
        <div class="receipt-top-edge"></div>

        <div class="receipt-body pa-8">
          <!-- fields ... -->
          <div class="receipt-fields">
            <div class="field-row">
              <span class="field-label">اسم العميل</span>
              <span class="field-value font-weight-bold">{{ customerName }}</span>
            </div>

            <div class="field-row">
              <span class="field-label">رقم العملية</span>
              <span class="field-value">
                <v-chip size="small" variant="flat" color="primary" class="font-weight-bold"> #{{ paymentData?.id }} </v-chip>
              </span>
            </div>

            <div class="field-row hero-row">
              <span class="field-label">المبلغ الإجمالي المحصل</span>
              <span class="field-value text-h5 font-weight-bold text-slate-900">
                {{ formatCurrency(amountPaid) }}
              </span>
            </div>

            <div class="field-row">
              <span class="field-label">تاريخ التحصيل</span>
              <span class="field-value font-weight-bold text-success">
                {{ formatDate(paymentData?.payment_date || paymentData?.created_at) }}
              </span>
            </div>

            <div class="field-row">
              <span class="field-label">تاريخ الاستحقاق</span>
              <span class="field-value font-weight-bold text-primary">
                {{ formatDate(paidInstallments[0]?.due_date) }}
              </span>
            </div>

            <div class="field-row">
              <span class="field-label">طريقة الدفع</span>
              <span class="field-value">{{ paymentMethodName }}</span>
            </div>
          </div>

          <!-- Paid Installments Section -->
          <div v-if="paidInstallments.length" class="paid-installments-section mt-6 mb-4">
            <div class="text-overline font-weight-bold text-slate-400 mb-2">الأقساط المسددة في هذه الحركة</div>
            <div class="installments-mini-table">
              <template v-for="inst in paidInstallments" :key="inst?.id">
                <div v-if="inst" class="mini-row d-flex justify-space-between align-center py-2 border-b-light">
                  <div class="d-flex align-center">
                    <v-icon icon="ri-refresh-line" size="14" color="success" class="me-2" />
                    <span class="text-body-2 text-slate-700">قسط رقم #{{ inst.installment_number }}</span>
                  </div>
                  <span class="text-body-2 font-weight-bold text-slate-900">{{ formatCurrency(inst.amount) }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Summary Footnote -->
          <div class="receipt-footer mt-4 pa-4 rounded-md bg-emerald-50 text-emerald-900 d-flex align-center justify-space-between summary-border">
            <div class="d-flex align-center">
              <v-icon icon="ri-subtract-line" size="18" class="me-2 opacity-50" />
              <span class="text-subtitle-2 font-weight-bold">المتبقي المطلوب من الخطة:</span>
            </div>
            <span class="text-h6 font-weight-bold">{{ formatCurrency(remainingAmount) }}</span>
          </div>
        </div>

        <div class="receipt-bottom-edge"></div>
      </div>
    </div>

    <!-- Actions -->
    <template #actions>
      <div class="d-flex flex-column gap-2 w-100 no-print px-1 pb-2">
        <AppPrintShare
          type="installment"
          :data="{
            payment: paymentData,
            customer: { name: customerName },
            installments: paidInstallments,
            plan: { remaining_amount: remainingAmount },
          }"
          label="طباعة الإيصال"
          color="primary"
          size="large"
          class="mb-2"
        />

        <v-btn block size="large" variant="tonal" color="secondary" class="rounded-md font-weight-bold" @click="close"> إغلاق </v-btn>
      </div>
    </template>
  </AppDialog>
</template>

<script setup>
import { computed } from 'vue';
import { AppDialog, AppPrintShare } from '@/components';
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  modelValue: Boolean,
  paymentDetails: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'close']);

const internalValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const paymentData = computed(() => {
  const details = Array.isArray(props.paymentDetails) ? props.paymentDetails[0] : props.paymentDetails;
  const record = details?.payment_record || details;
  return record?.data || record || {};
});

const nextInstallment = computed(() => {
  const details = Array.isArray(props.paymentDetails) ? props.paymentDetails[0] : props.paymentDetails;
  return details?.next_installment;
});

const paidInstallments = computed(() => {
  const details = Array.isArray(props.paymentDetails) ? props.paymentDetails[0] : props.paymentDetails;
  return details?.paid_installments || [];
});

const amountPaid = computed(() => {
  return paymentData.value?.amount_paid || paymentData.value?.amount || 0;
});

const remainingAmount = computed(() => {
  return paymentData.value?.plan?.remaining_amount || 0;
});

const customerName = computed(() => {
  const customer = paymentData.value?.customer || paymentData.value?.plan?.invoice?.customer;
  return customer?.name || 'عميل غير معروف';
});

const paymentMethodName = computed(() => {
  const method = paymentData.value?.payment_method;
  return typeof method === 'object' ? method.name : method || 'نقدي';
});

const close = () => {
  internalValue.value = false;
  emit('close');
};
</script>

<style scoped>
.success-icon-container {
  position: relative;
  display: inline-block;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: rgba(var(--v-theme-success), 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.premium-receipt {
  max-width: 460px;
  background: white;
  position: relative;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.receipt-top-edge {
  height: 6px;
  background-image: radial-gradient(circle at 10px 0, transparent 0, transparent 8px, #f1f5f9 8px, #f1f5f9 100%);
  background-size: 20px 6px;
  background-repeat: repeat-x;
}

.receipt-bottom-edge {
  height: 6px;
  background-image: radial-gradient(circle at 10px 6px, transparent 0, transparent 8px, #f1f5f9 8px, #f1f5f9 100%);
  background-size: 20px 6px;
  background-position: bottom;
  background-repeat: repeat-x;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.hero-row {
  background-color: #f8fafc;
  margin: 10px -15px;
  padding: 15px;
  border-radius: 8px;
  border-bottom: none !important;
}

.field-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}
.field-value {
  font-size: 0.95rem;
  color: #0f172a;
}

.mini-row {
  border-bottom: 1px solid #f1f5f9;
}
.bg-emerald-50 {
  background-color: #ecfdf5;
}
.text-emerald-900 {
  color: #064e3b;
}
.text-slate-400 {
  color: #94a3b8;
}
.text-slate-500 {
  color: #64748b;
}
.text-slate-700 {
  color: #334155;
}
.text-slate-900 {
  color: #0f172a;
}

.gap-2 {
  gap: 8px;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
