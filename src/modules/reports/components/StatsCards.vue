<template>
  <v-row class="mb-6">
    <v-col cols="12" sm="6" md="3">
      <v-card color="success" variant="tonal">
        <v-card-text>
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline">إجمالي الفواتير</div>
              <div class="text-h5 font-weight-bold">{{ stats.totalInvoices }}</div>
              <div class="text-caption">من جميع الأنواع</div>
            </div>
            <v-icon icon="ri-file-list-3-line" size="48" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card color="info" variant="tonal">
        <v-card-text>
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline">المنتجات</div>
              <div class="text-h5 font-weight-bold">{{ stats.totalProducts }}</div>
              <div class="text-caption">في النظام</div>
            </div>
            <v-icon icon="ri-shopping-bag-3-line" size="48" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card color="warning" variant="tonal">
        <v-card-text>
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline">المستخدمين</div>
              <div class="text-h5 font-weight-bold">{{ stats.totalUsers }}</div>
              <div class="text-caption">في الشركة</div>
            </div>
            <v-icon icon="ri-team-line" size="48" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card color="purple" variant="tonal">
        <v-card-text>
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-overline">المدفوعات</div>
              <div class="text-h5 font-weight-bold">{{ stats.totalPayments }}</div>
              <div class="text-caption">تم تسجيلها</div>
            </div>
            <v-icon icon="ri-money-dollar-circle-line" size="48" />
          </div>
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
