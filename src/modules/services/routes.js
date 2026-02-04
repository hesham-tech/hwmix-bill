import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'services',
    name: 'services',
    component: () => import('@/modules/services/pages/ServiceList.vue'),
    meta: {
      title: 'الخدمات',
      permission: [PERMISSIONS.PRODUCTS_VIEW_ALL],
    },
  },
  {
    path: 'subscriptions',
    name: 'subscriptions',
    component: () => import('@/modules/subscriptions/pages/SubscriptionList.vue'),
    meta: {
      title: 'الاشتراكات الجارية',
      permission: [PERMISSIONS.PRODUCTS_VIEW_ALL],
    },
  },
];
