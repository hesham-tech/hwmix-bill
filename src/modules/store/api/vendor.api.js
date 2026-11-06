// خدمات API لصفحات البائعين في المتجر
import apiClient from '@/modules/store/api/storeClient'

const BASE = '/store/public/vendors'

export const vendorApi = {
  getVendors: () =>
    apiClient.get(BASE),

  getVendor: (id) =>
    apiClient.get(`${BASE}/${id}`),

  getVendorProducts: (id, params = {}) =>
    apiClient.get(`${BASE}/${id}/products`, { params }),

  getVendorCategories: (id) =>
    apiClient.get(`${BASE}/${id}/categories`),
}
