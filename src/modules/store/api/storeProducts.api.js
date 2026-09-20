// خدمات API لجلب منتجات المتجر والفئات والبائعين
import apiClient from '@/api/axios.config'

const BASE = '/store/public'

export const storeProductsApi = {
  getProducts: (params = {}) =>
    apiClient.get(`${BASE}/products`, { params }),

  getFeatured: () =>
    apiClient.get(`${BASE}/products/featured`),

  getProduct: (slug) =>
    apiClient.get(`${BASE}/products/${slug}`),

  getCategories: () =>
    apiClient.get(`${BASE}/categories`),

  getBrands: () =>
    apiClient.get(`${BASE}/brands`),

  validateCart: (items) =>
    apiClient.post('/store/cart/validate', { items }),
}
