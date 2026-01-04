<template>
  <div class="sales-report-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">تقرير المبيعات</h1>
      <p class="text-body-1 text-grey">تحليل مفصل لأداء المبيعات</p>
    </div>

    <!-- Filters -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select v-model="filters.period" :items="periods" label="الفترة" prepend-inner-icon="ri-calendar-line" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field v-model="filters.dateFrom" type="date" label="من" prepend-inner-icon="ri-calendar-2-line" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field v-model="filters.dateTo" type="date" label="إلى" prepend-inner-icon="ri-calendar-2-line" />
          </v-col>

          <v-col cols="12" md="3">
            <v-btn color="primary" block height="56" @click="loadReport">
              <v-icon icon="ri-search-line" class="me-2" />
              بحث
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="إجمالي المبيعات"
          :value="summary.totalSales"
          type="currency"
          icon="ri-shopping-cart-line"
          color="#4CAF50"
          :trend="summary.salesTrend"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard title="عدد الفواتير" :value="summary.invoiceCount" icon="ri-file-list-3-line" color="#2196F3" :trend="summary.invoiceTrend" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard title="متوسط قيمة الفاتورة" :value="summary.avgInvoice" type="currency" icon="ri-calculator-line" color="#FF9800" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="الربح الصافي"
          :value="summary.netProfit"
          type="currency"
          icon="ri-funds-line"
          color="#9C27B0"
          :trend="summary.profitTrend"
        />
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row>
      <v-col cols="12" md="8">
        <AppCard title="اتجاه المبيعات" icon="ri-line-chart-line">
          <template #title-actions>
            <v-btn-group density="compact" variant="outlined">
              <v-btn @click="chartView = 'daily'">يومي</v-btn>
              <v-btn @click="chartView = 'monthly'">شهري</v-btn>
              <v-btn @click="chartView = 'yearly'">سنوي</v-btn>
            </v-btn-group>
          </template>

          <div class="pa-4">
            <canvas ref="salesChartRef" height="350"></canvas>
          </div>
        </AppCard>
      </v-col>

      <v-col cols="12" md="4">
        <AppCard title="أعلى المنتجات مبيعاً" icon="ri-medal-line">
          <v-list>
            <v-list-item v-for="(product, index) in topProducts" :key="product.id">
              <template #prepend>
                <v-avatar :color="getMedalColor(index)" size="32">
                  {{ index + 1 }}
                </v-avatar>
              </template>

              <v-list-item-title>{{ product.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatCurrency(product.sales) }}
              </v-list-item-subtitle>

              <template #append>
                <v-chip size="small" color="success"> {{ product.quantity }} قطعة </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </AppCard>
      </v-col>
    </v-row>

    <!-- Detailed Table -->
    <v-row class="mt-4">
      <v-col cols="12">
        <AppCard title="تفاصيل المبيعات" icon="ri-table-line">
          <template #title-actions>
            <v-btn color="success" prepend-icon="ri-file-excel-line" @click="exportToExcel"> تصدير Excel </v-btn>
          </template>

          <AppDataTable :headers="headers" :items="salesData" :loading="loading">
            <template #item.amount="{ item }">
              <span class="font-weight-bold text-success">
                {{ formatCurrency(item.amount) }}
              </span>
            </template>

            <template #item.date="{ item }">
              {{ formatDate(item.date) }}
            </template>
          </AppDataTable>
        </AppCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { AppCard, AppDataTable } from '@/components';
import StatsCard from '@/components/common/StatsCard.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { reportService } from '@/api';
import Chart from 'chart.js/auto';

const salesChartRef = ref(null);
const loading = ref(false);
const chartView = ref('monthly');

const filters = ref({
  period: 'month',
  dateFrom: '',
  dateTo: '',
});

const periods = [
  { title: 'اليوم', value: 'today' },
  { title: 'هذا الأسبوع', value: 'week' },
  { title: 'هذا الشهر', value: 'month' },
  { title: 'هذا العام', value: 'year' },
  { title: 'مخصص', value: 'custom' },
];

const summary = ref({
  totalSales: 250000,
  invoiceCount: 485,
  avgInvoice: 515,
  netProfit: 75000,
  salesTrend: '+18.5%',
  invoiceTrend: '+12.3%',
  profitTrend: '+22.1%',
});

const topProducts = ref([
  { id: 1, name: 'منتج أ', sales: 45000, quantity: 120 },
  { id: 2, name: 'منتج ب', sales: 38000, quantity: 95 },
  { id: 3, name: 'منتج ج', sales: 32000, quantity: 80 },
  { id: 4, name: 'منتج د', sales: 28000, quantity: 70 },
  { id: 5, name: 'منتج هـ', sales: 25000, quantity: 65 },
]);

const headers = [
  { title: 'رقم الفاتورة', key: 'invoice_number' },
  { title: 'العميل', key: 'customer' },
  { title: 'المبلغ', key: 'amount' },
  { title: 'التاريخ', key: 'date' },
  { title: 'الحالة', key: 'status' },
];

const salesData = ref([
  { invoice_number: 'INV-001', customer: 'عميل 1', amount: 5000, date: '2026-01-03', status: 'مدفوعة' },
  { invoice_number: 'INV-002', customer: 'عميل 2', amount: 3500, date: '2026-01-03', status: 'معلقة' },
]);

const getMedalColor = index => {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4CAF50', '#2196F3'];
  return colors[index] || '#9E9E9E';
};

const loadReport = async () => {
  loading.value = true;
  try {
    // TODO: Load from API
    await new Promise(resolve => setTimeout(resolve, 500));
  } finally {
    loading.value = false;
  }
};

const exportToExcel = () => {
  reportService.exportToExcel('sales', filters.value);
};

const initChart = () => {
  if (salesChartRef.value) {
    new Chart(salesChartRef.value, {
      type: 'line',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [
          {
            label: 'المبيعات',
            data: [35000, 42000, 38000, 51000, 48000, 60000],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
};

onMounted(() => {
  initChart();
  loadReport();
});
</script>

<style scoped>
.sales-report-page {
  padding: 24px;
}
</style>
