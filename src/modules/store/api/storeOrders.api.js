import apiClient from '@/modules/store/api/storeClient'
import { orderHeaders } from '../utils/checkoutSession'
const BASE = '/store'
export const storeOrdersApi = {
  configuration: () => apiClient.get(BASE + '/public/checkout-config'),
  quote: data => apiClient.post(BASE + '/checkout/quote', data),
  getOrders: (params = {}) => apiClient.get(BASE + '/orders', { params }),
  getOrder: id => apiClient.get(BASE + '/orders/' + encodeURIComponent(id), { headers: orderHeaders(id) }),
  placeOrder: data => apiClient.post(BASE + '/orders', data),
  cancelOrder: id => apiClient.post(BASE + '/orders/' + encodeURIComponent(id) + '/cancel', {}, { headers: orderHeaders(id) }),
  pay: (id, gatewayId) => apiClient.post(BASE + '/orders/' + encodeURIComponent(id) + '/payment',
    { payment_gateway_id: gatewayId }, { headers: orderHeaders(id) }),
  legal: id => apiClient.get(BASE + '/public/legal/' + id),
  accountStatus: () => apiClient.get(BASE + '/account/status'),
  sendVerification: data => apiClient.post(BASE + '/account/email/send', data),
  verifyEmail: code => apiClient.post(BASE + '/account/email/verify', { code }),
  returns: id => apiClient.get(BASE+'/orders/'+encodeURIComponent(id)+'/returns',{headers:orderHeaders(id)}),
  requestReturn: (id,data) => apiClient.post(BASE+'/orders/'+encodeURIComponent(id)+'/returns',data,{headers:orderHeaders(id)}),
}
