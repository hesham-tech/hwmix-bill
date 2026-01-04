<template>
  <div class="cashflow-report-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">تقرير التدفق النقدي</h1>
      <p class="text-body-1 text-grey">حركة الأموال الواردة والصادرة</p>
    </div>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatsCard title="الوارد" :value="summary.inflow" type="currency" icon="ri-arrow-down-line" color="#4CAF50" :trend="summary.inflowTrend" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard title="الصادر" :value="summary.outflow" type="currency" icon="ri-arrow-up-line" color="#F44336" :trend="summary.outflowTrend" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard
          title="صافي التدفق"
          :value="summary.netflow"
          type="currency"
          icon="ri-exchange-dollar-line"
          color="#2196F3"
          :trend="summary.netflowTrend"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatsCard title="الرصيد الحالي" :value="summary.balance" type="currency" icon="ri-wallet-3-line" color="#9C27B0" />
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row>
      <v-col cols="12">
        <AppCard title="التدفق النقدي" icon="ri-line-chart-line">
          <div class="pa-4">
            <canvas ref="cashflowChartRef" height="300"></canvas>
          </div>
        </AppCard>
      </v-col>
    </v-row>

    <!-- Transactions Table -->
    <v-row class="mt-4">
      <v-col cols="12">
        <AppCard title="الحركات المالية" icon="ri-exchange-line">
          <AppDataTable :headers="headers" :items="transactions" :loading="loading">
            <template #item.type="{ item }">
              <v-chip :color="item.type === 'inflow' ? 'success' : 'error'" size="small">
                {{ item.type === 'inflow' ? 'وارد' : 'صادر' }}
              </v-chip>
            </template>

            <template #item.amount="{ item }">
              <span :class="item.type === 'inflow' ? 'text-success' : 'text-error'" class="font-weight-bold">
                {{ item.type === 'inflow' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
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

const cashflowChartRef = ref(null);
const loading = ref(false);

const summary = ref({
  inflow: 280000,
  outflow: 150000,
  netflow: 130000,
  balance: 450000,
  inflowTrend: '+12%',
  outflowTrend: '+8%',
  netflowTrend: '+18%',
});

const headers = [
  { title: 'التاريخ', key: 'date' },
  { title: 'النوع', key: 'type' },
  { title: 'الوصف', key: 'description' },
  { title: 'المبلغ', key: 'amount' },
];

const transactions = ref([
  { date: '2026-01-03', type: 'inflow', description: 'مبيعات', amount: 15000 },
  { date: '2026-01-03', type: 'outflow', description: 'مشتريات', amount: 8000 },
]);

const initChart = () => {
  if (cashflowChartRef.value) {
    new Chart(cashflowChartRef.value, {
      type: 'bar',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [
          {
            label: 'الوارد',
            data: [45000, 52000, 48000, 60000, 55000, 65000],
            backgroundColor: '#4CAF50',
          },
          {
            label: 'الصادر',
            data: [25000, 30000, 28000, 35000, 32000, 38000],
            backgroundColor: '#F44336',
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
});
</script>

<style scoped>
.cashflow-report-page {
  padding: 24px;
}
</style>
