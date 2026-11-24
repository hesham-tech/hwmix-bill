<template>
  <AppDialog
    v-model="internalValue"
    :title="installment?.id ? `تحصيل قسط #${installment.id}` : 'تحصيل أقساط الخطة'"
    icon="ri-hand-coin-line"
    max-width="600"
    :loading="saving"
    @confirm="handleSubmit"
    @cancel="close"
  >
    <v-alert v-if="paymentError" type="error" variant="tonal" class="mb-3" role="alert">{{ paymentError }}</v-alert>
    <v-form ref="formRef" :disabled="saving || !!pendingPayment" @submit.prevent="handleSubmit">
      <v-row dense>
        <!-- Amount Info -->
        <v-col cols="12">
          <div class="pa-4 rounded-md bg-primary-lighten-5 border-primary border-opacity-25 mb-4 d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-primary font-weight-bold mb-1 d-flex align-center">
                <span>المبلغ المطلوب تحصيله (المتبقي)</span>
                <AppActionHelp action-key="installment_payment" color="primary" size="x-small" class="ms-1" />
              </div>
              <div class="text-h5 font-weight-bold text-primary">{{ formatCurrency(targetRemaining) }}</div>
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
            required
            :rules="[rules.required, rules.positive]"
          />
        </v-col>

        <!-- Date -->
        <v-col cols="12" md="6">
          <AppInput
            v-model="form.payment_date"
            label="تاريخ التحصيل *"
            type="date"
            prepend-inner-icon="ri-calendar-line"
            required
            :rules="[rules.required]"
          />
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
            required
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
            required
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

    <!-- Confirm the exact allocation before recording any payment. -->
    <AppConfirmDialog ref="excessDialogRef" v-bind="confirmation" />
  </AppDialog>
</template>

<script setup>
// تحصيل قسط مع معاينة وتأكيد صريح قبل التسجيل.
import { ref, watch, onMounted, computed } from 'vue';
import { AppDialog, AppInput, AppConfirmDialog } from '@/components';
import AppActionHelp from '@/components/common/AppActionHelp.vue';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import { formatCurrency } from '@/utils/formatters';
import apiClient from '@/api/axios.config';

const props = defineProps({
  modelValue: Boolean,
  plan: { type: Object, default: null },
  installment: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'success']);

const internalValue = computed({
  get: () => props.modelValue,
  set: val => { if (!saving.value && !pendingPayment.value) emit('update:modelValue', val); },
});

const targetRemaining = computed(() => props.installment?.remaining ?? props.installment?.amount ?? [...(props.plan?.installments || [])].filter(r => Number(r.remaining) > 0 && r.status !== 'canceled').sort((a,b) => a.due_date.localeCompare(b.due_date))[0]?.remaining ?? 0);
const formRef = ref(null);
const excessDialogRef = ref(null);
const saving = ref(false);
const confirmation = ref({});
const paymentError = ref('');
const pendingPayment = ref(null);
const loadingMethods = ref(false);
const loadingCashBoxes = ref(false);
const paymentMethods = ref([]);
const cashBoxes = ref([]);

const localToday = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; };
const form = ref({
  amount: 0,
  payment_method_id: null,
  cash_box_id: null,
  payment_date: localToday(),
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
      cashBoxesApi.get({ per_page: -1, is_active: 1 }, { showLoading: false }),
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
  () => [props.modelValue, props.installment],
  ([open]) => {
    if (open && !pendingPayment.value) {
      paymentError.value = '';
      form.value.amount = targetRemaining.value;
      form.value.payment_date = localToday();
    }
  },
  { immediate: true }
);

const close = () => {
  if (!saving.value && !pendingPayment.value) internalValue.value = false;
};

const handleSubmit = async () => {
  if (saving.value) return;
  if (!pendingPayment.value && !(await formRef.value.validate()).valid) return;
  saving.value = true;
  paymentError.value = '';
  try {
    if (!pendingPayment.value) {
      const planId = props.installment?.installment_plan_id || props.plan?.id;
      const customerId = props.installment?.user_id || props.plan?.user_id || props.plan?.customer?.id || props.installment?.installment_plan?.user_id;
      if (!customerId || !planId) throw new Error('تعذر تحديد العميل أو الخطة. أعد فتح الخطة.');
      const {data: candidates} = await apiClient.get('installment-collections/candidates', {params:{customer_id:customerId},handleErrorsLocally:true});
      const rows = candidates.data.items.filter(r => r.installment_plan_id === Number(planId));
      const target = rows.find(r => r.id === props.installment?.id) || rows[0];
      if (!target) throw new Error('لا توجد أقساط قابلة للسداد.');
      const ordered = [target, ...rows.filter(r => r.id !== target.id)];
      let left = Math.round(Number(form.value.amount) * 100);
      const allocations = [];
      for (const row of ordered) {
        const amount = Math.min(left, Math.round(Number(row.remaining) * 100));
        if (amount > 0) allocations.push({installment_id:row.id,amount:(amount/100).toFixed(2)});
        left -= amount;
      }
      if (left > 0) throw new Error(`المبلغ يتجاوز إجمالي المتبقي في الخطة بمقدار ${formatCurrency(left/100)}. عدّل المبلغ أو استخدم تحصيل أقساط العميل لاختيار خطط أخرى.`);
      const {data} = await apiClient.post('installment-collections/preview', {
        ...form.value, customer_id:customerId, installment_ids:allocations.map(r=>r.installment_id), allocations,
        paid_at:form.value.payment_date,
      }, {handleErrorsLocally:true});
      const base = Number(target.remaining), paid = Number(form.value.amount);
      const detail = data.data.allocations.map(r => `قسط #${r.id}: سداد ${formatCurrency(r.amount)}، المتبقي ${formatCurrency(r.remaining_after)}`).join(' — ');
      confirmation.value = {
        title: paid < base ? 'تأكيد الدفع الجزئي' : paid > base ? 'تأكيد توزيع الزيادة' : 'تأكيد تحصيل القسط',
        message: (paid < base
          ? `المبلغ ${formatCurrency(paid)} أقل من المتبقي من القسط ${formatCurrency(base)}. سيتبقى ${formatCurrency(base-paid)}. هل تريد دفعًا جزئيًا؟ `
          : paid > base ? `المبلغ أكبر من المتبقي من القسط بمقدار ${formatCurrency(paid-base)}. هل تريد توزيع الزيادة على أقساط الخطة الأخرى حسب المعاينة؟ ` : '') + detail,
        confirmText: paid < base ? 'تأكيد الدفع الجزئي' : paid > base ? 'تأكيد التوزيع والسداد' : 'تأكيد السداد', cancelText:'رجوع للتعديل',
      };
      if (!(await excessDialogRef.value.open())) return;
      pendingPayment.value = {token:data.data.token,request_key:crypto.randomUUID(), preview:data.data};
    }
    const {data} = await apiClient.post('installment-collections', {
      token:pendingPayment.value.token,request_key:pendingPayment.value.request_key,
    }, {handleErrorsLocally:true});
    const receipt = data.data;
    pendingPayment.value = null;
    let record = {id:receipt.payments[0]?.payment_id,amount_paid:receipt.amount,payment_date:receipt.paid_at};
    try { record = (await apiClient.get(`installment-payments/${record.id}`)).data.data; } catch { /* Payment already succeeded; never retry it for a receipt read failure. */ }
    emit('success', {payment_record:record,paid_installments:receipt.allocations.map(r=>({...r,remaining:r.remaining_after,amount_paid:r.amount})),collection:receipt});
    emit('update:modelValue', false);
  } catch (error) {
    if (error.response && error.response.status < 500) pendingPayment.value = null;
    paymentError.value = pendingPayment.value
      ? 'لم يتأكد وصول نتيجة التحصيل. اضغط تأكيد مرة أخرى للتحقق من نفس العملية دون تكرار الدفع.'
      : Object.values(error.response?.data?.errors || {}).flat()[0] || error.response?.data?.message || error.message;
  } finally { saving.value = false; }
};

onMounted(loadData);
</script>
