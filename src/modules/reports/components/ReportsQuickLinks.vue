<template>
  <v-card class="rounded-md h-100" border flat>
    <v-card-text class="pa-4">
      <h3 class="text-h6 font-weight-bold mb-4">التقارير المالية والتشغيلية</h3>

      <v-list density="compact" class="pa-0">
        <v-list-item
          v-for="report in reports"
          :key="report.route"
          :to="report.route"
          class="rounded-md mb-2"
          :prepend-icon="report.icon"
          :base-color="report.color"
        >
          <v-list-item-title class="font-weight-medium text-body-1">{{ report.title }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ report.description }}</v-list-item-subtitle>

          <template #append>
            <v-icon icon="ri-arrow-left-s-line" size="20" />
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
// يعرض كارت روابط سريعة للوصول لتقارير النظام المالية والتشغيلية المتقدمة.
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

const reports = [
  {
    title: 'تقرير الأرباح والخسائر',
    description: 'تحليل الإيرادات والتكاليف التفصيلي',
    icon: 'ri-line-chart-line',
    color: 'success',
    route: '/app/reports/profit',
  },
  {
    title: 'تقرير جرد المخزون',
    description: 'تقييم وتنبيهات المخزون الجارية',
    icon: 'ri-stock-line',
    color: 'warning',
    route: '/app/reports/stock',
  },
  {
    title: 'تقرير التدفق النقدي',
    description: 'تحليل حركة المقبوضات والمدفوعات',
    icon: 'ri-funds-line',
    color: 'info',
    route: '/app/reports/cash-flow',
  },
  {
    title: 'تقرير المبيعات والعملاء',
    description: 'أداء المبيعات وحركات العملاء',
    icon: 'ri-shopping-cart-line',
    color: 'primary',
    route: '/app/reports/sales',
  },
];
</script>

<script>
/**
 * روابط سريعة للوصول للتقارير المالية والتشغيلية (ممتثل للـ Widget Contract)
 */
export default {
  name: 'ReportsQuickLinks'
}
</script>
