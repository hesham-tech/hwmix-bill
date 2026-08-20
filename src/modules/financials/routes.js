import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'partner-funds',
    redirect: { name: 'owner-funds' },
  },
  {
    path: 'financials',
    name: 'financials-transactions',
    component: () => import('./pages/TransactionsList.vue'),
    meta: {
      title: 'Ø³Ø¬Ù„ Ø§Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª',
      permission: PERMISSIONS.TRANSACTIONS_VIEW_ALL,
    },
  },
  {
    path: 'owner-funds',
    name: 'owner-funds',
    component: () => import('./pages/OwnerFundsList.vue'),
    meta: {
      title: 'Ø±Ø£Ø³ Ø§Ù„Ù…Ø§Ù„ ÙˆØ§Ù„Ø´Ø±ÙƒØ§Ø¡',
      permission: 'owner_fund_transactions.page',
    },
  },
];
