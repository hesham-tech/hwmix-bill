<template>
  <div class="cash-flow-report-page">
    <div class="mb-6 px-6 pt-6 d-flex align-center justify-space-between">
      <div>
        <h1 class="text-h4 font-weight-bold">تحليل التدفقات النقدية</h1>
        <p class="text-body-1 text-grey">عرض تفصيلي للسيولة الداخلة والخارجة وحركات الصناديق</p>
      </div>
      <div class="d-flex gap-2">
        <AppButton variant="tonal" color="success" prepend-icon="ri-download-line" @click="exportReport" :disabled="!transactions.length">
          تصدير CSV
        </AppButton>
        <AppButton color="primary" prepend-icon="ri-refresh-line" @click="loadReport"> تحديث البيانات </AppButton>
      </div>
    </div>

    <!-- Summary Cards -->
    <v-row class="px-6 mx-0 mb-6" dense>
      <v-col cols="12" md="4">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-success">
          <v-card-text class="pa-4 bg-success-lighten-5">
            <div class="text-caption font-weight-bold text-success mb-1">إجمالي المقبوضات (+)</div>
            <div class="text-h4 font-weight-black text-success">{{ formatCurrency(summary.total_inflow) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-error">
          <v-card-text class="pa-4 bg-error-lighten-5">
            <div class="text-caption font-weight-bold text-error mb-1">إجمالي المدفوعات (-)</div>
            <div class="text-h4 font-weight-black text-error">{{ formatCurrency(summary.total_outflow) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-info">
          <v-card-text class="pa-4 bg-info-lighten-5">
            <div class="text-caption font-weight-bold text-info mb-1">صافي التدفق النقدي</div>
            <div class="text-h4 font-weight-black" :class="summary.net_flow >= 0 ? 'text-info' : 'text-error'">
              {{ formatCurrency(summary.net_flow) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="px-6 mb-4">
      <AppCard title="فترة التقرير" icon="ri-calendar-event-line">
        <v-row dense>
          <v-col cols="12" sm="4">
            <AppInput v-model="filters.date_from" label="من تاريخ" type="date" prepend-inner-icon="ri-calendar-line" />
          </v-col>
          <v-col cols="12" sm="4">
            <AppInput v-model="filters.date_to" label="إلى تاريخ" type="date" prepend-inner-icon="ri-calendar-check-line" />
          </v-col>
          <v-col cols="12" sm="4" class="d-flex align-center pt-2">
            <AppButton color="secondary" block prepend-icon="ri-search-eye-line" @click="loadReport" variant="tonal"> عرض حركات الصناديق </AppButton>
          </v-col>
        </v-row>
      </AppCard>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable :headers="headers" :items="transactions" :loading="loading" title="سجل حركات الخزينة" icon="ri-history-line">
        <template #item.amount="{ item }">
          <div :class="item.type === 'income' ? 'text-success' : 'text-error'" class="font-weight-black text-body-1">
            {{ item.type === 'income' ? '+' : '-' }} {{ formatCurrency(Math.abs(item.amount)) }}
          </div>
        </template>
        <template #item.transaction_date="{ item }">
          <div class="font-weight-medium">{{ item.transaction_date }}</div>
        </template>
        <template #no-data>
          <div class="text-center pa-10">
            <v-icon icon="ri-hand-coin-line" size="64" color="grey-lighten-2" class="mb-4" />
            <div class="text-h6 text-grey font-weight-medium">لا توجد حركات مالية مسجلة في هذه الفترة</div>
          </div>
        </template>
      </AppDataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { usePrintExport } from '@/composables/usePrintExport';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';

const api = useApi('/api/transactions');
const { exportToCSV } = usePrintExport();

const loading = ref(false);
const filters = ref({
  date_from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
  date_to: new Date().toISOString().split('T')[0],
});

const summary = ref({ total_inflow: 0, total_outflow: 0, net_flow: 0 });
const transactions = ref([]);

const headers = [
  { title: 'التاريخ', key: 'transaction_date' },
  { title: 'الخزينة', key: 'cash_box.name' },
  { title: 'المبلغ', key: 'amount', align: 'end' },
  { title: 'البيان', key: 'description' },
];

const formatCurrency = amount => {
  if (amount === undefined || amount === null) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const exportReport = () => {
  const data = transactions.value.map(t => ({
    التاريخ: t.transaction_date,
    الخزينة: t.cash_box?.name || '-',
    المقدار: t.amount,
    البيان: t.description,
  }));
  exportToCSV(data, 'تقرير_التدفق_النقدي.csv', ['التاريخ', 'الخزينة', 'المقدار', 'البيان']);
};

const loadReport = async () => {
  loading.value = true;
  try {
    const response = await api.get({ ...filters.value, per_page: 100 }, { showLoading: false });
    transactions.value = response.data || [];

    let inflow = 0;
    let outflow = 0;

    transactions.value.forEach(t => {
      const amt = parseFloat(t.amount || 0);
      if (t.type === 'income') inflow += amt;
      else outflow += Math.abs(amt);
    });

    summary.value = {
      total_inflow: inflow,
      total_outflow: outflow,
      net_flow: inflow - outflow,
    };
  } finally {
    loading.value = false;
  }
};

onMounted(loadReport);
</script>

<style scoped></style>
