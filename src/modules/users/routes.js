import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'users',
    name: 'users',
    component: () => import('@/modules/users/pages/UserList.vue'),
    meta: {
      title: 'المستخدمين',
      permission: [PERMISSIONS.USERS_VIEW_ALL, PERMISSIONS.USERS_VIEW_CHILDREN, PERMISSIONS.USERS_VIEW_SELF],
    },
  },
  {
    path: 'users/:id',
    name: 'user-view',
    component: () => import('@/modules/users/pages/UserView.vue'),
    meta: {
      title: 'عرض المستخدم',
      permission: PERMISSIONS.USERS_VIEW_ALL,
      breadcrumbs: [
        { title: 'المستخدمين', to: '/app/users' },
        { title: 'تفاصيل المستخدم', disabled: true },
      ],
    },
  },
  {
    path: 'roles',
    name: 'roles',
    component: () => import('@/modules/users/pages/RoleManagement.vue'),
    meta: {
      title: 'الأدوار والصلاحيات',
      permission: [PERMISSIONS.ROLES_VIEW_ALL, PERMISSIONS.ROLES_VIEW_CHILDREN, PERMISSIONS.ROLES_VIEW_SELF],
    },
  },
  {
    path: 'sessions',
    name: 'sessions',
    component: () => import('@/modules/users/pages/SessionManagement.vue'),
    meta: { title: 'إدارة الأجهزة' },
  },
  {
    path: 'profile',
    name: 'profile',
    component: () => import('@/modules/users/pages/Profile.vue'),
    meta: { title: 'الملف الشخصي' },
  },
];
