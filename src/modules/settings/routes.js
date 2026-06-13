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
    path: 'units',
    name: 'units',
    component: () => import('@/modules/settings/pages/UnitList.vue'),
    meta: {
      title: 'وحدات القياس',
      permission: [PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
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
      title: 'إعدادات الشركة',
      permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
    },
  },
  {
    path: 'mail',
    name: 'mail-settings',
    component: () => import('@/modules/settings/pages/MailSettings.vue'),
    meta: {
      title: 'إعدادات البريد',
      permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
    },
  },
  {
    path: 'whatsapp',
    name: 'whatsapp-settings',
    component: () => import('@/modules/settings/pages/WhatsAppSettings.vue'),
    meta: {
      title: 'إعدادات الواتساب',
      permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
    },
  },
  {
    path: 'notification-templates',
    name: 'notification-templates',
    component: () => import('@/modules/settings/pages/NotificationTemplates.vue'),
    meta: {
      title: 'قوالب الرسائل والإشعارات',
      permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
    },
  },
  {
    path: 'notification-workflows',
    name: 'notification-workflows',
    component: () => import('@/modules/settings/pages/NotificationWorkflows.vue'),
    meta: {
      title: 'أتمتة وجدولة الإشعارات',
      permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
    },
  },
  {
    path: 'payment-gateways',
    name: 'payment-gateways',
    component: () => import('@/modules/settings/pages/PaymentGatewaySettings.vue'),
    meta: {
      title: 'بوابات الدفع الإلكتروني',
      permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
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
  {
    path: 'saas-plans',
    name: 'saas-plans',
    component: () => import('@/modules/settings/pages/SaaSPlansList.vue'),
    meta: {
      title: 'إدارة باقات SaaS',
      permission: [
        PERMISSIONS.ADMIN_SUPER,
        PERMISSIONS.SUBSCRIPTIONS_VIEW_ALL,
        PERMISSIONS.PLANS_VIEW_ALL
      ],
    },
  },
  {
    path: 'my-subscription',
    name: 'my-subscription',
    component: () => import('@/modules/settings/pages/MySubscription.vue'),
    meta: {
      title: 'تفاصيل اشتراكي',
      permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
    },
  },
];
