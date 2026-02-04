import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'expenses',
    name: 'expenses',
    component: () => import('@/modules/expenses/pages/ExpenseList.vue'),
    meta: {
      title: 'المصاريف',
      permission: [PERMISSIONS.EXPENSES_VIEW_ALL, PERMISSIONS.EXPENSES_VIEW_CHILDREN, PERMISSIONS.EXPENSES_VIEW_SELF],
    },
  },
  {
    path: 'financial-ledger',
    name: 'financial-ledger',
    component: () => import('@/modules/expenses/pages/LedgerList.vue'),
    meta: {
      title: 'دفتر الأستاذ',
      permission: [PERMISSIONS.FINANCIAL_LEDGER_VIEW_ALL, PERMISSIONS.FINANCIAL_LEDGER_VIEW_CHILDREN, PERMISSIONS.FINANCIAL_LEDGER_VIEW_SELF],
    },
  },
];
