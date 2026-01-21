import { PERMISSIONS } from './permissions';

export default [
  // ==================== Dashboard ====================
  {
    title: 'لوحة التحكم',
    icon: 'ri-dashboard-line',
    to: '/dashboard',
    permission: null,
  },
  {
    title: 'المهام',
    icon: 'ri-list-settings-line',
    to: '/tasks',
    permission: null,
  },
  {
    title: 'مجموعات العمل',
    icon: 'ri-team-line',
    to: '/task-groups',
    permission: null,
  },
  {
    title: 'قائمة الاختبار',
    icon: 'ri-list-check-3',
    to: '/testing-checklist',
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
        to: '/invoices',
        icon: 'ri-file-list-line',
        permission: PERMISSIONS.INVOICES_VIEW_ALL,
      },
      {
        title: 'فاتورة جديدة',
        to: '/invoices/create',
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
        to: '/products',
        icon: 'ri-list-check',
        permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
      },
      {
        title: 'منتج جديد',
        to: '/products/create',
        icon: 'ri-add-box-line',
        permission: PERMISSIONS.PRODUCTS_CREATE,
      },

      {
        title: 'الأقسام والفئات',
        to: '/categories',
        icon: 'ri-organization-chart',
        permission: PERMISSIONS.CATEGORIES_VIEW_ALL,
      },
      {
        title: 'العلامات التجارية',
        to: '/brands',
        icon: 'ri-price-tag-3-line',
        permission: PERMISSIONS.BRANDS_VIEW_ALL,
      },
      {
        title: 'خصائص المنتج',
        to: '/attributes',
        icon: 'ri-list-settings-line',
        permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
      },
      {
        title: 'المخازن',
        to: '/warehouses',
        icon: 'ri-building-line',
        permission: PERMISSIONS.WAREHOUSES_VIEW_ALL,
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
        to: '/payments',
        icon: 'ri-list-check-2',
        permission: PERMISSIONS.PAYMENTS_VIEW_ALL,
      },
      {
        title: 'إضافة دفعة',
        to: '/payments/create',
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
        to: '/installment-plans',
        icon: 'ri-calendar-check-line',
        permission: PERMISSIONS.PAYMENTS_VIEW_ALL,
      },
      {
        title: 'دفعات الأقساط',
        to: '/installment-payments',
        icon: 'ri-money-dollar-box-line',
        permission: PERMISSIONS.PAYMENTS_VIEW_ALL,
      },
    ],
  },

  // ==================== CashBox ====================
  {
    title: 'الخزائن',
    icon: 'ri-safe-line',
    permission: PERMISSIONS.ADMIN_COMPANY,
    children: [
      {
        title: 'قائمة الخزائن',
        to: '/cashboxes',
        icon: 'ri-inbox-line',
        permission: PERMISSIONS.ADMIN_COMPANY,
      },
      {
        title: 'التحويلات',
        to: '/transactions',
        icon: 'ri-exchange-line',
        permission: PERMISSIONS.ADMIN_COMPANY,
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
        to: '/expenses',
        icon: 'ri-money-dollar-box-line',
        permission: PERMISSIONS.EXPENSES_VIEW_ALL,
      },
      {
        title: 'دفتر الأستاذ',
        to: '/financial-ledger',
        icon: 'ri-book-open-line',
        permission: PERMISSIONS.FINANCIAL_LEDGER_PAGE,
      },
    ],
  },

  // ==================== Reports ====================
  {
    title: 'التقارير',
    icon: 'ri-line-chart-line',
    permission: null,
    children: [
      {
        title: 'تقرير المبيعات',
        to: '/reports/sales',
        icon: 'ri-bar-chart-box-line',
        permission: PERMISSIONS.REPORTS_SALES,
      },
      {
        title: 'تقرير المخزون',
        to: '/reports/stock',
        icon: 'ri-database-2-line',
        permission: PERMISSIONS.REPORTS_STOCK,
      },
      {
        title: 'تقرير الأرباح',
        to: '/reports/profit',
        icon: 'ri-funds-line',
        permission: PERMISSIONS.REPORTS_PROFIT,
      },
      {
        title: 'التدفق النقدي',
        to: '/reports/cash-flow',
        icon: 'ri-exchange-funds-line',
        permission: PERMISSIONS.REPORTS_CASH_FLOW,
      },
      {
        title: 'تقرير الضرائب',
        to: '/reports/tax',
        icon: 'ri-percent-line',
        permission: PERMISSIONS.REPORTS_TAX,
      },
    ],
  },

  // ==================== Users ====================
  {
    title: 'المستخدمين',
    icon: 'ri-user-line',
    permission: PERMISSIONS.USERS_VIEW_ALL,
    children: [
      {
        title: 'قائمة المستخدمين',
        to: '/users',
        icon: 'ri-group-line',
        permission: PERMISSIONS.USERS_VIEW_ALL,
      },
      {
        title: 'الأدوار والصلاحيات',
        to: '/roles',
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
        to: '/company',
        icon: 'ri-building-2-line',
        permission: PERMISSIONS.ADMIN_COMPANY,
      },
      // Payment Methods
      {
        title: 'طرق الدفع',
        to: '/payment-methods',
        icon: 'ri-bank-card-line',
        permission: PERMISSIONS.PAYMENT_METHODS_VIEW_ALL,
      },

      // Invoice & CashBox Types
      {
        title: 'أنواع الفواتير',
        to: '/invoice-types',
        icon: 'ri-file-copy-line',
        permission: PERMISSIONS.INVOICES_VIEW_ALL,
      },
      {
        title: 'أنواع الخزائن',
        to: '/cashbox-types',
        icon: 'ri-safe-2-line',
        permission: PERMISSIONS.ADMIN_COMPANY,
      },

      // Activity Logs
      {
        title: 'سجل الأنشطة',
        to: '/activity-logs',
        icon: 'ri-history-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },

      {
        title: 'النسخ الاحتياطي',
        to: '/backups',
        icon: 'ri-database-2-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
      // Error Reports
      {
        title: 'تقارير الأعطال',
        to: '/error-reports',
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
    to: '/dashboard',
    permission: null,
  },
  {
    title: 'مشترياتي',
    icon: 'ri-bill-line',
    to: '/invoices',
    permission: null,
  },
  {
    title: 'جدول الأقساط',
    icon: 'ri-calendar-todo-line',
    to: '/installments',
    permission: null,
  },
  {
    title: 'حسابي المالي',
    icon: 'ri-wallet-3-line',
    to: '/reports/my-statement',
    permission: null,
  },
  {
    title: 'التحويلات',
    icon: 'ri-exchange-line',
    to: '/transactions',
    permission: null,
  },
];
