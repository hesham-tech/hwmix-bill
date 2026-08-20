import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'custodies',
    name: 'custodies',
    component: () => import('@/modules/custodies/pages/CustodiesList.vue'),
    meta: {
      title: 'العهد',
      permission: [PERMISSIONS.CUSTODIES_VIEW_ALL, PERMISSIONS.CUSTODIES_VIEW_SELF],
    },
  },
];
