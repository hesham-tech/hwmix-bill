<template>
  <div class="payment-create-page">
    <div class="mb-6 px-6 pt-6 d-flex align-center">
      <AppButton icon="ri-large-arrow-right-line" variant="text" color="secondary" class="me-3" @click="handleCancel" />
      <div>
        <h1 class="text-h4 font-weight-bold">تسجيل معاملة تحصيل</h1>
        <p class="text-body-1 text-grey">إضافة رصيد جديد لفاتورة غير مسددة أو مسددة جزئياً</p>
      </div>
    </div>

    <div class="px-6 pb-6">
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <AppCard title="تفاصيل العملية المالية" icon="ri-money-dollar-box-line" class="mb-6">
          <v-row dense>
            <v-col cols="12" md="6">
              <AppAutocomplete
                v-model="formData.invoice_id"
                :items="invoices"
                :loading="loadingInvoices"
                item-title="invoice_number"
                item-value="id"
                label="الفاتورة المستهدفة *"
                placeholder="ابحث برقم الفاتورة"
                prepend-inner-icon="ri-file-list-3-line"
                :rules="[rules.required]"
                @update:model-value="handleInvoiceChange"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #subtitle>
                      <div class="d-flex align-center mt-1">
                        <v-icon icon="ri-user-line" size="14" class="me-1" />
                        <span class="me-3">{{ item.raw.customer?.name }}</span>
                        <v-icon icon="ri-money-dollar-circle-line" size="14" color="error" class="me-1" />
                        <span class="text-error font-weight-bold">متبقي: {{ formatCurrency(item.raw.remaining_amount) }}</span>
                      </div>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import { formatCurrency } from '@/utils/formatters';

const router = useRouter();
const invoicesApi = useApi('/api/invoices');
const paymentMethodsApi = useApi('/api/payment-methods');
const paymentsApi = useApi('/api/payments');

const formRef = ref(null);
const saving = ref(false);
const invoices = ref([]);
const paymentMethods = ref([]);
const loadingInvoices = ref(false);
const loadingMethods = ref(false);
const selectedInvoice = ref(null);

const formData = ref({
  invoice_id: null,
  amount: 0,
  payment_method_id: null,
  payment_date: new Date().toISOString().split('T')[0],
  notes: '',
});

const rules = {
  required: v => !!v || 'مطلوب',
};

const remainingAmount = computed(() => selectedInvoice.value?.remaining_amount || 0);

const handleInvoiceChange = invoiceId => {
  selectedInvoice.value = invoices.value.find(inv => inv.id === invoiceId);
  if (selectedInvoice.value) {
    formData.value.amount = selectedInvoice.value.remaining_amount || 0;
  }
};

const loadInvoices = async () => {
  loadingInvoices.value = true;
  try {
    const response = await invoicesApi.get({ payment_status: 'unpaid,partial', per_page: 100 }, { showLoading: false, showError: false });
    invoices.value = response.data || [];
  } finally {
    loadingInvoices.value = false;
  }
};

const loadPaymentMethods = async () => {
  loadingMethods.value = true;
  try {
    const response = await paymentMethodsApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    paymentMethods.value = response.data || [];
  } finally {
    loadingMethods.value = false;
  }
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    await paymentsApi.create(formData.value, { successMessage: 'تم تسجيل الدفعة بنجاح' });
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

onMounted(() => {
  loadInvoices();
  loadPaymentMethods();
});
</script>

<style scoped></style>
