// خدمات API لإدارة عناوين الشحن الخاصة بالعميل
import apiClient from '@/api/axios.config'

const BASE = '/store/addresses'

export const customerAddressesApi = {
  getAddresses: () =>
    apiClient.get(BASE),

  createAddress: (data) =>
    apiClient.post(BASE, data),

  updateAddress: (id, data) =>
    apiClient.put(`${BASE}/${id}`, data),

  deleteAddress: (id) =>
    apiClient.delete(`${BASE}/${id}`),

  setDefault: (id) =>
    apiClient.post(`${BASE}/${id}/default`),
}
