import { PERMISSIONS } from './permissions';

export default [
  // ==================== Dashboard ====================
  {
    title: 'لوحة التحكم',
    icon: 'ri-dashboard-line',
    to: '/dashboard',
    permission: null,
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
        permission: PERMISSIONS.INVOICES_VIEW_ALL,
      },
      {
        title: 'فاتورة جديدة',
        to: '/invoices/create',
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
        permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
      },
      {
        title: 'منتج جديد',
        to: '/products/create',
        permission: PERMISSIONS.PRODUCTS_CREATE,
      },
      {
        title: 'أشكال المنتجات',
        to: '/product-variants',
        permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
      },
      {
        title: 'المخزون',
        to: '/stock',
        permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
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
        permission: PERMISSIONS.PAYMENTS_VIEW_ALL,
      },
      {
        title: 'إضافة دفعة',
        to: '/payments/create',
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
        permission: PERMISSIONS.PAYMENTS_VIEW_ALL,
      },
      {
        title: 'دفعات الأقساط',
        to: '/installment-payments',
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
        permission: PERMISSIONS.ADMIN_COMPANY,
      },
      {
        title: 'التحويلات',
        to: '/transactions',
        permission: PERMISSIONS.ADMIN_COMPANY,
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
        permission: PERMISSIONS.REPORTS_SALES,
      },
      {
        title: 'تقرير المخزون',
        to: '/reports/stock',
        permission: PERMISSIONS.REPORTS_STOCK,
      },
      {
        title: 'تقرير الأرباح',
        to: '/reports/profit',
        permission: PERMISSIONS.REPORTS_PROFIT,
      },
      {
        title: 'التدفق النقدي',
        to: '/reports/cash-flow',
        permission: PERMISSIONS.REPORTS_CASH_FLOW,
      },
      {
        title: 'تقرير الضرائب',
        to: '/reports/tax',
        permission: PERMISSIONS.REPORTS_TAX,
      },
    ],
  },

  // ==================== Settings ====================
  {
    title: 'الإعدادات',
    icon: 'ri-settings-3-line',
    permission: PERMISSIONS.ADMIN_COMPANY,
    children: [
      // Users & Roles
      {
        title: 'المستخدمين',
        to: '/users',
        permission: PERMISSIONS.USERS_VIEW_ALL,
      },
      {
        title: 'الأدوار والصلاحيات',
        to: '/roles',
        permission: PERMISSIONS.ROLES_VIEW_ALL,
      },

      // Warehouses
      {
        title: 'المخازن',
        to: '/warehouses',
        permission: PERMISSIONS.WAREHOUSES_VIEW_ALL,
      },

      // Categories & Brands
      {
        title: 'الفئات',
        to: '/categories',
        permission: PERMISSIONS.CATEGORIES_VIEW_ALL,
      },
      {
        title: 'العلامات التجارية',
        to: '/brands',
        permission: PERMISSIONS.BRANDS_VIEW_ALL,
      },
      {
        title: 'خصائص المنتجات',
        to: '/attributes',
        permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
      },

      // Payment Methods
      {
        title: 'طرق الدفع',
        to: '/payment-methods',
        permission: PERMISSIONS.PAYMENT_METHODS_VIEW_ALL,
      },

      // Invoice & CashBox Types
      {
        title: 'أنواع الفواتير',
        to: '/invoice-types',
        permission: PERMISSIONS.INVOICES_VIEW_ALL,
      },
      {
        title: 'أنواع الخزائن',
        to: '/cashbox-types',
        permission: PERMISSIONS.ADMIN_COMPANY,
      },

      // Activity Logs
      {
        title: 'سجل الأنشطة',
        to: '/activity-logs',
        permission: PERMISSIONS.ADMIN_SUPER,
      },

      // Company Settings
      {
        title: 'بيانات الشركة',
        to: '/company',
        permission: PERMISSIONS.ADMIN_COMPANY,
      },
    ],
  },
];
