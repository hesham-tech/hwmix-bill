<template>
  <ReportLayout
    v-if="can(PERMISSIONS.REPORTS_CASH_FLOW) || can(PERMISSIONS.TRANSACTIONS_VIEW_ALL)"
    title="تقرير التدفقات النقدية"
    description="تحليل المقبوضات والمدفوعات وحركة السيولة في الصناديق"
    :loading="loading"
    @refresh="loadReport"
    @export="handleExport"
  >
    <!-- Filters -->
    <template #filters>
      <div class="d-flex flex-column gap-4">
        <AppInput v-model="filters.date_from" label="من تاريخ" type="date" />
        <AppInput v-model="filters.date_to" label="إلى تاريخ" type="date" />
        <AppButton color="primary" block @click="loadReport">تحديث البيانات</AppButton>
      </div>
    </template>

    <!-- Summary -->
    <template #summary>
      <v-row dense>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 bg-success-lighten-5 border-success">
            <div class="text-caption font-weight-bold text-success">إجمالي المقبوضات (+)</div>
            <div class="text-h4 font-weight-black text-success">{{ formatCurrency(summary.total_inflow) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 bg-error-lighten-5 border-error">
            <div class="text-caption font-weight-bold text-error">إجمالي المدفوعات (-)</div>
            <div class="text-h4 font-weight-black text-error">{{ formatCurrency(summary.total_outflow) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 bg-info-lighten-5 border-info">
            <div class="text-caption font-weight-bold text-info">صافي التدفق</div>
            <div class="text-h4 font-weight-black" :class="summary.net_flow >= 0 ? 'text-info' : 'text-error'">
              {{ formatCurrency(summary.net_flow) }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Charts -->
    <template #charts>
      <CashFlowChart :data="transactions" :loading="loading" />
    </template>

    <!-- Table -->
    <template #table>
      <AppDataTable :headers="headers" :items="transactions" :loading="loading" title="سجل حركات الخزينة" icon="ri-history-line">
        <template #item.amount="{ item }">
          <div :class="item.type === 'income' ? 'text-success' : 'text-error'" class="font-weight-black pr-4">
            {{ item.type === 'income' ? '+' : '-' }} {{ formatCurrency(Math.abs(item.amount)) }}
          </div>
        </template>
      </AppDataTable>
    </template>
  </ReportLayout>

  <!-- Access Denied State -->
  <div v-else class="pa-12 text-center d-flex flex-column align-center justify-center" style="min-height: 400px">
    <v-avatar size="100" color="error-lighten-5" class="mb-6">
      <v-icon icon="ri-lock-2-line" size="48" color="error" />
    </v-avatar>
    <h2 class="text-h4 font-weight-bold mb-2">عذراً، لا تملك الصلاحية</h2>
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى تقارير التدفق النقدي. يرجى مراجعة المسؤول.</p>
    <AppButton to="/dashboard" color="primary" variant="tonal" prepend-icon="ri-home-4-line"> العودة للرئيسية </AppButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency } from '@/utils/formatters';
import { useApi } from '@/composables/useApi';
import { usePrintExport } from '@/composables/usePrintExport';
import CashFlowChart from '../components/CashFlowChart.vue';
import ReportLayout from '../components/ReportLayout.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';

const { can } = usePermissions();

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

const handleExport = () => {
  if (!can(PERMISSIONS.REPORTS_EXPORT)) {
    return;
  }
  const data = transactions.value.map(t => ({
    التاريخ: t.transaction_date,
    الخزينة: t.cash_box?.name || '-',
    المقدار: t.amount,
    البيان: t.description,
  }));
  exportToCSV(data, 'تقرير_التدفق_النقدي.csv');
};

onMounted(loadReport);
</script>
