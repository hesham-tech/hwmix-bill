// خدمات API لإنشاء وإدارة طلبات المتجر الخاصة بالعميل
import apiClient from '@/api/axios.config'

const BASE = '/store'

export const storeOrdersApi = {
  getOrders: (params = {}) =>
    apiClient.get(`${BASE}/orders`, { params }),

  getOrder: (orderNumber) =>
    apiClient.get(`${BASE}/orders/${orderNumber}`),

  placeOrder: (data) =>
    apiClient.post(`${BASE}/orders`, data),

  cancelOrder: (orderNumber) =>
    apiClient.post(`${BASE}/orders/${orderNumber}/cancel`),
}
