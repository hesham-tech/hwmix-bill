export default [
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
    path: '/service-unavailable',
    name: 'service-unavailable',
    component: () => import('@/pages/ServiceUnavailable.vue'),
    meta: { title: 'الخدمة غير متوفرة', public: true },
  },
  {
    path: '/legal/:key',
    name: 'public-legal-document',
    component: () => import('@/modules/legal/pages/PublicDocumentView.vue'),
    meta: { title: 'المستندات القانونية', public: true },
  },
  {
    path: '/privacy-policy',
    redirect: '/legal/privacy-policy',
  },
  {
    path: '/terms-of-use',
    redirect: '/legal/terms-of-use',
  },
  {
    path: '/refund-policy',
    redirect: '/legal/refund-policy',
  },
  {
    path: '/cookie-policy',
    redirect: '/legal/cookie-policy',
  },
  {
    path: '/magic-login',
    name: 'magic-login',
    component: () => import('@/pages/MagicLogin.vue'),
    meta: { title: 'تسجيل الدخول السريع', public: true },
  },
  // Store Routes
  {
    path: '/store',
    name: 'store-home',
    component: () => import('@/pages/store/StorePage.vue'),
    meta: { title: 'المتجر', public: true },
  },
  {
    path: '/store/product/:id',
    name: 'store-product-detail',
    component: () => import('@/pages/store/ProductDetailPage.vue'),
    meta: { title: 'تفاصيل المنتج', public: true },
  },
  {
    path: '/store/cart',
    name: 'store-cart',
    component: () => import('@/pages/store/CartPage.vue'),
    meta: { title: 'سلة المشتريات', public: true },
  },
  {
    path: '/store/checkout',
    name: 'store-checkout',
    component: () => import('@/pages/store/CheckoutPage.vue'),
    meta: { title: 'إتمام الطلب', public: true },
  },
  {
    path: '/store/my-orders',
    name: 'store-my-orders',
    component: () => import('@/pages/store/MyOrdersPage.vue'),
    meta: { title: 'طلباتي', public: true }, // Made public
  },
  {
    path: '/store/order-confirmation/:id',
    name: 'store-order-confirmation',
    component: () => import('@/pages/store/OrderConfirmationPage.vue'),
    meta: { title: 'تأكيد الطلب', public: true },
  },
  {
    path: '/store/vendor/:id',
    name: 'store-vendor',
    component: () => import('@/pages/store/VendorPage.vue'),
    meta: { title: 'صفحة البائع', public: true },
  },
];
