/**
 * Router Prefetching Utility
 * Preloads common routes in the background to improve navigation speed
 */

// Common routes that should be prefetched after initial load
const COMMON_ROUTES_TO_PREFETCH = [
  // Admin routes - most frequently accessed
  () => import('@/modules/reports/pages/Dashboard.vue'),
  () => import('@/modules/invoices/pages/InvoiceList.vue'),
  () => import('@/modules/products/pages/ProductList.vue'),
  () => import('@/modules/payments/pages/PaymentList.vue'),

  // Customer portal
  () => import('@/modules/customer/portal/dashboard/pages/CustomerDashboard.vue'),
  () => import('@/modules/customer/portal/purchases/pages/Purchases.vue'),
];

// Routes to prefetch when user is on a list page
const LIST_RELATED_ROUTES = {
  invoices: [() => import('@/modules/invoices/pages/InvoiceCreate.vue'), () => import('@/modules/invoices/pages/InvoiceView.vue')],
  products: [() => import('@/modules/products/pages/ProductFormPage.vue'), () => import('@/modules/products/pages/ProductView.vue')],
  payments: [() => import('@/modules/payments/pages/PaymentCreate.vue')],
};

/**
 * Prefetch common routes in the background
 * Should be called after app initialization
 */
export function prefetchCommonRoutes() {
  if (typeof requestIdleCallback === 'undefined') {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      COMMON_ROUTES_TO_PREFETCH.forEach(route => route().catch(() => {}));
    }, 3000);
    return;
  }

  requestIdleCallback(() => {
    COMMON_ROUTES_TO_PREFETCH.forEach((route, index) => {
      // Stagger prefetches to avoid network congestion
      setTimeout(() => {
        route().catch(err => {
          console.debug('[Prefetch] Failed to prefetch common route:', err);
        });
      }, index * 100);
    });
  });
}

/**
 * Prefetch related routes based on current route name
 * @param {string} routeName - Current route name
 */
export function prefetchRelatedRoutes(routeName) {
  const routes = LIST_RELATED_ROUTES[routeName];
  if (!routes) return;

  requestIdleCallback(() => {
    routes.forEach((route, index) => {
      setTimeout(() => {
        route().catch(() => {});
      }, index * 100);
    });
  });
}

/**
 * Setup route prefetching hooks
 * @param {Router} router - Vue Router instance
 */
export function setupRoutePrefetching(router) {
  router.afterEach(to => {
    // Prefetch related routes when landing on list pages
    if (to.name && LIST_RELATED_ROUTES[to.name]) {
      prefetchRelatedRoutes(to.name);
    }
  });
}
