import { PERMISSIONS } from './permissions';

export default [
  // ==================== 1. Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© ÙˆØ§Ù„Ø¥Ø¯Ø§Ø±Ø© (Workspace) ====================
  {
    title: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…',
    icon: 'ri-dashboard-line',
    to: '/app/admin/dashboard',
    permission: null,
  },
  {
    title: 'Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹',
    icon: 'ri-list-settings-line',
    permission: PERMISSIONS.ADMIN_SUPER,
    children: [
      {
        title: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù‡Ø§Ù…',
        to: '/app/tasks',
        icon: 'ri-task-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
      {
        title: 'Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„Ø¹Ù…Ù„',
        to: '/app/task-groups',
        icon: 'ri-team-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
      {
        title: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±',
        to: '/app/testing-checklist',
        icon: 'ri-list-check-3',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
    ],
  },
  {
    title: 'Ø³Ø¬Ù„ Ø§Ù„Ø£Ù†Ø´Ø·Ø©',
    icon: 'ri-history-line',
    to: '/app/activity-logs',
    permission: [PERMISSIONS.ACTIVITY_LOGS_VIEW_ALL, PERMISSIONS.ACTIVITY_LOGS_VIEW_CHILDREN, PERMISSIONS.ACTIVITY_LOGS_VIEW_SELF],
  },

  // ==================== 2. Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª ÙˆØ§Ù„Ø¹Ù…Ù„Ø§Ø¡ (Sales & CRM) ====================
  {
    title: 'Ø§Ù„ÙÙˆØ§ØªÙŠØ± ÙˆØ§Ù„Ø¨ÙŠØ¹',
    icon: 'ri-file-list-3-line',
    permission: PERMISSIONS.INVOICES_PAGE,
    children: [
      {
        title: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ÙÙˆØ§ØªÙŠØ±',
        to: '/app/invoices',
        icon: 'ri-file-list-line',
        permission: [PERMISSIONS.INVOICES_VIEW_ALL, PERMISSIONS.INVOICES_VIEW_CHILDREN, PERMISSIONS.INVOICES_VIEW_SELF],
      },
      {
        title: 'ÙØ§ØªÙˆØ±Ø© Ø¨ÙŠØ¹',
        to: '/app/invoices/create?type=sale',
        icon: 'ri-file-add-line',
        permission: PERMISSIONS.INVOICES_CREATE,
      },
      {
        title: 'ÙØ§ØªÙˆØ±Ø© ØªÙ‚Ø³ÙŠØ·',
        to: '/app/invoices/create?type=installment_sale',
        icon: 'ri-calendar-todo-line',
        permission: PERMISSIONS.INVOICES_CREATE,
      },
      {
        title: 'ÙØ§ØªÙˆØ±Ø© Ø´Ø±Ø§Ø¡',
        to: '/app/invoices/create?type=purchase',
        icon: 'ri-shopping-cart-line',
        permission: PERMISSIONS.INVOICES_CREATE,
      },
    ],
  },
  {
    title: 'Ø§Ù„ØªÙ‚Ø³ÙŠØ· Ø§Ù„Ù…Ø§Ù„ÙŠ',
    icon: 'ri-calendar-schedule-line',
    permission: PERMISSIONS.PAYMENTS_PAGE,
    children: [
      {
        title: 'Ø®Ø·Ø· Ø§Ù„ØªÙ‚Ø³ÙŠØ·',
        to: '/app/installment-plans',
        icon: 'ri-calendar-check-line',
        permission: [PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL, PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN, PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF],
      },
      {
        title: 'Ø§Ù„Ø£Ù‚Ø³Ø§Ø· Ø§Ù„Ù…Ø¬Ø¯ÙˆÙ„Ø©',
        to: '/app/installments',
        icon: 'ri-list-ordered',
        permission: [PERMISSIONS.INSTALLMENT_PLANS_VIEW_ALL, PERMISSIONS.INSTALLMENT_PLANS_VIEW_CHILDREN, PERMISSIONS.INSTALLMENT_PLANS_VIEW_SELF],
      },
      {
        title: 'Ø¯ÙØ¹Ø§Øª Ø§Ù„Ø£Ù‚Ø³Ø§Ø·',
        to: '/app/installment-payments',
        icon: 'ri-money-dollar-box-line',
        permission: [
          PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_ALL,
          PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_CHILDREN,
          PERMISSIONS.INSTALLMENT_PAYMENTS_VIEW_SELF,
        ],
      },
    ],
  },
  {
    title: 'Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ ÙˆØ§Ù„Ø¬Ù…Ù‡ÙˆØ±',
    icon: 'ri-user-heart-line',
    to: '/app/customers',
    permission: [PERMISSIONS.USERS_VIEW_ALL],
  },

  // ==================== 3. Ø§Ù„Ù…Ø®Ø§Ø²Ù† ÙˆØ§Ù„Ù…Ù†ØªØ¬Ø§Øª (Catalog & Stock) ====================
  {
    title: 'Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª ÙˆØ§Ù„Ù…Ø®Ø§Ø²Ù†',
    icon: 'ri-shopping-bag-3-line',
    permission: PERMISSIONS.PRODUCTS_PAGE,
    children: [
      {
        title: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª',
        to: '/app/products',
        icon: 'ri-list-check',
        permission: [PERMISSIONS.PRODUCTS_VIEW_ALL, PERMISSIONS.PRODUCTS_VIEW_CHILDREN, PERMISSIONS.PRODUCTS_VIEW_SELF],
      },
      {
        title: 'Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª',
        to: '/app/product-variants',
        icon: 'ri-bubble-chart-line',
        permission: [PERMISSIONS.PRODUCT_VARIANTS_VIEW_ALL, PERMISSIONS.PRODUCT_VARIANTS_VIEW_CHILDREN, PERMISSIONS.PRODUCT_VARIANTS_VIEW_SELF],
      },
      {
        title: 'Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬ Ø¬Ø¯ÙŠØ¯',
        to: '/app/products/create',
        icon: 'ri-add-box-line',
        permission: PERMISSIONS.PRODUCTS_CREATE,
      },
      {
        title: 'Ø§Ù„Ø£Ù‚Ø³Ø§Ù… ÙˆØ§Ù„ÙØ¦Ø§Øª',
        to: '/app/categories',
        icon: 'ri-organization-chart',
        permission: [PERMISSIONS.CATEGORIES_VIEW_ALL, PERMISSIONS.CATEGORIES_VIEW_CHILDREN, PERMISSIONS.CATEGORIES_VIEW_SELF],
      },
      {
        title: 'Ø§Ù„Ø¹Ù„Ø§Ù…Ø§Øª Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©',
        to: '/app/brands',
        icon: 'ri-price-tag-3-line',
        permission: [PERMISSIONS.BRANDS_VIEW_ALL, PERMISSIONS.BRANDS_VIEW_CHILDREN, PERMISSIONS.BRANDS_VIEW_SELF],
      },
      {
        title: 'Ø®ØµØ§Ø¦Øµ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª',
        to: '/app/attributes',
        icon: 'ri-list-settings-line',
        permission: [PERMISSIONS.ATTRIBUTES_VIEW_ALL, PERMISSIONS.ATTRIBUTES_VIEW_CHILDREN, PERMISSIONS.ATTRIBUTES_VIEW_SELF],
      },
      {
        title: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªÙˆØ¯Ø¹Ø§Øª',
        to: '/app/warehouses',
        icon: 'ri-building-line',
        permission: [PERMISSIONS.WAREHOUSES_VIEW_ALL, PERMISSIONS.WAREHOUSES_VIEW_CHILDREN, PERMISSIONS.WAREHOUSES_VIEW_SELF],
      },
      {
        title: 'ÙˆØ­Ø¯Ø§Øª Ø§Ù„Ù‚ÙŠØ§Ø³',
        to: '/app/units',
        icon: 'ri-scales-3-line',
        permission: [PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
    ],
  },
  {
    title: 'Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆØ§Ù„Ø§Ø´ØªØ±Ø§ÙƒØ§Øª',
    icon: 'ri-customer-service-2-line',
    permission: PERMISSIONS.PRODUCTS_PAGE,
    children: [
      {
        title: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø®Ø¯Ù…Ø§Øª',
        to: '/app/services',
        icon: 'ri-settings-5-line',
        permission: [PERMISSIONS.PRODUCTS_VIEW_ALL],
      },
      {
        title: 'Ø§Ù„Ø§Ø´ØªØ±Ø§ÙƒØ§Øª Ø§Ù„Ø¬Ø§Ø±ÙŠØ©',
        to: '/app/subscriptions',
        icon: 'ri-repeat-2-line',
        permission: [PERMISSIONS.PRODUCTS_VIEW_ALL],
      },
    ],
  },

  // ==================== 4. Ø§Ù„Ø®Ø²ÙŠÙ†Ø© ÙˆØ§Ù„Ù…Ø§Ù„ÙŠØ© (Treasury & Finance) ====================
  {
    title: 'Ø§Ù„Ø®Ø²Ø§Ø¦Ù† ÙˆØ§Ù„Ù†Ù‚Ø¯ÙŠØ©',
    icon: 'ri-safe-line',
    permission: PERMISSIONS.CASH_BOXES_PAGE,
    children: [
      {
        title: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø®Ø²Ø§Ø¦Ù†',
        to: '/app/cashboxes',
        icon: 'ri-inbox-line',
        permission: [PERMISSIONS.CASH_BOXES_VIEW_ALL, PERMISSIONS.CASH_BOXES_VIEW_CHILDREN, PERMISSIONS.CASH_BOXES_VIEW_SELF],
      },
      {
        title: 'Ø§Ù„ØªØ­ÙˆÙŠÙ„Ø§Øª Ø§Ù„Ù†Ù‚Ø¯ÙŠØ©',
        to: '/app/transactions',
        icon: 'ri-exchange-line',
        permission: [PERMISSIONS.TRANSACTIONS_VIEW_ALL, PERMISSIONS.TRANSACTIONS_VIEW_CHILDREN, PERMISSIONS.TRANSACTIONS_VIEW_SELF],
      },
    ],
  },
  {
    title: 'Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª ÙˆØ§Ù„Ù…ØµØ§Ø±ÙŠÙ',
    icon: 'ri-money-dollar-circle-line',
    permission: PERMISSIONS.PAYMENTS_PAGE,
    children: [
      {
        title: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª',
        to: '/app/payments',
        icon: 'ri-list-check-2',
        permission: [PERMISSIONS.PAYMENTS_VIEW_ALL, PERMISSIONS.PAYMENTS_VIEW_CHILDREN, PERMISSIONS.PAYMENTS_VIEW_SELF],
      },
      {
        title: 'Ø¥Ø¶Ø§ÙØ© Ø¯ÙØ¹Ø©',
        to: '/app/payments/create',
        icon: 'ri-add-circle-line',
        permission: PERMISSIONS.PAYMENTS_CREATE,
      },
      {
        title: 'Ø§Ù„Ù…ØµØ§Ø±ÙŠÙ Ø§Ù„ØªØ´ØºÙŠÙ„ÙŠØ©',
        to: '/app/expenses',
        icon: 'ri-money-dollar-box-line',
        permission: [PERMISSIONS.EXPENSES_VIEW_ALL, PERMISSIONS.EXPENSES_VIEW_CHILDREN, PERMISSIONS.EXPENSES_VIEW_SELF],
      },
    ],
  },
  {
    title: 'Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª ÙˆØ§Ù„Ù…Ø§Ù„ÙŠØ©',
    icon: 'ri-bank-card-2-line',
    permission: [
      PERMISSIONS.TRANSACTIONS_VIEW_ALL,
      PERMISSIONS.FINANCIAL_LEDGER_VIEW_ALL,
      PERMISSIONS.FINANCIAL_LEDGER_VIEW_CHILDREN,
      PERMISSIONS.FINANCIAL_LEDGER_VIEW_SELF,
    ],
    children: [
      {
        title: 'Ø³Ø¬Ù„ Ø§Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª',
        to: '/app/financials',
        icon: 'ri-exchange-funds-line',
        permission: [PERMISSIONS.TRANSACTIONS_VIEW_ALL],
      },
      {
        title: 'Ø¯ÙØªØ± Ø§Ù„Ø£Ø³ØªØ§Ø°',
        to: '/app/financial-ledger',
        icon: 'ri-book-open-line',
        permission: [PERMISSIONS.FINANCIAL_LEDGER_VIEW_ALL, PERMISSIONS.FINANCIAL_LEDGER_VIEW_CHILDREN, PERMISSIONS.FINANCIAL_LEDGER_VIEW_SELF],
      },
      {
        title: 'Ø£Ù…ÙˆØ§Ù„ Ø§Ù„Ø´Ø±ÙƒØ§Ø¡',
        to: '/app/owner-funds',
        icon: 'ri-pie-chart-box-line',
        permission: 'owner_fund_transactions.page',
      },
      {
        title: 'Ø§Ù„Ø¹Ù‡Ø¯',
        to: '/app/custodies',
        icon: 'ri-wallet-3-line',
        permission: [PERMISSIONS.CUSTODIES_VIEW_ALL, PERMISSIONS.CUSTODIES_VIEW_SELF],
      },
    ],
  },

  // ==================== 5. Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± ÙˆØ§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª (Reports & Analytics) ====================
  {
    title: 'Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± ÙˆØ§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª',
    icon: 'ri-line-chart-line',
    permission: PERMISSIONS.REPORTS_PAGE,
    children: [
      {
        title: 'ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª',
        to: '/app/reports/sales',
        icon: 'ri-bar-chart-box-line',
        permission: PERMISSIONS.REPORTS_SALES,
      },
      {
        title: 'ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø®Ø²ÙˆÙ†',
        to: '/app/reports/stock',
        icon: 'ri-database-2-line',
        permission: PERMISSIONS.REPORTS_STOCK,
      },
      {
        title: 'ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ø£Ø±Ø¨Ø§Ø­ ÙˆØ§Ù„Ø®Ø³Ø§Ø¦Ø±',
        to: '/app/reports/profit',
        icon: 'ri-funds-line',
        permission: PERMISSIONS.REPORTS_PROFIT,
      },
      {
        title: 'ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªØ¯ÙÙ‚ Ø§Ù„Ù†Ù‚Ø¯ÙŠ',
        to: '/app/reports/cash-flow',
        icon: 'ri-exchange-funds-line',
        permission: PERMISSIONS.REPORTS_CASH_FLOW,
      },
      {
        title: 'ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ø¶Ø±Ø§Ø¦Ø¨',
        to: '/app/reports/tax',
        icon: 'ri-percent-line',
        permission: PERMISSIONS.REPORTS_TAX,
      },
    ],
  },

  // ==================== 6. Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© ÙˆØ§Ù„ÙˆØµÙˆÙ„ (HR & Permissions) ====================
  {
    title: 'Ø§Ù„Ù…ÙˆØ¸ÙÙˆÙ† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª',
    icon: 'ri-user-line',
    permission: PERMISSIONS.USERS_PAGE,
    children: [
      {
        title: 'Ø§Ù„Ù…ÙˆØ¸ÙÙˆÙ†',
        to: '/app/users',
        icon: 'ri-group-line',
        permission: [PERMISSIONS.USERS_VIEW_ALL, PERMISSIONS.USERS_VIEW_CHILDREN, PERMISSIONS.USERS_VIEW_SELF],
      },
      {
        title: 'Ø§Ù„Ø£Ø¯ÙˆØ§Ø± ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª',
        to: '/app/roles',
        icon: 'ri-shield-user-line',
        permission: [PERMISSIONS.ROLES_VIEW_ALL, PERMISSIONS.ROLES_VIEW_CHILDREN, PERMISSIONS.ROLES_VIEW_SELF],
      },
    ],
  },

  // ==================== 7. ÙƒØ§Ø´ Ù‡ÙˆÙ†ÙƒØ³ (HwnixCash) ====================
  {
    title: 'ÙƒØ§Ø´ Ù‡ÙˆÙ†ÙƒØ³',
    icon: 'ri-smartphone-line',
    permission: [
      PERMISSIONS.HWNIX_CASH_VIEW_ALL,
      PERMISSIONS.HWNIX_CASH_VIEW_SELF,
      PERMISSIONS.HWNIX_CASH_MESSAGES_VIEW_ALL,
      PERMISSIONS.HWNIX_CASH_WALLET_TRANSACTIONS_VIEW_ALL,
      PERMISSIONS.HWNIX_CASH_MESSAGE_SOURCES_VIEW_ALL,
    ],
    children: [
      {
        title: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…',
        to: '/app/hwnix-cash/dashboard',
        icon: 'ri-dashboard-line',
        permission: [PERMISSIONS.HWNIX_CASH_VIEW_ALL, PERMISSIONS.HWNIX_CASH_VIEW_SELF],
      },
      {
        title: 'Ø§Ù„Ø®Ø·ÙˆØ· ÙˆØ§Ù„Ø£Ø¬Ù‡Ø²Ø©',
        to: '/app/hwnix-cash/lines',
        icon: 'ri-sim-card-line',
        permission: [PERMISSIONS.HWNIX_CASH_VIEW_ALL, PERMISSIONS.HWNIX_CASH_VIEW_SELF],
      },
      {
        title: 'Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ù…Ø­Ø§ÙØ¸',
        to: '/app/hwnix-cash/financial-accounts',
        icon: 'ri-wallet-3-line',
        permission: [PERMISSIONS.HWNIX_CASH_VIEW_ALL, PERMISSIONS.HWNIX_CASH_VIEW_SELF],
      },
      {
        title: 'Ø³Ø¬Ù„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„',
        to: '/app/hwnix-cash/messages',
        icon: 'ri-message-3-line',
        permission: [PERMISSIONS.HWNIX_CASH_MESSAGES_VIEW_ALL, PERMISSIONS.HWNIX_CASH_MESSAGES_VIEW_SELF],
      },
      {
        title: 'Ù…Ø¹Ø§Ù…Ù„Ø§Øª Ø§Ù„Ù…Ø­Ø§ÙØ¸',
        to: '/app/hwnix-cash/wallet-transactions',
        icon: 'ri-exchange-dollar-line',
        permission: [PERMISSIONS.HWNIX_CASH_WALLET_TRANSACTIONS_VIEW_ALL, PERMISSIONS.HWNIX_CASH_WALLET_TRANSACTIONS_VIEW_SELF],
      },
    ],
  },

  // ==================== 8. Ø§Ù„ØªÙƒØ§Ù…Ù„Ø§Øª ÙˆØ§Ù„Ø±Ø¨Ø· (Integrations & Connections) ====================
  {
    title: 'Ø§Ù„ØªÙƒØ§Ù…Ù„Ø§Øª ÙˆØ§Ù„Ø±Ø¨Ø·',
    icon: 'ri-link-m',
    permission: PERMISSIONS.ADMIN_COMPANY,
    children: [
      {
        title: 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¨Ø±ÙŠØ¯',
        to: '/app/mail',
        icon: 'ri-mail-settings-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨',
        to: '/app/whatsapp',
        icon: 'ri-whatsapp-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'Ù‚ÙˆØ§Ù„Ø¨ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ ÙˆØ§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª',
        to: '/app/notification-templates',
        icon: 'ri-file-text-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'Ø£ØªÙ…ØªØ© ÙˆØ¬Ø¯ÙˆÙ„Ø© Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª',
        to: '/app/notification-workflows',
        icon: 'ri-settings-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ',
        to: '/app/payment-gateways',
        icon: 'ri-bank-card-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
    ],
  },

  // ==================== 8. ØªÙ‡ÙŠØ¦Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª ÙˆØ§Ù„ØªØ´ØºÙŠÙ„ (Configuration) ====================
  {
    title: 'ØªÙ‡ÙŠØ¦Ø© Ø§Ù„ØªØ´ØºÙŠÙ„',
    icon: 'ri-settings-5-line',
    permission: PERMISSIONS.ADMIN_COMPANY,
    children: [
      {
        title: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙØ±ÙˆØ¹',
        to: '/app/branches',
        icon: 'ri-git-branch-line',
        permission: [PERMISSIONS.BRANCHES_VIEW_ALL],
      },
      {
        title: 'Ø·Ø±Ù‚ Ø§Ù„Ø¯ÙØ¹',
        to: '/app/payment-methods',
        icon: 'ri-bank-card-line',
        permission: [PERMISSIONS.PAYMENT_METHODS_VIEW_ALL, PERMISSIONS.PAYMENT_METHODS_VIEW_CHILDREN, PERMISSIONS.PAYMENT_METHODS_VIEW_SELF],
      },
      {
        title: 'Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„ÙÙˆØ§ØªÙŠØ±',
        to: '/app/invoice-types',
        icon: 'ri-file-copy-line',
        permission: [PERMISSIONS.INVOICE_TYPES_VIEW_ALL, PERMISSIONS.INVOICE_TYPES_VIEW_CHILDREN, PERMISSIONS.INVOICE_TYPES_VIEW_SELF],
      },
      {
        title: 'Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ø®Ø²Ø§Ø¦Ù†',
        to: '/app/cashbox-types',
        icon: 'ri-safe-2-line',
        permission: [PERMISSIONS.CASH_BOX_TYPES_VIEW_ALL, PERMISSIONS.CASH_BOX_TYPES_VIEW_CHILDREN, PERMISSIONS.CASH_BOX_TYPES_VIEW_SELF],
      },
    ],
  },

  // ==================== 9. Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆØ§Ù„Ø­Ø³Ø§Ø¨ (System Settings) ====================
  {
    title: 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…',
    icon: 'ri-settings-3-line',
    permission: PERMISSIONS.ADMIN_COMPANY,
    children: [
      {
        title: 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ø±ÙƒØ©',
        to: '/app/company',
        icon: 'ri-building-2-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'Ø§Ø´ØªØ±Ø§ÙƒÙŠ Ø§Ù„Ø­Ø§Ù„ÙŠ',
        to: '/app/my-subscription',
        icon: 'ri-vip-crown-2-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.ADMIN_COMPANY],
      },
      {
        title: 'Ø§Ù„Ù…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©',
        to: '/app/admin/legal-documents',
        icon: 'ri-file-shield-2-line',
        permission: [PERMISSIONS.LEGAL_DOCUMENTS_VIEW_ALL, PERMISSIONS.ADMIN_SUPER],
      },
      {
        title: 'Ø³Ø¬Ù„ÙŠ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ',
        to: '/app/legal-history',
        icon: 'ri-history-line',
        permission: null,
      },
      {
        title: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ø¬Ù‡Ø²Ø©',
        to: '/app/sessions',
        icon: 'ri-device-line',
        permission: null,
      },
    ],
  },

  // ==================== 10. Ø¥Ø¯Ø§Ø±Ø© Ù…Ù†ØµØ© Ø§Ù„Ø³Ø§Ø³ (SaaS Admin Control) ====================
  {
    title: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø³Ø§Ø³',
    icon: 'ri-vip-crown-line',
    permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.COMPANIES_VIEW_ALL, PERMISSIONS.SUBSCRIPTIONS_VIEW_ALL, PERMISSIONS.PLANS_VIEW_ALL],
    children: [
      {
        title: 'Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø´Ø±ÙƒØ§Øª',
        to: '/app/companies',
        icon: 'ri-building-4-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.COMPANIES_VIEW_ALL, PERMISSIONS.COMPANIES_VIEW_CHILDREN, PERMISSIONS.COMPANIES_VIEW_SELF],
      },
      {
        title: 'Ø¥Ø¶Ø§ÙØ© Ø´Ø±ÙƒØ© Ø¬Ø¯ÙŠØ¯Ø©',
        to: '/app/companies?action=create',
        icon: 'ri-add-box-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.COMPANIES_CREATE],
      },
      {
        title: 'Ø¨Ø§Ù‚Ø§Øª SaaS',
        to: '/app/saas-plans',
        icon: 'ri-vip-crown-line',
        permission: [PERMISSIONS.ADMIN_SUPER, PERMISSIONS.SUBSCRIPTIONS_VIEW_ALL, PERMISSIONS.PLANS_VIEW_ALL],
      },
      {
        title: 'Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠ',
        to: '/app/backups',
        icon: 'ri-database-2-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
      {
        title: 'ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ø£Ø¹Ø·Ø§Ù„',
        to: '/app/error-reports',
        icon: 'ri-bug-line',
        permission: PERMISSIONS.ADMIN_SUPER,
      },
    ],
  },

  // ==================== 11. Ù…Ù†ØµØ© Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ (AI Platform) ====================
  {
    title: 'Ù…Ù†ØµØ© Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
    icon: 'ri-sparkling-2-line',
    permission: [PERMISSIONS.ADMIN_SUPER],
    children: [
      {
        title: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…',
        to: '/ai-platform',
        icon: 'ri-dashboard-line',
        permission: null,
      },
      {
        title: 'Ø§Ù„ÙˆÙƒÙ„Ø§Ø¡ Ø§Ù„Ø°ÙƒÙŠÙˆÙ†',
        to: '/ai-platform/agents',
        icon: 'ri-user-star-line',
        permission: null,
      },
      {
        title: 'Ù‚ÙˆØ§Ù„Ø¨ Prompts',
        to: '/ai-platform/prompts',
        icon: 'ri-terminal-box-line',
        permission: null,
      },
      {
        title: 'ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ',
        to: '/ai-platform/usage',
        icon: 'ri-money-dollar-circle-line',
        permission: null,
      },
      {
        title: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù†Ù…Ø§Ø°Ø¬',
        to: '/ai-platform/models',
        icon: 'ri-robot-line',
        permission: null,
      },
      {
        title: 'Ù…ÙØ§ØªÙŠØ­ ÙˆØ­Ø³Ø§Ø¨Ø§Øª API',
        to: '/ai-platform/accounts',
        icon: 'ri-key-2-line',
        permission: null,
      },
    ],
  },
];

export const CUSTOMER_MENU = [
  {
    title: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…',
    icon: 'ri-dashboard-3-line',
    to: '/app/portal',
  },
  {
    title: 'Ù…Ø´ØªØ±ÙŠØ§ØªÙŠ',
    icon: 'ri-bill-line',
    to: '/app/purchases',
  },
  {
    title: 'Ø®Ø·Ø· Ø§Ù„ØªÙ‚Ø³ÙŠØ·',
    icon: 'ri-calendar-todo-line',
    to: '/app/customer-installments',
    requiresInstallments: true,
  },
  {
    title: 'Ù…Ø¯ÙÙˆØ¹Ø§ØªÙŠ',
    icon: 'ri-money-dollar-circle-line',
    to: '/app/customer-payments',
  },
  {
    title: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ø¬Ù‡Ø²Ø©',
    icon: 'ri-device-line',
    to: '/app/sessions',
  },
  {
    title: 'Ø³Ø¬Ù„ Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©',
    icon: 'ri-file-shield-2-line',
    to: '/app/legal-history',
  },
];
