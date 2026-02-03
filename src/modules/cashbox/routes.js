import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'cashboxes',
    name: 'cashboxes',
    component: () => import('@/modules/cashbox/pages/CashBoxList.vue'),
    meta: {
      title: 'الخزائن',
      permission: [PERMISSIONS.CASH_BOXES_VIEW_ALL, PERMISSIONS.CASH_BOXES_VIEW_CHILDREN, PERMISSIONS.CASH_BOXES_VIEW_SELF],
    },
  },
  {
    path: 'transactions',
    name: 'transactions',
    component: () => import('@/modules/cashbox/pages/TransactionList.vue'),
    meta: {
      title: 'التحويلات',
      permission: [PERMISSIONS.TRANSACTIONS_VIEW_ALL, PERMISSIONS.TRANSACTIONS_VIEW_CHILDREN, PERMISSIONS.TRANSACTIONS_VIEW_SELF],
    },
  },
];
