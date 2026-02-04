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
];
