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
  {
    path: 'owner-funds',
    name: 'owner-funds',
    component: () => import('./pages/OwnerFundsList.vue'),
    meta: {
      title: 'رأس المال والشركاء',
      permission: 'owner_fund_transactions.page',
    },
  },
];
