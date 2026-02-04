<template>
  <AppDialog
    v-model="internalValue"
    :title="`تحصيل قسط #${installment?.id}`"
    icon="ri-hand-coin-line"
    max-width="600"
    :loading="saving"
    @confirm="handleSubmit"
    @cancel="close"
  >
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-row dense>
        <!-- Amount Info -->
        <v-col cols="12">
          <div class="pa-4 rounded-md bg-primary-lighten-5 border-primary border-opacity-25 mb-4 d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-primary font-weight-bold mb-1">المبلغ المطلوب تحصيله (المتبقي)</div>
              <div class="text-h5 font-weight-black text-primary">{{ formatCurrency(installment?.remaining ?? installment?.amount ?? 0) }}</div>
            </div>
            <v-icon icon="ri-money-dollar-circle-line" size="48" color="primary" class="opacity-25" />
          </div>
        </v-col>

        <!-- Amount Input (Editable if partial payment is allowed, but usually full for installments) -->
        <v-col cols="12" md="6">
          <AppInput
            v-model.number="form.amount"
            label="المبلغ المدفوع *"
            type="number"
            step="0.01"
            prepend-inner-icon="ri-coins-line"
            :rules="[rules.required, rules.positive]"
          />
        </v-col>

        <!-- Date -->
        <v-col cols="12" md="6">
          <AppInput v-model="form.payment_date" label="تاريخ التحصيل *" type="date" prepend-inner-icon="ri-calendar-line" :rules="[rules.required]" />
        </v-col>

        <!-- Payment Method -->
        <v-col cols="12" md="6">
          <v-select
            v-model="form.payment_method_id"
            :items="paymentMethods"
            :loading="loadingMethods"
            item-title="name"
            item-value="id"
            label="طريقة التحصيل *"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="ri-wallet-line"
            :rules="[rules.required]"
          />
        </v-col>

        <!-- Cash Box -->
        <v-col cols="12" md="6">
          <v-select
            v-model="form.cash_box_id"
            :items="cashBoxes"
            :loading="loadingCashBoxes"
            item-title="name"
            item-value="id"
            label="الخزنة / الصندوق *"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="ri-safe-2-line"
            :rules="[rules.required]"
          />
        </v-col>

        <!-- Reference Number -->
        <v-col cols="12" md="6">
          <AppInput v-model="form.reference_number" label="رقم المرجع" placeholder="رقم العملية أو الشيك" prepend-inner-icon="ri-hashtag" />
        </v-col>

        <!-- Notes -->
        <v-col cols="12">
          <v-textarea
            v-model="form.notes"
            label="ملاحظات"
            placeholder="أدخل أي ملاحظات إضافية..."
            rows="2"
            variant="outlined"
            prepend-inner-icon="ri-article-line"
            hide-details
          />
        </v-col>
      </v-row>
    </v-form>

    <!-- Surplus Handling Dialog -->
    <AppConfirmDialog ref="excessDialogRef" />
  </AppDialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { AppDialog, AppInput, AppConfirmDialog } from '@/components';
import { useApi } from '@/composables/useApi';
import { installmentService } from '@/api';
import { useUserStore } from '@/stores/user';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  modelValue: Boolean,
  installment: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'success']);

const internalValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const formRef = ref(null);
const excessDialogRef = ref(null);
const saving = ref(false);
const loadingMethods = ref(false);
const loadingCashBoxes = ref(false);
const paymentMethods = ref([]);
const cashBoxes = ref([]);

const form = ref({
  amount: 0,
  payment_method_id: null,
  cash_box_id: null,
  payment_date: new Date().toISOString().split('T')[0],
  reference_number: '',
  notes: '',
});

const rules = {
  required: v => !!v || 'مطلوب',
  positive: v => v > 0 || 'يجب أن يكون المبلغ أكبر من صفر',
};

// APIs
const paymentMethodsApi = useApi('/api/payment-methods');
const cashBoxesApi = useApi('/api/cash-boxes');

const loadData = async () => {
  loadingMethods.value = true;
  loadingCashBoxes.value = true;
  try {
    const [methodsRes, boxesRes] = await Promise.all([
      paymentMethodsApi.get({ active: true, per_page: -1 }, { showLoading: false }),
      cashBoxesApi.get({ per_page: -1 }, { showLoading: false }),
    ]);

    paymentMethods.value = methodsRes.data;
    cashBoxes.value = boxesRes.data;

    // Default selection
    if (!form.value.payment_method_id) {
      const cashMethod = paymentMethods.value.find(m => m.code === 'cash');
      if (cashMethod) form.value.payment_method_id = cashMethod.id;
    }

    if (!form.value.cash_box_id) {
      const userStore = useUserStore();
      const defaultBoxId = userStore.currentUser?.cash_box_default_id;
      const defaultBox = cashBoxes.value.find(b => b.id === defaultBoxId) || cashBoxes.value.find(b => b.is_default);
      if (defaultBox) form.value.cash_box_id = defaultBox.id;
    }
  } finally {
    loadingMethods.value = false;
    loadingCashBoxes.value = false;
  }
};

// Auto-select payment method based on cash box type
watch(
  () => form.value.cash_box_id,
  newBoxId => {
    if (!newBoxId) return;
    const selectedBox = cashBoxes.value.find(b => b.id === newBoxId);
    if (selectedBox) {
      const matchKey = selectedBox.cash_type || 'cash';
      const matchingMethod = paymentMethods.value.find(
        m => m.name.toLowerCase() === matchKey.toLowerCase() || m.code.toLowerCase() === matchKey.toLowerCase()
      );
      if (matchingMethod) form.value.payment_method_id = matchingMethod.id;
    }
  }
);

watch(
  () => props.installment,
  newVal => {
    if (newVal) {
      form.value.amount = newVal.remaining ?? newVal.amount;
      form.value.payment_date = new Date().toISOString().split('T')[0];
    }
  },
  { immediate: true }
);

const close = () => {
  internalValue.value = false;
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const payload = {
      ...form.value,
      installment_plan_id: props.installment.installment_plan_id,
      installment_ids: [props.installment.id],
      paid_at: form.value.payment_date, // Align with backend expected name if needed
    };

    const response = await installmentService.pay(payload, { showToast: false });

    if (response.success) {
      const { excess_amount } = response.data;

      // Handle excess amount
      if (excess_amount > 0) {
        const confirmResult = await excessDialogRef.value.open({
          title: 'وجود مبلغ زائد',
          message: `تم دفع كل الأقساط المحددة ويوجد مبلغ زائد قدره ${formatCurrency(excess_amount)}. هل تريد إضافة هذا المبلغ إلى رصيد العميل؟`,
          confirmText: 'إضافة للرصيد',
          cancelText: 'إنهاء (إرجاع نقدي)',
          icon: 'ri-scales-3-line',
          color: 'warning',
        });

        if (confirmResult) {
          await installmentService.depositExcess({
            installment_plan_id: props.installment.installment_plan_id,
            amount: excess_amount,
            notes: `فائض تحصيل أقساط - دفعة #${response.data.payment_record.id}`,
          });
        }
      }

      emit('success', response.data);
      close();
    }
  } catch (error) {
    console.error('Payment failed:', error);
  } finally {
    saving.value = false;
  }
};

onMounted(loadData);
</script>
