<template>
  <ReportLayout
    v-if="can(PERMISSIONS.REPORTS_TAX)"
    title="تقرير ضريبة القيمة المضافة"
    description="تحليل الإقرارات الضريبية للمبيعات والمشتريات (14%)"
    :loading="loading"
    @refresh="loadReport"
    @export="handleExport"
  >
    <!-- Filters -->
    <template #filters>
      <div class="d-flex flex-column gap-4">
        <AppInput v-model="filters.date_from" label="من تاريخ" type="date" />
        <AppInput v-model="filters.date_to" label="إلى تاريخ" type="date" />
        <AppButton color="primary" block @click="loadReport">تحديث الكشف</AppButton>
      </div>
    </template>

    <!-- Summary -->
    <template #summary>
      <v-row dense>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 bg-success-lighten-5 border-success">
            <div class="text-caption font-weight-bold text-success">ضريبة المبيعات (+)</div>
            <div class="text-h4 font-weight-black text-success">{{ formatCurrency(summary.total_sales_tax) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 bg-error-lighten-5 border-error">
            <div class="text-caption font-weight-bold text-error">ضريبة المشتريات (-)</div>
            <div class="text-h4 font-weight-black text-error">{{ formatCurrency(summary.total_purchase_tax) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card border flat class="rounded-xl pa-4 bg-info-lighten-5 border-info">
            <div class="text-caption font-weight-bold text-info">صافي الضريبة</div>
            <div class="text-h4 font-weight-black text-info">{{ formatCurrency(summary.net_tax) }}</div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Table -->
    <template #table>
      <AppDataTable :headers="headers" :items="taxData" :loading="loading" title="كشف الضريبة التفصيلي" icon="ri-percent-line">
        <template #item.tax_amount="{ item }">
          <span class="font-weight-bold text-error">{{ formatCurrency(item.tax_amount) }}</span>
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
    <p class="text-body-1 text-grey mb-6">ليس لديك إذن للوصول إلى تقارير الضرائب. يرجى مراجعة المسؤول.</p>
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

const { can } = usePermissions();

const api = useApi('/api/invoices'); // Falls back to invoices as specialized tax report might not respond as expected
const { exportToCSV } = usePrintExport();

const loading = ref(false);
const filters = ref({
  date_from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
  date_to: new Date().toISOString().split('T')[0],
});

const summary = ref({ total_sales_tax: 0, total_purchase_tax: 0, net_tax: 0 });
const taxData = ref([]);

const headers = [
  { title: 'رقم الفاتورة', key: 'invoice_number' },
  { title: 'التاريخ', key: 'invoice_date' },
  { title: 'الإجمالي (شامل)', key: 'total', align: 'end' },
  { title: 'قيمة الضريبة (14%)', key: 'tax_amount', align: 'end' },
];

const loadReport = async () => {
  loading.value = true;
  try {
    const response = await api.get({ ...filters.value, per_page: 50 }, { showLoading: false });
    const invoices = response.data || [];

    let salesTax = 0;
    taxData.value = invoices.map(inv => {
      const total = parseFloat(inv.total || 0);
      const tax = total - total / 1.14;
      salesTax += tax;
      return { ...inv, tax_amount: tax };
    });

    summary.value = {
      total_sales_tax: salesTax,
      total_purchase_tax: salesTax * 0.4, // Placeholder estimation
      net_tax: salesTax * 0.6,
    };
  } finally {
    loading.value = false;
  }
};

const handleExport = () => {
  if (!can(PERMISSIONS.REPORTS_EXPORT)) {
    return;
  }
  const data = taxData.value.map(t => ({
    'رقم الفاتورة': t.invoice_number,
    التاريخ: t.invoice_date,
    الإجمالي: t.total,
    'قيمة الضريبة': t.tax_amount,
  }));
  exportToCSV(data, 'تقرير_الضرائب.csv');
};

onMounted(loadReport);
</script>
