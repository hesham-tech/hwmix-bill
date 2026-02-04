import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'portal',
    name: 'portal',
    component: () => import('@/modules/customer/portal/dashboard/pages/CustomerDashboard.vue'),
    meta: { title: 'بوابة العميل' },
  },
  {
    path: 'purchases',
    name: 'purchases',
    component: () => import('@/modules/customer/portal/purchases/pages/Purchases.vue'),
    meta: {
      title: 'مشترياتي',
      permission: ['invoices.view_self', PERMISSIONS.INVOICES_VIEW_ALL],
    },
  },
  {
    path: 'purchases/:id',
    name: 'purchase-view',
    component: () => import('@/modules/customer/portal/purchases/pages/PurchaseView.vue'),
    meta: {
      title: 'عرض الفاتورة',
      permission: ['invoices.view_self', PERMISSIONS.INVOICES_VIEW_ALL],
      breadcrumbs: [
        { title: 'مشترياتي', to: '/app/purchases' },
        { title: 'عرض الفاتورة', disabled: true },
      ],
    },
  },
  {
    path: 'customer-installments',
    name: 'customer-installments',
    component: () => import('@/modules/customer/portal/installments/pages/Installments.vue'),
    meta: {
      title: 'خطط التقسيط',
      permission: ['payments.view_self', PERMISSIONS.PAYMENTS_VIEW_ALL],
    },
  },
  {
    path: 'customer-payments',
    name: 'customer-payments',
    component: () => import('@/modules/customer/portal/payments/pages/Payments.vue'),
    meta: {
      title: 'مدفوعاتي',
      permission: ['payments.view_self', PERMISSIONS.PAYMENTS_VIEW_ALL],
    },
  },
];
