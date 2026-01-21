<template>
  <v-card class="rounded-xl" border flat>
    <v-card-text class="pa-6">
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else-if="!data || data.length === 0" class="text-center py-12 text-grey">
        <v-icon size="64" color="grey-lighten-2">ri-line-chart-line</v-icon>
        <p class="text-subtitle-1 mt-4">لا توجد حركات للعرض</p>
      </div>
      <div v-else>
        <h3 class="text-h6 font-weight-black mb-6">تدفق السيولة النقدية</h3>
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { formatCurrency, formatNumber } from '@/utils/formatters';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const chartData = computed(() => ({
  labels: props.data.map(item => item.period),
  datasets: [
    {
      label: 'المقبوضات',
      data: props.data.map(item => item.total_in || 0),
      backgroundColor: 'rgba(76, 175, 80, 0.8)',
      borderColor: '#4CAF50',
      borderWidth: 1,
    },
    {
      label: 'المدفوعات',
      data: props.data.map(item => item.total_out || 0),
      backgroundColor: 'rgba(244, 67, 54, 0.8)',
      borderColor: '#F44336',
      borderWidth: 1,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      display: true,
      position: 'top',
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
          const label = context.dataset.label || '';
          const value = formatCurrency(context.parsed.y);
          return `${label}: ${value}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        font: {
          family: 'Cairo, sans-serif',
        },
        callback: value => {
          return formatNumber(value, 0); // Simplified for y-axis
        },
      },
    },
    x: {
      ticks: {
        font: {
          family: 'Cairo, sans-serif',
        },
      },
    },
  },
};
</script>
