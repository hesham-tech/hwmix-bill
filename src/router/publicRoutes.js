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
];
