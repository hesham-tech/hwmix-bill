import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'companies',
    name: 'companies',
    component: () => import('./pages/CompanyList.vue'),
    meta: {
      title: 'إدارة الشركات',
      permission: [
        PERMISSIONS.ADMIN_SUPER,
        PERMISSIONS.COMPANIES_VIEW_ALL,
        PERMISSIONS.COMPANIES_VIEW_CHILDREN,
        PERMISSIONS.COMPANIES_VIEW_SELF,
      ],
    },
  },
];
