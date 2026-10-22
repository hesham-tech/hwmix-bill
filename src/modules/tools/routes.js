// مسارات مركز الأدوات وتطبيقات الويب المفتوحة بدون تسجيل دخول

export default [
  {
    path: '/tools',
    name: 'public-tools-hub',
    component: () => import('@/modules/tools/pages/ToolsHubPage.vue'),
    meta: {
      title: 'مركز الأدوات وتطبيقات الويب',
      public: true,
    },
  },
  {
    path: '/tools/:toolSlug',
    name: 'public-tool-detail',
    component: () => import('@/modules/tools/pages/ToolDetailPage.vue'),
    meta: {
      title: 'أداة ويب تفاعلية',
      public: true,
    },
  },
];
