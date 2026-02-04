import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'warehouses',
    name: 'warehouses',
    component: () => import('@/modules/warehouses/pages/WarehouseList.vue'),
    meta: {
      title: 'المخازن',
      permission: [PERMISSIONS.WAREHOUSES_VIEW_ALL, PERMISSIONS.WAREHOUSES_VIEW_CHILDREN, PERMISSIONS.WAREHOUSES_VIEW_SELF],
    },
  },
];
