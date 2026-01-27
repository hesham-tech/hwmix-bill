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
        permission: PERMISSIONS.INVOICES_VIEW_ALL,
      },
      {
        title: 'فاتورة جديدة',
        to: '/app/invoices/create',
        icon: 'ri-file-add-line',
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
        permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
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
        permission: PERMISSIONS.CATEGORIES_PAGE,
      },
      {
        title: 'العلامات التجارية',
        to: '/app/brands',
        icon: 'ri-price-tag-3-line',
        permission: PERMISSIONS.BRANDS_PAGE,
      },
      {
        title: 'خصائص المنتج',
        to: '/app/attributes',
        icon: 'ri-list-settings-line',
        permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
      },
      {
        title: 'المخازن',
        to: '/app/warehouses',
        icon: 'ri-building-line',
        permission: PERMISSIONS.WAREHOUSES_PAGE,
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
        permission: PERMISSIONS.PAYMENTS_VIEW_ALL,
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
        permission: PERMISSIONS.PAYMENTS_VIEW_ALL,
      },
      {
        title: 'دفعات الأقساط',
        to: '/app/installment-payments',
        icon: 'ri-money-dollar-box-line',
        permission: PERMISSIONS.PAYMENTS_VIEW_ALL,
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
        permission: PERMISSIONS.CASH_BOXES_PAGE,
      },
      {
        title: 'التحويلات',
        to: '/app/transactions',
        icon: 'ri-exchange-line',
        permission: PERMISSIONS.TRANSACTIONS_PAGE,
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
        permission: PERMISSIONS.EXPENSES_VIEW_ALL,
      },
      {
        title: 'دفتر الأستاذ',
        to: '/app/financial-ledger',
        icon: 'ri-book-open-line',
        permission: PERMISSIONS.FINANCIAL_LEDGER_PAGE,
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
        permission: PERMISSIONS.USERS_VIEW_ALL,
      },
      {
        title: 'الأدوار والصلاحيات',
        to: '/app/roles',
        icon: 'ri-shield-user-line',
        permission: PERMISSIONS.ROLES_VIEW_ALL,
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
        permission: PERMISSIONS.COMPANIES_PAGE,
      },
      // Payment Methods
      {
        title: 'طرق الدفع',
        to: '/app/payment-methods',
        icon: 'ri-bank-card-line',
        permission: PERMISSIONS.PAYMENT_METHODS_PAGE,
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
        permission: PERMISSIONS.INVOICES_VIEW_ALL,
      },
      {
        title: 'أنواع الخزائن',
        to: '/app/cashbox-types',
        icon: 'ri-safe-2-line',
        permission: PERMISSIONS.CASH_BOX_TYPES_PAGE,
      },

      // Activity Logs
      {
        title: 'سجل الأنشطة',
        to: '/app/activity-logs',
        icon: 'ri-history-line',
        permission: PERMISSIONS.ACTIVITY_LOGS_PAGE,
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
