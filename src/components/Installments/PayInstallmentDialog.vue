<template>
  <v-dialog v-model="payDialog" max-width="500px" persistent>
    <v-card class="rounded-lg">
      <!-- Header -->
      <v-card-title class="text-h5 pa-5 bg-primary">
        <v-icon start class="ml-2">ri-wallet-3-line</v-icon>
        سداد القسط
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- حالة التحميل -->
        <template v-if="payDialog && isLoading">
          <div class="d-flex flex-column align-center justify-center py-10">
            <v-progress-circular indeterminate color="primary" size="64" width="6" class="mb-4"></v-progress-circular>
            <p class="text-h6 text-medium-emphasis mb-2">جاري معالجة الدفع...</p>
            <p class="text-body-2 text-medium-emphasis">الرجاء الانتظار</p>
          </div>
        </template>

        <!-- نموذج الدفع -->
        <template v-else-if="payDialog && !isLoading && !alreadyPaid && !directPay">
          <v-form ref="payForm" v-model="valid">
            <!-- مبلغ السداد -->
            <div class="mb-4">
              <v-text-field
                variant="outlined"
                label="مبلغ السداد"
                v-model="payData.amount"
                type="number"
                :rules="[v => !!v || 'المبلغ مطلوب', v => v > 0 || 'المبلغ يجب أن يكون أكبر من صفر']"
                required
                density="comfortable"
                color="primary"
              >
                <template v-slot:prepend-inner>
                  <v-icon color="primary">ri-money-dollar-circle-line</v-icon>
                </template>
              </v-text-field>
            </div>

            <!-- تاريخ السداد -->
            <div class="mb-4">
              <v-text-field variant="outlined" label="تاريخ السداد" v-model="payData.paid_at" type="date" density="comfortable" color="primary">
                <template v-slot:prepend-inner>
                  <v-icon color="primary">ri-calendar-line</v-icon>
                </template>
              </v-text-field>
            </div>

            <!-- طريقة الدفع -->
            <div class="mb-4">
              <v-select
                variant="outlined"
                label="طريقة الدفع"
                v-model="payData.payment_method_id"
                :items="paymentMethods"
                item-title="name"
                item-value="id"
                :rules="[v => !!v || 'اختر طريقة الدفع']"
                required
                density="comfortable"
                color="primary"
              >
                <template v-slot:prepend-inner>
                  <v-icon color="primary">ri-bank-card-line</v-icon>
                </template>
              </v-select>
            </div>

            <!-- صندوق النقدية -->
            <div class="mb-4">
              <v-select
                variant="outlined"
                label="صندوق النقدية"
                v-model="payData.cash_box_id"
                :items="cashboxes"
                item-title="name"
                item-value="id"
                :rules="[v => !!v || 'اختر صندوق النقدية']"
                density="comfortable"
                color="primary"
              >
                <template v-slot:prepend-inner>
                  <v-icon color="primary">ri-safe-line</v-icon>
                </template>
              </v-select>
            </div>

            <!-- ملاحظات -->
            <div>
              <v-textarea
                variant="outlined"
                label="ملاحظات (اختياري)"
                v-model="payData.notes"
                rows="2"
                density="comfortable"
                color="primary"
                auto-grow
              >
                <template v-slot:prepend-inner>
                  <v-icon color="primary">ri-file-text-line</v-icon>
                </template>
              </v-textarea>
            </div>
          </v-form>
        </template>

        <!-- حالة النجاح -->
        <template v-else-if="payDialog && !isLoading && alreadyPaid && dataReturn">
          <div class="text-center py-4">
            <!-- أيقونة النجاح -->
            <div class="mb-4">
              <v-avatar size="80" color="success" class="elevation-4">
                <v-icon size="50" color="white">ri-checkbox-circle-fill</v-icon>
              </v-avatar>
            </div>

            <!-- رسالة النجاح -->
            <h3 class="text-h5 mb-2 font-weight-bold">تمت العملية بنجاح!</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">تم تسجيل الدفع في النظام</p>

            <!-- معلومات الدفع -->
            <v-card variant="tonal" color="success" class="mb-4">
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-body-2">المبلغ المدفوع:</span>
                  <span class="text-h6 font-weight-bold"> {{ dataReturn?.payment_record?.amount_paid }} ج.م </span>
                </div>
                <div v-if="dataReturn?.payment_record?.excess_amount" class="mt-3">
                  <v-divider class="mb-3"></v-divider>
                  <v-alert type="info" variant="tonal" density="compact" class="text-start">
                    <div class="text-body-2">
                      <div class="font-weight-bold mb-1">مبلغ متبقٍ</div>
                      <div>
                        تم دفع جميع الأقساط المستحقة، ويوجد مبلغ متبقٍ بقيمة
                        <span class="font-weight-bold"> {{ dataReturn?.payment_record?.excess_amount }} ج.م </span>
                      </div>
                    </div>
                  </v-alert>
                </div>
              </v-card-text>
            </v-card>

            <!-- الأقساط المدفوعة -->
            <div class="text-start">
              <div class="d-flex align-center mb-3">
                <v-icon start color="primary">ri-file-list-3-line</v-icon>
                <span class="text-subtitle-1 font-weight-bold">الأقساط التي تم دفعها</span>
              </div>

              <div v-if="dataReturn?.paid_installments?.length">
                <v-card v-for="installment in dataReturn.paid_installments" :key="installment.id" variant="outlined" class="mb-2">
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-avatar size="32" :color="installment.remaining != '0.00' ? 'warning' : 'success'" class="ml-3">
                          <span class="text-body-2 font-weight-bold">
                            {{ installment.installment_number }}
                          </span>
                        </v-avatar>
                        <div>
                          <div class="text-body-2 font-weight-medium">قسط رقم {{ installment.installment_number }}</div>
                          <div class="text-caption text-medium-emphasis">
                            {{ installment.due_date.split(' ')[0] }}
                          </div>
                        </div>
                      </div>
                      <div class="text-left">
                        <v-chip :color="installment.remaining != '0.00' ? 'warning' : 'success'" size="small" variant="flat">
                          <v-icon start size="16">
                            {{ installment.remaining != '0.00' ? 'ri-time-line' : 'ri-check-line' }}
                          </v-icon>
                          <span v-if="installment.remaining != '0.00'"> باقي {{ installment.remaining }} ج.م </span>
                          <span v-else> مدفوع {{ installment.amount }} ج.م </span>
                        </v-chip>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <v-alert v-else type="info" variant="tonal" density="compact" class="text-center"> لا توجد أقساط مدفوعة لعرضها </v-alert>
            </div>
          </div>
        </template>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-5 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closePayDialog" size="large">
          {{ alreadyPaid ? 'إغلاق' : 'إلغاء' }}
        </v-btn>
        <v-btn
          v-if="payDialog && !isLoading && !alreadyPaid && !directPay"
          color="primary"
          :disabled="!valid"
          @click="submitPayment"
          size="large"
          variant="flat"
        >
          <v-icon start>ri-check-line</v-icon>
          تأكيد الدفع
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getAll, saveItem } from '@/services/api';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const props = defineProps({
  installment: Object,
  modelValue: Boolean,
  directPay: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue', 'update:installment']);

const payDialog = ref(false);
const dataReturn = ref(null);
const isLoading = ref(false);
const valid = ref(false);
const alreadyPaid = ref(false);

const payData = ref({
  amount: '',
  paid_at: new Date().toISOString().substr(0, 10),
  payment_method_id: '',
  cash_box_id: null,
  notes: '',
  installment_ids: [],
});

const paymentMethods = ref([]);
const cashboxes = ref([]);
const cashBoxDefaultId = ref(null);
const payForm = ref(null);

async function fetchPaymentMethods() {
  try {
    const { data } = await getAll('payment-methods', { per_page: -1 }, true, false, false);
    paymentMethods.value = data || [];
  } catch (error) {
    console.error('خطأ في جلب طرق الدفع:', error);
  }
}

async function fetchCashboxes() {
  try {
    await userStore.fetchUser();
    cashBoxDefaultId.value = userStore.user?.cash_box_id || null;
    cashboxes.value = userStore.user?.cashBoxes || [];
  } catch (error) {
    console.error('خطأ في جلب صناديق النقدية:', error);
  }
}

onMounted(async () => {
  await Promise.all([fetchPaymentMethods(), fetchCashboxes()]);

  const methodsLoaded = paymentMethods.value.length > 0;
  const defaultBoxSet = !!cashBoxDefaultId.value;
  const currentInstallment = props.installment;

  if (currentInstallment && methodsLoaded && defaultBoxSet) {
    setupPaymentData(currentInstallment);

    if (props.directPay && !alreadyPaid.value && !isLoading.value) {
      submitPayment();
    }
  }
});

function setupPaymentData(newInstallment) {
  if (!newInstallment) return;

  payData.value.installment_ids = [newInstallment.id];
  payData.value.amount = newInstallment.remaining;
  payData.value.user_id = newInstallment.user_id;
  payData.value.installment_plan_id = newInstallment.installment_plan_id;
  payData.value.notes = '';

  const cashMethod = paymentMethods.value.find(m => m.code?.trim().toLowerCase() === 'cash');
  payData.value.payment_method_id = cashMethod?.id || '';
  payData.value.cash_box_id = cashBoxDefaultId.value;
}

watch(
  () => props.installment,
  newInstallment => {
    const methodsLoaded = paymentMethods.value.length > 0;
    const defaultBoxSet = !!cashBoxDefaultId.value;

    if (newInstallment && methodsLoaded && defaultBoxSet) {
      setupPaymentData(newInstallment);

      if (props.directPay && !alreadyPaid.value && !isLoading.value) {
        submitPayment();
      }
    }
  }
);

watch(
  () => props.modelValue,
  newVal => {
    payDialog.value = newVal;

    if (newVal && props.installment && !alreadyPaid.value) {
      payData.value.amount = props.installment.remaining || props.installment.amount;
    }

    if (!newVal) {
      resetStateOnClose();
    }
  }
);

function resetStateOnClose() {
  payData.value = {
    amount: '',
    paid_at: new Date().toISOString().substr(0, 10),
    payment_method_id: '',
    cash_box_id: null,
    notes: '',
    installment_ids: [],
  };

  alreadyPaid.value = false;
  isLoading.value = false;
  dataReturn.value = null;

  if (payForm.value) payForm.value.resetValidation();
}

function closePayDialog() {
  emit('update:modelValue', false);
}

async function submitPayment() {
  if (!props.directPay) {
    const { valid: formValid } = await payForm.value.validate();
    if (!formValid) return;
  }

  isLoading.value = true;

  try {
    const response = await saveItem('installment-payment/pay', payData.value, false, false);
    dataReturn.value = response.data;
    alreadyPaid.value = true;
    emit('update:installment', response);
  } catch (error) {
    console.error('خطأ في إرسال الدفع:', error);
    alert('حدث خطأ أثناء الدفع: ' + (error.response?.data?.message || error.message));
    alreadyPaid.value = false;
    dataReturn.value = null;
  } finally {
    isLoading.value = false;
  }
}
</script>
