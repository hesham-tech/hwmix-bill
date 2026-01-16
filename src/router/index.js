import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, permissionGuard, roleGuard, defaultGuard } from './guards';
import { PERMISSIONS } from '@/config/permissions';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ==================== Public Routes ====================
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/pages/Login.vue'),
      meta: { title: 'تسجيل الدخول', public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/modules/auth/pages/Register.vue'),
      meta: { title: 'إنشاء حساب', public: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/modules/auth/pages/ForgotPassword.vue'),
      meta: { title: 'استعادة كلمة المرور', public: true },
    },

    // ==================== Protected Routes (With MainLayout) ====================
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        // Dashboard
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/modules/reports/pages/Dashboard.vue'),
          meta: { title: 'لوحة التحكم' },
        },

        // ==================== Invoices ====================
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('@/modules/invoices/pages/InvoiceList.vue'),
          meta: {
            title: 'الفواتير',
            permission: [PERMISSIONS.INVOICES_VIEW_ALL, 'invoices.view_self'],
          },
        },
        {
          path: 'invoices/create',
          name: 'invoice-create',
          component: () => import('@/modules/invoices/pages/InvoiceCreate.vue'),
          meta: {
            title: 'فاتورة جديدة',
            permission: PERMISSIONS.INVOICES_CREATE,
          },
        },
        {
          path: 'invoices/:id',
          name: 'invoice-view',
          component: () => import('@/modules/invoices/pages/InvoiceView.vue'),
          meta: {
            title: 'عرض الفاتورة',
            permission: [PERMISSIONS.INVOICES_VIEW_ALL, 'invoices.view_self'],
          },
        },
        {
          path: 'invoices/:id/edit',
          name: 'invoice-edit',
          component: () => import('@/modules/invoices/pages/InvoiceEdit.vue'),
          meta: {
            title: 'تعديل الفاتورة',
            permission: [PERMISSIONS.INVOICES_UPDATE_ALL, 'invoices.view_self'],
          },
        },

        // ==================== Products ====================
        {
          path: 'products',
          name: 'products',
          component: () => import('@/modules/products/pages/ProductList.vue'),
          meta: {
            title: 'المنتجات',
            permission: [PERMISSIONS.PRODUCTS_VIEW_ALL, 'products.view_self'],
          },
        },
        {
          path: 'products/create',
          name: 'product-create',
          component: () => import('@/modules/products/pages/ProductFormPage.vue'),
          meta: {
            title: 'منتج جديد',
            permission: PERMISSIONS.PRODUCTS_CREATE,
          },
        },
        {
          path: 'products/:id',
          name: 'product-view',
          component: () => import('@/modules/products/pages/ProductView.vue'),
          meta: {
            title: 'عرض المنتج',
            permission: [PERMISSIONS.PRODUCTS_VIEW_ALL, 'products.view_self'],
          },
        },
        {
          path: 'products/:id/edit',
          name: 'product-edit',
          component: () => import('@/modules/products/pages/ProductFormPage.vue'),
          meta: {
            title: 'تعديل المنتج',
            permission: PERMISSIONS.PRODUCTS_UPDATE_ALL,
          },
        },

        // ==================== Payments ====================
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/modules/payments/pages/PaymentList.vue'),
          meta: {
            title: 'المدفوعات',
            permission: [PERMISSIONS.PAYMENTS_VIEW_ALL, 'payments.view_self'],
          },
        },
        {
          path: 'payments/create',
          name: 'payment-create',
          component: () => import('@/modules/payments/pages/PaymentCreate.vue'),
          meta: {
            title: 'إضافة دفعة',
            permission: PERMISSIONS.PAYMENTS_CREATE,
          },
        },

        // ==================== Installments ====================
        {
          path: 'installment-plans',
          name: 'installment-plans',
          component: () => import('@/modules/installments/pages/InstallmentPlanList.vue'),
          meta: {
            title: 'خطط التقسيط',
            permission: [PERMISSIONS.PAYMENTS_VIEW_ALL, 'payments.view_self'],
          },
        },
        {
          path: 'installment-payments',
          name: 'installment-payments',
          component: () => import('@/modules/installments/pages/InstallmentPaymentList.vue'),
          meta: {
            title: 'دفعات الأقساط',
            permission: [PERMISSIONS.PAYMENTS_VIEW_ALL, 'payments.view_self'],
          },
        },

        // ==================== CashBoxes ====================
        {
          path: 'cashboxes',
          name: 'cashboxes',
          component: () => import('@/modules/cashbox/pages/CashBoxList.vue'),
          meta: {
            title: 'الخزائن',
            permission: PERMISSIONS.ADMIN_COMPANY,
          },
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () => import('@/modules/cashbox/pages/TransactionList.vue'),
          meta: {
            title: 'التحويلات',
            permission: PERMISSIONS.ADMIN_COMPANY,
          },
        },

        // ==================== Reports ====================
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

        // ==================== Users & Roles ====================
        {
          path: 'users',
          name: 'users',
          component: () => import('@/modules/users/pages/UserList.vue'),
          meta: {
            title: 'المستخدمين',
            permission: PERMISSIONS.USERS_VIEW_ALL,
          },
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('@/modules/users/pages/RoleManagement.vue'),
          meta: {
            title: 'الأدوار والصلاحيات',
            permission: PERMISSIONS.ROLES_VIEW_ALL,
          },
        },

        // ==================== Warehouses ====================
        {
          path: 'warehouses',
          name: 'warehouses',
          component: () => import('@/modules/warehouses/pages/WarehouseList.vue'),
          meta: {
            title: 'المخازن',
            permission: PERMISSIONS.WAREHOUSES_VIEW_ALL,
          },
        },

        // ==================== Settings ====================
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/modules/settings/pages/CategoryList.vue'),
          meta: {
            title: 'الفئات',
            permission: PERMISSIONS.CATEGORIES_VIEW_ALL,
          },
        },
        {
          path: 'brands',
          name: 'brands',
          component: () => import('@/modules/settings/pages/BrandList.vue'),
          meta: {
            title: 'العلامات التجارية',
            permission: PERMISSIONS.BRANDS_VIEW_ALL,
          },
        },
        {
          path: 'attributes',
          name: 'attributes',
          component: () => import('@/modules/settings/pages/AttributeList.vue'),
          meta: {
            title: 'خصائص المنتجات',
            permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
          },
        },
        {
          path: 'attributes/:id/values',
          name: 'attribute-values',
          component: () => import('@/modules/settings/pages/AttributeValueList.vue'),
          meta: {
            title: 'قيم الخاصية',
            permission: PERMISSIONS.PRODUCTS_VIEW_ALL,
          },
        },
        {
          path: 'payment-methods',
          name: 'payment-methods',
          component: () => import('@/modules/settings/pages/PaymentMethodList.vue'),
          meta: {
            title: 'طرق الدفع',
            permission: PERMISSIONS.PAYMENT_METHODS_VIEW_ALL,
          },
        },
        {
          path: 'invoice-types',
          name: 'invoice-types',
          component: () => import('@/modules/settings/pages/InvoiceTypeList.vue'),
          meta: {
            title: 'أنواع الفواتير',
            permission: PERMISSIONS.INVOICES_VIEW_ALL,
          },
        },
        {
          path: 'cashbox-types',
          name: 'cashbox-types',
          component: () => import('@/modules/settings/pages/CashBoxTypeList.vue'),
          meta: {
            title: 'أنواع الخزائن',
            permission: PERMISSIONS.ADMIN_COMPANY,
          },
        },
        {
          path: 'activity-logs',
          name: 'activity-logs',
          component: () => import('@/modules/settings/pages/ActivityLogList.vue'),
          meta: {
            title: 'سجل الأنشطة',
            permission: PERMISSIONS.ADMIN_SUPER,
          },
        },
        {
          path: 'company',
          name: 'company',
          component: () => import('@/modules/settings/pages/CompanySettings.vue'),
          meta: {
            title: 'بيانات الشركة',
            permission: PERMISSIONS.ADMIN_COMPANY,
          },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/modules/users/pages/Profile.vue'),
          meta: { title: 'الملف الشخصي' },
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

        // ==================== Error Pages ====================
        {
          path: 'forbidden',
          name: 'forbidden',
          component: () => import('@/pages/Forbidden.vue'),
          meta: { title: 'غير مصرح' },
        },

        // ==================== Task Management ====================
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('@/modules/tasks/pages/TasksList.vue'),
          meta: { title: 'المهام' },
        },
        {
          path: 'task-groups',
          name: 'task-groups',
          component: () => import('@/modules/tasks/pages/TaskGroups.vue'),
          meta: { title: 'مجموعات العمل' },
        },

        // ==================== Dev Tools ====================
        {
          path: 'testing-checklist',
          name: 'testing-checklist',
          component: () => import('@/modules/dev/pages/TestingChecklist.vue'),
          meta: { title: 'قائمة فحص النظام' },
        },
      ],
    },

    // ==================== 404 ====================
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFound.vue'),
      meta: { title: 'الصفحة غير موجودة' },
    },
  ],
});

// Global navigation guards
router.beforeEach(authGuard);
router.beforeEach(permissionGuard);
router.beforeEach(roleGuard);
router.beforeEach(defaultGuard);

export default router;
