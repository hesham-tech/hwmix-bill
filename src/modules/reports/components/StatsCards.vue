<template>
  <v-row dense>
    <v-col cols="12" sm="6" md="3">
      <v-card border flat class="rounded-xl overflow-hidden pa-1">
        <v-card-text class="pa-4 bg-success-lighten-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-success mb-1">إجمالي الفواتير</div>
              <div class="text-h4 font-weight-black text-success">{{ stats.totalInvoices }}</div>
            </div>
            <v-avatar color="success" size="48" variant="flat" class="rounded-lg">
              <v-icon icon="ri-file-list-3-line" color="white" size="28" />
            </v-avatar>
          </div>
          <div class="mt-3 text-caption text-grey">جميع الفواتير المسجلة</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card border flat class="rounded-xl overflow-hidden pa-1">
        <v-card-text class="pa-4 bg-info-lighten-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-info mb-1">إجمالي المنتجات</div>
              <div class="text-h4 font-weight-black text-info">{{ stats.totalProducts }}</div>
            </div>
            <v-avatar color="info" size="48" variant="flat" class="rounded-lg">
              <v-icon icon="ri-shopping-bag-3-line" color="white" size="28" />
            </v-avatar>
          </div>
          <div class="mt-3 text-caption text-grey">الأصناف المتوفرة حالياً</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card border flat class="rounded-xl overflow-hidden pa-1">
        <v-card-text class="pa-4 bg-warning-lighten-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-warning mb-1">فريق العمل</div>
              <div class="text-h4 font-weight-black text-warning">{{ stats.totalUsers }}</div>
            </div>
            <v-avatar color="warning" size="48" variant="flat" class="rounded-lg">
              <v-icon icon="ri-team-line" color="white" size="28" />
            </v-avatar>
          </div>
          <div class="mt-3 text-caption text-grey">إجمالي المستخدمين والمديرين</div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card border flat class="rounded-xl overflow-hidden pa-1">
        <v-card-text class="pa-4 bg-secondary-lighten-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption font-weight-bold text-secondary mb-1">المدفوعات</div>
              <div class="text-h4 font-weight-black text-secondary">{{ stats.totalPayments }}</div>
            </div>
            <v-avatar color="secondary" size="48" variant="flat" class="rounded-lg">
              <v-icon icon="ri-money-dollar-circle-line" color="white" size="28" />
            </v-avatar>
          </div>
          <div class="mt-3 text-caption text-grey">العمليات المالية المحصلة</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
  },
});
</script>
