import { defineAsyncComponent } from 'vue';

// تسجيل الـ Widgets التابعة لموديل الإعدادات (سجل النشاطات) لعرضها ديناميكياً
export default [
  {
    id: 'user-activity-log',
    group: 'history',
    order: 10,
    supportedEntities: ['user'],
    component: defineAsyncComponent(() => import('./widgets/UserActivityLogWidget.vue')),
  },
];
