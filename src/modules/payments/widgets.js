import { defineAsyncComponent } from 'vue';

// تسجيل الـ Widgets التابعة لموديل المدفوعات لعرضها ديناميكياً
export default [
  {
    id: 'user-payments',
    group: 'financial',
    order: 20,
    supportedEntities: ['user'],
    component: defineAsyncComponent(() => import('./widgets/UserPaymentsWidget.vue')),
  },
];
