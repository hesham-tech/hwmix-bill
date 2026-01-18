<template>
  <ReportLayout
    v-if="can(PERMISSIONS.REPORTS_PROFIT) || can(PERMISSIONS.PROFITS_VIEW_ALL)"
    title="تحليل الأرباح والخسائر"
    description="نظرة شاملة على الربحية، الهوامش، ومقارنة الأداء المالي"
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
            <div class="text-caption font-weight-bold text-success">إجمالي الإيرادات</div>
            <div class="text-h4 font-weight-black text-success">{{ formatCurrency(summary.total_revenue) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 bg-error-lighten-5 border-error">
            <div class="text-caption font-weight-bold text-error">إجمالي التكاليف</div>
            <div class="text-h4 font-weight-black text-error">{{ formatCurrency(summary.total_costs) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 bg-info-lighten-5 border-info">
            <div class="text-caption font-weight-bold text-info">صافي الربح</div>
            <div class="text-h4 font-weight-black text-info">{{ formatCurrency(summary.net_profit) }}</div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Charts -->
    <template #charts>
      <ProfitComparisonChart :data="comparisonData" :loading="loading" />
    </template>

    <!-- Table -->
    <template #table>
      <AppDataTable :headers="headers" :items="comparisonData" :loading="loading" title="مقارنة الأداء الشهري" icon="ri-calendar-todo-line">
        <template #item.revenue="{ item }">
          <span class="text-primary font-weight-bold">{{ formatCurrency(item.revenue) }}</span>
        </template>
        <template #item.costs="{ item }">
          <span class="text-error">{{ formatCurrency(item.costs) }}</span>
        </template>
        <template #item.profit="{ item }">
          <v-chip :color="item.profit >= 0 ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
            {{ formatCurrency(item.profit) }}
          </v-chip>
        </template>
        <template #item.margin="{ item }">
          <v-chip size="x-small" variant="tonal" color="info"> {{ item.margin }}% </v-chip>
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
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى تقارير الأرباح والخسائر. يرجى مراجعة المسؤول.</p>
    <AppButton to="/dashboard" color="primary" variant="tonal" prepend-icon="ri-home-4-line"> العودة للرئيسية </AppButton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency } from '@/utils/formatters';

const { can } = usePermissions();

const api = useApi('/api/reports/profit-loss');
const { exportToCSV } = usePrintExport();

const loading = ref(false);
const filters = ref({
  date_from: new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString().split('T')[0],
  date_to: new Date().toISOString().split('T')[0],
});

const comparisonData = ref([]);
const summary = ref({
  total_revenue: 0,
  total_costs: 0,
  net_profit: 0,
});

const headers = [
  { title: 'الشهر', key: 'month' },
  { title: 'الإيرادات', key: 'revenue', align: 'end' },
  { title: 'التكاليف', key: 'costs', align: 'end' },
  { title: 'صافي الربح', key: 'profit', align: 'end' },
  { title: 'الهامش', key: 'margin', align: 'center' },
];

const loadReport = async () => {
  loading.value = true;
  try {
    // 1. Fetch Summary for current period
    const resSummary = await api.get(filters.value, { showLoading: false });
    summary.value = {
      total_revenue: resSummary.revenues?.total || 0,
      total_costs: resSummary.costs?.total || 0,
      net_profit: resSummary.result?.net_profit || 0,
    };

    // 2. Fetch Monthly Comparison for Chart & Table
    const resComp = await useApi('/api/reports/profit-loss/monthly-comparison').get(
      {
        months: 6,
      },
      { showLoading: false }
    );
    comparisonData.value = resComp.comparison || [];
  } finally {
    loading.value = false;
  }
};

const handleExport = () => {
  if (!can(PERMISSIONS.REPORTS_EXPORT)) {
    return;
  }
  const data = comparisonData.value.map(item => ({
    الشهر: item.month,
    الإيرادات: item.revenue,
    التكاليف: item.costs,
    الربح: item.profit,
    'الهامش %': item.margin,
  }));
  exportToCSV(data, 'تقرير_الأرباح_والخسائر.csv');
};

onMounted(loadReport);
</script>
