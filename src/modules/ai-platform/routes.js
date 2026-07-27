export default [
  {
    path: '/ai-platform',
    name: 'ai-platform-dashboard',
    component: () => import('@/modules/ai-platform/pages/AiDashboard.vue'),
    meta: {
      title: 'منصة الذكاء الاصطناعي',
      requiresAuth: true,
    },
  },
  {
    path: '/ai-platform/agents',
    name: 'ai-platform-agents',
    component: () => import('@/modules/ai-platform/pages/AiAgents.vue'),
    meta: {
      title: 'الوكلاء الذكيون - AI Platform',
      requiresAuth: true,
    },
  },
  {
    path: '/ai-platform/prompts',
    name: 'ai-platform-prompts',
    component: () => import('@/modules/ai-platform/pages/AiPrompts.vue'),
    meta: {
      title: 'قوالب الـ Prompts - AI Platform',
      requiresAuth: true,
    },
  },
  {
    path: '/ai-platform/usage',
    name: 'ai-platform-usage',
    component: () => import('@/modules/ai-platform/pages/AiUsage.vue'),
    meta: {
      title: 'تقرير الاستهلاك - AI Platform',
      requiresAuth: true,
    },
  },
  {
    path: '/ai-platform/models',
    name: 'ai-platform-models',
    component: () => import('./pages/AiModels.vue'),
    meta: {
      title: 'إدارة النماذج - AI Platform',
      requiresAuth: true,
    },
  },
  {
    path: '/ai-platform/accounts',
    name: 'ai-platform-accounts',
    component: () => import('./pages/AiAccounts.vue'),
    meta: {
      title: 'مفاتيح وحسابات API - AI Platform',
      requiresAuth: true,
    },
  },
];
