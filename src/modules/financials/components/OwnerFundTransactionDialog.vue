<template>
  <AppDialog
    v-model="isOpen"
    title="تسجيل حركة أملاك شريك / مالك"
    icon="ri-hand-coin-line"
    max-width="550"
    :loading="loading"
    confirm-text="تسجيل المعاملة"
    @confirm="handleSubmit"
    @close="close"
  >
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-container class="pa-0">
        <v-row dense>
          <!-- نوع المعاملة -->
          <v-col cols="12">
            <v-select
              v-model="form.type"
              :items="transactionTypes"
              item-title="title"
              item-value="value"
              label="نوع الحركة المالية *"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'نوع الحركة مطلوب']"
              class="mb-2"
            />
          </v-col>

          <!-- المالك / الشريك -->
          <v-col cols="12">
            <v-autocomplete
              v-model="form.user_id"
              :items="users"
              :loading="loadingUsers"
              :item-title="item => item.nickname ? `${item.full_name} (${item.nickname})` : item.full_name || item.name"
              item-value="id"
              label="المالك أو الشريك المستهدف *"
              placeholder="ابحث عن اسم المالك/الشريك..."
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'المالك/الشريك مطلوب']"
              class="mb-2"
            />
          </v-col>

          <!-- الخزينة / الحساب البنكي -->
          <v-col cols="12">
            <v-select
              v-model="form.cashbox_id"
              :items="cashBoxes"
              :loading="loadingBoxes"
              item-title="name"
              item-value="id"
              label="الخزينة أو الحساب البنكي المرتبط *"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'الخزينة مطلوبة']"
              class="mb-2"
            />
          </v-col>

          <!-- المبلغ -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="form.amount"
              label="المبلغ المطلوب *"
              type="number"
              step="0.01"
              variant="outlined"
              density="comfortable"
              prefix="£"
              required
              :rules="[v => !!v || 'المبلغ مطلوب', v => v > 0 || 'المبلغ يجب أن يكون أكبر من الصفر']"
              class="mb-2"
            />
          </v-col>

          <!-- تاريخ المعاملة -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.entry_date"
              label="التاريخ الفعلي للمطابقة *"
              type="date"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || 'التاريخ مطلوب']"
              class="mb-2"
            />
          </v-col>

          <!-- الملاحظات -->
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="ملاحظات وتفاصيل الحركة"
              placeholder="اكتب تفاصيل المعاملة (مثال: زيادة الحصة النقدية في رأس المال...)"
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
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { AppDialog } from '@/components';
import { useApi } from '@/composables/useApi';
import { userService } from '@/api';
import notificationManager from '@/services/notificationManager';

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue', 'success']);

const formRef = ref(null);
const loading = ref(false);
const loadingUsers = ref(false);
const loadingBoxes = ref(false);
const users = ref([]);
const cashBoxes = ref([]);

const api = useApi('/api/owner-fund-transactions');
const boxesApi = useApi('/api/cash-boxes');

const transactionTypes = [
  { title: 'زيادة رأس المال (Capital Increase)', value: 'capital_increase' },
  { title: 'مساهمة شريك جاري (Partner Contribution)', value: 'partner_contribution' },
  { title: 'قرض من المالك للشركة (Loan from Owner)', value: 'loan_from_owner' },
  { title: 'قرض من الشركة للمالك (Loan to Owner)', value: 'loan_to_owner' },
  { title: 'سلفة من المالك (Advance from Owner)', value: 'advance_from_owner' },
  { title: 'سلفة للشريك (Advance to Partner)', value: 'advance_to_partner' },
  { title: 'سحب أرباح (Drawings)', value: 'drawings' },
  { title: 'توزيع أرباح (Profit Distribution)', value: 'profit_distribution' },
];

const form = reactive({
  type: null,
  user_id: null,
  cashbox_id: null,
  amount: null,
  entry_date: new Date().toISOString().substring(0, 10),
  description: '',
});

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const response = await userService.getAll({ per_page: 100 });
    users.value = response.data || [];
  } catch (error) {
    console.error('Failed to load users for owner transaction:', error);
  } finally {
    loadingUsers.value = false;
  }
};

const loadBoxes = async () => {
  loadingBoxes.value = true;
  try {
    const response = await boxesApi.get({ per_page: 100, is_active: true, all_company_boxes: true });
    cashBoxes.value = response.data || [];
  } catch (error) {
    console.error('Failed to load active cash boxes:', error);
  } finally {
    loadingBoxes.value = false;
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    form.type = null;
    form.user_id = null;
    form.cashbox_id = null;
    form.amount = null;
    form.entry_date = new Date().toISOString().substring(0, 10);
    form.description = '';
    if (formRef.value) formRef.value.resetValidation();
    
    loadUsers();
    loadBoxes();
  }
});

const close = () => {
  isOpen.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const response = await api.create({ ...form });
    notificationManager.success('تم تسجيل معاملة أموال الملاك/الشركاء بنجاح.');
    emit('success', response.data);
    close();
  } catch (error) {
    console.error('Failed to submit owner fund transaction:', error);
  } finally {
    loading.value = false;
  }
};
</script>
