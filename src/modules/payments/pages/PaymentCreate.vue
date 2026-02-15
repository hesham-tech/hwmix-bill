<template>
  <div class="payment-create-page">
    <div class="mb-2 px-6 pt-6 d-flex align-center">
      <AppButton icon="ri-large-arrow-right-line" variant="text" color="secondary" class="me-3" @click="handleCancel" />
      <div>
        <h1 class="text-h4 font-weight-bold">تسجيل معاملة تحصيل</h1>
        <p class="text-body-1 text-grey">إضافة رصيد جديد لفاتورة غير مسددة أو مسددة جزئياً</p>
      </div>
    </div>

    <div class="px-6 pb-6">
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <AppCard title="تفاصيل العملية المالية" icon="ri-money-dollar-box-line" class="mb-2">
          <v-row dense>
            <v-col cols="12" md="6">
              <AppAutocomplete
                v-model="formData.invoice_id"
                label="اختر الفاتورة"
                :api-endpoint="invoicesEndpoint"
                item-title="invoice_number"
                item-value="id"
                required
                placeholder="ابحث برقم الفاتورة"
                prepend-inner-icon="ri-file-list-3-line"
                :rules="[rules.required]"
                @update:model-value="handleInvoiceChange"
              >
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :subtitle="`${item.raw.user?.full_name || 'عميل'} - المتبقي: ${formatCurrency(item.raw.remaining_amount)}`"
                  >
                    <template #title>
                      <div class="font-weight-bold">{{ item.raw.invoice_number }}</div>
                    </template>
                  </v-list-item>
                </template>
              </AppAutocomplete>
            </v-col>

            <v-col cols="12" md="6">
              <AppInput
                v-model.number="formData.amount"
                label="القيمة المحصلة *"
                type="number"
                step="0.01"
                placeholder="ادخل المبلغ"
                prepend-inner-icon="ri-money-dollar-circle-line"
                :rules="[rules.required]"
                :hint="
                  remainingAmount ? `الحد الأقصى المتبقي لهذه الفاتورة: ${formatCurrency(remainingAmount)}` : 'سيتم خصم هذا المبلغ من رصيد الفاتورة'
                "
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.payment_method_id"
                :items="paymentMethods"
                :loading="loadingMethods"
                item-title="name"
                item-value="id"
                label="طريقة التحصيل *"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="ri-wallet-line"
                :rules="[rules.required]"
                hide-details
                class="mb-4"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.cash_box_id"
                :items="cashBoxes"
                :loading="loadingCashBoxes"
                item-title="name"
                item-value="id"
                label="الخزنة / الصندوق *"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="ri-safe-2-line"
                :rules="[rules.required]"
                hide-details
                class="mb-4"
              />
            </v-col>

            <v-col cols="12" md="6">
              <AppInput
                v-model="formData.payment_date"
                label="تاريخ التحصيل *"
                type="date"
                prepend-inner-icon="ri-calendar-line"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.notes"
                label="ملاحظات وسند الصرف"
                placeholder="أدخل أي ملاحظات إضافية هنا..."
                rows="3"
                variant="outlined"
                prepend-inner-icon="ri-article-line"
                hide-details
              />
            </v-col>
          </v-row>

          <!-- ملخص العملية المالية -->
          <v-expand-transition>
            <div v-if="formData.invoice_id" class="mt-6 p-4 rounded-md bg-blue-grey-lighten-5 border">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-icon color="primary" class="me-2">ri-calculator-line</v-icon>
                  <span class="text-subtitle-1 font-weight-bold">ملخص الحسبة المالية</span>
                </div>
                <v-switch
                  v-if="userBalance >= 1"
                  v-model="formData.use_credit"
                  label="استخدام رصيد العميل المتاح"
                  color="primary"
                  hide-details
                  density="compact"
                />
              </div>

              <v-row dense>
                <v-col cols="12" md="4">
                  <div class="p-3 bg-white rounded border text-center relative-container">
                    <div class="text-caption text-grey d-flex align-center justify-center">
                      {{ userBalance >= 0 ? 'رصيد العميل الحالي' : 'مطلوبات سابقة (مديونية)' }}
                      <v-btn
                        icon="ri-refresh-line"
                        size="x-small"
                        variant="text"
                        color="primary"
                        class="ms-1"
                        :loading="loadingInvoices"
                        @click="handleInvoiceChange(formData.invoice_id)"
                      />
                    </div>
                    <div class="text-h6 font-weight-bold" :class="userBalance > 0 ? 'text-success' : userBalance < 0 ? 'text-error' : ''">
                      {{ formatCurrency(userBalance) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="p-3 bg-white rounded border text-center">
                    <div class="text-caption text-grey">إجمالي المتوفر للسداد</div>
                    <div class="text-h6 font-weight-bold text-primary">
                      {{ formatCurrency(totalFundsAvailable) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="p-3 bg-white rounded border text-center">
                    <div class="text-caption text-grey">المتبقي المطلوب للفاتورة</div>
                    <div class="text-h6 font-weight-bold text-error">
                      {{ formatCurrency(remainingAmount) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="p-3 bg-white rounded border text-center">
                    <div class="text-caption text-grey">سيتم سداد من الفاتورة:</div>
                    <div class="text-h6 font-weight-bold text-error">
                      {{ formatCurrency(appliedToInvoice) }}
                    </div>
                  </div>
                </v-col>

                <v-col cols="12">
                  <div class="p-3 bg-white rounded border text-center">
                    <div class="text-caption text-grey">المتبقي في الفاتورة بعد العملية:</div>
                    <div class="text-h6 font-weight-bold text-error">
                      {{ formatCurrency(Math.max(0, remainingAmount - appliedToInvoice)) }}
                    </div>
                  </div>
                </v-col>
                <v-col v-if="overpaidAmount > 0" cols="12" md="4">
                  <div class="p-3 bg-white rounded border text-center">
                    <div class="text-caption text-grey">سيضاف لرصيد العميل (فائض):</div>
                    <div class="text-h6 font-weight-bold text-error">
                      {{ formatCurrency(overpaidAmount) }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <template #actions>
            <div class="d-flex w-100 align-center gap-3">
              <AppButton variant="text" color="secondary" @click="handleCancel"> تراجع </AppButton>
              <v-spacer />
              <AppButton color="primary" type="submit" :loading="saving" prepend-icon="ri-save-line" class="px-8"> تأكيد وتسجيل الدفعة </AppButton>
            </div>
          </template>
        </AppCard>
      </v-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import { formatCurrency } from '@/utils/formatters';

const router = useRouter();
const route = useRoute(); // Added useRoute
const invoicesApi = useApi('/api/invoices');
const paymentMethodsApi = useApi('/api/payment-methods');
const paymentsApi = useApi('/api/payments');

const formRef = ref(null);
const saving = ref(false);
const invoices = ref([]);
const paymentMethods = ref([]);
const cashBoxes = ref([]);
const loadingInvoices = ref(false);
const loadingMethods = ref(false);
const loadingCashBoxes = ref(false);
const selectedInvoice = ref(null);

const formData = ref({
  invoice_id: null,
  user_id: null,
  amount: 0,
  payment_method_id: null,
  cash_box_id: null,
  payment_date: new Date().toISOString().split('T')[0],
  method: 'cash',
  is_split: false,
  notes: '',
  use_credit: true,
});

// مراقبة تغيير الصندوق لاختيار طريقة الدفع المناسبة تلقائياً
watch(
  () => formData.value.cash_box_id,
  newBoxId => {
    if (!newBoxId) return;
    const selectedBox = cashBoxes.value.find(b => b.id === newBoxId);
    if (selectedBox && selectedBox.cash_type) {
      const matchingMethod = paymentMethods.value.find(
        m =>
          m.name.trim().toLowerCase() === selectedBox.cash_type.trim().toLowerCase() ||
          m.code.trim().toLowerCase() === selectedBox.cash_type.trim().toLowerCase()
      );
      if (matchingMethod) {
        formData.value.payment_method_id = matchingMethod.id;
      }
    }
  }
);

const rules = {
  required: v => !!v || 'مطلوب',
};

const invoicesEndpoint = computed(() => {
  let endpoint = 'invoices?due_only=1';
  if (formData.value.user_id) {
    endpoint += `&user_id=${formData.value.user_id}`;
  }
  return endpoint;
});

const remainingAmount = computed(() => (selectedInvoice.value?.remaining_amount ? parseFloat(selectedInvoice.value.remaining_amount) : 0));
const userBalance = computed(() => (selectedInvoice.value?.user_balance ? parseFloat(selectedInvoice.value.user_balance) : 0));

const totalFundsAvailable = computed(() => {
  const cash = parseFloat(formData.value.amount) || 0;
  const credit = formData.value.use_credit && userBalance.value >= 1 ? userBalance.value : 0;
  return cash + credit;
});

const appliedToInvoice = computed(() => {
  return Math.min(totalFundsAvailable.value, remainingAmount.value);
});

const overpaidAmount = computed(() => {
  if (totalFundsAvailable.value > remainingAmount.value) {
    return totalFundsAvailable.value - remainingAmount.value;
  }
  return 0;
});

const handleInvoiceChange = async invoiceId => {
  if (!invoiceId) {
    selectedInvoice.value = null;
    formData.value.amount = 0;
    formData.value.user_id = null;
    return;
  }

  // Fetch the selected invoice details if it's a new selection
  if (!selectedInvoice.value || selectedInvoice.value.id !== invoiceId) {
    loadingInvoices.value = true;
    try {
      const response = await invoicesApi.getById(invoiceId, { showLoading: false, showError: false });
      selectedInvoice.value = response.data;
    } catch (error) {
      console.error('Failed to fetch invoice details:', error);
      selectedInvoice.value = null;
    } finally {
      loadingInvoices.value = false;
    }
  }

  if (selectedInvoice.value) {
    formData.value.amount = selectedInvoice.value.remaining_amount || 0;
    formData.value.user_id = selectedInvoice.value.user_id;
  }
};

const loadInvoices = async () => {
  loadingInvoices.value = true;
  try {
    const response = await invoicesApi.get({ payment_status: 'unpaid,partial', per_page: 100 }, { showLoading: false, showError: false });
    invoices.value = Array.isArray(response.data) ? response.data : response.data?.data || [];
  } finally {
    loadingInvoices.value = false;
  }
};

const loadPaymentMethods = async () => {
  loadingMethods.value = true;
  try {
    // جلب طرق الدفع الخاصة بالشركة فقط (نشطة)
    const response = await paymentMethodsApi.get({ active: true, per_page: -1 }, { showLoading: false, showError: false });
    paymentMethods.value = Array.isArray(response.data) ? response.data : response.data?.data || [];

    // تعيين "نقدي" كخيار افتراضي تلقائياً
    if (!formData.value.payment_method_id) {
      const cashMethod = paymentMethods.value.find(m => m.code === 'cash');
      if (cashMethod) {
        formData.value.payment_method_id = cashMethod.id;
      }
    }
  } finally {
    loadingMethods.value = false;
  }
};

const loadCashBoxes = async () => {
  const cashBoxesApi = useApi('/api/cash-boxes');
  loadingCashBoxes.value = true;
  try {
    // جلب الصناديق الخاصة بالمستخدم الحالي فقط (الباك إند يقوم بالفلترة تلقائياً)
    const response = await cashBoxesApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    cashBoxes.value = Array.isArray(response.data) ? response.data : response.data?.data || [];

    // تعيين الصندوق الافتراضي إذا وجد
    const defaultBox = cashBoxes.value.find(b => b.is_default);
    if (defaultBox) {
      formData.value.cash_box_id = defaultBox.id;
    }
  } finally {
    loadingCashBoxes.value = false;
  }
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const payload = {
    ...formData.value,
    cash_amount: formData.value.amount || 0,
    credit_amount: formData.value.use_credit && userBalance.value >= 1 ? userBalance.value : 0,
  };

  saving.value = true;
  try {
    await paymentsApi.create(payload, { successMessage: 'تم تسجيل الدفعة بنجاح' });
    router.push('/payments');
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push('/payments');
};

const formatCurrencyLocal = amount => {
  return formatCurrency(amount);
};

onMounted(async () => {
  // استقبال invoice_id من الـ query إن وجد
  if (route.query.invoice_id) {
    formData.value.invoice_id = Number(route.query.invoice_id);
    handleInvoiceChange(formData.value.invoice_id);
  } else if (route.query.user_id) {
    // إذا تم تمرير user_id فقط، نحاول جلب أول فاتورة مستحقة له لتسهيل المهمة
    const userId = Number(route.query.user_id);
    formData.value.user_id = userId;

    try {
      loadingInvoices.value = true;
      const response = await invoicesApi.get({ user_id: userId, due_only: 1, per_page: 1 }, { showLoading: false, showError: false });
      const firstInvoice = response.data?.data?.[0] || response.data?.[0];
      if (firstInvoice) {
        formData.value.invoice_id = firstInvoice.id;
        handleInvoiceChange(firstInvoice.id);
      }
    } catch (error) {
      console.error('Failed to pre-fetch user invoice:', error);
    } finally {
      loadingInvoices.value = false;
    }
  }

  await loadPaymentMethods(); // تحميل طرق الدفع أولاً لتمكين الاختيار التلقائي عند تحميل الصناديق
  loadCashBoxes();
});
</script>

<style scoped></style>
