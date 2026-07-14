import { defineAsyncComponent } from 'vue';

// تسجيل الـ Widgets التابعة لموديل الفواتير لعرضها ديناميكياً
export default [
  {
    id: 'user-invoices',
    group: 'operational',
    order: 10,
    supportedEntities: ['user'],
    component: defineAsyncComponent(() => import('./widgets/UserInvoicesWidget.vue')),
  },
];
