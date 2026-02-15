import { PERMISSIONS } from './permissions';

export default [
  // ==================== Dashboard ====================
  {
    title: 'لوحة التحكم',
    icon: 'ri-dashboard-line',
    to: '/app/admin/dashboard',
    permission: null,
  },
  {
    title: 'المهام',
    icon: 'ri-list-settings-line',
    to: '/app/tasks',
    permission: PERMISSIONS.ADMIN_SUPER,
  },
  {
    title: 'مجموعات العمل',
    icon: 'ri-team-line',
    to: '/app/task-groups',
    permission: PERMISSIONS.ADMIN_SUPER,
  },
  {
    title: 'قائمة الاختبار',
    icon: 'ri-list-check-3',
    to: '/app/testing-checklist',
    permission: PERMISSIONS.ADMIN_SUPER,
  },

  // ==================== Invoices ====================
  {
    title: 'الفواتير',
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

  // ==================== Products ====================
  {
    title: 'المنتجات',
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
        title: 'منتج جديد',
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
        title: 'خصائص المنتج',
        to: '/app/attributes',
        icon: 'ri-list-settings-line',
        permission: [PERMISSIONS.ATTRIBUTES_VIEW_ALL, PERMISSIONS.ATTRIBUTES_VIEW_CHILDREN, PERMISSIONS.ATTRIBUTES_VIEW_SELF],
      },
      {
        title: 'المخازن',
        to: '/app/warehouses',
        icon: 'ri-building-line',
        permission: [PERMISSIONS.WAREHOUSES_VIEW_ALL, PERMISSIONS.WAREHOUSES_VIEW_CHILDREN, PERMISSIONS.WAREHOUSES_VIEW_SELF],
      },
    ],
  },

  // ==================== Services & Subscriptions ====================
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

  // ==================== Payments ====================
  {
    title: 'المدفوعات',
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
    ],
  },

  // ==================== Installments ====================
  {
    title: 'التقسيط',
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

  // ==================== CashBox ====================
  {
    title: 'الخزائن',
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
        title: 'التحويلات',
        to: '/app/transactions',
        icon: 'ri-exchange-line',
        permission: [PERMISSIONS.TRANSACTIONS_VIEW_ALL, PERMISSIONS.TRANSACTIONS_VIEW_CHILDREN, PERMISSIONS.TRANSACTIONS_VIEW_SELF],
      },
    ],
  },

  // ==================== Financials ====================
  {
    title: 'المالية',
    icon: 'ri-bank-card-2-line',
    permission: PERMISSIONS.EXPENSES_PAGE,
    children: [
      {
        title: 'المصاريف',
        to: '/app/expenses',
        icon: 'ri-money-dollar-box-line',
        permission: [PERMISSIONS.EXPENSES_VIEW_ALL, PERMISSIONS.EXPENSES_VIEW_CHILDREN, PERMISSIONS.EXPENSES_VIEW_SELF],
      },
      {
        title: 'دفتر الأستاذ',
        to: '/app/financial-ledger',
        icon: 'ri-book-open-line',
        permission: [PERMISSIONS.FINANCIAL_LEDGER_VIEW_ALL, PERMISSIONS.FINANCIAL_LEDGER_VIEW_CHILDREN, PERMISSIONS.FINANCIAL_LEDGER_VIEW_SELF],
      },
    ],
  },

  // ==================== Reports ====================
  {
    title: 'التقارير',
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
        title: 'تقرير الأرباح',
        to: '/app/reports/profit',
        icon: 'ri-funds-line',
        permission: PERMISSIONS.REPORTS_PROFIT,
      },
      {
        title: 'التدفق النقدي',
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

  // ==================== Users ====================
  {
    title: 'المستخدمين',
    icon: 'ri-user-line',
    permission: PERMISSIONS.USERS_PAGE,
    children: [
      {
        title: 'قائمة المستخدمين',
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
      {
        title: 'قائمة العملاء',
        to: '/app/customers',
        icon: 'ri-team-line',
        permission: [PERMISSIONS.USERS_VIEW_ALL],
      },
    ],
  },

  // ==================== Settings ====================
  {
    title: 'الإعدادات',
    icon: 'ri-settings-3-line',
    permission: PERMISSIONS.ADMIN_COMPANY,
    children: [
      // Company Settings
      {
        title: 'بيانات الشركة',
        to: '/app/company',
        icon: 'ri-building-2-line',
        permission: [PERMISSIONS.COMPANIES_VIEW_ALL, PERMISSIONS.COMPANIES_VIEW_CHILDREN, PERMISSIONS.COMPANIES_VIEW_SELF],
      },
      // Payment Methods
      {
        title: 'طرق الدفع',
        to: '/app/payment-methods',
        icon: 'ri-bank-card-line',
        permission: [PERMISSIONS.PAYMENT_METHODS_VIEW_ALL, PERMISSIONS.PAYMENT_METHODS_VIEW_CHILDREN, PERMISSIONS.PAYMENT_METHODS_VIEW_SELF],
      },
      // Session Management
      {
        title: 'إدارة الأجهزة',
        to: '/app/sessions',
        icon: 'ri-device-line',
        permission: null,
      },

      // Invoice & CashBox Types
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

      // Activity Logs
      {
        title: 'سجل الأنشطة',
        to: '/app/activity-logs',
        icon: 'ri-history-line',
        permission: [PERMISSIONS.ACTIVITY_LOGS_VIEW_ALL, PERMISSIONS.ACTIVITY_LOGS_VIEW_CHILDREN, PERMISSIONS.ACTIVITY_LOGS_VIEW_SELF],
      },

      {
        title: 'النسخ الاحتياطي',
        to: '/app/backups',
        icon: 'ri-database-2-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
      // Error Reports
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
];
