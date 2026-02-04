export default [
  {
    path: 'forbidden',
    name: 'forbidden',
    component: () => import('@/pages/Forbidden.vue'),
    meta: { title: 'غير مصرح' },
  },
];
