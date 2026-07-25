<template>
  <v-card variant="flat" border class="chart-card rounded-md overflow-hidden pa-1">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">تحليل المبيعات</div>
          <h3 class="text-h6 font-weight-bold">اتجاه المبيعات (آخر 7 أيام)</h3>
        </div>
        <v-btn icon="ri-more-2-line" variant="text" size="small" color="grey" />
      </div>

      <div class="chart-wrapper">
        <div v-show="!loading">
          <apexchart v-if="data && data.length > 0" type="area" height="300" :options="chartOptions" :series="series" />
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
// يعرض الرسم البياني لاتجاه المبيعات الأسبوعي تفاعلياً من الـ Runtime المركزي دون طلبات مستقلة.
import { computed } from 'vue';
import { useDashboardStore } from '@/@core/dashboard/store/dashboardStore';

const props = defineProps({
  instanceId: {
    type: String,
    required: true
  },
  userConfig: {
    type: Object,
    default: () => ({})
  }
});

const dashboardStore = useDashboardStore();

const loading = computed(() => {
  return dashboardStore.widgetLoadingStates[props.instanceId] !== false;
});

const data = computed(() => {
  const wData = dashboardStore.dashboardData[props.instanceId];
  return wData?.sales_trend || wData?.salesTrend || [];
});

const series = computed(() => [
  {
    name: 'المبيعات',
    data: data.value && data.value.length > 0 ? data.value.map(item => item.total_sales || item.total || 0) : [],
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
    categories: data.value && data.value.length > 0 ? data.value.map(item => item.period || '') : [],
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

<script>
/**
 * مكون اتجاه المبيعات (ممتثل للـ Widget Contract)
 */
export default {
  name: 'SalesTrendChart'
}
</script>

<style scoped>
.height-300 {
  height: 300px;
}
.chart-wrapper {
  position: relative;
  width: 100%;
}
</style>
