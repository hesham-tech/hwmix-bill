import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, permissionGuard, roleGuard, defaultGuard } from './guards';
import { setupRoutePrefetching } from './prefetch';

// Import Route Modules
import publicRoutes from './publicRoutes';
import authRoutes from '@/modules/auth/routes';
import customerRoutes from '@/modules/customer/portal-routes';
import invoiceRoutes from '@/modules/invoices/routes';
import productRoutes from '@/modules/products/routes';
import serviceRoutes from '@/modules/services/routes';
import expenseRoutes from '@/modules/expenses/routes';
import paymentRoutes from '@/modules/payments/routes';
import installmentRoutes from '@/modules/installments/routes';
import cashboxRoutes from '@/modules/cashbox/routes';
import reportRoutes from '@/modules/reports/routes';
import userRoutes from '@/modules/users/routes';
import warehouseRoutes from '@/modules/warehouses/routes';
import settingRoutes from '@/modules/settings/routes';
import taskRoutes from '@/modules/tasks/routes';
import devRoutes from '@/modules/dev/routes';
import errorRoutes from './errorRoutes';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ==================== Public & Auth Routes ====================
    ...publicRoutes,
    ...authRoutes,

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
              const permissions = user.permissions || [];
              const isStaff = permissions.some(p => p.includes('.view_') || p.includes('.page') || p.includes('admin.'));

              return isStaff ? '/app/admin/dashboard' : '/app/portal';
            }
            return '/login';
          },
        },

        // Merge Module Routes
        ...reportRoutes,
        ...customerRoutes,
        ...invoiceRoutes,
        ...productRoutes,
        ...serviceRoutes,
        ...expenseRoutes,
        ...paymentRoutes,
        ...installmentRoutes,
        ...cashboxRoutes,
        ...userRoutes,
        ...warehouseRoutes,
        ...settingRoutes,
        ...taskRoutes,
        ...devRoutes,
        ...errorRoutes,
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

// Setup route prefetching for common pages
setupRoutePrefetching(router);

export default router;
