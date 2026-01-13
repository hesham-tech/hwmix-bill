<template>
  <v-card variant="flat" border class="chart-card rounded-xl overflow-hidden pa-1">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">تحليل الربحية</div>
          <h3 class="text-h6 font-weight-black">مقارنة الإيرادات والتكاليف والأرباح</h3>
        </div>
      </div>

      <div class="chart-wrapper">
        <apexchart v-if="!loading" type="bar" height="350" :options="chartOptions" :series="series" />
        <div v-else class="d-flex align-center justify-center height-350">
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
    name: 'الإيرادات',
    data: props.data.map(item => item.revenue),
  },
  {
    name: 'التكاليف',
    data: props.data.map(item => item.costs),
  },
  {
    name: 'الربح',
    data: props.data.map(item => item.profit),
  },
]);

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4,
    },
  },
  dataLabels: { enabled: false },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  xaxis: {
    categories: props.data.map(item => item.month),
    labels: {
      style: { colors: '#64748b', fontSize: '12px' },
    },
  },
  yaxis: {
    labels: {
      style: { colors: '#64748b', fontSize: '12px' },
      formatter: val => `${val} ج.م`,
    },
  },
  fill: { opacity: 1 },
  tooltip: {
    theme: 'light',
    y: {
      formatter: val => `${val} ج.م`,
    },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    fontFamily: 'Inter, sans-serif',
  },
  colors: ['#3b82f6', '#ef4444', '#10b981'], // Revenue(Blue), Cost(Red), Profit(Green)
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
  },
}));
</script>

<style scoped>
.chart-card {
  height: 100%;
}
.height-350 {
  height: 350px;
}
</style>
