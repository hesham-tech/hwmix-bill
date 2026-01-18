<template>
  <v-card class="rounded-xl" border flat>
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
        <!-- Placeholder for actual chart - will be implemented with Chart.js -->
        <div class="chart-placeholder pa-6 bg-grey-lighten-4 rounded-lg text-center">
          <v-icon size="48" color="success">ri-pie-chart-2-line</v-icon>
          <p class="text-body-2 mt-2">الرسم البياني قيد التطوير</p>
          <div class="mt-4">
            <p class="text-caption">قيمة التكلفة: {{ formatCurrency(summary.total_cost_value) }}</p>
            <p class="text-caption">القيمة البيعية: {{ formatCurrency(summary.total_sale_value) }}</p>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters';

defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.chart-placeholder {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
