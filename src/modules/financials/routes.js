import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'financials',
    name: 'financials-transactions',
    component: () => import('./pages/TransactionsList.vue'),
    meta: {
      title: 'سجل المعاملات',
      permission: PERMISSIONS.TRANSACTIONS_VIEW_ALL,
    },
  },
];
