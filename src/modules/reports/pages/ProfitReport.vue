<template>
  <div class="profit-report-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">تقرير الأرباح</h1>
      <p class="text-body-1 text-grey">تحليل الأرباح والخسائر</p>
    </div>

    <!-- Filters -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select v-model="filters.period" :items="periods" label="الفترة" prepend-inner-icon="ri-calendar-line" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field v-model="filters.dateFrom" type="date" label="من" prepend-inner-icon="ri-calendar-2-line" />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field v-model="filters.dateTo" type="date" label="إلى" prepend-inner-icon="ri-calendar-2-line" />
          </v-col>

          <v-col cols="12" md="2">
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
          title="إجمالي الإيرادات"
          :value="summary.revenue"
          type="currency"
          icon="ri-arrow-up-circle-line"
          color="#4CAF50"
          :trend="summary.revenueTrend"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="إجمالي التكاليف"
          :value="summary.costs"
          type="currency"
          icon="ri-arrow-down-circle-line"
          color="#F44336"
          :trend="summary.costsTrend"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard title="صافي الربح" :value="summary.profit" type="currency" icon="ri-funds-line" color="#2196F3" :trend="summary.profitTrend" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard title="هامش الربح" :value="summary.margin" type="percentage" icon="ri-percent-line" color="#9C27B0" />
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row>
      <v-col cols="12" md="8">
        <AppCard title="اتجاه الأرباح" icon="ri-line-chart-line">
          <div class="pa-4">
            <canvas ref="profitChartRef" height="350"></canvas>
          </div>
        </AppCard>
      </v-col>

      <v-col cols="12" md="4">
        <AppCard title="التوزيع" icon="ri-pie-chart-line">
          <div class="pa-4">
            <canvas ref="distributionChartRef" height="350"></canvas>
          </div>
        </AppCard>
      </v-col>
    </v-row>

    <!-- Detailed Breakdown -->
    <v-row class="mt-4">
      <v-col cols="12">
        <AppCard title="تفصيل الأرباح" icon="ri-table-line">
          <AppDataTable :headers="headers" :items="profitData" :loading="loading">
            <template #item.revenue="{ item }">
              <span class="text-success font-weight-bold">
                {{ formatCurrency(item.revenue) }}
              </span>
            </template>

            <template #item.cost="{ item }">
              <span class="text-error">
                {{ formatCurrency(item.cost) }}
              </span>
            </template>

            <template #item.profit="{ item }">
              <span :class="item.profit >= 0 ? 'text-success' : 'text-error'" class="font-weight-bold">
                {{ formatCurrency(item.profit) }}
              </span>
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
import { formatCurrency } from '@/utils/formatters';
import Chart from 'chart.js/auto';

const profitChartRef = ref(null);
const distributionChartRef = ref(null);
const loading = ref(false);

const filters = ref({
  period: 'month',
  dateFrom: '',
  dateTo: '',
});

const periods = [
  { title: 'هذا الشهر', value: 'month' },
  { title: 'هذا الربع', value: 'quarter' },
  { title: 'هذا العام', value: 'year' },
];

const summary = ref({
  revenue: 350000,
  costs: 220000,
  profit: 130000,
  margin: 37,
  revenueTrend: '+15%',
  costsTrend: '+8%',
  profitTrend: '+25%',
});

const headers = [
  { title: 'الفترة', key: 'period' },
  { title: 'الإيرادات', key: 'revenue' },
  { title: 'التكاليف', key: 'cost' },
  { title: 'الربح', key: 'profit' },
];

const profitData = ref([
  { period: 'يناير', revenue: 50000, cost: 30000, profit: 20000 },
  { period: 'فبراير', revenue: 60000, cost: 38000, profit: 22000 },
]);

const loadReport = () => {
  loading.value = true;
  setTimeout(() => (loading.value = false), 500);
};

const initCharts = () => {
  if (profitChartRef.value) {
    new Chart(profitChartRef.value, {
      type: 'line',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [
          {
            label: 'الإيرادات',
            data: [50000, 60000, 55000, 70000, 65000, 75000],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
          },
          {
            label: 'التكاليف',
            data: [30000, 38000, 35000, 45000, 40000, 48000],
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  if (distributionChartRef.value) {
    new Chart(distributionChartRef.value, {
      type: 'doughnut',
      data: {
        labels: ['إيرادات', 'تكاليف', 'ربح'],
        datasets: [
          {
            data: [350000, 220000, 130000],
            backgroundColor: ['#4CAF50', '#F44336', '#2196F3'],
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
.profit-report-page {
  padding: 24px;
}
</style>
