import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, permissionGuard, roleGuard, defaultGuard } from './guards';
import { PERMISSIONS } from '@/config/permissions';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ==================== Public Routes ====================
    {
      path: '/',
      name: 'landing',
      component: () => import('@/pages/LandingPage.vue'),
      meta: { title: 'مرحباً بكم', public: true },
    },
    {
      path: '/saas',
      name: 'saas-landing',
      component: () => import('@/pages/SaasLanding.vue'),
      meta: { title: 'نظام الإدارة HWNix', public: true },
    },
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
      path: '/app',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        // Role-based redirection entry point
        {
          path: '',
          name: 'app-home',
          redirect: to => {
            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              // Simple check for staff vs customer logic (matches stores/user.js)
              const permissions = user.permissions || [];
              const isStaff = permissions.some(p => p.includes('.view_') || p.includes('.page') || p.includes('admin.'));

              return isStaff ? '/app/admin/dashboard' : '/app/portal';
            }
            return '/login';
          },
        },
        // Dashboard
        {
          path: 'admin/dashboard',
          name: 'admin-dashboard',
          component: () => import('@/modules/reports/pages/Dashboard.vue'),
          meta: { title: 'لوحة التحكم' },
        },

        // ==================== Customer Routes ====================
        {
          path: 'portal',
          name: 'portal',
          component: () => import('@/customer/modules/dashboard/pages/CustomerDashboard.vue'),
          meta: { title: 'بوابة العميل' },
        },
        {
          path: 'purchases',
          name: 'purchases',
          component: () => import('@/customer/modules/purchases/pages/Purchases.vue'),
          meta: {
            title: 'مشترياتي',
            permission: ['invoices.view_self', PERMISSIONS.INVOICES_VIEW_ALL],
          },
        },
        {
          path: 'purchases/:id',
          name: 'purchase-view',
          component: () => import('@/customer/modules/purchases/pages/PurchaseView.vue'),
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
          component: () => import('@/customer/modules/installments/pages/Installments.vue'),
          meta: {
            title: 'خطط التقسيط',
            permission: ['payments.view_self', PERMISSIONS.PAYMENTS_VIEW_ALL],
          },
        },
        {
          path: 'customer-payments',
          name: 'customer-payments',
          component: () => import('@/customer/modules/payments/pages/Payments.vue'),
          meta: {
            title: 'مدفوعاتي',
            permission: ['payments.view_self', PERMISSIONS.PAYMENTS_VIEW_ALL],
          },
        },

        // ==================== Invoices ====================
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

        // ==================== Products ====================
        {
          path: 'products',
          name: 'products',
          component: () => import('@/modules/products/pages/ProductList.vue'),
          meta: {
            title: 'المنتجات',
            permission: [PERMISSIONS.PRODUCTS_VIEW_ALL, PERMISSIONS.PRODUCTS_VIEW_CHILDREN, PERMISSIONS.PRODUCTS_VIEW_SELF],
          },
        },
        {
          path: 'products/create',
          name: 'product-create',
          component: () => import('@/modules/products/pages/ProductFormPage.vue'),
          meta: {
            title: 'منتج جديد',
            permission: PERMISSIONS.PRODUCTS_CREATE,
            breadcrumbs: [
              { title: 'المنتجات', to: '/app/products' },
              { title: 'منتج جديد', disabled: true },
            ],
          },
        },
        {
          path: 'products/:id',
          name: 'product-view',
          component: () => import('@/modules/products/pages/ProductView.vue'),
          meta: {
            title: 'عرض المنتج',
            permission: [PERMISSIONS.PRODUCTS_VIEW_ALL, PERMISSIONS.PRODUCTS_VIEW_CHILDREN, PERMISSIONS.PRODUCTS_VIEW_SELF],
            breadcrumbs: [
              { title: 'المنتجات', to: '/app/products' },
              { title: 'عرض المنتج', disabled: true },
            ],
          },
        },
        {
          path: 'products/:id/edit',
          name: 'product-edit',
          component: () => import('@/modules/products/pages/ProductFormPage.vue'),
          meta: {
            title: 'تعديل المنتج',
            permission: PERMISSIONS.PRODUCTS_UPDATE_ALL,
            breadcrumbs: [
              { title: 'المنتجات', to: '/app/products' },
              { title: 'تعديل المنتج', disabled: true },
            ],
          },
        },
        // ==================== Services & Subscriptions ====================
        {
          path: 'services',
          name: 'services',
          component: () => import('@/modules/services/pages/ServiceList.vue'),
          meta: {
            title: 'الخدمات',
            permission: [PERMISSIONS.PRODUCTS_VIEW_ALL],
          },
        },
        {
          path: 'subscriptions',
          name: 'subscriptions',
          component: () => import('@/modules/subscriptions/pages/SubscriptionList.vue'),
          meta: {
            title: 'الاشتراكات الجارية',
            permission: [PERMISSIONS.PRODUCTS_VIEW_ALL],
          },
        },
        // ==================== Expenses & Financials ====================
        {
          path: 'expenses',
          name: 'expenses',
          component: () => import('@/modules/expenses/pages/ExpenseList.vue'),
          meta: {
            title: 'المصاريف',
            permission: [PERMISSIONS.EXPENSES_VIEW_ALL, PERMISSIONS.EXPENSES_VIEW_CHILDREN, PERMISSIONS.EXPENSES_VIEW_SELF],
          },
        },
        {
          path: 'financial-ledger',
          name: 'financial-ledger',
          component: () => import('@/modules/expenses/pages/LedgerList.vue'),
          meta: {
            title: 'دفتر الأستاذ',
            permission: [PERMISSIONS.FINANCIAL_LEDGER_VIEW_ALL, PERMISSIONS.FINANCIAL_LEDGER_VIEW_CHILDREN, PERMISSIONS.FINANCIAL_LEDGER_VIEW_SELF],
          },
        },

        // ==================== Payments ====================
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/modules/payments/pages/PaymentList.vue'),
          meta: {
            title: 'المدفوعات',
            permission: [PERMISSIONS.PAYMENTS_VIEW_ALL, PERMISSIONS.PAYMENTS_VIEW_CHILDREN, PERMISSIONS.PAYMENTS_VIEW_SELF],
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
            permission: [
              PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL,
              PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN,
              PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF,
            ],
          },
        },
        {
          path: 'installment-plans/:id',
          name: 'installment-plan-view',
          component: () => import('@/modules/installments/pages/InstallmentPlanView.vue'),
          meta: {
            title: 'عرض خطة التقسيط',
            permission: [
              PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL,
              PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN,
              PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF,
            ],
            breadcrumbs: [
              { title: 'خطط التقسيط', to: '/app/installment-plans' },
              { title: 'تفاصيل الخطة', disabled: true },
            ],
          },
        },
        {
          path: 'installments',
          name: 'installments',
          component: () => import('@/modules/installments/pages/InstallmentList.vue'),
          meta: {
            title: 'الأقساط',
            permission: [
              PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL,
              PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN,
              PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF,
            ],
          },
        },
        {
          path: 'installment-payments',
          name: 'installment-payments',
          component: () => import('@/modules/installments/pages/InstallmentPaymentList.vue'),
          meta: {
            title: 'دفعات الأقساط',
            permission: [
              PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_ALL,
              PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_CHILDREN,
              PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_SELF,
            ],
          },
        },

        // ==================== CashBoxes ====================
        {
          path: 'cashboxes',
          name: 'cashboxes',
          component: () => import('@/modules/cashbox/pages/CashBoxList.vue'),
          meta: {
            title: 'الخزائن',
            permission: [PERMISSIONS.CASH_BOXES_VIEW_ALL, PERMISSIONS.CASH_BOXES_VIEW_CHILDREN, PERMISSIONS.CASH_BOXES_VIEW_SELF],
          },
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () => import('@/modules/cashbox/pages/TransactionList.vue'),
          meta: {
            title: 'التحويلات',
            permission: [PERMISSIONS.TRANSACTIONS_VIEW_ALL, PERMISSIONS.TRANSACTIONS_VIEW_CHILDREN, PERMISSIONS.TRANSACTIONS_VIEW_SELF],
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
            permission: [PERMISSIONS.USERS_VIEW_ALL, PERMISSIONS.USERS_VIEW_CHILDREN, PERMISSIONS.USERS_VIEW_SELF],
          },
        },
        {
          path: 'users/:id',
          name: 'user-view',
          component: () => import('@/modules/users/pages/UserView.vue'),
          meta: {
            title: 'عرض المستخدم',
            permission: PERMISSIONS.USERS_VIEW_ALL,
            breadcrumbs: [
              { title: 'المستخدمين', to: '/app/users' },
              { title: 'تفاصيل المستخدم', disabled: true },
            ],
          },
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('@/modules/users/pages/RoleManagement.vue'),
          meta: {
            title: 'الأدوار والصلاحيات',
            permission: [PERMISSIONS.ROLES_VIEW_ALL, PERMISSIONS.ROLES_VIEW_CHILDREN, PERMISSIONS.ROLES_VIEW_SELF],
          },
        },

        // ==================== Warehouses ====================
        {
          path: 'warehouses',
          name: 'warehouses',
          component: () => import('@/modules/warehouses/pages/WarehouseList.vue'),
          meta: {
            title: 'المخازن',
            permission: [PERMISSIONS.WAREHOUSES_VIEW_ALL, PERMISSIONS.WAREHOUSES_VIEW_CHILDREN, PERMISSIONS.WAREHOUSES_VIEW_SELF],
          },
        },

        // ==================== Settings ====================
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
          path: 'attributes',
          name: 'attributes',
          component: () => import('@/modules/products/pages/AttributeList.vue'),
          meta: {
            title: 'خصائص المنتجات',
            permission: [PERMISSIONS.ATTRIBUTES_VIEW_ALL, PERMISSIONS.ATTRIBUTES_VIEW_CHILDREN, PERMISSIONS.ATTRIBUTES_VIEW_SELF],
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
          path: 'sessions',
          name: 'sessions',
          component: () => import('@/modules/users/pages/SessionManagement.vue'),
          meta: { title: 'إدارة الأجهزة' },
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
