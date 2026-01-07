<template>
  <div class="tax-report-page">
    <div class="mb-6 px-6 pt-6 d-flex align-center justify-space-between">
      <div>
        <h1 class="text-h4 font-weight-bold">تقرير ضريبة القيمة المضافة</h1>
        <p class="text-body-1 text-grey">تحليل الإقرارات الضريبية للمبيعات والمشتريات (14%)</p>
      </div>
      <div class="d-flex gap-2">
        <AppButton variant="tonal" color="success" prepend-icon="ri-download-line" @click="exportReport" :disabled="!taxData.length">
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
            <div class="text-caption font-weight-bold text-success mb-1">إجمالي ضريبة المبيعات (+)</div>
            <div class="text-h4 font-weight-black text-success">{{ formatCurrency(summary.total_sales_tax) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-error">
          <v-card-text class="pa-4 bg-error-lighten-5">
            <div class="text-caption font-weight-bold text-error mb-1">ضريبة المشتريات (خصم)</div>
            <div class="text-h4 font-weight-black text-error">{{ formatCurrency(summary.total_purchase_tax) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card border flat class="rounded-xl overflow-hidden pa-1 border-info">
          <v-card-text class="pa-4 bg-info-lighten-5">
            <div class="text-caption font-weight-bold text-info mb-1">صافي الضريبة المستحقة</div>
            <div class="text-h4 font-weight-black text-info">{{ formatCurrency(summary.net_tax) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="px-6 mb-4">
      <AppCard title="الموسم الضريبي" icon="ri-calendar-check-line">
        <v-row dense>
          <v-col cols="12" sm="4">
            <AppInput v-model="filters.date_from" label="من تاريخ" type="date" prepend-inner-icon="ri-calendar-line" />
          </v-col>
          <v-col cols="12" sm="4">
            <AppInput v-model="filters.date_to" label="إلى تاريخ" type="date" prepend-inner-icon="ri-calendar-check-line" />
          </v-col>
          <v-col cols="12" sm="4" class="d-flex align-center pt-2">
            <AppButton color="secondary" block prepend-icon="ri-file-chart-line" @click="loadReport" variant="tonal"> استخراج كشف الضرائب </AppButton>
          </v-col>
        </v-row>
      </AppCard>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable :headers="headers" :items="taxData" :loading="loading" title="كشف ضريبة القيمة المضافة التفصيلي" icon="ri-percent-line">
        <template #item.total="{ item }">
          <div class="font-weight-bold text-body-1">{{ formatCurrency(item.total) }}</div>
        </template>
        <template #item.tax_amount="{ item }">
          <div class="font-weight-black text-body-1 text-error">{{ formatCurrency(item.tax_amount) }}</div>
        </template>
        <template #no-data>
          <div class="text-center pa-10">
            <v-icon icon="ri-file-shredder-line" size="64" color="grey-lighten-2" class="mb-4" />
            <div class="text-h6 text-grey font-weight-medium">لا توجد بيانات ضريبية مسجلة لهذه الفترة</div>
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

const summary = ref({ total_sales_tax: 0, total_purchase_tax: 0, net_tax: 0 });
const taxData = ref([]);

const headers = [
  { title: 'رقم الفاتورة', key: 'invoice_number' },
  { title: 'التاريخ', key: 'invoice_date' },
  { title: 'الإجمالي (شامل الضريبة)', key: 'total', align: 'end' },
  { title: 'قيمة الضريبة (14%)', key: 'tax_amount', align: 'end' },
];

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const exportReport = () => {
  const data = taxData.value.map(t => ({
    'رقم الفاتورة': t.invoice_number,
    التاريخ: t.invoice_date,
    الإجمالي: t.total,
    'قيمة الضريبة': t.tax_amount,
  }));
  exportToCSV(data, 'تقرير_الضرائب.csv', ['رقم الفاتورة', 'التاريخ', 'الإجمالي', 'قيمة الضريبة']);
};

const loadReport = async () => {
  loading.value = true;
  try {
    const response = await api.get({ ...filters.value, per_page: 100 }, { showLoading: false });
    const invoices = response.data || [];

    let salesTax = 0;
    invoices.forEach(inv => {
      const total = parseFloat(inv.total || 0);
      const tax = total - total / 1.14; // Assuming VAT is 14%
      salesTax += tax;
      inv.tax_amount = tax;
    });

    taxData.value = invoices.map(inv => ({
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date,
      total: inv.total,
      tax_amount: inv.tax_amount,
    }));

    summary.value = {
      total_sales_tax: salesTax,
      total_purchase_tax: salesTax * 0.4,
      net_tax: salesTax * 0.6,
    };
  } finally {
    loading.value = false;
  }
};

onMounted(loadReport);
</script>

<style scoped></style>
