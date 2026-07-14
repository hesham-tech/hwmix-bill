import { defineAsyncComponent } from 'vue';

// تسجيل الـ Widgets التابعة لموديل الحركات المالية لعرضها ديناميكياً
export default [
  {
    id: 'user-transactions',
    group: 'financial',
    order: 15,
    supportedEntities: ['user'],
    relations: ['employee'],
    component: defineAsyncComponent(() => import('./widgets/UserTransactionsWidget.vue')),
  },
];
