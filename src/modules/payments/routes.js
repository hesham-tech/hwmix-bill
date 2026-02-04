import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'payments',
    name: 'payments',
    component: () => import('@/modules/payments/pages/PaymentList.vue'),
    meta: {
      title: 'المدفوعات',
      permission: [PERMISSIONS.PAYMENTS_VIEW_ALL, PERMISSIONS.PAYMENTS_VIEW_CHILDREN, PERMISSIONS.PAYMENTS_VIEW_SELF],
    },
  },
  {
    path: 'payments/create',
    name: 'payment-create',
    component: () => import('@/modules/payments/pages/PaymentCreate.vue'),
    meta: {
      title: 'إضافة دفعة',
      permission: PERMISSIONS.PAYMENTS_CREATE,
    },
  },
];
