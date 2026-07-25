<template>
  <v-card border flat class="rounded-lg overflow-hidden mt-4">
    <div class="pa-4 d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between" style="gap: 16px">
      <div class="d-flex align-center">
        <v-icon icon="ri-funds-box-line" color="primary" size="24" class="me-2" />
        <h3 class="text-h6 font-weight-bold mb-0">تحليل أداء المنتجات المتقدم</h3>
      </div>

      <v-btn-toggle
        v-model="sortBy"
        mandatory
        color="primary"
        variant="tonal"
        class="analytics-toggle border rounded-lg overflow-hidden"
        @update:model-value="onSortChange"
      >
        <v-btn value="total_sold_quantity" size="small" class="px-4" style="min-width: 110px">الأكثر مبيعاً</v-btn>
        <v-btn value="total_profit" size="small" class="px-4" style="min-width: 110px">الأكثر ربحية</v-btn>
      </v-btn-toggle>
    </div>

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
                <span class="text-mini font-weight-bold text-grey-darken-3">{{ Math.round(value) }}%</span>
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
// يعرض جدول تحليل أداء المنتجات المتقدم تفاعلياً ويدعم الترتيب المباشر عبر الـ Runtime المركزي.
import { ref, computed, onMounted } from 'vue';
import { formatCurrency, getRelativeTime } from '@/utils/formatters';
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

const sortBy = ref('total_sold_quantity');
const dashboardStore = useDashboardStore();

const loading = computed(() => {
  return dashboardStore.widgetLoadingStates[props.instanceId] !== false;
});

const data = computed(() => {
  const wData = dashboardStore.dashboardData[props.instanceId];
  return Array.isArray(wData) ? wData : [];
});

const loadData = async () => {
  await dashboardStore.fetchWidgetData(props.instanceId, { sortBy: sortBy.value });
};

const onSortChange = (val) => {
  sortBy.value = val;
  loadData();
};

const calculateMargin = item => {
  const revenue = parseFloat(item.total_revenue || 0);
  const profit = parseFloat(item.total_profit || 0);
  if (!revenue || revenue === 0) return 0;
  return (profit / revenue) * 100;
};

onMounted(() => {
  // نقوم بطلب البيانات الأولية محلياً عند تفعيل المكون للتأكد من المزامنة
  loadData();
});
</script>

<script>
/**
 * مكون جدول أداء المنتجات المتقدم (ممتثل للـ Widget Contract)
 */
export default {
  name: 'ProductIntelligenceTable'
}
</script>

<style scoped>
.analytics-toggle {
  background: white;
}
.text-mini {
  font-size: 8px;
}
</style>
