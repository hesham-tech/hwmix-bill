<template>
  <div class="sales-report-page">
    <div class="mb-6 px-6 pt-6">
      <h1 class="text-h4 font-weight-bold">تقرير المبيعات التفصيلي</h1>
      <p class="text-body-1 text-grey">تحليل أداء المبيعات والإيرادات والأرباح التشغيلية</p>
    </div>

    <div class="px-6 mb-4">
      <AppCard title="خيارات البحث والفلترة" icon="ri-filter-3-line">
        <v-row dense>
          <v-col cols="12" sm="4" md="3">
            <AppInput v-model="filters.date_from" label="من تاريخ" type="date" prepend-inner-icon="ri-calendar-line" />
          </v-col>
          <v-col cols="12" sm="4" md="3">
            <AppInput v-model="filters.date_to" label="إلى تاريخ" type="date" prepend-inner-icon="ri-calendar-check-line" />
          </v-col>
          <v-col cols="12" sm="4" md="6" class="d-flex align-center pt-2">
            <AppButton color="primary" block prepend-icon="ri-search-line" @click="loadReport" class="me-2"> عرض التقرير </AppButton>
            <AppButton variant="tonal" color="success" prepend-icon="ri-file-excel-2-line" @click="exportReport" :disabled="!invoices.length">
              تصدير
            </AppButton>
          </v-col>
        </v-row>
      </AppCard>
    </div>

    <v-row class="px-6 mx-0 mb-4" dense>
      <v-col cols="12" sm="6" md="3">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-success">
          <v-card-text class="pa-4 bg-success-lighten-5">
            <div class="text-caption font-weight-bold text-success mb-1">إجمالي المبيعات</div>
            <div class="text-h4 font-weight-black text-success">{{ formatCurrency(summary.total_sales) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card border flat class="rounded-xl overflow-hidden pa-1">
          <v-card-text class="pa-4 bg-grey-lighten-5">
            <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">عدد الفواتير</div>
            <div class="text-h4 font-weight-black">{{ summary.total_invoices }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card border flat class="rounded-xl overflow-hidden pa-1">
          <v-card-text class="pa-4 bg-grey-lighten-5">
            <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">متوسط الفاتورة</div>
            <div class="text-h4 font-weight-black">{{ formatCurrency(summary.average_invoice) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-info">
          <v-card-text class="pa-4 bg-info-lighten-5">
            <div class="text-caption font-weight-bold text-info mb-1">الربح التقديري</div>
            <div class="text-h4 font-weight-black text-info">{{ formatCurrency(summary.profit) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="px-6 pb-6">
      <AppDataTable :headers="headers" :items="invoices" :loading="loading" title="كشف الفواتير التفصيلي" icon="ri-file-list-3-line">
        <template #item.invoice_number="{ item }">
          <div class="font-weight-black text-primary">#{{ item.invoice_number }}</div>
        </template>
        <template #item.total="{ item }">
          <div class="font-weight-black text-h6 text-success">{{ formatCurrency(item.total) }}</div>
        </template>
        <template #no-data>
          <div class="text-center pa-10">
            <v-icon icon="ri-file-history-line" size="64" color="grey-lighten-2" class="mb-4" />
            <div class="text-h6 text-grey font-weight-medium">لا توجد بيانات متاحة لهذا النطاق الزمني</div>
            <div class="text-body-2 text-grey">جرب اختيار تواريخ مختلفة لعرض النتائج</div>
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

const api = useApi('/api/invoices');
const { exportToCSV } = usePrintExport();

const loading = ref(false);
const filters = ref({
  date_from: new Date(new Date().setDate(1)).toISOString().split('T')[0],
  date_to: new Date().toISOString().split('T')[0],
});

const summary = ref({
  total_sales: 0,
  total_invoices: 0,
  average_invoice: 0,
  profit: 0,
});

const invoices = ref([]);

const headers = [
  { title: 'رقم الفاتورة', key: 'invoice_number' },
  { title: 'العميل', key: 'customer.name' },
  { title: 'التاريخ', key: 'invoice_date' },
  { title: 'الإجمالي', key: 'total', align: 'end' },
];

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const exportReport = () => {
  const data = invoices.value.map(inv => ({
    'رقم الفاتورة': inv.invoice_number,
    العميل: inv.customer?.name || '-',
    التاريخ: inv.invoice_date,
    الإجمالي: inv.total,
  }));
  exportToCSV(data, `تقرير_المبيعات_${filters.value.date_from}_إلى_${filters.value.date_to}.csv`, ['رقم الفاتورة', 'العميل', 'التاريخ', 'الإجمالي']);
};

const loadReport = async () => {
  loading.value = true;
  try {
    const response = await api.get({ ...filters.value, per_page: 100 }, { showLoading: false });
    invoices.value = response.data || [];

    const total = invoices.value.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    summary.value = {
      total_sales: total,
      total_invoices: invoices.value.length,
      average_invoice: invoices.value.length ? total / invoices.value.length : 0,
      profit: total * 0.3,
    };
  } finally {
    loading.value = false;
  }
};

onMounted(loadReport);
</script>

<style scoped></style>
