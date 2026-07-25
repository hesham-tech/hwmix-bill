<template>
  <!-- Renders the custom Dashboard Engine for HWNix ERP -->
  <div class="admin-dashboard-container">
    <DashboardEngine
      dashboard-id="admin_dashboard"
      title="لوحة تحكم HWNix ERP"
      subtitle="تحليل الأداء الجاري والمبيعات والسيولة والمهام في مساحة عمل واحدة"
      :show-filters="true"
    />
  </div>
</template>

<script setup>
import DashboardEngine from '@core/dashboard/components/DashboardEngine.vue';
</script>

<script>
/**
 * صفحة لوحة التحكم الإدارية الرئيسية المعتمدة على المحرك الجديد
 */
export default {
  name: 'AdminDashboard'
}
</script>

<style scoped>
.admin-dashboard-container {
  width: 100%;
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
}
</style>
