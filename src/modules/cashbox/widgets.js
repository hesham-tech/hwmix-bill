import { defineAsyncComponent } from 'vue';

// تسجيل الـ Widgets التابعة لموديل الخزن والعهد لعرضها ديناميكياً
export default [
  {
    id: 'user-cashboxes',
    group: 'financial',
    order: 10,
    supportedEntities: ['user'],
    relations: ['employee'],
    component: defineAsyncComponent(() => import('./widgets/UserCashboxWidget.vue')),
  },
];
