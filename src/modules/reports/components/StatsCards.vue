<template>
  <v-row dense>
    <v-col cols="12" sm="6" md="3">
      <v-card border flat class="rounded-xl overflow-hidden pa-1">
        <v-card-text class="pa-4 bg-success-lighten-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-success mb-1">إجمالي المبيعات</div>
              <div class="text-h5 font-weight-black text-success">{{ formatCurrency(stats.totalSales) }}</div>
            </div>
            <v-avatar color="success" size="48" variant="flat" class="rounded-lg">
              <v-icon icon="ri-money-dollar-box-line" color="white" size="28" />
            </v-avatar>
          </div>
          <div class="mt-3 text-caption text-grey">تراكمي منذ البداية</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card border flat class="rounded-xl overflow-hidden pa-1">
        <v-card-text class="pa-4 bg-primary-lighten-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-primary mb-1">مبيعات الشهر</div>
              <div class="text-h5 font-weight-black text-primary">{{ formatCurrency(stats.monthlySales) }}</div>
            </div>
            <v-avatar color="primary" size="48" variant="flat" class="rounded-lg">
              <v-icon icon="ri-calendar-event-line" color="white" size="28" />
            </v-avatar>
          </div>
          <div class="mt-3 text-caption text-grey">مبيعات الشهر الحالي</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card border flat class="rounded-xl overflow-hidden pa-1">
        <v-card-text class="pa-4 bg-error-lighten-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-error mb-1">تحصيل معلق</div>
              <div class="text-h5 font-weight-black text-error">{{ formatCurrency(stats.pendingPayments) }}</div>
            </div>
            <v-avatar color="error" size="48" variant="flat" class="rounded-lg">
              <v-icon icon="ri-hand-coin-line" color="white" size="28" />
            </v-avatar>
          </div>
          <div class="mt-3 text-caption text-grey">مبالغ لم يتم تحصيلها</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card border flat class="rounded-xl overflow-hidden pa-1">
        <v-card-text class="pa-4 bg-info-lighten-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-info mb-1">العملاء</div>
              <div class="text-h5 font-weight-black text-info">{{ stats.totalCustomers || 0 }}</div>
            </div>
            <v-avatar color="info" size="48" variant="flat" class="rounded-lg">
              <v-icon icon="ri-team-line" color="white" size="28" />
            </v-avatar>
          </div>
          <div class="mt-3 text-caption text-grey">عدد العملاء النشطين</div>
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
  },
});
</script>
