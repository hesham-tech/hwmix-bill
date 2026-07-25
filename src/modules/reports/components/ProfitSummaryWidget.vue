<template>
  <v-card class="rounded-md h-100" border flat>
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h3 class="text-h6 font-weight-bold">صافي الربح والخسارة</h3>
          <p class="text-caption text-grey">مقارنة بالفترة السابقة</p>
        </div>
        <v-avatar size="48" color="success-lighten-5">
          <v-icon icon="ri-money-dollar-circle-line" size="24" color="success" />
        </v-avatar>
      </div>

      <div v-if="loading" class="text-center py-6">
        <v-progress-circular indeterminate color="primary" size="40" />
      </div>

      <div v-else>
        <div class="mb-4">
          <h2 class="text-h3 font-weight-bold" :class="profitData.netProfit >= 0 ? 'text-success' : 'text-error'">
            {{ formatCurrency(profitData.netProfit) }}
          </h2>
          <div class="d-flex align-center gap-2 mt-2">
            <v-chip
              :color="profitData.change >= 0 ? 'success' : 'error'"
              size="small"
              :prepend-icon="profitData.change >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"
            >
              {{ Math.abs(profitData.change).toFixed(1) }}%
            </v-chip>
            <span class="text-caption text-grey">مقارنة بالفترة السابقة</span>
          </div>
        </div>

        <v-divider class="my-4" />

        <div class="d-flex justify-space-between">
          <div>
            <p class="text-caption text-grey mb-1">الإيرادات</p>
            <p class="text-subtitle-1 font-weight-bold text-success">{{ formatCurrency(profitData.revenue) }}</p>
          </div>
          <div class="text-end">
            <p class="text-caption text-grey mb-1">التكاليف</p>
            <p class="text-subtitle-1 font-weight-bold text-error">{{ formatCurrency(profitData.costs) }}</p>
          </div>
        </div>

        <v-btn block variant="tonal" color="primary" class="mt-4" prepend-icon="ri-line-chart-line" to="/app/reports/profit">
          عرض التقرير التفصيلي
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
// يعرض كارت ملخص الأرباح والخسائر المقارن تفاعلياً من الـ Runtime المركزي دون استدعاءات API مباشرة.
import { computed, onMounted } from 'vue';
import { formatCurrency } from '@/utils/formatters';
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

const profitData = computed(() => {
  return dashboardStore.dashboardData[props.instanceId] || {
    revenue: 0,
    costs: 0,
    netProfit: 0,
    change: 0,
  };
});

const loadData = async () => {
  await dashboardStore.fetchWidgetData(props.instanceId);
};

onMounted(() => {
  loadData();
});
</script>

<script>
/**
 * مكون ملخص الأرباح والخسائر (ممتثل للـ Widget Contract)
 */
export default {
  name: 'ProfitSummaryWidget'
}
</script>
