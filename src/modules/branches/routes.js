import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'branches',
    name: 'branches',
    component: () => import('./pages/BranchList.vue'),
    meta: {
      title: 'إدارة الفروع',
      permission: [PERMISSIONS.BRANCHES_VIEW_ALL],
    },
  },
];
