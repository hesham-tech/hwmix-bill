/**
 * Constants for the application
 */

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? 'https://bill-api.hwnix.com/api/' : 'http://127.0.0.1:8000/api/');

// App Configuration
export const APP_NAME = 'hwmix-bill';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
  { value: -1, title: 'الكل' },
];

// Invoice Types
export const INVOICE_TYPES = {
  SALE: 'sales',
  PURCHASE: 'purchases',
  INSTALLMENT_SALE: 'installment_sale',
};

export const INVOICE_TYPE_LABELS = {
  [INVOICE_TYPES.SALE]: 'بيع',
  [INVOICE_TYPES.PURCHASE]: 'شراء',
  [INVOICE_TYPES.INSTALLMENT_SALE]: 'تقسيط',
};

export const INVOICE_TYPE_COLORS = {
  [INVOICE_TYPES.SALE]: 'success',
  [INVOICE_TYPES.PURCHASE]: 'warning',
  [INVOICE_TYPES.INSTALLMENT_SALE]: 'info',
};

// Invoice Statuses
export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUSES.DRAFT]: 'مسودة',
  [INVOICE_STATUSES.PENDING]: 'معلقة',
  [INVOICE_STATUSES.PAID]: 'مدفوعة',
  [INVOICE_STATUSES.CANCELLED]: 'ملغاة',
};

export const INVOICE_STATUS_COLORS = {
  [INVOICE_STATUSES.DRAFT]: 'grey',
  [INVOICE_STATUSES.PENDING]: 'warning',
  [INVOICE_STATUSES.PAID]: 'success',
  [INVOICE_STATUSES.CANCELLED]: 'error',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  CHECK: 'check',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'نقدي',
  [PAYMENT_METHODS.CARD]: 'بطاقة',
  [PAYMENT_METHODS.TRANSFER]: 'تحويل',
  [PAYMENT_METHODS.CHECK]: 'شيك',
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'admin.super',
  COMPANY_ADMIN: 'admin.company',
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
};

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';

// File Upload
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Currencies
export const DEFAULT_CURRENCY = 'EGP';
export const CURRENCIES = [
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م' },
  { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
  { code: 'EUR', name: 'يورو', symbol: '€' },
];

// Tax Rates
export const DEFAULT_TAX_RATE = 14;

// Permissions
export const PERMISSIONS = {
  // Invoices
  INVOICES_VIEW: 'invoices.view',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_UPDATE: 'invoices.update',
  INVOICES_DELETE: 'invoices.delete',

  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',

  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_UPDATE: 'payments.update',
  PAYMENTS_DELETE: 'payments.delete',

  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  // Reports
  REPORTS_VIEW: 'reports.view',
};
