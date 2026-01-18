<template>
  <v-card class="rounded-xl" border flat>
    <v-card-text class="pa-6">
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else-if="!data || data.length === 0" class="text-center py-12 text-grey">
        <v-icon size="64" color="grey-lighten-2">ri-line-chart-line</v-icon>
        <p class="text-subtitle-1 mt-4">لا توجد حركات للعرض</p>
      </div>
      <div v-else>
        <h3 class="text-h6 font-weight-black mb-6">تدفق السيولة النقدية</h3>
        <!-- Placeholder for actual chart - will be implemented with Chart.js -->
        <div class="chart-placeholder pa-6 bg-grey-lighten-4 rounded-lg text-center">
          <v-icon size="48" color="info">ri-funds-line</v-icon>
          <p class="text-body-2 mt-2">الرسم البياني قيد التطوير</p>
          <p class="text-caption text-grey">عدد الحركات: {{ data.length }}</p>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => [],
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
