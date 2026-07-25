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
// يعرض الرسم البياني لأفضل المنتجات مبيعاً تفاعلياً من خلال قراءة متجر الـ Runtime المركزي.
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
  return Array.isArray(wData) ? wData : (wData?.top_products || wData?.topProducts || []);
});

const series = computed(() => [
  {
    name: 'الكمية',
    data: data.value && data.value.length > 0 ? data.value.map(item => item.total_qty || item.total_sold_quantity || 0) : [],
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
      const label = opt.w.globals.labels[opt.dataPointIndex];
      return (label ? label + ':  ' : '') + val;
    },
    offsetX: 0,
  },
  legend: { show: false },
  xaxis: {
    categories: data.value && data.value.length > 0 ? data.value.map(item => item.name || item.product?.name || '') : [],
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

<script>
/**
 * مكون رسم أفضل خمسة منتجات (ممتثل للـ Widget Contract)
 */
export default {
  name: 'TopProductsChart'
}
</script>

<style scoped>
.chart-card {
  height: 100%;
}
.height-300 {
  height: 300px;
}
.chart-wrapper {
  position: relative;
  width: 100%;
}
</style>
