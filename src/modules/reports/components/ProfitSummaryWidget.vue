<template>
  <v-card class="rounded-md" border flat>
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h3 class="text-h6 font-weight-bold">صافي الربح - هذا الشهر</h3>
          <p class="text-caption text-grey">مقارنة بالشهر الماضي</p>
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
            <span class="text-caption text-grey">مقارنة بالشهر الماضي</span>
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

        <v-btn block variant="tonal" color="primary" class="mt-4" prepend-icon="ri-line-chart-line" to="/reports/profit">
          عرض التقرير التفصيلي
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { formatCurrency } from '@/utils/formatters';

const loading = ref(true);
const profitData = ref({
  revenue: 0,
  costs: 0,
  netProfit: 0,
  change: 0,
});

const loadProfitData = async () => {
  loading.value = true;
  try {
    const api = useApi('/api/reports/profit-loss');

    // Current month
    const currentMonth = new Date();
    const dateFrom = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
    const dateTo = new Date().toISOString().split('T')[0];

    const current = await api.get({ date_from: dateFrom, date_to: dateTo }, { showLoading: false });

    // Last month
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastMonthFrom = lastMonth.toISOString().split('T')[0];
    const lastMonthTo = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).toISOString().split('T')[0];

    const last = await api.get({ date_from: lastMonthFrom, date_to: lastMonthTo }, { showLoading: false });

    const currentProfit = current.data?.summary?.net_profit || 0;
    const lastProfit = last.data?.summary?.net_profit || 0;

    profitData.value = {
      revenue: current.data?.summary?.total_revenue || 0,
      costs: current.data?.summary?.total_costs || 0,
      netProfit: currentProfit,
      change: lastProfit !== 0 ? ((currentProfit - lastProfit) / Math.abs(lastProfit)) * 100 : 0,
    };
  } catch (error) {
    console.error('Error loading profit data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadProfitData);
</script>
