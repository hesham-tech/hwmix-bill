/**
 * Permission Keys Constants
 *
 * مركزة جميع مفاتيح الصلاحيات في مكان واحد
 * يجب أن تطابق تماماً الموجودة في Backend:
 * config/permissions_keys.php
 *
 * ⚠️ عند تغيير أي مفتاح في Backend، قم بتحديثه هنا
 */

export const PERMISSIONS = {
  // ==================== Admin ====================
  ADMIN_SUPER: 'admin.super',
  ADMIN_COMPANY: 'admin.company',

  // ==================== Invoices ====================
  INVOICES_PAGE: 'invoices.page',
  INVOICES_VIEW_ALL: 'invoices.view_all',
  INVOICES_VIEW_OWN: 'invoices.view_own',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_UPDATE_ALL: 'invoices.update_all',
  INVOICES_UPDATE_OWN: 'invoices.update_own',
  INVOICES_DELETE_ALL: 'invoices.delete_all',
  INVOICES_DELETE_OWN: 'invoices.delete_own',
  INVOICES_PRINT: 'invoices.print',

  // ==================== Products ====================
  PRODUCTS_PAGE: 'products.page',
  PRODUCTS_VIEW_ALL: 'products.view_all',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE_ALL: 'products.update_all',
  PRODUCTS_DELETE_ALL: 'products.delete_all',
  PRODUCTS_IMPORT: 'products.import',
  PRODUCTS_EXPORT: 'products.export',

  // ==================== Payments ====================
  PAYMENTS_PAGE: 'payments.page',
  PAYMENTS_VIEW_ALL: 'payments.view_all',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_UPDATE_ALL: 'payments.update_all',
  PAYMENTS_DELETE_ALL: 'payments.delete_all',

  // ==================== Users ====================
  USERS_PAGE: 'users.page',
  USERS_VIEW_ALL: 'users.view_all',
  USERS_CREATE: 'users.create',
  USERS_UPDATE_ALL: 'users.update_all',
  USERS_DELETE_ALL: 'users.delete_all',

  // ==================== Roles ====================
  ROLES_PAGE: 'roles.page',
  ROLES_VIEW_ALL: 'roles.view_all',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE_ALL: 'roles.update_all',
  ROLES_DELETE_ALL: 'roles.delete_all',

  // ==================== Reports ====================
  REPORTS_VIEW: 'reports.view',
  REPORTS_SALES: 'reports.sales',
  REPORTS_STOCK: 'reports.stock',
  REPORTS_PROFIT: 'reports.profit',
  REPORTS_CASH_FLOW: 'reports.cash_flow',
  REPORTS_TAX: 'reports.tax',
  REPORTS_EXPORT: 'reports.export',

  // ==================== Warehouses ====================
  WAREHOUSES_PAGE: 'warehouses.page',
  WAREHOUSES_VIEW_ALL: 'warehouses.view_all',
  WAREHOUSES_CREATE: 'warehouses.create',
  WAREHOUSES_UPDATE_ALL: 'warehouses.update_all',
  WAREHOUSES_DELETE_ALL: 'warehouses.delete_all',

  // ==================== Categories ====================
  CATEGORIES_PAGE: 'categories.page',
  CATEGORIES_VIEW_ALL: 'categories.view_all',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE_ALL: 'categories.update_all',
  CATEGORIES_DELETE_ALL: 'categories.delete_all',

  // ==================== Brands ====================
  BRANDS_PAGE: 'brands.page',
  BRANDS_VIEW_ALL: 'brands.view_all',
  BRANDS_CREATE: 'brands.create',
  BRANDS_UPDATE_ALL: 'brands.update_all',
  BRANDS_DELETE_ALL: 'brands.delete_all',

  // ==================== Payment Methods ====================
  PAYMENT_METHODS_PAGE: 'payment_methods.page',
  PAYMENT_METHODS_VIEW_ALL: 'payment_methods.view_all',
  PAYMENT_METHODS_CREATE: 'payment_methods.create',
  PAYMENT_METHODS_UPDATE_ALL: 'payment_methods.update_all',
  PAYMENT_METHODS_DELETE_ALL: 'payment_methods.delete_all',
};

/**
 * Permission Groups for easy checking
 * مجموعات الصلاحيات لسهولة التحقق
 */
export const PERMISSION_GROUPS = {
  // Can manage invoices (any action)
  MANAGE_INVOICES: [PERMISSIONS.INVOICES_CREATE, PERMISSIONS.INVOICES_UPDATE_ALL, PERMISSIONS.INVOICES_DELETE_ALL],

  // Can manage products
  MANAGE_PRODUCTS: [PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_UPDATE_ALL, PERMISSIONS.PRODUCTS_DELETE_ALL],

  // Is admin
  IS_ADMIN: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
};

/**
 * Helper to check if a permission key is valid
 * للتحقق من صحة مفتاح الصلاحية
 */
export function isValidPermission(permission) {
  return Object.values(PERMISSIONS).includes(permission);
}

/**
 * Helper to get permission by module and action
 * للحصول على صلاحية حسب الوحدة والإجراء
 */
export function getPermission(module, action) {
  const key = `${module.toUpperCase()}_${action.toUpperCase()}`;
  return PERMISSIONS[key] || null;
}
