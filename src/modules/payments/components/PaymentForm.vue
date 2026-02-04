<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Invoice Selection -->
      <v-col cols="12">
        <v-autocomplete
          v-model="form.invoice_id"
          :items="invoices"
          item-title="invoice_number"
          item-value="id"
          label="الفاتورة *"
          :rules="[required]"
          :loading="loadingInvoices"
          prepend-inner-icon="ri-file-list-line"
          clearable
          @update:model-value="handleInvoiceChange"
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #title> فاتورة {{ item.raw.invoice_number }} </template>
              <template #subtitle> {{ formatCurrency(item.raw.total) }} - {{ item.raw.customer_name }} </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>

      <!-- Amount -->
      <v-col cols="12" md="6">
        <AppInput
          v-model.number="form.amount"
          label="المبلغ *"
          type="number"
          :rules="[required, positiveNumber]"
          prepend-inner-icon="ri-money-dollar-circle-line"
          min="0"
          step="0.01"
        />
      </v-col>

      <!-- Payment Method -->
      <v-col cols="12" md="6">
        <v-select v-model="form.method" :items="paymentMethods" label="طريقة الدفع *" :rules="[required]" prepend-inner-icon="ri-bank-card-line" />
      </v-col>

      <!-- Payment Date -->
      <v-col cols="12" md="6">
        <v-text-field v-model="form.date" type="date" label="تاريخ الدفع *" :rules="[required]" prepend-inner-icon="ri-calendar-line" />
      </v-col>

      <!-- Reference Number -->
      <v-col cols="12" md="6">
        <AppInput v-model="form.reference_number" label="رقم المرجع" prepend-inner-icon="ri-hashtag" hint="رقم الشيك أو التحويل" persistent-hint />
      </v-col>

      <!-- Notes -->
      <v-col cols="12">
        <v-textarea v-model="form.notes" label="ملاحظات" rows="3" prepend-inner-icon="ri-file-text-line" />
      </v-col>

      <!-- Invoice Summary (if selected) -->
      <v-col v-if="selectedInvoice" cols="12">
        <AppCard title="ملخص الفاتورة" icon="ri-information-line">
          <v-row dense>
            <v-col cols="6">
              <div class="text-caption text-grey">المجموع الكلي:</div>
              <div class="text-h6">{{ formatCurrency(selectedInvoice.total) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">المدفوع:</div>
              <div class="text-h6 text-success">
                {{ formatCurrency(selectedInvoice.paid || 0) }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">المتبقي:</div>
              <div class="text-h6 text-error">
                {{ formatCurrency((selectedInvoice.total || 0) - (selectedInvoice.paid || 0)) }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">الحالة:</div>
              <v-chip :color="selectedInvoice.status === 'paid' ? 'success' : 'warning'" size="small">
                {{ selectedInvoice.status === 'paid' ? 'مدفوعة' : 'معلقة' }}
              </v-chip>
            </v-col>
          </v-row>
        </AppCard>
      </v-col>
    </v-row>

    <!-- Actions -->
    <FormActions :loading="loading" @cancel="$emit('cancel')" @submit="handleSubmit" />
  </v-form>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { AppInput, AppCard, FormActions } from '@/components';
import { invoiceService } from '@/api';
import { required, positiveNumber } from '@/utils/validators';
import { formatCurrency } from '@/utils/formatters';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/utils/constants';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['save', 'cancel']);

const formRef = ref(null);
const loading = ref(false);
const loadingInvoices = ref(false);
const invoices = ref([]);
const selectedInvoice = ref(null);

const form = ref({
  invoice_id: null,
  amount: 0,
  method: 'cash',
  date: new Date().toISOString().split('T')[0],
  reference_number: '',
  notes: '',
  ...props.modelValue,
});

const paymentMethods = Object.entries(PAYMENT_METHOD_LABELS).map(([value, title]) => ({
  value,
  title,
}));

const handleInvoiceChange = invoiceId => {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  selectedInvoice.value = invoice;

  // Auto-fill amount with remaining balance
  if (invoice) {
    const remaining = (invoice.total || 0) - (invoice.paid || 0);
    if (remaining > 0 && form.value.amount === 0) {
      form.value.amount = remaining;
    }
  }
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();

  if (!valid) return;

  loading.value = true;
  emit('save', form.value);
  loading.value = false;
};

// Load invoices
const loadInvoices = async () => {
  loadingInvoices.value = true;
  try {
    const response = await invoiceService.getAll({ per_page: -1, status: 'pending' }, { showToast: false });
    invoices.value = response.data;
  } catch (error) {
    console.error('Error loading invoices:', error);
  } finally {
    loadingInvoices.value = false;
  }
};

watch(
  () => props.modelValue,
  newVal => {
    form.value = { ...form.value, ...newVal };

    if (newVal.invoice_id) {
      handleInvoiceChange(newVal.invoice_id);
    }
  },
  { deep: true }
);

onMounted(() => {
  loadInvoices();

  if (form.value.invoice_id) {
    handleInvoiceChange(form.value.invoice_id);
  }
});
</script>
