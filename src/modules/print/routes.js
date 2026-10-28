import { PERMISSIONS } from '@/config/permissions';
const permission = [PERMISSIONS.LABEL_TEMPLATES_MANAGE, PERMISSIONS.LABEL_TEMPLATES_PUBLISH, PERMISSIONS.LABEL_TEMPLATES_SET_DEFAULT];
export default [
  {
    path: 'label-templates',
    name: 'label-templates',
    component: () => import('./pages/LabelTemplates.vue'),
    meta: { title: 'قوالب الملصقات', permission },
  },
  {
    path: 'label-templates/new',
    name: 'label-template-create',
    component: () => import('./pages/LabelTemplateEditor.vue'),
    meta: { labelEditor: true, title: 'إنشاء قالب ملصقات', permission: [PERMISSIONS.LABEL_TEMPLATES_MANAGE] },
  },
  {
    path: 'label-templates/:id/edit',
    name: 'label-template-editor',
    component: () => import('./pages/LabelTemplateEditor.vue'),
    meta: { labelEditor: true, title: 'محرر قالب الملصقات', permission: [PERMISSIONS.LABEL_TEMPLATES_MANAGE, PERMISSIONS.LABEL_TEMPLATES_PUBLISH] },
  },
];
