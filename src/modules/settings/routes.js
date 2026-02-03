import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'categories',
    name: 'categories',
    component: () => import('@/modules/settings/pages/CategoryList.vue'),
    meta: {
      title: 'الفئات',
      permission: [PERMISSIONS.CATEGORIES_VIEW_ALL, PERMISSIONS.CATEGORIES_VIEW_CHILDREN, PERMISSIONS.CATEGORIES_VIEW_SELF],
    },
  },
  {
    path: 'brands',
    name: 'brands',
    component: () => import('@/modules/settings/pages/BrandList.vue'),
    meta: {
      title: 'العلامات التجارية',
      permission: [PERMISSIONS.BRANDS_VIEW_ALL, PERMISSIONS.BRANDS_VIEW_CHILDREN, PERMISSIONS.BRANDS_VIEW_SELF],
    },
  },
  {
    path: 'payment-methods',
    name: 'payment-methods',
    component: () => import('@/modules/settings/pages/PaymentMethodList.vue'),
    meta: {
      title: 'طرق الدفع',
      permission: [PERMISSIONS.PAYMENT_METHODS_VIEW_ALL, PERMISSIONS.PAYMENT_METHODS_VIEW_CHILDREN, PERMISSIONS.PAYMENT_METHODS_VIEW_SELF],
    },
  },
  {
    path: 'invoice-types',
    name: 'invoice-types',
    component: () => import('@/modules/settings/pages/InvoiceTypeList.vue'),
    meta: {
      title: 'أنواع الفواتير',
      permission: [PERMISSIONS.INVOICE_TYPES_VIEW_ALL, PERMISSIONS.INVOICE_TYPES_VIEW_CHILDREN, PERMISSIONS.INVOICE_TYPES_VIEW_SELF],
    },
  },
  {
    path: 'cashbox-types',
    name: 'cashbox-types',
    component: () => import('@/modules/settings/pages/CashBoxTypeList.vue'),
    meta: {
      title: 'أنواع الخزائن',
      permission: [PERMISSIONS.CASH_BOX_TYPES_VIEW_ALL, PERMISSIONS.CASH_BOX_TYPES_VIEW_CHILDREN, PERMISSIONS.CASH_BOX_TYPES_VIEW_SELF],
    },
  },
  {
    path: 'activity-logs',
    name: 'activity-logs',
    component: () => import('@/modules/settings/pages/ActivityLogList.vue'),
    meta: {
      title: 'سجل الأنشطة',
      permission: [PERMISSIONS.ACTIVITY_LOGS_VIEW_ALL, PERMISSIONS.ACTIVITY_LOGS_VIEW_CHILDREN, PERMISSIONS.ACTIVITY_LOGS_VIEW_SELF],
    },
  },
  {
    path: 'company',
    name: 'company',
    component: () => import('@/modules/settings/pages/CompanySettings.vue'),
    meta: {
      title: 'بيانات الشركة',
      permission: [PERMISSIONS.COMPANIES_VIEW_ALL, PERMISSIONS.COMPANIES_VIEW_CHILDREN, PERMISSIONS.COMPANIES_VIEW_SELF],
    },
  },
  {
    path: 'settings',
    name: 'settings',
    component: () => import('@/modules/settings/pages/Settings.vue'),
    meta: { title: 'الإعدادات' },
  },
  {
    path: 'backups',
    name: 'backups',
    component: () => import('@/modules/settings/pages/BackupList.vue'),
    meta: {
      title: 'النسخ الاحتياطي',
      permission: PERMISSIONS.ADMIN_SUPER,
    },
  },
  {
    path: 'error-reports',
    name: 'error-reports',
    component: () => import('@/modules/settings/pages/ErrorReportList.vue'),
    meta: {
      title: 'تقارير الأعطال',
      permission: PERMISSIONS.ADMIN_SUPER,
    },
  },
];
