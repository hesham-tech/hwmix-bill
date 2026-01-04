<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <h1 class="text-h4 font-weight-bold">لوحة التحكم</h1>
      <p class="text-body-1 text-grey">نظرة عامة على أداء النظام</p>
    </div>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" variant="tonal">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline">إجمالي الإيرادات</div>
                <div class="text-h5 font-weight-bold">{{ formatCurrency(stats.totalRevenue) }}</div>
                <div class="text-caption">{{ stats.revenueTrend }}</div>
              </div>
              <v-icon icon="ri-money-dollar-circle-line" size="48" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" variant="tonal">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline">الفواتير</div>
                <div class="text-h5 font-weight-bold">{{ stats.totalInvoices }}</div>
                <div class="text-caption">{{ stats.invoicesTrend }}</div>
              </div>
              <v-icon icon="ri-file-list-3-line" size="48" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" variant="tonal">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline">المدفوعات المعلقة</div>
                <div class="text-h5 font-weight-bold">{{ formatCurrency(stats.pendingPayments) }}</div>
                <div class="text-caption">{{ stats.pendingTrend }}</div>
              </div>
              <v-icon icon="ri-time-line" size="48" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="purple" variant="tonal">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-overline">العملاء النشطين</div>
                <div class="text-h5 font-weight-bold">{{ stats.activeCustomers }}</div>
                <div class="text-caption">+8.5%</div>
              </div>
              <v-icon icon="ri-team-line" size="48" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Row -->
    <v-row class="mb-6">
      <!-- Revenue Chart -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon icon="ri-line-chart-line" class="me-2" />
            اتجاه الإيرادات
          </v-card-title>
          <v-card-text>
            <canvas ref="revenueChartRef" height="300"></canvas>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Sales by Category -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon icon="ri-pie-chart-line" class="me-2" />
            المبيعات حسب الفئة
          </v-card-title>
          <v-card-text>
            <canvas ref="categoryChartRef" height="300"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions & Recent Activity -->
    <v-row>
      <!-- Quick Actions -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon icon="ri-flashlight-line" class="me-2" />
            إجراءات سريعة
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list>
              <v-list-item
                v-for="action in quickActions"
                :key="action.title"
                :prepend-icon="action.icon"
                :title="action.title"
                :subtitle="action.subtitle"
                @click="handleAction(action.route)"
              >
                <template #append>
                  <v-btn :color="action.color" variant="tonal" size="small" icon="ri-arrow-right-line" />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Recent Activity -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon icon="ri-history-line" class="me-2" />
            النشاط الأخير
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="activityHeaders" :items="recentActivity" :items-per-page="5" density="comfortable">
              <template #item.type="{ item }">
                <v-chip :color="getActivityColor(item.type)" size="small">
                  {{ item.type }}
                </v-chip>
              </template>

              <template #item.amount="{ item }">
                <span class="font-weight-bold">
                  {{ formatCurrency(item.amount) }}
                </span>
              </template>

              <template #item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Low Stock Alert -->
    <v-row class="mt-4" v-if="lowStockItems.length">
      <v-col cols="12">
        <v-alert type="warning" variant="tonal" border="start" closable>
          <template #title>
            <v-icon icon="ri-alert-line" class="me-2" />
            تنبيه: منتجات منخفضة المخزون
          </template>
          <div class="d-flex flex-wrap gap-2 mt-2">
            <v-chip v-for="item in lowStockItems" :key="item.id" color="warning" size="small"> {{ item.name }}: {{ item.stock }} </v-chip>
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Chart from 'chart.js/auto';

const router = useRouter();

// Simple StatsCard component inline
const StatsCard = null; // Will use v-card instead

const revenueChartRef = ref(null);
const categoryChartRef = ref(null);

const stats = ref({
  totalRevenue: 125000,
  totalInvoices: 342,
  pendingPayments: 45000,
  activeCustomers: 156,
  revenueTrend: '+12.5%',
  invoicesTrend: '+8.2%',
  pendingTrend: '-5.3%',
});

const quickActions = [
  {
    title: 'فاتورة جديدة',
    subtitle: 'إنشاء فاتورة بيع',
    icon: 'ri-file-add-line',
    color: 'primary',
    route: '/invoices/create',
  },
  {
    title: 'تسجيل دفعة',
    subtitle: 'إضافة دفعة جديدة',
    icon: 'ri-money-dollar-circle-line',
    color: 'success',
    route: '/payments/create',
  },
  {
    title: 'منتج جديد',
    subtitle: 'إضافة منتج للمخزون',
    icon: 'ri-shopping-bag-line',
    color: 'info',
    route: '/products/create',
  },
  {
    title: 'عرض التقارير',
    subtitle: 'تقارير مفصلة',
    icon: 'ri-bar-chart-line',
    color: 'warning',
    route: '/reports',
  },
];

const activityHeaders = [
  { title: 'النوع', key: 'type' },
  { title: 'الوصف', key: 'description' },
  { title: 'المبلغ', key: 'amount' },
  { title: 'التاريخ', key: 'date' },
];

const recentActivity = ref([
  { type: 'فاتورة', description: 'فاتورة #1234', amount: 5000, date: '2026-01-03' },
  { type: 'دفعة', description: 'دفعة نقدية', amount: 3000, date: '2026-01-03' },
  { type: 'منتج', description: 'إضافة منتج جديد', amount: 0, date: '2026-01-02' },
]);

const lowStockItems = ref([
  { id: 1, name: 'منتج أ', stock: 5 },
  { id: 2, name: 'منتج ب', stock: 3 },
]);

const getActivityColor = type => {
  const colors = {
    فاتورة: 'primary',
    دفعة: 'success',
    منتج: 'info',
  };
  return colors[type] || 'grey';
};

const handleAction = route => {
  router.push(route);
};

const initCharts = () => {
  // Revenue Chart
  if (revenueChartRef.value) {
    new Chart(revenueChartRef.value, {
      type: 'line',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [
          {
            label: 'الإيرادات',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
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
        plugins: {
          legend: { display: false },
        },
      },
    });
  }

  // Category Chart
  if (categoryChartRef.value) {
    new Chart(categoryChartRef.value, {
      type: 'doughnut',
      data: {
        labels: ['إلكترونيات', 'ملابس', 'أغذية', 'أخرى'],
        datasets: [
          {
            data: [45, 25, 20, 10],
            backgroundColor: ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0'],
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
  initCharts();
});
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
}

.dashboard-header {
  margin-bottom: 24px;
}
</style>
