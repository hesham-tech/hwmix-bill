<template>
  <v-card variant="flat" border class="chart-card rounded-xl overflow-hidden pa-1">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">توزيع القيمة</div>
          <h3 class="text-h6 font-weight-black">قيمة التكلفة مقابل الربح التقديري</h3>
        </div>
      </div>

      <div class="chart-wrapper d-flex justify-center">
        <apexchart v-if="!loading" type="donut" width="380" :options="chartOptions" :series="series" />
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
  summary: {
    type: Object,
    default: () => ({ total_cost_value: 0, potential_profit: 0 }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const series = computed(() => [props.summary.total_cost_value || 0, props.summary.potential_profit || 0]);

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Inter, sans-serif',
  },
  labels: ['إجمالي التكلفة', 'الربح المتوقع'],
  colors: ['#3b82f6', '#10b981'],
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'إجمالي القيمة البيعية',
            formatter: w => {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(total);
            },
          },
        },
      },
    },
  },
  legend: {
    position: 'bottom',
    fontFamily: 'Inter, sans-serif',
  },
  dataLabels: { enabled: false },
  tooltip: {
    y: {
      formatter: val => new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(val),
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
