import { PERMISSIONS } from '@/config/permissions';

export default [
  {
    path: 'sms-gateway/devices',
    name: 'sms-devices',
    component: () => import('@/modules/sms-gateway/pages/DeviceList.vue'),
    meta: {
      title: 'أجهزة البوابات (SMS Gateways)',
      permission: [PERMISSIONS.SMS_GATEWAY_VIEW_ALL, PERMISSIONS.SMS_GATEWAY_VIEW_SELF],
    },
  },
  {
    path: 'sms-gateway/lines',
    name: 'sms-lines',
    component: () => import('@/modules/sms-gateway/pages/LineList.vue'),
    meta: {
      title: 'خطوط الاتصال والشرائح',
      permission: [PERMISSIONS.SMS_GATEWAY_VIEW_ALL, PERMISSIONS.SMS_GATEWAY_VIEW_SELF],
    },
  },
  {
    path: 'sms-gateway/messages',
    name: 'sms-messages',
    component: () => import('@/modules/sms-gateway/pages/MessageList.vue'),
    meta: {
      title: 'سجل الرسائل SMS',
      permission: [PERMISSIONS.SMS_MESSAGES_VIEW_ALL, PERMISSIONS.SMS_MESSAGES_VIEW_SELF],
    },
  },
];
