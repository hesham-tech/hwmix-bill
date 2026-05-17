export default [
  // ==================== Store Auth Routes ====================
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/pages/StoreLogin.vue'),
    meta: { title: 'دخول المتجر', public: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/modules/auth/pages/StoreRegister.vue'),
    meta: { title: 'إنشاء حساب في المتجر', public: true },
  },

  // ==================== SaaS Auth Routes ====================
  {
    path: '/saas/login',
    name: 'saas-login',
    component: () => import('@/modules/auth/pages/SaasLogin.vue'),
    meta: { title: 'دخول نظام الإدارة', public: true },
  },
  {
    path: '/saas/register',
    name: 'saas-register',
    component: () => import('@/modules/auth/pages/SaasRegister.vue'),
    meta: { title: 'تسجيل شركة جديدة', public: true },
  },

  // ==================== Shared ====================
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/modules/auth/pages/ForgotPassword.vue'),
    meta: { title: 'استعادة كلمة المرور', public: true },
  },
];

