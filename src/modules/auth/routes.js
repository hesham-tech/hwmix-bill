export default [
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
];
