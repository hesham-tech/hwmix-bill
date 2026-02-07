<template>
  <v-dialog v-model="show" max-width="600px" persistent>
    <v-card v-if="subscription" rounded="lg" class="border overflow-hidden p-0">
      <v-toolbar color="primary" density="compact" class="px-2">
        <v-icon icon="ri-loop-right-line" class="me-2" />
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">تجديد اشتراك: {{ subscription.service?.name }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon="ri-close-line" variant="text" @click="show = false" />
      </v-toolbar>

      <v-card-text class="pa-2">
        <!-- Subscription Summary -->
        <div class="d-flex align-center justify-space-between mb-2 p-4 bg-grey-lighten-4 rounded-md border">
          <div>
            <div class="text-caption text-grey">العميل</div>
            <div class="font-weight-bold">{{ subscription.user?.full_name }}</div>
          </div>
          <div class="text-end">
            <div class="text-caption text-grey">تاريخ الانتهاء الحالي</div>
            <div class="font-weight-bold" :class="isExpired ? 'text-error' : ''">
              {{ formatDate(subscription.ends_at || subscription.next_billing_date) }}
            </div>
          </div>
        </div>

        <v-form ref="form" v-model="isValid">
          <v-row>
            <!-- Previous Balance Info -->
            <v-col cols="12">
              <div
                v-if="subscription.partial_payment > 0"
                class="d-flex justify-space-between bg-success-lighten-5 pa-2 rounded border border-success mb-2"
              >
                <span class="text-body-2 text-success">رصيد اشتراك سابق (مدفوع جزئي):</span>
                <span class="font-weight-bold text-success">{{ formatCurrency(subscription.partial_payment) }}</span>
              </div>
              <div
                v-else-if="subscription.partial_payment < 0"
                class="d-flex justify-space-between bg-error-lighten-5 pa-2 rounded border border-error mb-2"
              >
                <span class="text-body-2 text-error">مديونية اشتراك سابقة:</span>
                <span class="font-weight-bold text-error">{{ formatCurrency(Math.abs(subscription.partial_payment)) }}</span>
              </div>
            </v-col>

            <!-- Payment Amount -->
            <v-col cols="12" md="6">
              <AppInput
                v-model.number="paymentForm.amount"
                label="المبلغ المسدد *"
                type="number"
                required
                :rules="[v => v >= 0 || 'المبلغ يجب أن يكون 0 أو أكثر']"
                prepend-inner-icon="ri-money-dollar-circle-line"
                @update:model-value="calculateRenewal"
              />
            </v-col>

            <!-- Price Info -->
            <v-col cols="12" md="6">
              <AppInput
                v-model.number="subscription.price"
                label="سعر الخطة (للمراجعة)"
                type="number"
                disabled
                prepend-inner-icon="ri-price-tag-3-line"
              />
            </v-col>

            <!-- Payment Method -->
            <v-col cols="12" md="6">
              <AppAutocomplete
                v-model="paymentForm.payment_method_id"
                label="طريقة الدفع *"
                api-endpoint="payment-methods"
                item-title="name"
                item-value="id"
                required
                :rules="[v => !!v || 'يرجى اختيار طريقة الدفع']"
              />
            </v-col>

            <!-- Cash Box -->
            <v-col cols="12" md="6">
              <AppAutocomplete
                v-model="paymentForm.cash_box_id"
                label="الخزينة / الصندوق *"
                api-endpoint="cash-boxes"
                item-title="name"
                item-value="id"
                required
                :rules="[v => !!v || 'يرجى اختيار الخزينة']"
              />
            </v-col>

            <!-- Notes -->
            <v-col cols="12">
              <AppInput v-model="paymentForm.notes" label="ملاحظات الدفع" placeholder="أضف ملاحظات اختيارية هنا..." />
            </v-col>
          </v-row>
        </v-form>

        <!-- Renewal Forecast -->
        <div
          v-if="renewalForecast"
          class="mt-4 pa-4 border rounded-md"
          :class="renewalForecast.periods > 0 ? 'bg-primary-lighten-5' : 'bg-grey-lighten-4'"
        >
          <div class="d-flex align-center mb-2">
            <v-icon
              :icon="renewalForecast.periods > 0 ? 'ri-calendar-check-line' : 'ri-information-line'"
              class="me-2"
              :color="renewalForecast.periods > 0 ? 'primary' : 'grey'"
            />
            <div class="font-weight-bold">{{ renewalForecast.periods > 0 ? 'توقع التجديد' : 'معلومات الدفع' }}</div>
          </div>

          <div class="d-flex justify-space-between mb-1">
            <span class="text-body-2">سيتم التجديد لـ:</span>
            <span class="font-weight-bold"
              >{{ renewalForecast.periods }} {{ translateUnit(subscription.service?.period_unit, renewalForecast.periods) }}</span
            >
          </div>
          <div class="d-flex justify-space-between mb-1">
            <span class="text-body-2">تاريخ الانتهاء الجديد:</span>
            <span class="font-weight-bold text-primary">{{ formatDate(renewalForecast.newExpiry) }}</span>
          </div>
          <div class="d-flex justify-space-between border-t mt-2 pt-2">
            <span class="text-body-2">الرصيد المتبقي للاشتراك:</span>
            <span class="font-weight-bold" :class="renewalForecast.remainingBalance >= 0 ? 'text-success' : 'text-error'">{{
              formatCurrency(renewalForecast.remainingBalance)
            }}</span>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-spacer />
        <AppButton variant="text" @click="show = false">إلغاء</AppButton>
        <AppButton
          color="primary"
          :loading="processing"
          :disabled="!isValid || (paymentForm.amount === 0 && subscription.partial_payment <= 0)"
          prepend-icon="ri-check-double-line"
          @click="handleRenew"
        >
          تأكيد التجديد والتحصيل
        </AppButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { subscriptionApiService, apiClient } from '@/api';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { toast } from 'vue3-toastify';

const show = ref(false);
const processing = ref(false);
const isValid = ref(false);
const subscription = ref(null);

const paymentForm = reactive({
  amount: 0,
  payment_method_id: null,
  cash_box_id: null,
  notes: '',
});

const renewalForecast = ref(null);

const isExpired = computed(() => {
  if (!subscription.value) return false;
  const date = subscription.value.ends_at || subscription.value.next_billing_date;
  if (!date) return false;
  return new Date(date) < new Date();
});

const open = async sub => {
  subscription.value = sub;
  paymentForm.amount = sub.price || sub.service?.default_price || 0;
  paymentForm.notes = '';
  show.value = true;

  // Set defaults
  await setDefaults();

  calculateRenewal();
};

const setDefaults = async () => {
  try {
    // 1. Get Payment Methods to find "Cash"
    const pmRes = await apiClient.get('payment-methods');
    const methods = pmRes.data?.data?.data || pmRes.data?.data || [];
    const cashMethod = methods.find(m => m.code === 'cash' || m.name.includes('نقدي'));
    if (cashMethod) {
      paymentForm.payment_method_id = cashMethod.id;
    } else if (methods.length > 0) {
      paymentForm.payment_method_id = methods[0].id;
    }

    // 2. Get Cash Boxes to find Default
    const cbRes = await apiClient.get('cash-boxes');
    const boxes = cbRes.data?.data || cbRes.data || [];
    const defaultBox = boxes.find(b => b.is_default) || boxes[0];
    if (defaultBox) {
      paymentForm.cash_box_id = defaultBox.id;
    }
  } catch (error) {
    console.error('Error setting defaults:', error);
  }
};

const calculateRenewal = () => {
  if (!subscription.value) return;

  const price = Number(subscription.value.price || subscription.value.service?.default_price || 0);
  const currentBalance = Number(subscription.value.partial_payment || 0);
  const amount = Number(paymentForm.amount || 0);
  const total = amount + currentBalance;

  let periods = 0;
  let remainingBalance = total;

  if (price > 0) {
    periods = Math.floor(total / price);
    remainingBalance = total - periods * price;
  } else if (total > 0) {
    periods = 1;
    remainingBalance = total;
  }

  // Calculate new expiry
  const currentExpiry = subscription.value.ends_at || subscription.value.next_billing_date;
  let baseDate = new Date();

  // If current subscription is still active, start from its expiry
  if (currentExpiry) {
    const expiryDate = new Date(currentExpiry);
    if (!isNaN(expiryDate.getTime()) && expiryDate > baseDate) {
      baseDate = expiryDate;
    }
  }

  const unit = subscription.value.service?.period_unit || 'month';
  const periodVal = subscription.value.service?.period_value || 1;
  const val = periodVal * (periods > 0 ? periods : 0);

  const newExpiry = new Date(baseDate);
  if (periods > 0) {
    if (unit === 'week') newExpiry.setDate(newExpiry.getDate() + val * 7);
    else if (unit === 'month') newExpiry.setMonth(newExpiry.getMonth() + val);
    else if (unit === 'quarter') newExpiry.setMonth(newExpiry.getMonth() + val * 3);
    else if (unit === 'year') newExpiry.setFullYear(newExpiry.getFullYear() + val);
    else newExpiry.setMonth(newExpiry.getMonth() + val);
  }

  renewalForecast.value = {
    periods: isNaN(periods) ? 0 : periods,
    remainingBalance: isNaN(remainingBalance) ? 0 : remainingBalance,
    newExpiry: isNaN(newExpiry.getTime()) ? baseDate : newExpiry,
  };
};

const translateUnit = (unit, count) => {
  const units = {
    week: count === 1 ? 'أسبوع' : 'أسابيع',
    month: count === 1 ? 'شهر' : 'شهور',
    quarter: count === 1 ? 'ربع سنة' : 'فترات ربع سنوية',
    year: count === 1 ? 'سنة' : 'سنوات',
  };
  return units[unit] || 'فترة';
};

const handleRenew = async () => {
  if (!isValid.value) return;

  processing.value = true;
  try {
    const response = await subscriptionApiService.renew(subscription.value.id, paymentForm);
    toast.success('تم تجديد الاشتراك بنجاح');
    show.value = false;
    emit('success', response.data);
  } catch (error) {
    console.error(error);
  } finally {
    processing.value = false;
  }
};

const emit = defineEmits(['success']);
defineExpose({ open });
</script>

<style scoped>
.rounded-md {
  border-radius: 8px;
}
.bg-primary-lighten-5 {
  background-color: #e3f2fd;
}
.bg-success-lighten-5 {
  background-color: #e8f5e9;
}
.bg-error-lighten-5 {
  background-color: #ffebee;
}
</style>
