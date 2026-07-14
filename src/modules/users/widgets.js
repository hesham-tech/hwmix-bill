import { defineAsyncComponent } from 'vue';

// قائمة المكونات البرمجية الخاصة بموديل المستخدمين لتسجيلها ديناميكياً في النظام
export default [
  {
    id: 'user-companies',
    group: 'core',
    order: 1,
    supportedEntities: ['user'],
    component: defineAsyncComponent(() => import('./widgets/UserCompaniesWidget.vue')),
  },
  {
    id: 'user-notes',
    group: 'core',
    order: 2,
    supportedEntities: ['user'],
    component: defineAsyncComponent(() => import('./widgets/UserNotesWidget.vue')),
  },
  {
    id: 'user-statement',
    group: 'financial',
    order: 5,
    supportedEntities: ['user'],
    component: defineAsyncComponent(() => import('./widgets/UserStatementWidget.vue')),
  },
];
