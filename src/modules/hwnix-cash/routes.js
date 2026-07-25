import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'hwnix-cash/lines',
    name: 'hwnix-cash-lines',
    component: () => import('@/modules/hwnix-cash/pages/HwnixCashLineList.vue'),
    meta: {
      title: 'خطوط كاش هونكس',
      permission: [
        PERMISSIONS.HWNIX_CASH_VIEW_ALL,
        PERMISSIONS.HWNIX_CASH_VIEW_SELF,
      ],
      breadcrumbs: [
        { title: 'كاش هونكس', disabled: true },
        { title: 'الخطوط', disabled: true },
      ],
    },
  },
  {
    path: 'hwnix-cash/messages',
    name: 'hwnix-cash-messages',
    component: () => import('@/modules/hwnix-cash/pages/HwnixCashMessageList.vue'),
    meta: {
      title: 'رسائل كاش هونكس',
      permission: [
        PERMISSIONS.HWNIX_CASH_MESSAGES_VIEW_ALL,
        PERMISSIONS.HWNIX_CASH_MESSAGES_VIEW_SELF,
      ],
      breadcrumbs: [
        { title: 'كاش هونكس', disabled: true },
        { title: 'سجل الرسائل', disabled: true },
      ],
    },
  },
  {
    path: 'hwnix-cash/wallet-transactions',
    name: 'hwnix-cash-wallet-transactions',
    component: () => import('@/modules/hwnix-cash/pages/HwnixCashWalletTransactionList.vue'),
    meta: {
      title: 'معاملات المحافظ',
      permission: [
        PERMISSIONS.HWNIX_CASH_WALLET_TRANSACTIONS_VIEW_ALL,
        PERMISSIONS.HWNIX_CASH_WALLET_TRANSACTIONS_VIEW_SELF,
      ],
      breadcrumbs: [
        { title: 'كاش هونكس', disabled: true },
        { title: 'معاملات المحافظ', disabled: true },
      ],
    },
  },
  {
    path: 'hwnix-cash/wallet-transactions/:id',
    name: 'hwnix-cash-wallet-transaction-view',
    component: () => import('@/modules/hwnix-cash/pages/HwnixCashWalletTransactionView.vue'),
    meta: {
      title: 'تفاصيل المعاملة',
      permission: [
        PERMISSIONS.HWNIX_CASH_WALLET_TRANSACTIONS_VIEW_ALL,
        PERMISSIONS.HWNIX_CASH_WALLET_TRANSACTIONS_VIEW_SELF,
      ],
      breadcrumbs: [
        { title: 'كاش هونكس', disabled: true },
        { title: 'معاملات المحافظ', to: '/app/hwnix-cash/wallet-transactions' },
        { title: 'تفاصيل المعاملة', disabled: true },
      ],
    },
  },
  {
    path: 'hwnix-cash/message-sources',
    name: 'hwnix-cash-message-sources',
    component: () => import('@/modules/hwnix-cash/pages/HwnixCashMessageSourceList.vue'),
    meta: {
      title: 'مصادر الرسائل',
      permission: [
        PERMISSIONS.HWNIX_CASH_MESSAGE_SOURCES_VIEW_ALL,
      ],
      breadcrumbs: [
        { title: 'كاش هونكس', disabled: true },
        { title: 'مصادر الرسائل', disabled: true },
      ],
    },
  },
];
