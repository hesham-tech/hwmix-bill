<template>
  <v-card class="rounded-lg" border flat>
    <v-card-text class="pa-6">
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else-if="!data || data.length === 0" class="text-center py-12 text-grey">
        <v-icon size="64" color="grey-lighten-2">ri-bar-chart-line</v-icon>
        <p class="text-subtitle-1 mt-4">لا توجد بيانات للعرض</p>
      </div>
      <div v-else>
        <h3 class="text-h6 font-weight-black mb-6">مقارنة الربحية الشهرية</h3>
        <Line :data="chartData" :options="computedOptions" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const { mobile } = useDisplay();

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
  labels: props.data.map(item => item.month),
  datasets: [
    {
      label: 'الإيرادات',
      data: props.data.map(item => item.revenue),
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'التكاليف',
      data: props.data.map(item => item.costs),
      borderColor: '#F44336',
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'صافي الربح',
      data: props.data.map(item => item.profit),
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
}));

const computedOptions = computed(() => ({
  ...chartOptions,
  aspectRatio: mobile.value ? 1.2 : 2,
  plugins: {
    ...chartOptions.plugins,
    legend: {
      ...chartOptions.plugins.legend,
      position: mobile.value ? 'bottom' : 'top',
    },
  },
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
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
