<template>
  <v-card variant="flat" border class="chart-card rounded-xl overflow-hidden pa-1">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">تحليل المبيعات</div>
          <h3 class="text-h6 font-weight-black">اتجاه المبيعات (آخر 7 أيام)</h3>
        </div>
        <v-btn icon="ri-more-2-line" variant="text" size="small" color="grey" />
      </div>

      <div class="chart-wrapper">
        <apexchart v-if="!loading" type="area" height="300" :options="chartOptions" :series="series" />
        <div v-else class="d-flex align-center justify-center height-300">
          <v-progress-circular indeterminate color="primary" />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

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

const series = computed(() => [
  {
    name: 'المبيعات',
    data: props.data && props.data.length > 0 ? props.data.map(item => item.total || 0) : [],
  },
]);

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 3,
    colors: ['#3b82f6'],
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 100],
      colorStops: [
        { offset: 0, color: '#3b82f6', opacity: 0.4 },
        { offset: 100, color: '#3b82f6', opacity: 0.1 },
      ],
    },
  },
  xaxis: {
    categories: props.data && props.data.length > 0 ? props.data.map(item => item.date || '') : [],
    labels: {
      style: { colors: '#64748b', fontSize: '12px' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#64748b', fontSize: '12px' },
      formatter: val => `${val} ج.م`,
    },
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
  },
  tooltip: {
    theme: 'light',
    y: {
      formatter: val => `${val} ج.م`,
    },
  },
  colors: ['#3b82f6'],
}));
</script>

<style scoped>
.chart-card {
  height: 100%;
}
.height-300 {
  height: 300px;
}
.chart-wrapper {
  margin-inline-start: -15px;
  margin-inline-end: -10px;
}
</style>
