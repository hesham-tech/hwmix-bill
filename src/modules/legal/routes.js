import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'admin/legal-documents',
    name: 'admin-legal-documents',
    component: () => import('@/modules/legal/pages/AdminLegalDashboard.vue'),
    meta: {
      title: 'إدارة المستندات القانونية',
      permission: [PERMISSIONS.LEGAL_DOCUMENTS_VIEW_ALL, PERMISSIONS.ADMIN_SUPER],
    },
  },
  {
    path: 'admin/legal-documents/editor',
    name: 'admin-legal-document-editor',
    component: () => import('@/modules/legal/pages/DocumentEditor.vue'),
    meta: {
      title: 'محرر المستندات القانونية',
      permission: [PERMISSIONS.LEGAL_DOCUMENTS_UPDATE, PERMISSIONS.ADMIN_SUPER],
    },
  },
  {
    path: 'admin/legal-documents/report/:versionId',
    name: 'admin-legal-document-report',
    component: () => import('@/modules/legal/pages/AcceptancesReportList.vue'),
    meta: {
      title: 'تقارير نسب الموافقات',
      permission: [PERMISSIONS.LEGAL_DOCUMENTS_VIEW_ALL, PERMISSIONS.ADMIN_SUPER],
    },
  },
  {
    path: 'legal-history',
    name: 'user-legal-history',
    component: () => import('@/modules/legal/pages/UserAcceptanceHistory.vue'),
    meta: {
      title: 'سجل الشروط والموافقات',
    },
  },
];
