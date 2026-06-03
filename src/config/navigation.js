import { PERMISSIONS } from './permissions';

export default [
  // ==================== 1. الرئيسية والإدارة (Workspace) ====================
  {
    title: 'لوحة التحكم',
    icon: 'ri-dashboard-line',
    to: '/app/admin/dashboard',
    permission: null,
  },
  {
    title: 'المهام والمشاريع',
    icon: 'ri-list-settings-line',
    permission: PERMISSIONS.ADMIN_SUPER,
    children: [
      {
        title: 'قائمة المهام',
        to: '/app/tasks',
        icon: 'ri-task-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
      {
        title: 'مجموعات العمل',
        to: '/app/task-groups',
        icon: 'ri-team-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
      {
        title: 'قائمة الاختبار',
        to: '/app/testing-checklist',
        icon: 'ri-list-check-3',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
    ],
  },
  {
    title: 'سجل الأنشطة',
    icon: 'ri-history-line',
    to: '/app/activity-logs',
    permission: [PERMISSIONS.ACTIVITY_LOGS_VIEW_ALL, PERMISSIONS.ACTIVITY_LOGS_VIEW_CHILDREN, PERMISSIONS.ACTIVITY_LOGS_VIEW_SELF],
  },

  // ==================== 2. المبيعات والعملاء (Sales & CRM) ====================
  {
    title: 'الفواتير والبيع',
    icon: 'ri-file-list-3-line',
    permission: PERMISSIONS.INVOICES_PAGE,
    children: [
      {
        title: 'قائمة الفواتير',
        to: '/app/invoices',
        icon: 'ri-file-list-line',
        permission: [PERMISSIONS.INVOICES_VIEW_ALL, PERMISSIONS.INVOICES_VIEW_CHILDREN, PERMISSIONS.INVOICES_VIEW_SELF],
      },
      {
        title: 'فاتورة بيع',
        to: '/app/invoices/create?type=sale',
        icon: 'ri-file-add-line',
        permission: PERMISSIONS.INVOICES_CREATE,
      },
      {
        title: 'فاتورة تقسيط',
        to: '/app/invoices/create?type=installment_sale',
        icon: 'ri-calendar-todo-line',
        permission: PERMISSIONS.INVOICES_CREATE,
      },
      {
        title: 'فاتورة شراء',
        to: '/app/invoices/create?type=purchase',
        icon: 'ri-shopping-cart-line',
        permission: PERMISSIONS.INVOICES_CREATE,
      },
    ],
  },
  {
    title: 'التقسيط المالي',
    icon: 'ri-calendar-schedule-line',
    permission: PERMISSIONS.PAYMENTS_PAGE,
    children: [
      {
        title: 'خطط التقسيط',
        to: '/app/installment-plans',
        icon: 'ri-calendar-check-line',
        permission: [PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL, PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN, PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF],
      },
      {
        title: 'الأقساط المجدولة',
        to: '/app/installments',
        icon: 'ri-list-ordered',
        permission: [PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL, PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN, PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF],
      },
      {
        title: 'دفعات الأقساط',
        to: '/app/installment-payments',
        icon: 'ri-money-dollar-box-line',
        permission: [
          PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_ALL,
          PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_CHILDREN,
          PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_SELF,
        ],
      },
    ],
  },
  {
    title: 'العملاء والجمهور',
    icon: 'ri-user-heart-line',
    to: '/app/customers',
    permission: [PERMISSIONS.USERS_VIEW_ALL],
  },

  // ==================== 3. المخازن والمنتجات (Catalog & Stock) ====================
  {
    title: 'المنتجات والمخازن',
    icon: 'ri-shopping-bag-3-line',
    permission: PERMISSIONS.PRODUCTS_PAGE,
    children: [
      {
        title: 'قائمة المنتجات',
        to: '/app/products',
        icon: 'ri-list-check',
        permission: [PERMISSIONS.PRODUCTS_VIEW_ALL, PERMISSIONS.PRODUCTS_VIEW_CHILDREN, PERMISSIONS.PRODUCTS_VIEW_SELF],
      },
      {
        title: 'متغيرات المنتجات',
        to: '/app/product-variants',
        icon: 'ri-bubble-chart-line',
        permission: [PERMISSIONS.PRODUCT_VARIANTS_VIEW_ALL, PERMISSIONS.PRODUCT_VARIANTS_VIEW_CHILDREN, PERMISSIONS.PRODUCT_VARIANTS_VIEW_SELF],
      },
      {
        title: 'إضافة منتج جديد',
        to: '/app/products/create',
        icon: 'ri-add-box-line',
        permission: PERMISSIONS.PRODUCTS_CREATE,
      },
      {
        title: 'الأقسام والفئات',
        to: '/app/categories',
        icon: 'ri-organization-chart',
        permission: [PERMISSIONS.CATEGORIES_VIEW_ALL, PERMISSIONS.CATEGORIES_VIEW_CHILDREN, PERMISSIONS.CATEGORIES_VIEW_SELF],
      },
      {
        title: 'العلامات التجارية',
        to: '/app/brands',
        icon: 'ri-price-tag-3-line',
        permission: [PERMISSIONS.BRANDS_VIEW_ALL, PERMISSIONS.BRANDS_VIEW_CHILDREN, PERMISSIONS.BRANDS_VIEW_SELF],
      },
      {
        title: 'خصائص المنتجات',
        to: '/app/attributes',
        icon: 'ri-list-settings-line',
        permission: [PERMISSIONS.ATTRIBUTES_VIEW_ALL, PERMISSIONS.ATTRIBUTES_VIEW_CHILDREN, PERMISSIONS.ATTRIBUTES_VIEW_SELF],
      },
      {
        title: 'إدارة المستودعات',
        to: '/app/warehouses',
        icon: 'ri-building-line',
        permission: [PERMISSIONS.WAREHOUSES_VIEW_ALL, PERMISSIONS.WAREHOUSES_VIEW_CHILDREN, PERMISSIONS.WAREHOUSES_VIEW_SELF],
      },
    ],
  },
  {
    title: 'الخدمات والاشتراكات',
    icon: 'ri-customer-service-2-line',
    permission: PERMISSIONS.PRODUCTS_PAGE,
    children: [
      {
        title: 'قائمة الخدمات',
        to: '/app/services',
        icon: 'ri-settings-5-line',
        permission: [PERMISSIONS.PRODUCTS_VIEW_ALL],
      },
      {
        title: 'الاشتراكات الجارية',
        to: '/app/subscriptions',
        icon: 'ri-repeat-2-line',
        permission: [PERMISSIONS.PRODUCTS_VIEW_ALL],
      },
    ],
  },

  // ==================== 4. الخزينة والمالية (Treasury & Finance) ====================
  {
    title: 'الخزائن والنقدية',
    icon: 'ri-safe-line',
    permission: PERMISSIONS.CASH_BOXES_PAGE,
    children: [
      {
        title: 'قائمة الخزائن',
        to: '/app/cashboxes',
        icon: 'ri-inbox-line',
        permission: [PERMISSIONS.CASH_BOXES_VIEW_ALL, PERMISSIONS.CASH_BOXES_VIEW_CHILDREN, PERMISSIONS.CASH_BOXES_VIEW_SELF],
      },
      {
        title: 'التحويلات النقدية',
        to: '/app/transactions',
        icon: 'ri-exchange-line',
        permission: [PERMISSIONS.TRANSACTIONS_VIEW_ALL, PERMISSIONS.TRANSACTIONS_VIEW_CHILDREN, PERMISSIONS.TRANSACTIONS_VIEW_SELF],
      },
    ],
  },
  {
    title: 'المدفوعات والمصاريف',
    icon: 'ri-money-dollar-circle-line',
    permission: PERMISSIONS.PAYMENTS_PAGE,
    children: [
      {
        title: 'قائمة المدفوعات',
        to: '/app/payments',
        icon: 'ri-list-check-2',
        permission: [PERMISSIONS.PAYMENTS_VIEW_ALL, PERMISSIONS.PAYMENTS_VIEW_CHILDREN, PERMISSIONS.PAYMENTS_VIEW_SELF],
      },
      {
        title: 'إضافة دفعة',
        to: '/app/payments/create',
        icon: 'ri-add-circle-line',
        permission: PERMISSIONS.PAYMENTS_CREATE,
      },
      {
        title: 'المصاريف التشغيلية',
        to: '/app/expenses',
        icon: 'ri-money-dollar-box-line',
        permission: [PERMISSIONS.EXPENSES_VIEW_ALL, PERMISSIONS.EXPENSES_VIEW_CHILDREN, PERMISSIONS.EXPENSES_VIEW_SELF],
      },
    ],
  },
  {
    title: 'الحسابات والمالية',
    icon: 'ri-bank-card-2-line',
    permission: PERMISSIONS.EXPENSES_PAGE,
    children: [
      {
        title: 'سجل المعاملات',
        to: '/app/financials',
        icon: 'ri-exchange-funds-line',
        permission: [PERMISSIONS.TRANSACTIONS_VIEW_ALL],
      },
      {
        title: 'دفتر الأستاذ',
        to: '/app/financial-ledger',
        icon: 'ri-book-open-line',
        permission: [PERMISSIONS.FINANCIAL_LEDGER_VIEW_ALL, PERMISSIONS.FINANCIAL_LEDGER_VIEW_CHILDREN, PERMISSIONS.FINANCIAL_LEDGER_VIEW_SELF],
      },
    ],
  },

  // ==================== 5. التقارير والتحليلات (Reports & Analytics) ====================
  {
    title: 'التقارير والتحليلات',
    icon: 'ri-line-chart-line',
    permission: PERMISSIONS.REPORTS_PAGE,
    children: [
      {
        title: 'تقرير المبيعات',
        to: '/app/reports/sales',
        icon: 'ri-bar-chart-box-line',
        permission: PERMISSIONS.REPORTS_SALES,
      },
      {
        title: 'تقرير المخزون',
        to: '/app/reports/stock',
        icon: 'ri-database-2-line',
        permission: PERMISSIONS.REPORTS_STOCK,
      },
      {
        title: 'تقرير الأرباح والخسائر',
        to: '/app/reports/profit',
        icon: 'ri-funds-line',
        permission: PERMISSIONS.REPORTS_PROFIT,
      },
      {
        title: 'تقرير التدفق النقدي',
        to: '/app/reports/cash-flow',
        icon: 'ri-exchange-funds-line',
        permission: PERMISSIONS.REPORTS_CASH_FLOW,
      },
      {
        title: 'تقرير الضرائب',
        to: '/app/reports/tax',
        icon: 'ri-percent-line',
        permission: PERMISSIONS.REPORTS_TAX,
      },
    ],
  },

  // ==================== 6. الموارد البشرية والوصول (HR & Permissions) ====================
  {
    title: 'الموظفون والصلاحيات',
    icon: 'ri-user-line',
    permission: PERMISSIONS.USERS_PAGE,
    children: [
      {
        title: 'الموظفون',
        to: '/app/users',
        icon: 'ri-group-line',
        permission: [PERMISSIONS.USERS_VIEW_ALL, PERMISSIONS.USERS_VIEW_CHILDREN, PERMISSIONS.USERS_VIEW_SELF],
      },
      {
        title: 'الأدوار والصلاحيات',
        to: '/app/roles',
        icon: 'ri-shield-user-line',
        permission: [PERMISSIONS.ROLES_VIEW_ALL, PERMISSIONS.ROLES_VIEW_CHILDREN, PERMISSIONS.ROLES_VIEW_SELF],
      },
    ],
  },

  // ==================== 7. التكاملات والربط (Integrations & Connections) ====================
  {
    title: 'التكاملات والربط',
    icon: 'ri-link-m',
    permission: PERMISSIONS.ADMIN_COMPANY,
    children: [
      {
        title: 'إعدادات البريد',
        to: '/app/mail',
        icon: 'ri-mail-settings-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'إعدادات الواتساب',
        to: '/app/whatsapp',
        icon: 'ri-whatsapp-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'قوالب الرسائل والإشعارات',
        to: '/app/notification-templates',
        icon: 'ri-file-text-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'أتمتة وجدولة الإشعارات',
        to: '/app/notification-workflows',
        icon: 'ri-settings-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'بوابات الدفع الإلكتروني',
        to: '/app/payment-gateways',
        icon: 'ri-bank-card-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
    ],
  },

  // ==================== 8. تهيئة العمليات والتشغيل (Configuration) ====================
  {
    title: 'تهيئة التشغيل',
    icon: 'ri-settings-5-line',
    permission: PERMISSIONS.ADMIN_COMPANY,
    children: [
      {
        title: 'إدارة الفروع',
        to: '/app/branches',
        icon: 'ri-git-branch-line',
        permission: [PERMISSIONS.BRANCHES_VIEW_ALL],
      },
      {
        title: 'طرق الدفع',
        to: '/app/payment-methods',
        icon: 'ri-bank-card-line',
        permission: [PERMISSIONS.PAYMENT_METHODS_VIEW_ALL, PERMISSIONS.PAYMENT_METHODS_VIEW_CHILDREN, PERMISSIONS.PAYMENT_METHODS_VIEW_SELF],
      },
      {
        title: 'أنواع الفواتير',
        to: '/app/invoice-types',
        icon: 'ri-file-copy-line',
        permission: [PERMISSIONS.INVOICE_TYPES_VIEW_ALL, PERMISSIONS.INVOICE_TYPES_VIEW_CHILDREN, PERMISSIONS.INVOICE_TYPES_VIEW_SELF],
      },
      {
        title: 'أنواع الخزائن',
        to: '/app/cashbox-types',
        icon: 'ri-safe-2-line',
        permission: [PERMISSIONS.CASH_BOX_TYPES_VIEW_ALL, PERMISSIONS.CASH_BOX_TYPES_VIEW_CHILDREN, PERMISSIONS.CASH_BOX_TYPES_VIEW_SELF],
      },
    ],
  },

  // ==================== 9. إعدادات النظام والحساب (System Settings) ====================
  {
    title: 'إعدادات النظام',
    icon: 'ri-settings-3-line',
    permission: PERMISSIONS.ADMIN_COMPANY,
    children: [
      {
        title: 'إعدادات الشركة',
        to: '/app/company',
        icon: 'ri-building-2-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'اشتراكي الحالي',
        to: '/app/my-subscription',
        icon: 'ri-vip-crown-2-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'المستندات القانونية',
        to: '/app/admin/legal-documents',
        icon: 'ri-file-shield-2-line',
        permission: [PERMISSIONS.LEGAL_DOCUMENTS_VIEW_ALL, PERMISSIONS.ADMIN_SUPER],
      },
      {
        title: 'سجلي القانوني',
        to: '/app/legal-history',
        icon: 'ri-history-line',
        permission: null,
      },
      {
        title: 'إدارة الأجهزة',
        to: '/app/sessions',
        icon: 'ri-device-line',
        permission: null,
      },
    ],
  },

  // ==================== 10. إدارة منصة الساس (SaaS Admin Control) ====================
  {
    title: 'إدارة الساس',
    icon: 'ri-vip-crown-line',
    permission: PERMISSIONS.ADMIN_SUPER,
    children: [
      {
        title: 'قائمة الشركات',
        to: '/app/companies',
        icon: 'ri-building-4-line',
        permission: [
          PERMISSIONS.ADMIN_SUPER,
          PERMISSIONS.COMPANIES_VIEW_ALL,
          PERMISSIONS.COMPANIES_VIEW_CHILDREN,
          PERMISSIONS.COMPANIES_VIEW_SELF,
        ],
      },
      {
        title: 'باقات SaaS',
        to: '/app/saas-plans',
        icon: 'ri-vip-crown-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
      {
        title: 'النسخ الاحتياطي',
        to: '/app/backups',
        icon: 'ri-database-2-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
      {
        title: 'تقارير الأعطال',
        to: '/app/error-reports',
        icon: 'ri-bug-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
    ],
  },
];

export const CUSTOMER_MENU = [
  {
    title: 'لوحة التحكم',
    icon: 'ri-dashboard-3-line',
    to: '/app/portal',
  },
  {
    title: 'مشترياتي',
    icon: 'ri-bill-line',
    to: '/app/purchases',
  },
  {
    title: 'خطط التقسيط',
    icon: 'ri-calendar-todo-line',
    to: '/app/customer-installments',
    requiresInstallments: true,
  },
  {
    title: 'مدفوعاتي',
    icon: 'ri-money-dollar-circle-line',
    to: '/app/customer-payments',
  },
  {
    title: 'إدارة الأجهزة',
    icon: 'ri-device-line',
    to: '/app/sessions',
  },
  {
    title: 'سجل الموافقات القانونية',
    icon: 'ri-file-shield-2-line',
    to: '/app/legal-history',
  },
];
