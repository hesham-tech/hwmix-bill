<template>
  <v-card class="rounded-md" border flat>
    <v-card-text class="pa-6">
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else-if="!summary || summary.total_cost_value === 0" class="text-center py-12 text-grey">
        <v-icon size="64" color="grey-lighten-2">ri-pie-chart-line</v-icon>
        <p class="text-subtitle-1 mt-4">لا توجد بيانات للعرض</p>
      </div>
      <div v-else>
        <h3 class="text-h6 font-weight-black mb-6">توزيع قيمة المخزون</h3>
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatCurrency } from '@/utils/formatters';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const chartData = computed(() => ({
  labels: ['قيمة التكلفة', 'هامش الربح المتوقع'],
  datasets: [
    {
      data: [props.summary.total_cost_value || 0, props.summary.potential_profit || 0],
      backgroundColor: ['#FF9800', '#4CAF50'],
      borderColor: ['#F57C00', '#388E3C'],
      borderWidth: 2,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.5,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      rtl: true,
      labels: {
        font: {
          family: 'Cairo, sans-serif',
          size: 12,
        },
        padding: 15,
        usePointStyle: true,
      },
    },
    tooltip: {
      rtl: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        family: 'Cairo, sans-serif',
        size: 14,
      },
      bodyFont: {
        family: 'Cairo, sans-serif',
        size: 13,
      },
      callbacks: {
        label: context => {
          const label = context.label || '';
          const value = formatCurrency(context.parsed);
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((context.parsed / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};
</script>
