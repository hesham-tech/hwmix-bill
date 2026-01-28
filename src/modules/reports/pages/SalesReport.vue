<template>
  <ReportLayout
    v-if="
      canAny(PERMISSIONS.REPORTS_SALES, PERMISSIONS.REPORTS_VIEW_ALL, PERMISSIONS.REPORTS_VIEW_CHILDREN, PERMISSIONS.REPORTS_VIEW_SELF) ||
      canAny(PERMISSIONS.INVOICES_VIEW_ALL, PERMISSIONS.INVOICES_VIEW_CHILDREN, PERMISSIONS.INVOICES_VIEW_SELF)
    "
    title="تقرير المبيعات التفصيلي"
    description="تحليل أداء المبيعات، الإيرادات، والمنتجات الأكثر مبيعاً"
    :loading="loading"
    @refresh="loadReport"
    @export="handleExport"
  >
    <!-- Filters -->
    <template #filters>
      <div class="d-flex flex-column gap-4">
        <AppInput v-model="filters.date_from" label="من تاريخ" type="date" />
        <AppInput v-model="filters.date_to" label="إلى تاريخ" type="date" />
        <v-select
          v-model="filters.group_by"
          label="تجميع حسب"
          :items="[
            { title: 'بدون تجميع', value: '' },
            { title: 'باليوم', value: 'day' },
            { title: 'بالشهر', value: 'month' },
            { title: 'بالمنتج', value: 'product' },
            { title: 'بالعميل', value: 'customer' },
          ]"
          variant="outlined"
          density="compact"
        />
        <AppButton color="primary" block @click="loadReport">تطبيق الفلاتر</AppButton>
      </div>
    </template>

    <!-- Summary -->
    <template #summary>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-card border flat class="rounded-lg pa-4 bg-success-lighten-5 border-success">
            <div class="text-caption font-weight-bold text-success">إجمالي المبيعات</div>
            <div class="text-h4 font-weight-black text-success">{{ formatCurrency(summary.total_sales) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card border flat class="rounded-lg pa-4 bg-primary-lighten-5 border-primary">
            <div class="text-caption font-weight-bold text-primary">عدد الفواتير</div>
            <div class="text-h4 font-weight-black text-primary">{{ summary.total_invoices }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card border flat class="rounded-lg pa-4 bg-info-lighten-5 border-info">
            <div class="text-caption font-weight-bold text-info">قطع مباعة</div>
            <div class="text-h4 font-weight-black text-info">{{ summary.total_items_sold || 0 }}</div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Charts -->
    <template #charts>
      <SalesTrendChart :data="trendData" :loading="loading" />
    </template>

    <!-- Table -->
    <template #table>
      <AppDataTable :headers="headers" :items="reportData" :loading="loading" title="نتائج التقرير" icon="ri-table-line">
        <template #item.total="{ item }">
          <span class="font-weight-bold text-success">{{ formatCurrency(item.total || item.net_amount) }}</span>
        </template>
        <template #item.invoice_number="{ item }">
          <span class="text-primary font-weight-bold">#{{ item.invoice_number }}</span>
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
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى تقارير المبيعات. يرجى مراجعة المسؤول.</p>
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
import ReportLayout from '../components/ReportLayout.vue';
import SalesTrendChart from '../components/SalesTrendChart.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';

const { can, canAny } = usePermissions();

const api = useApi('/api/reports/sales');
const { exportToCSV } = usePrintExport();

const loading = ref(false);
const filters = ref({
  date_from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
  date_to: new Date().toISOString().split('T')[0],
  group_by: '',
});

const reportData = ref([]);
const trendData = ref([]);
const summary = ref({
  total_sales: 0,
  total_invoices: 0,
  total_items_sold: 0,
});

const headers = ref([
  { title: 'التاريخ', key: 'invoice_date' },
  { title: 'العميل', key: 'user.name' },
  { title: 'رقم الفاتورة', key: 'invoice_number' },
  { title: 'الإجمالي', key: 'total', align: 'end' },
]);

const loadReport = async () => {
  loading.value = true;
  try {
    // 1. Fetch Main Report
    const response = await api.get(filters.value, { showLoading: false });
    reportData.value = response.report?.data || response.report || [];
    summary.value = response.summary || { total_sales: 0, total_invoices: 0, total_items_sold: 0 };

    // Update headers based on grouping
    if (filters.value.group_by === 'product') {
      headers.value = [
        { title: 'المنتج', key: 'name' },
        { title: 'الكمية', key: 'total_qty', align: 'center' },
        { title: 'إجمالي المبيعات', key: 'total', align: 'end' },
      ];
    } else if (filters.value.group_by === 'customer') {
      headers.value = [
        { title: 'العميل', key: 'name' },
        { title: 'عدد الفواتير', key: 'invoice_count', align: 'center' },
        { title: 'إجمالي المشتريات', key: 'total', align: 'end' },
      ];
    } else {
      headers.value = [
        { title: 'رقم الفاتورة', key: 'invoice_number' },
        { title: 'العميل', key: 'user.name' },
        { title: 'التاريخ', key: 'invoice_date' },
        { title: 'الإجمالي', key: 'total', align: 'end' },
      ];
    }

    // 2. Fetch Trend Data for Chart
    const trendRes = await useApi('/api/reports/sales/trend').get(
      {
        period: 'day',
        date_from: filters.value.date_from,
        date_to: filters.value.date_to,
      },
      { showLoading: false }
    );
    trendData.value = trendRes.trend || [];
  } finally {
    loading.value = false;
  }
};

const handleExport = () => {
  if (!can(PERMISSIONS.REPORTS_EXPORT)) {
    return;
  }
  const data = reportData.value.map(item => ({
    البيان: item.invoice_number || item.name || item.date,
    'الطرف الآخر': item.user?.name || '-',
    التاريخ: item.invoice_date || item.date || '-',
    الإجمالي: item.total || 0,
  }));
  exportToCSV(data, `تقرير_المبيعات_${filters.value.date_from}.csv`);
};

onMounted(loadReport);
</script>
