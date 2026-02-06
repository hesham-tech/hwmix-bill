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
          <!-- Print Only Header -->
          <!-- This section is now handled by AppReceipt for printing -->

          <!-- Fields Grid (Table-like, border-bottom) -->
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

            <div v-if="paymentData?.reference_number" class="field-row">
              <span class="field-label">رقم المرجع / الشيك</span>
              <span class="field-value font-weight-bold">{{ paymentData?.reference_number }}</span>
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

        <!-- Receipt Bottom Edge -->
        <div class="receipt-bottom-edge"></div>
      </div>

      <!-- Quick Tips / Info -->
      <div v-if="nextInstallment" class="mx-auto max-w-sm px-4 text-center opacity-80">
        <p class="text-caption text-slate-500">
          <v-icon icon="ri-calendar-check-line" size="14" class="me-1" />
          تم تحديد القسط القادم بتاريخ <strong>{{ formatDate(nextInstallment.due_date) }}</strong>
        </p>
      </div>
    </div>

    <!-- Redesigned Action Buttons -->
    <template #actions>
      <div class="flex-column gap-2 w-full no-print px-1 pb-2">
        <v-btn
          block
          size="large"
          color="primary"
          variant="elevated"
          class="rounded-md font-weight-bold mb-2"
          prepend-icon="ri-printer-fill"
          @click="handlePrint"
        >
          طباعة
        </v-btn>

        <v-btn block size="large" variant="tonal" color="secondary" class="rounded-md font-weight-bold" @click="close"> إغلاق </v-btn>
      </div>
    </template>
  </AppDialog>
</template>

<script setup>
import { computed } from 'vue';
import { AppDialog } from '@/components';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { usePrint } from '@/modules/print/composables/usePrint';

const props = defineProps({
  modelValue: Boolean,
  paymentDetails: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'close']);

const { printInstallment } = usePrint();

const internalValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const paymentData = computed(() => {
  // BaseService wraps single results in an array. Handle both array and object.
  const details = Array.isArray(props.paymentDetails) ? props.paymentDetails[0] : props.paymentDetails;

  // Robust check for the record itself (handling possible Laravel resource wrapping)
  const record = details?.payment_record || details;

  return record?.data || record || {};
});

const nextInstallment = computed(() => {
  const details = Array.isArray(props.paymentDetails) ? props.paymentDetails[0] : props.paymentDetails;
  return details?.next_installment;
});

const excessAmount = computed(() => {
  const details = Array.isArray(props.paymentDetails) ? props.paymentDetails[0] : props.paymentDetails;
  return details?.excess_amount || 0;
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
  // استخدام الحقل الموحد "name" الذي يضمنه الباك إند الآن
  const customer = paymentData.value?.customer || paymentData.value?.plan?.invoice?.customer;
  return customer?.name || 'عميل غير معروف';
});

const paymentMethodName = computed(() => {
  const method = paymentData.value?.payment_method;
  return typeof method === 'object' ? method.name : method || 'نقدي';
});

const cashBoxName = computed(() => {
  return paymentData.value?.cash_box?.name || 'الخزنة الرئيسية';
});

const companyName = computed(() => {
  return userStore.currentCompany?.name || paymentData.value?.plan?.invoice?.company?.name || 'المتجر الإلكتروني';
});

const companyLogo = computed(() => {
  return userStore.currentCompany?.logo_url || userStore.currentCompany?.logo || paymentData.value?.plan?.invoice?.company?.logo_url;
});

const printFormat = computed(() => {
  return userStore.currentCompany?.print_settings?.print_format || 'thermal';
});

const close = () => {
  internalValue.value = false;
  emit('close');
};

const handlePrint = async () => {
  try {
    await printInstallment({
      payment: paymentData.value,
      customer: { name: customerName.value },
      installments: paidInstallments.value,
      plan: { remaining_amount: remainingAmount.value },
    });

    // Close dialog after print
    setTimeout(() => close(), 300);
  } catch (error) {
    console.error('[PaymentSuccessDialog] Print error:', error);
  }
};
</script>

<style scoped>
.success-content {
  max-width: 100%;
}

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

/* Premium Receipt Styles */
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

.field-row:last-child {
  border-bottom: none;
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

.hero-row {
  background-color: #f8fafc;
  margin: 10px -15px;
  padding: 15px;
  border-radius: 8px;
  border-bottom: none !important;
}

.mini-row {
  border-bottom: 1px solid #f1f5f9;
}

.border-b-light {
  border-bottom: 1px solid #f1f5f9;
}

.bg-slate-50 {
  background-color: #f8fafc;
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

.dashed-divider {
  border-top: 2px dashed #e2e8f0;
}

.gap-2 {
  gap: 8px;
}

@media print {
  /* Standard Print Hiding */
  .v-overlay-container,
  .v-navigation-drawer,
  .v-app-bar,
  .v-footer,
  .no-print,
  .v-overlay__scrim {
    display: none !important;
  }

  /* Force the receipt to show */
  #receipt-print-area {
    display: none !important;
  }
  .print-only {
    display: none !important;
  }
}
</style>
