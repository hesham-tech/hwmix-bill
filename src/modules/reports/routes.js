import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/modules/reports/pages/Dashboard.vue'),
    meta: { title: 'لوحة التحكم' },
  },
  {
    path: 'reports/sales',
    name: 'sales-report',
    component: () => import('@/modules/reports/pages/SalesReport.vue'),
    meta: {
      title: 'تقرير المبيعات',
      permission: PERMISSIONS.REPORTS_SALES,
    },
  },
  {
    path: 'reports/stock',
    name: 'stock-report',
    component: () => import('@/modules/reports/pages/StockReport.vue'),
    meta: {
      title: 'تقرير المخزون',
      permission: PERMISSIONS.REPORTS_STOCK,
    },
  },
  {
    path: 'reports/profit',
    name: 'profit-report',
    component: () => import('@/modules/reports/pages/ProfitReport.vue'),
    meta: {
      title: 'تقرير الأرباح',
      permission: PERMISSIONS.REPORTS_PROFIT,
    },
  },
  {
    path: 'reports/cash-flow',
    name: 'cash-flow-report',
    component: () => import('@/modules/reports/pages/CashFlowReport.vue'),
    meta: {
      title: 'التدفق النقدي',
      permission: PERMISSIONS.REPORTS_CASH_FLOW,
    },
  },
  {
    path: 'reports/tax',
    name: 'tax-report',
    component: () => import('@/modules/reports/pages/TaxReport.vue'),
    meta: {
      title: 'تقرير الضرائب',
      permission: PERMISSIONS.REPORTS_TAX,
    },
  },
];
