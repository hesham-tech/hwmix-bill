<template>
  <AppDialog
    v-model="isOpen"
    title="مطابقة وتسوية رصيد الخزينة"
    icon="ri-scales-line"
    max-width="500"
    :loading="loading"
    confirm-text="بدء عملية التسوية"
    @confirm="handleSubmit"
    @close="close"
  >
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-container class="pa-0">
        <div v-if="cashBox" class="mb-4 pa-3 bg-grey-lighten-4 rounded-lg d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">{{ cashBox.name }}</div>
            <div class="text-caption text-grey">الرصيد الدفتري الحالي: {{ formatCurrency(cashBox.balance) }}</div>
          </div>
          <v-chip color="primary" size="small" variant="tonal" class="font-weight-bold">
            {{ cashBox.type?.name || cashBox.cash_type || 'نقدي' }}
          </v-chip>
        </div>

        <v-row dense>
          <!-- تاريخ المطابقة -->
          <v-col cols="12">
            <v-text-field
              v-model="form.reconciliation_date"
              label="تاريخ المطابقة والتسوية *"
              type="date"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'التاريخ مطلوب']"
              class="mb-2"
            />
          </v-col>

          <!-- الرصيد الفعلي -->
          <v-col cols="12">
            <v-text-field
              v-model.number="form.physical_balance"
              label="الرصيد الفعلي (الواقعي / البنكي) *"
              type="number"
              step="0.01"
              variant="outlined"
              density="comfortable"
              placeholder="0.00"
              required
              :rules="[v => v !== null && v !== undefined || 'الرصيد الفعلي مطلوب', v => v >= 0 || 'يجب أن يكون أكبر من أو يساوي الصفر']"
              class="mb-2"
            />
          </v-col>

          <!-- ملاحظات التسوية -->
          <v-col cols="12">
            <v-textarea
              v-model="form.notes"
              label="ملاحظات وتفاصيل التسوية"
              placeholder="اكتب أي ملاحظات أو أسباب لوجود عجز أو زيادة..."
              rows="2"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </AppDialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { AppDialog } from '@/components';
import { useApi } from '@/composables/useApi';
import { formatCurrency } from '@/utils/formatters';
import notificationManager from '@/services/notificationManager';

const props = defineProps({
  modelValue: Boolean,
  cashBox: Object,
});

const emit = defineEmits(['update:modelValue', 'success']);

const api = useApi('/api/cash-reconciliations');
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  reconciliation_date: new Date().toISOString().substring(0, 10),
  physical_balance: null,
  notes: '',
});

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    form.reconciliation_date = new Date().toISOString().substring(0, 10);
    form.physical_balance = null;
    form.notes = '';
    if (formRef.value) formRef.value.resetValidation();
  }
});

const close = () => {
  isOpen.value = false;
};

const handleSubmit = async () => {
  if (!props.cashBox || !formRef.value) return;
  
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const payload = {
      cashbox_id: props.cashBox.id,
      reconciliation_date: form.reconciliation_date,
      physical_balance: form.physical_balance,
      notes: form.notes,
    };
    const response = await api.create(payload);
    notificationManager.success('تم تسجيل تسوية المطابقة بنجاح وهي قيد المراجعة حالياً.');
    emit('success', response.data);
    close();
  } catch (error) {
    console.error('Failed to submit cash reconciliation:', error);
  } finally {
    loading.value = false;
  }
};
</script>
