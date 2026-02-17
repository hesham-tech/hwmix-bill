/**
 * ============================================================================
 * Permission Keys Constants - Complete Sync with Backend
 * ============================================================================
 * مزامنة كاملة مع: D:\Dev\projects\hwmix-bill-api\config\permissions_keys.php
 *
 * ⚠️ هذا الملف يجب أن يطابق Backend تماماً
 * Last synced: 2026-01-04
 */

export const PERMISSIONS = {
  // ==================== Admin ====================
  ADMIN_PAGE: 'admin.page',
  ADMIN_SUPER: 'admin.super',
  ADMIN_COMPANY: 'admin.company',

  // ==================== Companies ====================
  COMPANIES_PAGE: 'companies.page',
  COMPANIES_VIEW_ALL: 'companies.view_all',
  COMPANIES_VIEW_CHILDREN: 'companies.view_children',
  COMPANIES_VIEW_SELF: 'companies.view_self',
  COMPANIES_CREATE: 'companies.create',
  COMPANIES_UPDATE_ALL: 'companies.update_all',
  COMPANIES_UPDATE_CHILDREN: 'companies.update_children',
  COMPANIES_UPDATE_SELF: 'companies.update_self',
  COMPANIES_DELETE_ALL: 'companies.delete_all',
  COMPANIES_DELETE_CHILDREN: 'companies.delete_children',
  COMPANIES_DELETE_SELF: 'companies.delete_self',
  COMPANIES_CHANGE_ACTIVE: 'companies.change_active_company',

  // ==================== Users ====================
  USERS_PAGE: 'users.page',
  USERS_VIEW_ALL: 'users.view_all',
  USERS_VIEW_CHILDREN: 'users.view_children',
  USERS_VIEW_SELF: 'users.view_self',
  USERS_CREATE: 'users.create',
  USERS_UPDATE_ALL: 'users.update_all',
  USERS_UPDATE_CHILDREN: 'users.update_children',
  USERS_UPDATE_SELF: 'users.update_self',
  USERS_DELETE_ALL: 'users.delete_all',
  USERS_DELETE_CHILDREN: 'users.delete_children',
  USERS_DELETE_SELF: 'users.delete_self',

  // ==================== Roles ====================
  ROLES_PAGE: 'roles.page',
  ROLES_VIEW_ALL: 'roles.view_all',
  ROLES_VIEW_CHILDREN: 'roles.view_children',
  ROLES_VIEW_SELF: 'roles.view_self',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE_ALL: 'roles.update_all',
  ROLES_UPDATE_CHILDREN: 'roles.update_children',
  ROLES_UPDATE_SELF: 'roles.update_self',
  ROLES_DELETE_ALL: 'roles.delete_all',
  ROLES_DELETE_CHILDREN: 'roles.delete_children',
  ROLES_DELETE_SELF: 'roles.delete_self',

  // ==================== Personal Access Tokens ====================
  PERSONAL_ACCESS_TOKENS_PAGE: 'personal_access_tokens.page',
  PERSONAL_ACCESS_TOKENS_VIEW_ALL: 'personal_access_tokens.view_all',
  PERSONAL_ACCESS_TOKENS_VIEW_CHILDREN: 'personal_access_tokens.view_children',
  PERSONAL_ACCESS_TOKENS_VIEW_SELF: 'personal_access_tokens.view_self',
  PERSONAL_ACCESS_TOKENS_CREATE: 'personal_access_tokens.create',
  PERSONAL_ACCESS_TOKENS_UPDATE_ALL: 'personal_access_tokens.update_all',
  PERSONAL_ACCESS_TOKENS_UPDATE_CHILDREN: 'personal_access_tokens.update_children',
  PERSONAL_ACCESS_TOKENS_UPDATE_SELF: 'personal_access_tokens.update_self',
  PERSONAL_ACCESS_TOKENS_DELETE_ALL: 'personal_access_tokens.delete_all',
  PERSONAL_ACCESS_TOKENS_DELETE_CHILDREN: 'personal_access_tokens.delete_children',
  PERSONAL_ACCESS_TOKENS_DELETE_SELF: 'personal_access_tokens.delete_self',

  // ==================== Translations ====================
  TRANSLATIONS_PAGE: 'translations.page',
  TRANSLATIONS_VIEW_ALL: 'translations.view_all',
  TRANSLATIONS_VIEW_CHILDREN: 'translations.view_children',
  TRANSLATIONS_VIEW_SELF: 'translations.view_self',
  TRANSLATIONS_CREATE: 'translations.create',
  TRANSLATIONS_UPDATE_ALL: 'translations.update_all',
  TRANSLATIONS_UPDATE_CHILDREN: 'translations.update_children',
  TRANSLATIONS_UPDATE_SELF: 'translations.update_self',
  TRANSLATIONS_DELETE_ALL: 'translations.delete_all',
  TRANSLATIONS_DELETE_CHILDREN: 'translations.delete_children',
  TRANSLATIONS_DELETE_SELF: 'translations.delete_self',

  // ==================== Transactions ====================
  TRANSACTIONS_PAGE: 'transactions.page',
  TRANSACTIONS_VIEW_ALL: 'transactions.view_all',
  TRANSACTIONS_VIEW_CHILDREN: 'transactions.view_children',
  TRANSACTIONS_VIEW_SELF: 'transactions.view_self',
  TRANSACTIONS_CREATE: 'transactions.create',
  TRANSACTIONS_UPDATE_ALL: 'transactions.update_all',
  TRANSACTIONS_UPDATE_CHILDREN: 'transactions.update_children',
  TRANSACTIONS_UPDATE_SELF: 'transactions.update_self',
  TRANSACTIONS_DELETE_ALL: 'transactions.delete_all',
  TRANSACTIONS_DELETE_CHILDREN: 'transactions.delete_children',
  TRANSACTIONS_DELETE_SELF: 'transactions.delete_self',

  // ==================== Activity Logs ====================
  ACTIVITY_LOGS_PAGE: 'activity_logs.page',
  ACTIVITY_LOGS_VIEW_ALL: 'activity_logs.view_all',
  ACTIVITY_LOGS_VIEW_CHILDREN: 'activity_logs.view_children',
  ACTIVITY_LOGS_VIEW_SELF: 'activity_logs.view_self',
  ACTIVITY_LOGS_CREATE: 'activity_logs.create',
  ACTIVITY_LOGS_UPDATE_ALL: 'activity_logs.update_all',
  ACTIVITY_LOGS_UPDATE_CHILDREN: 'activity_logs.update_children',
  ACTIVITY_LOGS_UPDATE_SELF: 'activity_logs.update_self',
  ACTIVITY_LOGS_DELETE_ALL: 'activity_logs.delete_all',
  ACTIVITY_LOGS_DELETE_CHILDREN: 'activity_logs.delete_children',
  ACTIVITY_LOGS_DELETE_SELF: 'activity_logs.delete_self',

  // ==================== Cash Box Types ====================
  CASH_BOX_TYPES_PAGE: 'cash_box_types.page',
  CASH_BOX_TYPES_VIEW_ALL: 'cash_box_types.view_all',
  CASH_BOX_TYPES_VIEW_CHILDREN: 'cash_box_types.view_children',
  CASH_BOX_TYPES_VIEW_SELF: 'cash_box_types.view_self',
  CASH_BOX_TYPES_CREATE: 'cash_box_types.create',
  CASH_BOX_TYPES_UPDATE_ALL: 'cash_box_types.update_all',
  CASH_BOX_TYPES_UPDATE_CHILDREN: 'cash_box_types.update_children',
  CASH_BOX_TYPES_UPDATE_SELF: 'cash_box_types.update_self',
  CASH_BOX_TYPES_DELETE_ALL: 'cash_box_types.delete_all',
  CASH_BOX_TYPES_DELETE_CHILDREN: 'cash_box_types.delete_children',
  CASH_BOX_TYPES_DELETE_SELF: 'cash_box_types.delete_self',

  // ==================== Cash Boxes ====================
  CASH_BOXES_PAGE: 'cash_boxes.page',
  CASH_BOXES_VIEW_ALL: 'cash_boxes.view_all',
  CASH_BOXES_VIEW_CHILDREN: 'cash_boxes.view_children',
  CASH_BOXES_VIEW_SELF: 'cash_boxes.view_self',
  CASH_BOXES_CREATE: 'cash_boxes.create',
  CASH_BOXES_UPDATE_ALL: 'cash_boxes.update_all',
  CASH_BOXES_UPDATE_CHILDREN: 'cash_boxes.update_children',
  CASH_BOXES_UPDATE_SELF: 'cash_boxes.update_self',
  CASH_BOXES_DELETE_ALL: 'cash_boxes.delete_all',
  CASH_BOXES_DELETE_CHILDREN: 'cash_boxes.delete_children',
  CASH_BOXES_DELETE_SELF: 'cash_boxes.delete_self',

  // ==================== Images ====================
  IMAGES_PAGE: 'images.page',
  IMAGES_VIEW_ALL: 'images.view_all',
  IMAGES_VIEW_CHILDREN: 'images.view_children',
  IMAGES_VIEW_SELF: 'images.view_self',
  IMAGES_CREATE: 'images.create',
  IMAGES_UPDATE_ALL: 'images.update_all',
  IMAGES_UPDATE_CHILDREN: 'images.update_children',
  IMAGES_UPDATE_SELF: 'images.update_self',
  IMAGES_DELETE_ALL: 'images.delete_all',
  IMAGES_DELETE_CHILDREN: 'images.delete_children',
  IMAGES_DELETE_SELF: 'images.delete_self',

  // ==================== Warehouses ====================
  WAREHOUSES_PAGE: 'warehouses.page',
  WAREHOUSES_VIEW_ALL: 'warehouses.view_all',
  WAREHOUSES_VIEW_CHILDREN: 'warehouses.view_children',
  WAREHOUSES_VIEW_SELF: 'warehouses.view_self',
  WAREHOUSES_CREATE: 'warehouses.create',
  WAREHOUSES_UPDATE_ALL: 'warehouses.update_all',
  WAREHOUSES_UPDATE_CHILDREN: 'warehouses.update_children',
  WAREHOUSES_UPDATE_SELF: 'warehouses.update_self',
  WAREHOUSES_DELETE_ALL: 'warehouses.delete_all',
  WAREHOUSES_DELETE_CHILDREN: 'warehouses.delete_children',
  WAREHOUSES_DELETE_SELF: 'warehouses.delete_self',

  // ==================== Categories ====================
  CATEGORIES_PAGE: 'categories.page',
  CATEGORIES_VIEW_ALL: 'categories.view_all',
  CATEGORIES_VIEW_CHILDREN: 'categories.view_children',
  CATEGORIES_VIEW_SELF: 'categories.view_self',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE_ALL: 'categories.update_all',
  CATEGORIES_UPDATE_CHILDREN: 'categories.update_children',
  CATEGORIES_UPDATE_SELF: 'categories.update_self',
  CATEGORIES_DELETE_ALL: 'categories.delete_all',
  CATEGORIES_DELETE_CHILDREN: 'categories.delete_children',
  CATEGORIES_DELETE_SELF: 'categories.delete_self',
  CATEGORIES_MERGE: 'categories.merge',
  CATEGORIES_GLOBALIZE: 'categories.globalize',

  // ==================== Brands ====================
  BRANDS_PAGE: 'brands.page',
  BRANDS_VIEW_ALL: 'brands.view_all',
  BRANDS_VIEW_CHILDREN: 'brands.view_children',
  BRANDS_VIEW_SELF: 'brands.view_self',
  BRANDS_CREATE: 'brands.create',
  BRANDS_UPDATE_ALL: 'brands.update_all',
  BRANDS_UPDATE_CHILDREN: 'brands.update_children',
  BRANDS_UPDATE_SELF: 'brands.update_self',
  BRANDS_DELETE_ALL: 'brands.delete_all',
  BRANDS_DELETE_CHILDREN: 'brands.delete_children',
  BRANDS_DELETE_SELF: 'brands.delete_self',
  BRANDS_MERGE: 'brands.merge',
  BRANDS_GLOBALIZE: 'brands.globalize',

  // ==================== Attributes ====================
  ATTRIBUTES_PAGE: 'attributes.page',
  ATTRIBUTES_VIEW_ALL: 'attributes.view_all',
  ATTRIBUTES_VIEW_CHILDREN: 'attributes.view_children',
  ATTRIBUTES_VIEW_SELF: 'attributes.view_self',
  ATTRIBUTES_CREATE: 'attributes.create',
  ATTRIBUTES_UPDATE_ALL: 'attributes.update_all',
  ATTRIBUTES_UPDATE_CHILDREN: 'attributes.update_children',
  ATTRIBUTES_UPDATE_SELF: 'attributes.update_self',
  ATTRIBUTES_DELETE_ALL: 'attributes.delete_all',
  ATTRIBUTES_DELETE_CHILDREN: 'attributes.delete_children',
  ATTRIBUTES_DELETE_SELF: 'attributes.delete_self',

  // ==================== Attribute Values ====================
  ATTRIBUTE_VALUES_PAGE: 'attribute_values.page',
  ATTRIBUTE_VALUES_VIEW_ALL: 'attribute_values.view_all',
  ATTRIBUTE_VALUES_VIEW_CHILDREN: 'attribute_values.view_children',
  ATTRIBUTE_VALUES_VIEW_SELF: 'attribute_values.view_self',
  ATTRIBUTE_VALUES_CREATE: 'attribute_values.create',
  ATTRIBUTE_VALUES_UPDATE_ALL: 'attribute_values.update_all',
  ATTRIBUTE_VALUES_UPDATE_CHILDREN: 'attribute_values.update_children',
  ATTRIBUTE_VALUES_UPDATE_SELF: 'attribute_values.update_self',
  ATTRIBUTE_VALUES_DELETE_ALL: 'attribute_values.delete_all',
  ATTRIBUTE_VALUES_DELETE_CHILDREN: 'attribute_values.delete_children',
  ATTRIBUTE_VALUES_DELETE_SELF: 'attribute_values.delete_self',

  // ==================== Products ====================
  PRODUCTS_PAGE: 'products.page',
  PRODUCTS_VIEW_ALL: 'products.view_all',
  PRODUCTS_VIEW_CHILDREN: 'products.view_children',
  PRODUCTS_VIEW_SELF: 'products.view_self',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE_ALL: 'products.update_all',
  PRODUCTS_UPDATE_CHILDREN: 'products.update_children',
  PRODUCTS_UPDATE_SELF: 'products.update_self',
  PRODUCTS_DELETE_ALL: 'products.delete_all',
  PRODUCTS_DELETE_CHILDREN: 'products.delete_children',
  PRODUCTS_DELETE_SELF: 'products.delete_self',
  PRODUCTS_VIEW_WHOLESALE_PRICE: 'products.view_wholesale_price',
  PRODUCTS_VIEW_PURCHASE_PRICE: 'products.view_purchase_price',
  PRODUCTS_PRINT_LABELS: 'products.print_labels',

  // ==================== Product Variants ====================
  PRODUCT_VARIANTS_PAGE: 'product_variants.page',
  PRODUCT_VARIANTS_VIEW_ALL: 'product_variants.view_all',
  PRODUCT_VARIANTS_VIEW_CHILDREN: 'product_variants.view_children',
  PRODUCT_VARIANTS_VIEW_SELF: 'product_variants.view_self',
  PRODUCT_VARIANTS_CREATE: 'product_variants.create',
  PRODUCT_VARIANTS_UPDATE_ALL: 'product_variants.update_all',
  PRODUCT_VARIANTS_UPDATE_CHILDREN: 'product_variants.update_children',
  PRODUCT_VARIANTS_UPDATE_SELF: 'product_variants.update_self',
  PRODUCT_VARIANTS_DELETE_ALL: 'product_variants.delete_all',
  PRODUCT_VARIANTS_DELETE_CHILDREN: 'product_variants.delete_children',
  PRODUCT_VARIANTS_DELETE_SELF: 'product_variants.delete_self',

  // ==================== Product Variant Attributes ====================
  PRODUCT_VARIANT_ATTRIBUTES_PAGE: 'product_variant_attributes.page',
  PRODUCT_VARIANT_ATTRIBUTES_VIEW_ALL: 'product_variant_attributes.view_all',
  PRODUCT_VARIANT_ATTRIBUTES_VIEW_CHILDREN: 'product_variant_attributes.view_children',
  PRODUCT_VARIANT_ATTRIBUTES_VIEW_SELF: 'product_variant_attributes.view_self',
  PRODUCT_VARIANT_ATTRIBUTES_CREATE: 'product_variant_attributes.create',
  PRODUCT_VARIANT_ATTRIBUTES_UPDATE_ALL: 'product_variant_attributes.update_all',
  PRODUCT_VARIANT_ATTRIBUTES_UPDATE_CHILDREN: 'product_variant_attributes.update_children',
  PRODUCT_VARIANT_ATTRIBUTES_UPDATE_SELF: 'product_variant_attributes.update_self',
  PRODUCT_VARIANT_ATTRIBUTES_DELETE_ALL: 'product_variant_attributes.delete_all',
  PRODUCT_VARIANT_ATTRIBUTES_DELETE_CHILDREN: 'product_variant_attributes.delete_children',
  PRODUCT_VARIANT_ATTRIBUTES_DELETE_SELF: 'product_variant_attributes.delete_self',

  // ==================== Stocks ====================
  STOCKS_PAGE: 'stocks.page',
  STOCKS_VIEW_ALL: 'stocks.view_all',
  STOCKS_VIEW_CHILDREN: 'stocks.view_children',
  STOCKS_VIEW_SELF: 'stocks.view_self',
  STOCKS_CREATE: 'stocks.create',
  STOCKS_UPDATE_ALL: 'stocks.update_all',
  STOCKS_UPDATE_CHILDREN: 'stocks.update_children',
  STOCKS_UPDATE_SELF: 'stocks.update_self',
  STOCKS_DELETE_ALL: 'stocks.delete_all',
  STOCKS_DELETE_CHILDREN: 'stocks.delete_children',
  STOCKS_DELETE_SELF: 'stocks.delete_self',
  STOCKS_MANUAL_ADJUSTMENT: 'stocks.manual_adjustment',

  // ==================== Invoices ====================
  INVOICES_PAGE: 'invoices.page',
  INVOICES_VIEW_ALL: 'invoices.view_all',
  INVOICES_VIEW_CHILDREN: 'invoices.view_children',
  INVOICES_VIEW_SELF: 'invoices.view_self',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_UPDATE_ALL: 'invoices.update_all',
  INVOICES_UPDATE_CHILDREN: 'invoices.update_children',
  INVOICES_UPDATE_SELF: 'invoices.update_self',
  INVOICES_DELETE_ALL: 'invoices.delete_all',
  INVOICES_DELETE_CHILDREN: 'invoices.delete_children',
  INVOICES_DELETE_SELF: 'invoices.delete_self',
  INVOICES_PRINT: 'invoices.print',

  // ==================== Installment Plans ====================
  INSTALLMENT_PLANS_PAGE: 'installment_plans.page',
  INSTALLMENT_PLANS_VIEW_ALL: 'installment_plans.view_all',
  INSTALLMENT_PLANS_VIEW_CHILDREN: 'installment_plans.view_children',
  INSTALLMENT_PLANS_VIEW_SELF: 'installment_plans.view_self',
  INSTALLMENT_PLANS_CREATE: 'installment_plans.create',
  INSTALLMENT_PLANS_UPDATE_ALL: 'installment_plans.update_all',
  INSTALLMENT_PLANS_UPDATE_CHILDREN: 'installment_plans.update_children',
  INSTALLMENT_PLANS_UPDATE_SELF: 'installment_plans.update_self',
  INSTALLMENT_PLANS_DELETE_ALL: 'installment_plans.delete_all',
  INSTALLMENT_PLANS_DELETE_CHILDREN: 'installment_plans.delete_children',
  INSTALLMENT_PLANS_DELETE_SELF: 'installment_plans.delete_self',

  // ==================== Installments ====================
  INSTALLMENTS_PAGE: 'installments.page',
  INSTALLMENTS_VIEW_ALL: 'installments.view_all',
  INSTALLMENTS_VIEW_CHILDREN: 'installments.view_children',
  INSTALLMENTS_VIEW_SELF: 'installments.view_self',
  INSTALLMENTS_CREATE: 'installments.create',
  INSTALLMENTS_UPDATE_ALL: 'installments.update_all',
  INSTALLMENTS_UPDATE_CHILDREN: 'installments.update_children',
  INSTALLMENTS_UPDATE_SELF: 'installments.update_self',
  INSTALLMENTS_DELETE_ALL: 'installments.delete_all',
  INSTALLMENTS_DELETE_CHILDREN: 'installments.delete_children',
  INSTALLMENTS_DELETE_SELF: 'installments.delete_self',

  // ==================== Installment Payments ====================
  INSTALLMENT_PAYMENTS_PAGE: 'installment_payments.page',
  INSTALLMENT_PAYMENTS_VIEW_ALL: 'installment_payments.view_all',
  INSTALLMENT_PAYMENTS_VIEW_CHILDREN: 'installment_payments.view_children',
  INSTALLMENT_PAYMENTS_VIEW_SELF: 'installment_payments.view_self',
  INSTALLMENT_PAYMENTS_CREATE: 'installment_payments.create',
  INSTALLMENT_PAYMENTS_UPDATE_ALL: 'installment_payments.update_all',
  INSTALLMENT_PAYMENTS_UPDATE_CHILDREN: 'installment_payments.update_children',
  INSTALLMENT_PAYMENTS_UPDATE_SELF: 'installment_payments.update_self',
  INSTALLMENT_PAYMENTS_DELETE_ALL: 'installment_payments.delete_all',
  INSTALLMENT_PAYMENTS_DELETE_CHILDREN: 'installment_payments.delete_children',
  INSTALLMENT_PAYMENTS_DELETE_SELF: 'installment_payments.delete_self',

  // ==================== Invoice Items ====================
  INVOICE_ITEMS_PAGE: 'invoice_items.page',
  INVOICE_ITEMS_VIEW_ALL: 'invoice_items.view_all',
  INVOICE_ITEMS_VIEW_CHILDREN: 'invoice_items.view_children',
  INVOICE_ITEMS_VIEW_SELF: 'invoice_items.view_self',
  INVOICE_ITEMS_CREATE: 'invoice_items.create',
  INVOICE_ITEMS_UPDATE_ALL: 'invoice_items.update_all',
  INVOICE_ITEMS_UPDATE_CHILDREN: 'invoice_items.update_children',
  INVOICE_ITEMS_UPDATE_SELF: 'invoice_items.update_self',
  INVOICE_ITEMS_DELETE_ALL: 'invoice_items.delete_all',
  INVOICE_ITEMS_DELETE_CHILDREN: 'invoice_items.delete_children',
  INVOICE_ITEMS_DELETE_SELF: 'invoice_items.delete_self',

  // ==================== Payments ====================
  PAYMENTS_PAGE: 'payments.page',
  PAYMENTS_VIEW_ALL: 'payments.view_all',
  PAYMENTS_VIEW_CHILDREN: 'payments.view_children',
  PAYMENTS_VIEW_SELF: 'payments.view_self',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_UPDATE_ALL: 'payments.update_all',
  PAYMENTS_UPDATE_CHILDREN: 'payments.update_children',
  PAYMENTS_UPDATE_SELF: 'payments.update_self',
  PAYMENTS_DELETE_ALL: 'payments.delete_all',
  PAYMENTS_DELETE_CHILDREN: 'payments.delete_children',
  PAYMENTS_DELETE_SELF: 'payments.delete_self',

  // ==================== Payment Methods ====================
  PAYMENT_METHODS_PAGE: 'payment_methods.page',
  PAYMENT_METHODS_VIEW_ALL: 'payment_methods.view_all',
  PAYMENT_METHODS_VIEW_CHILDREN: 'payment_methods.view_children',
  PAYMENT_METHODS_VIEW_SELF: 'payment_methods.view_self',
  PAYMENT_METHODS_CREATE: 'payment_methods.create',
  PAYMENT_METHODS_UPDATE_ALL: 'payment_methods.update_all',
  PAYMENT_METHODS_UPDATE_CHILDREN: 'payment_methods.update_children',
  PAYMENT_METHODS_UPDATE_SELF: 'payment_methods.update_self',
  PAYMENT_METHODS_DELETE_ALL: 'payment_methods.delete_all',
  PAYMENT_METHODS_DELETE_CHILDREN: 'payment_methods.delete_children',
  PAYMENT_METHODS_DELETE_SELF: 'payment_methods.delete_self',

  // ==================== Revenues ====================
  REVENUES_PAGE: 'revenues.page',
  REVENUES_VIEW_ALL: 'revenues.view_all',
  REVENUES_VIEW_CHILDREN: 'revenues.view_children',
  REVENUES_VIEW_SELF: 'revenues.view_self',
  REVENUES_CREATE: 'revenues.create',
  REVENUES_UPDATE_ALL: 'revenues.update_all',
  REVENUES_UPDATE_CHILDREN: 'revenues.update_children',
  REVENUES_UPDATE_SELF: 'revenues.update_self',
  REVENUES_DELETE_ALL: 'revenues.delete_all',
  REVENUES_DELETE_CHILDREN: 'revenues.delete_children',
  REVENUES_DELETE_SELF: 'revenues.delete_self',

  // ==================== Profits ====================
  PROFITS_PAGE: 'profits.page',
  PROFITS_VIEW_ALL: 'profits.view_all',
  PROFITS_VIEW_CHILDREN: 'profits.view_children',
  PROFITS_VIEW_SELF: 'profits.view_self',
  PROFITS_CREATE: 'profits.create',
  PROFITS_UPDATE_ALL: 'profits.update_all',
  PROFITS_UPDATE_CHILDREN: 'profits.update_children',
  PROFITS_UPDATE_SELF: 'profits.update_self',
  PROFITS_DELETE_ALL: 'profits.delete_all',
  PROFITS_DELETE_CHILDREN: 'profits.delete_children',
  PROFITS_DELETE_SELF: 'profits.delete_self',

  // ==================== Services ====================
  SERVICES_PAGE: 'services.page',
  SERVICES_VIEW_ALL: 'services.view_all',
  SERVICES_VIEW_CHILDREN: 'services.view_children',
  SERVICES_VIEW_SELF: 'services.view_self',
  SERVICES_CREATE: 'services.create',
  SERVICES_UPDATE_ALL: 'services.update_all',
  SERVICES_UPDATE_CHILDREN: 'services.update_children',
  SERVICES_UPDATE_SELF: 'services.update_self',
  SERVICES_DELETE_ALL: 'services.delete_all',
  SERVICES_DELETE_CHILDREN: 'services.delete_children',
  SERVICES_DELETE_SELF: 'services.delete_self',

  // ==================== Subscriptions ====================
  SUBSCRIPTIONS_PAGE: 'subscriptions.page',
  SUBSCRIPTIONS_VIEW_ALL: 'subscriptions.view_all',
  SUBSCRIPTIONS_VIEW_CHILDREN: 'subscriptions.view_children',
  SUBSCRIPTIONS_VIEW_SELF: 'subscriptions.view_self',
  SUBSCRIPTIONS_CREATE: 'subscriptions.create',
  SUBSCRIPTIONS_UPDATE_ALL: 'subscriptions.update_all',
  SUBSCRIPTIONS_UPDATE_CHILDREN: 'subscriptions.update_children',
  SUBSCRIPTIONS_UPDATE_SELF: 'subscriptions.update_self',
  SUBSCRIPTIONS_DELETE_ALL: 'subscriptions.delete_all',
  SUBSCRIPTIONS_DELETE_CHILDREN: 'subscriptions.delete_children',
  SUBSCRIPTIONS_DELETE_SELF: 'subscriptions.delete_self',

  // ==================== Expenses ====================
  EXPENSES_PAGE: 'expenses.page',
  EXPENSES_VIEW_ALL: 'expenses.view_all',
  EXPENSES_VIEW_CHILDREN: 'expenses.view_children',
  EXPENSES_VIEW_SELF: 'expenses.view_self',
  EXPENSES_CREATE: 'expenses.create',
  EXPENSES_UPDATE_ALL: 'expenses.update_all',
  EXPENSES_UPDATE_CHILDREN: 'expenses.update_children',
  EXPENSES_UPDATE_SELF: 'expenses.update_self',
  EXPENSES_DELETE_ALL: 'expenses.delete_all',
  EXPENSES_DELETE_CHILDREN: 'expenses.delete_children',
  EXPENSES_DELETE_SELF: 'expenses.delete_self',

  // ==================== Expense Categories ====================
  EXPENSE_CATEGORIES_PAGE: 'expense_categories.page',
  EXPENSE_CATEGORIES_VIEW_ALL: 'expense_categories.view_all',
  EXPENSE_CATEGORIES_VIEW_CHILDREN: 'expense_categories.view_children',
  EXPENSE_CATEGORIES_VIEW_SELF: 'expense_categories.view_self',
  EXPENSE_CATEGORIES_CREATE: 'expense_categories.create',
  EXPENSE_CATEGORIES_UPDATE_ALL: 'expense_categories.update_all',
  EXPENSE_CATEGORIES_UPDATE_CHILDREN: 'expense_categories.update_children',
  EXPENSE_CATEGORIES_UPDATE_SELF: 'expense_categories.update_self',
  EXPENSE_CATEGORIES_DELETE_ALL: 'expense_categories.delete_all',
  EXPENSE_CATEGORIES_DELETE_CHILDREN: 'expense_categories.delete_children',
  EXPENSE_CATEGORIES_DELETE_SELF: 'expense_categories.delete_self',

  // ==================== Financial Ledger ====================
  FINANCIAL_LEDGER_PAGE: 'financial_ledger.page',
  FINANCIAL_LEDGER_VIEW_ALL: 'financial_ledger.view_all',
  FINANCIAL_LEDGER_VIEW_CHILDREN: 'financial_ledger.view_children',
  FINANCIAL_LEDGER_VIEW_SELF: 'financial_ledger.view_self',
  FINANCIAL_LEDGER_CREATE: 'financial_ledger.create',
  FINANCIAL_LEDGER_UPDATE_ALL: 'financial_ledger.update_all',
  FINANCIAL_LEDGER_UPDATE_CHILDREN: 'financial_ledger.update_children',
  FINANCIAL_LEDGER_UPDATE_SELF: 'financial_ledger.update_self',
  FINANCIAL_LEDGER_DELETE_ALL: 'financial_ledger.delete_all',
  FINANCIAL_LEDGER_DELETE_CHILDREN: 'financial_ledger.delete_children',
  FINANCIAL_LEDGER_DELETE_SELF: 'financial_ledger.delete_self',
  FINANCIAL_LEDGER_EXPORT: 'financial_ledger.export',

  // ==================== Reports ====================
  REPORTS_PAGE: 'reports.page',
  REPORTS_VIEW_ALL: 'reports.view_all',
  REPORTS_VIEW_CHILDREN: 'reports.view_children',
  REPORTS_VIEW_SELF: 'reports.view_self',
  REPORTS_SALES: 'reports.sales',
  REPORTS_STOCK: 'reports.stock',
  REPORTS_PROFIT: 'reports.profit',
  REPORTS_EXPENSES: 'reports.expenses',
  REPORTS_CASH_FLOW: 'reports.cash_flow',
  REPORTS_TAX: 'reports.tax',
  REPORTS_EXPORT: 'reports.export',

  // ==================== Invoice Types ====================
  INVOICE_TYPES_PAGE: 'invoice_types.page',
  INVOICE_TYPES_VIEW_ALL: 'invoice_types.view_all',
  INVOICE_TYPES_VIEW_CHILDREN: 'invoice_types.view_children',
  INVOICE_TYPES_VIEW_SELF: 'invoice_types.view_self',
  INVOICE_TYPES_UPDATE_ALL: 'invoice_types.update_all',

  // ==================== Plans ====================
  PLANS_PAGE: 'plans.page',
  PLANS_VIEW_ALL: 'plans.view_all',
  PLANS_VIEW_CHILDREN: 'plans.view_children',
  PLANS_VIEW_SELF: 'plans.view_self',
  PLANS_CREATE: 'plans.create',
  PLANS_UPDATE_ALL: 'plans.update_all',
  PLANS_UPDATE_CHILDREN: 'plans.update_children',
  PLANS_UPDATE_SELF: 'plans.update_self',
  PLANS_DELETE_ALL: 'plans.delete_all',
  PLANS_DELETE_CHILDREN: 'plans.delete_children',
  PLANS_DELETE_SELF: 'plans.delete_self',

  // ==================== Tasks ====================
  TASKS_PAGE: 'tasks.page',
  TASKS_VIEW_ALL: 'tasks.view_all',
  TASKS_VIEW_CHILDREN: 'tasks.view_children',
  TASKS_VIEW_SELF: 'tasks.view_self',
  TASKS_CREATE: 'tasks.create',
  TASKS_UPDATE_ALL: 'tasks.update_all',
  TASKS_DELETE_ALL: 'tasks.delete_all',

  // ==================== Error Reports ====================
  ERROR_REPORTS_PAGE: 'error_reports.page',
  ERROR_REPORTS_VIEW_ALL: 'error_reports.view_all',
  ERROR_REPORTS_UPDATE_ALL: 'error_reports.update_all',

  // ==================== Backups ====================
  BACKUPS_PAGE: 'backups.page',
  BACKUPS_CREATE: 'backups.create',
  BACKUPS_VIEW_ALL: 'backups.view_all',

  // ==================== Quotations ====================
  QUOTATIONS_PAGE: 'quotations.page',
  QUOTATIONS_VIEW_ALL: 'quotations.view_all',
  QUOTATIONS_CREATE: 'quotations.create',

  // ==================== Orders ====================
  ORDERS_PAGE: 'orders.page',
  ORDERS_VIEW_ALL: 'orders.view_all',
  ORDERS_CREATE: 'orders.create',
};

/**
 * HWNiX Bill Permission System
 * مجموعات الصلاحيات للتحقق السريع
 */
export const PERMISSION_GROUPS = {
  // Is Super Admin
  IS_SUPER_ADMIN: [PERMISSIONS.ADMIN_SUPER],

  // Can manage company
  CAN_MANAGE_COMPANY: [PERMISSIONS.ADMIN_COMPANY],

  // Can manage invoices
  CAN_MANAGE_INVOICES: [PERMISSIONS.INVOICES_CREATE, PERMISSIONS.INVOICES_UPDATE_ALL, PERMISSIONS.INVOICES_DELETE_ALL],

  // Can manage products
  CAN_MANAGE_PRODUCTS: [PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_UPDATE_ALL, PERMISSIONS.PRODUCTS_DELETE_ALL],

  // Can manage users
  CAN_MANAGE_USERS: [PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_UPDATE_ALL, PERMISSIONS.USERS_DELETE_ALL],
};

/**
 * Helper: Check if permission key is valid
 */
export function isValidPermission(permission) {
  return Object.values(PERMISSIONS).includes(permission);
}

/**
 * Helper: Get permission by module and action
 */
export function getPermission(module, action) {
  const key = `${module.toUpperCase()}_${action.toUpperCase()}`;
  return PERMISSIONS[key] || null;
}
