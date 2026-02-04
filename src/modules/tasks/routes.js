export default [
  {
    path: 'tasks',
    name: 'tasks',
    component: () => import('@/modules/tasks/pages/TasksList.vue'),
    meta: { title: 'المهام' },
  },
  {
    path: 'task-groups',
    name: 'task-groups',
    component: () => import('@/modules/tasks/pages/TaskGroups.vue'),
    meta: { title: 'مجموعات العمل' },
  },
];
