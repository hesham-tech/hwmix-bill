<template>
  <v-card class="rounded-md" border flat>
    <v-card-text class="pa-6">
      <h3 class="text-h6 font-weight-bold mb-4">التقارير المالية</h3>

      <v-list density="compact" class="pa-0">
        <v-list-item
          v-for="report in reports"
          :key="report.route"
          :to="report.route"
          class="rounded-md mb-2"
          :prepend-icon="report.icon"
          :base-color="report.color"
        >
          <v-list-item-title class="font-weight-medium">{{ report.title }}</v-list-item-title>
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
const reports = [
  {
    title: 'تقرير الأرباح',
    description: 'تحليل الإيرادات والتكاليف',
    icon: 'ri-line-chart-line',
    color: 'success',
    route: '/reports/profit',
  },
  {
    title: 'تقرير المخزون',
    description: 'تقييم وتنبيهات المخزون',
    icon: 'ri-stock-line',
    color: 'warning',
    route: '/reports/stock',
  },
  {
    title: 'التدفق النقدي',
    description: 'المقبوضات والمدفوعات',
    icon: 'ri-funds-line',
    color: 'info',
    route: '/reports/cash-flow',
  },
  {
    title: 'تقرير المبيعات',
    description: 'أداء المبيعات والعملاء',
    icon: 'ri-shopping-cart-line',
    color: 'primary',
    route: '/reports/sales',
  },
];
</script>
