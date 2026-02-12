<template>
  <v-card border flat class="rounded-lg overflow-hidden mt-4">
    <v-card-title class="pa-4 d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon icon="ri-funds-box-line" color="primary" class="me-2" />
        <span class="text-h6 font-weight-bold">تحليل أداء المنتجات المتقدم</span>
      </div>
      <v-btn-toggle v-model="sortBy" mandatory density="compact" color="primary" variant="tonal" @update:model-value="onSortChange">
        <v-btn value="total_sold_quantity" size="small">الأكثر مبيعاً</v-btn>
        <v-btn value="total_profit" size="small">الأكثر ربحية</v-btn>
      </v-btn-toggle>
    </v-card-title>

    <v-divider />

    <v-table hover density="comfortable">
      <thead>
        <tr>
          <th class="text-right font-weight-bold">المنتج</th>
          <th class="text-center font-weight-bold">الكمية المباعة</th>
          <th class="text-center font-weight-bold">إجمالي المبيعات</th>
          <th class="text-center font-weight-bold">صافي الربح</th>
          <th class="text-center font-weight-bold">هامش الربح</th>
          <th class="text-left font-weight-bold">آخر عملية بيع</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id">
          <td class="text-right">
            <div class="font-weight-bold text-body-1">{{ item.product?.name }}</div>
            <div class="text-caption text-grey">SKU: {{ item.product?.sku || 'N/A' }}</div>
          </td>
          <td class="text-center">
            <v-chip size="small" variant="tonal" color="info">{{ item.total_sold_quantity }}</v-chip>
          </td>
          <td class="text-center font-weight-medium">{{ formatCurrency(item.total_revenue) }}</td>
          <td class="text-center">
            <span class="text-success font-weight-bold">{{ formatCurrency(item.total_profit) }}</span>
          </td>
          <td class="text-center">
            <v-progress-linear :model-value="calculateMargin(item)" color="success" height="8" rounded class="mt-1">
              <template v-slot:default="{ value }">
                <span class="text-mini font-weight-bold">{{ Math.round(value) }}%</span>
              </template>
            </v-progress-linear>
          </td>
          <td class="text-left text-caption text-grey">
            {{ getRelativeTime(item.last_sold_at) }}
          </td>
        </tr>

        <tr v-if="!loading && data.length === 0">
          <td colspan="6" class="text-center pa-8 text-grey">لا توجد بيانات متاحة حالياً</td>
        </tr>

        <tr v-if="loading">
          <td colspan="6" class="text-center pa-4">
            <v-progress-linear indeterminate color="primary" />
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { formatCurrency, getRelativeTime } from '@/utils/formatters';

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

const emit = defineEmits(['sort-change']);
const sortBy = ref('total_sold_quantity');

const onSortChange = val => {
  emit('sort-change', val);
};

const calculateMargin = item => {
  if (!item.total_revenue || item.total_revenue === 0) return 0;
  return (item.total_profit / item.total_revenue) * 100;
};
</script>

<style scoped>
.text-mini {
  font-size: 10px;
  color: #fff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}
</style>
