<template>
  <v-row dense>
    <!-- Revenue Card -->
    <v-col cols="6" sm="6" md="4">
      <v-card border flat class="stat-card overflow-hidden h-100">
        <v-skeleton-loader v-if="loading" type="list-item-avatar, heading, subtitle" class="pa-2" />
        <v-card-text v-else class="pa-2 pa-sm-5 h-100">
          <div class="d-flex align-center justify-space-between mb-2">
            <v-avatar color="primary" variant="tonal" :size="xs ? 32 : 48" class="rounded-lg">
              <v-icon icon="ri-money-dollar-circle-line" :size="xs ? 20 : 28" />
            </v-avatar>
            <v-chip v-if="!xs" size="x-small" color="primary" variant="flat" class="font-weight-bold">اليوم</v-chip>
          </div>

          <div class="text-xxs text-grey-darken-1 mb-1 truncate-text">إجمالي الإيرادات</div>
          <div class="text-subtitle-1 text-sm-h4 font-weight-black mb-1 truncate-text">{{ formatCurrency(stats.today.revenue) }}</div>

          <div class="d-flex align-center pt-2 border-t mt-2 flex-wrap">
            <span class="text-xxs text-grey">الشهر:</span>
            <span class="text-xxs font-weight-bold ms-1">{{ formatCurrency(stats.month_to_date.revenue) }}</span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Profit Card -->
    <v-col cols="6" sm="6" md="4">
      <v-card border flat class="stat-card overflow-hidden h-100">
        <v-skeleton-loader v-if="loading" type="list-item-avatar, heading, subtitle" class="pa-2" />
        <v-card-text v-else class="pa-2 pa-sm-5 h-100">
          <div class="d-flex align-center justify-space-between mb-2">
            <v-avatar color="success" variant="tonal" :size="xs ? 32 : 48" class="rounded-lg">
              <v-icon icon="ri-hand-coin-line" :size="xs ? 20 : 28" />
            </v-avatar>
            <v-chip v-if="!xs" size="x-small" color="success" variant="flat" class="font-weight-bold">صافي</v-chip>
          </div>

          <div class="text-xxs text-grey-darken-1 mb-1 truncate-text">صافي الأرباح</div>
          <div class="text-subtitle-1 text-sm-h4 font-weight-black mb-1 text-success truncate-text">{{ formatCurrency(stats.today.profit) }}</div>

          <div class="d-flex align-center pt-2 border-t mt-2 flex-wrap">
            <span class="text-xxs text-grey">هامش:</span>
            <span class="text-xxs font-weight-bold ms-1 text-success">
              {{ stats.today.revenue > 0 ? ((stats.today.profit / stats.today.revenue) * 100).toFixed(0) : 0 }}%
            </span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Orders Card -->
    <v-col cols="12" sm="12" md="4">
      <v-card border flat class="stat-card overflow-hidden">
        <v-skeleton-loader v-if="loading" type="list-item-avatar, heading, subtitle" class="pa-2" />
        <v-card-text v-else class="pa-2 pa-sm-5">
          <div class="d-flex align-center justify-space-between mb-2">
            <v-avatar color="warning" variant="tonal" :size="xs ? 32 : 48" class="rounded-lg">
              <v-icon icon="ri-shopping-cart-2-line" :size="xs ? 20 : 28" />
            </v-avatar>
            <v-chip size="x-small" color="warning" variant="flat" class="font-weight-bold">العمليات</v-chip>
          </div>

          <div class="text-xxs text-grey-darken-1 mb-1 truncate-text">عدد الطلبات</div>
          <div class="text-subtitle-1 text-sm-h4 font-weight-black mb-1 truncate-text">
            {{ stats.today.orders_count }} <span class="text-xxs font-weight-medium text-grey">طلب</span>
          </div>

          <div class="d-flex align-center pt-2 border-t mt-2">
            <span class="text-xxs text-grey">إجمالي الشهر: </span>
            <span class="text-xxs font-weight-bold ms-1">{{ stats.month_to_date.orders_count }}</span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { useDisplay } from 'vuetify';
import { formatCurrency } from '@/utils/formatters';

const { xs } = useDisplay();

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
  border-radius: 8px;
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
  border-color: rgb(var(--v-theme-primary)) !important;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-xxs {
  font-size: 0.65rem !important;
  line-height: 1;
}
</style>
