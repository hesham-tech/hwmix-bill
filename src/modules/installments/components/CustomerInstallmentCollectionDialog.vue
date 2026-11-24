<template>
  <AppDialog v-model="visible" :title="receipt ? 'تم تحصيل أقساط العميل' : 'تحصيل أقساط العميل'"
    :subtitle="chosenCustomer ? `${chosenCustomer.full_name || ''} — ${chosenCustomer.phone || ''}` : ''"
    icon="ri-hand-coin-line" max-width="1000" :fullscreen="mobile" :persistent="busy || uncertain" hide-actions>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" role="alert">{{ error }}</v-alert>
    <template v-if="receipt">
      <v-alert type="success" variant="tonal" class="mb-4">تم تحصيل {{ formatCurrency(receipt.amount) }} — عملية رقم #{{ receipt.collection_id }}</v-alert>
      <AllocationSummary :rows="receipt.allocations" />
      <div class="mt-4">المتبقي من المطلوب حتى نهاية الشهر: {{ formatCurrency(receipt.remaining_due) }}</div>
      <div>إجمالي المتبقي في الخطط: {{ formatCurrency(receipt.total_remaining_after) }}</div>
    </template>
    <template v-else-if="preview">
      <h3 class="mb-3">راجع توزيع {{ formatCurrency(preview.amount) }} قبل تأكيد التحصيل</h3>
      <v-alert v-if="Number(preview.shortfall) > 0" type="warning" variant="tonal" class="mb-3">
        المبلغ أقل من إجمالي الأقساط المحددة بمقدار {{ formatCurrency(preview.shortfall) }}. سيُسجل سداد جزئي حسب التوزيع التالي.
      </v-alert>
      <v-alert v-if="Number(preview.advance_amount) > 0" type="info" variant="tonal" class="mb-3">
        يتضمن المبلغ سداد {{ formatCurrency(preview.advance_amount) }} من أقساط الشهور القادمة. هل تريد المتابعة؟
      </v-alert>
      <AllocationSummary :rows="preview.allocations" />
      <p class="mt-3">لن يتم تسجيل أي مبلغ قبل الضغط على «تأكيد التحصيل».</p>
    </template>
    <v-form v-else ref="formRef" @submit.prevent="review">
      <AppAutocomplete v-model="customerId" :items="customer ? [customer] : []" :api-endpoint="customer ? null : '/api/users/customers'"
        item-title="full_name" item-value="id" label="العميل" placeholder="ابحث باسم العميل أو هاتفه"
        :disabled="busy || !!customer" :rules="[required]" @select="chosenCustomer = $event" />
      <v-btn v-if="customerId && !schedule && !loading" variant="tonal" @click="loadSchedule">إعادة تحميل الأقساط</v-btn>
      <v-progress-linear v-if="loading" indeterminate class="my-4" />
      <template v-if="schedule && !loading">
        <div class="collection-totals mb-4">
          <div>المطلوب سداده حتى نهاية الشهر <strong>{{ formatCurrency(schedule.due_total) }}</strong><small class="d-block">حتى {{ formatDate(schedule.cutoff) }}</small></div>
          <div>إجمالي المتبقي في الخطط <strong>{{ formatCurrency(schedule.total_remaining) }}</strong></div>
        </div>
        <v-alert v-if="!schedule.items.length" type="info" variant="tonal">لا توجد أقساط قابلة للسداد لهذا العميل ضمن نطاق صلاحياتك.</v-alert>
        <template v-else>
          <v-switch v-model="includeFuture" label="إظهار أقساط الشهور القادمة للسداد المبكر" color="primary" hide-details />
          <v-switch v-model="manual" label="تعديل مبالغ التوزيع يدويًا" color="primary" hide-details />
          <p class="text-caption my-2">التوزيع الافتراضي: الأقدم استحقاقًا أولًا عبر الخطط. يمكنك تغيير الأقساط المحددة.</p>
          <div class="collection-rows">
            <div v-for="row in shownRows" :key="row.id" class="collection-row pa-3 border rounded mb-2">
              <v-checkbox v-model="selected" :value="row.id" :aria-label="`تحديد القسط ${row.id}`" hide-details density="compact" />
              <div class="flex-grow-1">
                <strong>خطة #{{ row.installment_plan_id }}</strong> — {{ row.invoice_number || 'بدون فاتورة' }}
                <div>{{ formatDate(row.due_date) }} · المتبقي {{ formatCurrency(row.remaining) }}</div>
                <v-chip size="x-small" :color="row.overdue ? 'error' : 'info'">{{ row.overdue ? 'متأخر' : row.selected ? 'خلال الشهر الحالي' : 'شهر قادم' }}</v-chip>
              </div>
              <AppInput v-if="manual && selected.includes(row.id)" v-model="manualAmounts[row.id]" type="number" min="0" step="0.01"
                :max="row.remaining" :label="`مبلغ القسط ${row.id}`" class="allocation-input" />
            </div>
          </div>
          <v-row class="mt-3" dense>
            <v-col cols="12" sm="6"><AppInput v-model="form.amount" label="المبلغ المستلم" type="number" min="0.01" step="0.01" :rules="[required, positive]" /></v-col>
            <v-col cols="12" sm="6"><AppInput v-model="form.paid_at" label="تاريخ التحصيل" type="date" :rules="[required]" /></v-col>
            <v-col cols="12" sm="6"><v-select v-model="form.cash_box_id" :items="cashBoxes" item-title="name" item-value="id" label="الخزنة" variant="outlined" :rules="[required]" /></v-col>
            <v-col cols="12" sm="6"><v-select v-model="form.payment_method_id" :items="methods" item-title="name" item-value="id" label="طريقة التحصيل" variant="outlined" :rules="[required]" /></v-col>
            <v-col cols="12" sm="6"><AppInput v-model="form.reference_number" label="رقم المرجع" /></v-col>
            <v-col cols="12" sm="6"><AppInput v-model="form.notes" label="ملاحظات" /></v-col>
          </v-row>
          <v-alert v-if="difference > 0" type="warning" variant="tonal" class="mb-3">
            المبلغ أقل من إجمالي المحدد: ستدفع {{ formatCurrency(form.amount) }} ويتبقى {{ formatCurrency(difference) }}. راجع التوزيع قبل التأكيد.
          </v-alert>
          <v-alert v-else-if="difference < 0" type="info" variant="tonal" class="mb-3">
            توجد زيادة {{ formatCurrency(-difference) }} عن الأقساط المحددة. اختر أقساطًا إضافية؛ يمكنك إظهار أقساط الشهور القادمة.
            <v-btn class="mt-2" size="small" variant="outlined" @click="selectFutureForExcess">اقتراح توزيع الزيادة على الأقساط القادمة</v-btn>
          </v-alert>
          <div v-if="manual">مجموع التوزيع: {{ formatCurrency(manualTotal) }} · غير موزع: {{ formatCurrency(Number(form.amount) - manualTotal) }}</div>
        </template>
      </template>
    </v-form>
    <template #actions>
      <v-btn v-if="receipt" color="primary" @click="visible = false">إغلاق</v-btn>
      <template v-else-if="preview">
        <v-btn :disabled="busy || uncertain" variant="tonal" @click="preview = null">تعديل التوزيع</v-btn>
        <v-btn color="primary" :loading="busy" @click="pay">{{ uncertain ? 'إعادة التحقق من التحصيل' : 'تأكيد التحصيل' }}</v-btn>
      </template>
      <template v-else>
        <v-btn :disabled="busy" @click="visible = false">إلغاء</v-btn>
        <v-btn color="primary" :loading="busy" :disabled="loading || !selected.length || difference < 0" @click="review">معاينة التوزيع</v-btn>
      </template>
    </template>
  </AppDialog>
</template>

<script setup>
import { computed, defineComponent, h, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { AppDialog, AppInput, AppAutocomplete } from '@/components';
import api from '@/api/axios.config';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useUserStore } from '@/stores/user';

const props = defineProps({ modelValue: Boolean, customer: { type: Object, default: null } });
const emit = defineEmits(['update:modelValue', 'success']);
const { mobile } = useDisplay();
const busy = ref(false), uncertain = ref(false), loading = ref(false), error = ref('');
const customerId = ref(null), schedule = ref(null), selected = ref([]), includeFuture = ref(false), manual = ref(false), manualAmounts = ref({});
const chosenCustomer = ref(null);
const methods = ref([]), cashBoxes = ref([]), preview = ref(null), receipt = ref(null), requestKey = ref(''), formRef = ref(null);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const form = ref({});
const visible = computed({ get: () => props.modelValue, set: value => { if (!busy.value && !uncertain.value) emit('update:modelValue', value); } });
const shownRows = computed(() => (schedule.value?.items || []).filter(row => row.selected || includeFuture.value));
const selectedTotal = computed(() => (schedule.value?.items || []).filter(r => selected.value.includes(r.id)).reduce((s,r) => s + Number(r.remaining),0));
const difference = computed(() => Math.round((selectedTotal.value - Number(form.value.amount || 0)) * 100) / 100);
const manualTotal = computed(() => selected.value.reduce((s,id) => s + Number(manualAmounts.value[id] || 0),0));
const required = value => !!value || 'مطلوب';
const positive = value => Number(value) > 0 || 'أدخل مبلغًا أكبر من صفر';
const message = e => Object.values(e.response?.data?.errors || {}).flat()[0] || e.response?.data?.message || 'تعذر الاتصال. حاول مرة أخرى.';
function selectFutureForExcess() {
  includeFuture.value = true;
  let total = selectedTotal.value;
  for (const row of schedule.value?.items || []) {
    if (total >= Number(form.value.amount)) break;
    if (!row.selected && !selected.value.includes(row.id)) {
      selected.value = [...selected.value, row.id]; total += Number(row.remaining);
    }
  }
  if (total < Number(form.value.amount)) error.value = 'المبلغ يتجاوز الأقساط المتاحة. عدّل المبلغ أو اختر أقساطًا أخرى.';
}
let loadVersion = 0;
async function loadSchedule(preserveError = false) {
  const version = ++loadVersion;
  schedule.value = null; selected.value = []; if (preserveError !== true) error.value = '';
  if (!customerId.value) { loading.value = false; return; }
  loading.value = true;
  try {
    const { data } = await api.get('installment-collections/candidates', { params: { customer_id: customerId.value }, handleErrorsLocally: true });
    if (version !== loadVersion) return;
    schedule.value = data.data;
    selected.value = data.data.items.filter(r => r.selected).map(r => r.id);
    form.value.amount = data.data.due_total;
    manualAmounts.value = Object.fromEntries(data.data.items.map(r => [r.id, r.remaining]));
  } catch (e) { if (version === loadVersion) error.value = message(e); }
  finally { if (version === loadVersion) loading.value = false; }
}
watch(customerId, loadSchedule);
watch(includeFuture, enabled => { if (!enabled) selected.value = selected.value.filter(id => schedule.value?.items.some(r => r.id === id && r.selected)); });
watch(() => props.modelValue, async open => {
  if (!open) { ++loadVersion; return; }
  error.value = ''; preview.value = null; receipt.value = null; uncertain.value = false;
  includeFuture.value = false; manual.value = false;
  chosenCustomer.value = props.customer;
  form.value = { amount: '', paid_at: today(), payment_method_id: null, cash_box_id: null, notes: '', reference_number: '' };
  const same = customerId.value === (props.customer?.id || null);
  customerId.value = props.customer?.id || null;
  if (same) loadSchedule();
  try {
    const [m,b] = await Promise.all([api.get('payment-methods', {params:{active:1,per_page:-1}}), api.get('cash-boxes',{params:{is_active:1,per_page:-1}})]);
    methods.value = m.data.data; cashBoxes.value = b.data.data;
    form.value.payment_method_id = methods.value.find(m => m.code === 'cash')?.id || methods.value[0]?.id;
    const preferred = useUserStore().currentUser?.cash_box_default_id;
    form.value.cash_box_id = cashBoxes.value.find(b => b.id === preferred)?.id || cashBoxes.value.find(b => b.is_default)?.id;
  } catch (e) { error.value = message(e); }
});
async function review() {
  if (busy.value || loading.value) return;
  if (!(await formRef.value?.validate())?.valid) return;
  busy.value = true; error.value = '';
  try {
    const payload = { ...form.value, customer_id: customerId.value, installment_ids: selected.value };
    if (manual.value) payload.allocations = selected.value.map(id => ({installment_id:id,amount:manualAmounts.value[id] || 0}));
    const { data } = await api.post('installment-collections/preview', payload, { handleErrorsLocally: true });
    preview.value = data.data; requestKey.value = crypto.randomUUID();
  } catch (e) { error.value = message(e); }
  finally { busy.value = false; }
}
async function pay() {
  if (busy.value) return;
  busy.value = true; error.value = '';
  try {
    const { data } = await api.post('installment-collections', { token: preview.value.token, request_key: requestKey.value }, { handleErrorsLocally: true });
    receipt.value = data.data; uncertain.value = false; emit('success', data.data);
  } catch (e) {
    uncertain.value = !e.response || e.response.status >= 500;
    error.value = uncertain.value ? 'لم يتأكد وصول نتيجة التحصيل. اضغط إعادة التحقق؛ لن يتم تسجيل الدفعة مرتين.' : message(e);
    if (!uncertain.value && [409,422].includes(e.response?.status)) {
      preview.value = null; const enteredAmount = form.value.amount;
      await loadSchedule(true); form.value.amount = enteredAmount;
    }
  } finally { busy.value = false; }
}
const AllocationSummary = defineComponent({
  props: { rows: Array },
  setup: p => () => h('div', {class:'collection-summary'}, p.rows.map(row => h('div',{class:'pa-3 border rounded mb-2'},[
    h('strong', `خطة #${row.installment_plan_id} · ${formatDate(row.due_date)}`),
    h('div', `سداد ${formatCurrency(row.amount)} · المتبقي من القسط ${formatCurrency(row.remaining_after)}`),
  ]))),
});
</script>

<style scoped>
.collection-totals { display:flex; flex-wrap:wrap; gap:16px; padding:16px; background:rgba(var(--v-theme-primary),.06); border-radius:8px; }
.collection-totals strong { display:block; }
.collection-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.allocation-input { max-width:180px; min-width:120px; }
.collection-rows { max-height:350px; overflow:auto; }
</style>
