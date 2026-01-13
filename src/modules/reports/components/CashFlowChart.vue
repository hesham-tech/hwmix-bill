<template>
  <v-card variant="flat" border class="chart-card rounded-xl overflow-hidden pa-1">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">السيولة النقدية</div>
          <h3 class="text-h6 font-weight-black">حركة المقبوضات والمدفوعات</h3>
        </div>
      </div>

      <div class="chart-wrapper">
        <apexchart v-if="!loading" type="line" height="300" :options="chartOptions" :series="series" />
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

// Group data by date
const groupedData = computed(() => {
  const groups = {};
  props.data.forEach(item => {
    const date = item.transaction_date;
    if (!groups[date]) groups[date] = { income: 0, expense: 0 };
    if (item.type === 'income') groups[date].income += parseFloat(item.amount);
    else groups[date].expense += Math.abs(parseFloat(item.amount));
  });

  return Object.keys(groups)
    .sort()
    .map(date => ({
      date,
      income: groups[date].income,
      expense: groups[date].expense,
    }));
});

const series = computed(() => [
  {
    name: 'المقبوضات',
    data: groupedData.value.map(item => item.income),
  },
  {
    name: 'المدفوعات',
    data: groupedData.value.map(item => item.expense),
  },
]);

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
  },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: groupedData.value.map(item => item.date),
    labels: { style: { colors: '#64748b' } },
  },
  yaxis: {
    labels: {
      formatter: val => `${val} ج.م`,
      style: { colors: '#64748b' },
    },
  },
  colors: ['#10b981', '#ef4444'],
  grid: { borderColor: '#f1f5f9' },
  tooltip: { theme: 'light' },
  legend: { position: 'top', horizontalAlign: 'right' },
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
