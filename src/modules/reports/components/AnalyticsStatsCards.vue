<template>
  <v-row dense>
    <!-- Revenue Card -->
    <v-col cols="12" sm="6" md="4">
      <v-card border flat class="stat-card overflow-hidden">
        <v-card-text class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-avatar color="primary" variant="tonal" size="48" class="rounded-lg">
              <v-icon icon="ri-money-dollar-circle-line" size="28" />
            </v-avatar>
            <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">اليوم</v-chip>
          </div>

          <div class="text-overline text-grey-darken-1 mb-1">إجمالي الإيرادات</div>
          <div class="text-h4 font-weight-black mb-2">{{ formatCurrency(stats.today.revenue) }}</div>

          <div class="d-flex align-center pt-2 border-t mt-3">
            <v-icon icon="ri-calendar-line" size="14" class="me-1 text-grey" />
            <span class="text-caption text-grey">هذا الشهر: </span>
            <span class="text-caption font-weight-bold ms-1">{{ formatCurrency(stats.month_to_date.revenue) }}</span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Profit Card -->
    <v-col cols="12" sm="6" md="4">
      <v-card border flat class="stat-card overflow-hidden">
        <v-card-text class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-avatar color="success" variant="tonal" size="48" class="rounded-lg">
              <v-icon icon="ri-hand-coin-line" size="28" />
            </v-avatar>
            <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">صافي</v-chip>
          </div>

          <div class="text-overline text-grey-darken-1 mb-1">صافي الأرباح (اليوم)</div>
          <div class="text-h4 font-weight-black mb-2 text-success">{{ formatCurrency(stats.today.profit) }}</div>

          <div class="d-flex align-center pt-2 border-t mt-3">
            <v-icon icon="ri-line-chart-line" size="14" class="me-1 text-success" />
            <span class="text-caption text-grey">الهامش التقريبي: </span>
            <span class="text-caption font-weight-bold ms-1 text-success">
              {{ stats.today.revenue > 0 ? ((stats.today.profit / stats.today.revenue) * 100).toFixed(1) : 0 }}%
            </span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Orders Card -->
    <v-col cols="12" sm="12" md="4">
      <v-card border flat class="stat-card overflow-hidden">
        <v-card-text class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-avatar color="warning" variant="tonal" size="48" class="rounded-lg">
              <v-icon icon="ri-shopping-cart-2-line" size="28" />
            </v-avatar>
            <v-chip size="x-small" color="warning" variant="flat" class="font-weight-bold">العمليات</v-chip>
          </div>

          <div class="text-overline text-grey-darken-1 mb-1">عدد الطلبات</div>
          <div class="text-h4 font-weight-black mb-2">
            {{ stats.today.orders_count }} <span class="text-body-2 font-weight-medium text-grey">طلب</span>
          </div>

          <div class="d-flex align-center pt-2 border-t mt-3">
            <v-icon icon="ri-history-line" size="14" class="me-1 text-grey" />
            <span class="text-caption text-grey">إجمالي الشهر: </span>
            <span class="text-caption font-weight-bold ms-1">{{ stats.month_to_date.orders_count }}</span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters';

defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      today: { revenue: 0, profit: 0, orders_count: 0 },
      month_to_date: { revenue: 0, orders_count: 0 },
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
  border-color: rgb(var(--v-theme-primary)) !important;
}

.text-overline {
  letter-spacing: 0.5px !important;
  font-weight: 700 !important;
}
</style>
