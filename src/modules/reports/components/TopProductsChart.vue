<template>
  <v-card variant="flat" border class="chart-card rounded-md overflow-hidden pa-1">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">الأكثر مبيعاً</div>
          <h3 class="text-h6 font-weight-bold">أفضل 5 منتجات</h3>
        </div>
        <v-btn icon="ri-bar-chart-2-line" variant="text" size="small" color="primary" />
      </div>

      <div class="chart-wrapper">
        <div v-show="!loading">
          <apexchart v-if="data && data.length > 0" type="bar" height="300" :options="chartOptions" :series="series" />
          <div v-else-if="!loading" class="d-flex align-center justify-center height-300 text-grey">لا تتوفر بيانات للعرض</div>
        </div>
        <div v-if="loading" class="d-flex align-center justify-center height-300">
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
    name: 'الكمية',
    data: props.data && props.data.length > 0 ? props.data.map(item => item.total_qty || 0) : [],
  },
]);

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
  },
  plotOptions: {
    bar: {
      borderRadius: 6,
      horizontal: true,
      distributed: true,
      barHeight: '60%',
    },
  },
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  dataLabels: {
    enabled: true,
    textAnchor: 'start',
    style: { colors: ['#fff'] },
    formatter: function (val, opt) {
      return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val;
    },
    offsetX: 0,
  },
  legend: { show: false },
  xaxis: {
    categories: props.data && props.data.length > 0 ? props.data.map(item => item.name || '') : [],
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { show: false },
  },
  grid: {
    show: false,
  },
  tooltip: {
    theme: 'light',
    y: {
      formatter: val => `${val} قطعة`,
    },
  },
}));
</script>

<style scoped>
.chart-card {
  height: 100%;
}
.height-300 {
  height: 300px;
}
</style>
