import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'products',
    name: 'products',
    component: () => import('@/modules/products/pages/ProductList.vue'),
    meta: {
      title: 'المنتجات',
      permission: [PERMISSIONS.PRODUCTS_VIEW_ALL, PERMISSIONS.PRODUCTS_VIEW_CHILDREN, PERMISSIONS.PRODUCTS_VIEW_SELF],
    },
  },
  {
    path: 'products/create',
    name: 'product-create',
    component: () => import('@/modules/products/pages/ProductFormPage.vue'),
    meta: {
      title: 'منتج جديد',
      permission: PERMISSIONS.PRODUCTS_CREATE,
      breadcrumbs: [
        { title: 'المنتجات', to: '/app/products' },
        { title: 'منتج جديد', disabled: true },
      ],
    },
  },
  {
    path: 'products/:id',
    name: 'product-view',
    component: () => import('@/modules/products/pages/ProductView.vue'),
    meta: {
      title: 'عرض المنتج',
      permission: [PERMISSIONS.PRODUCTS_VIEW_ALL, PERMISSIONS.PRODUCTS_VIEW_CHILDREN, PERMISSIONS.PRODUCTS_VIEW_SELF],
      breadcrumbs: [
        { title: 'المنتجات', to: '/app/products' },
        { title: 'عرض المنتج', disabled: true },
      ],
    },
  },
  {
    path: 'products/:id/edit',
    name: 'product-edit',
    component: () => import('@/modules/products/pages/ProductFormPage.vue'),
    meta: {
      title: 'تعديل المنتج',
      permission: PERMISSIONS.PRODUCTS_UPDATE_ALL,
      breadcrumbs: [
        { title: 'المنتجات', to: '/app/products' },
        { title: 'تعديل المنتج', disabled: true },
      ],
    },
  },
  {
    path: 'attributes',
    name: 'attributes',
    component: () => import('@/modules/products/pages/AttributeList.vue'),
    meta: {
      title: 'خصائص المنتجات',
      permission: [PERMISSIONS.ATTRIBUTES_VIEW_ALL, PERMISSIONS.ATTRIBUTES_VIEW_CHILDREN, PERMISSIONS.ATTRIBUTES_VIEW_SELF],
    },
  },
];
