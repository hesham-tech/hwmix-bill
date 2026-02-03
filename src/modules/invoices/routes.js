import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'invoices',
    name: 'invoices',
    component: () => import('@/modules/invoices/pages/InvoiceList.vue'),
    meta: {
      title: 'الفواتير',
      permission: [PERMISSIONS.INVOICES_VIEW_ALL, PERMISSIONS.INVOICES_VIEW_CHILDREN, PERMISSIONS.INVOICES_VIEW_SELF],
    },
  },
  {
    path: 'invoices/create',
    name: 'invoice-create',
    component: () => import('@/modules/invoices/pages/InvoiceCreate.vue'),
    meta: {
      title: 'فاتورة جديدة',
      permission: PERMISSIONS.INVOICES_CREATE,
      breadcrumbs: [
        { title: 'الفواتير', to: '/app/invoices' },
        { title: 'فاتورة جديدة', disabled: true },
      ],
    },
  },
  {
    path: 'invoices/:id',
    name: 'invoice-view',
    component: () => import('@/modules/invoices/pages/InvoiceView.vue'),
    meta: {
      title: 'عرض الفاتورة',
      permission: [PERMISSIONS.INVOICES_VIEW_ALL, PERMISSIONS.INVOICES_VIEW_CHILDREN, PERMISSIONS.INVOICES_VIEW_SELF],
      breadcrumbs: [
        { title: 'الفواتير', to: '/app/invoices' },
        { title: 'عرض الفاتورة', disabled: true },
      ],
    },
  },
  {
    path: 'invoices/:id/edit',
    name: 'invoice-edit',
    component: () => import('@/modules/invoices/pages/InvoiceEdit.vue'),
    meta: {
      title: 'تعديل الفاتورة',
      permission: [PERMISSIONS.INVOICES_UPDATE_ALL, PERMISSIONS.INVOICES_UPDATE_CHILDREN, PERMISSIONS.INVOICES_UPDATE_SELF],
      breadcrumbs: [
        { title: 'الفواتير', to: '/app/invoices' },
        { title: 'تعديل الفاتورة', disabled: true },
      ],
    },
  },
];
