import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'installment-plans',
    name: 'installment-plans',
    component: () => import('@/modules/installments/pages/InstallmentPlanList.vue'),
    meta: {
      title: 'خطط التقسيط',
      permission: [PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL, PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN, PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF],
    },
  },
  {
    path: 'installment-plans/:id',
    name: 'installment-plan-view',
    component: () => import('@/modules/installments/pages/InstallmentPlanView.vue'),
    meta: {
      title: 'عرض خطة التقسيط',
      permission: [PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL, PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN, PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF],
      breadcrumbs: [
        { title: 'خطط التقسيط', to: '/app/installment-plans' },
        { title: 'تفاصيل الخطة', disabled: true },
      ],
    },
  },
  {
    path: 'installments',
    name: 'installments',
    component: () => import('@/modules/installments/pages/InstallmentList.vue'),
    meta: {
      title: 'الأقساط',
      permission: [PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL, PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN, PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF],
    },
  },
  {
    path: 'installment-payments',
    name: 'installment-payments',
    component: () => import('@/modules/installments/pages/InstallmentPaymentList.vue'),
    meta: {
      title: 'دفعات الأقساط',
      permission: [
        PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_ALL,
        PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_CHILDREN,
        PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_SELF,
      ],
    },
  },
];
