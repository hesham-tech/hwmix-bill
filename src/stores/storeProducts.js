import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storeProductsApi } from '@/modules/store/api/storeProducts.api.js'
import { defaultCatalogFilters, normalizeCatalogFilters } from '@/modules/store/utils/catalogFilters'

export const useStoreProductsStore = defineStore('storeProducts', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  let requestVersion = 0

  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15
  })

  const filters = ref(defaultCatalogFilters())

  async function fetchProducts(page = 1) {
    const version = ++requestVersion
    loading.value = true
    error.value = null
    try {
      const response = await storeProductsApi.getProducts({
        page,
        per_page: pagination.value.perPage,
        ...filters.value
      })
      if (version !== requestVersion) return
      const resData = response.data?.data;
      if (resData && resData.data && Array.isArray(resData.data)) {
        products.value = resData.data;
        pagination.value = {
          currentPage: resData.meta?.current_page || 1,
          lastPage: resData.meta?.last_page || 1,
          total: resData.meta?.total || 0,
          perPage: resData.meta?.per_page || 15
        };
      } else if (Array.isArray(resData)) {
        products.value = resData;
      } else {
        products.value = [];
      }
    } catch (err) {
      if (version !== requestVersion) return
      error.value = err.response?.data?.message || err.message || 'حدث خطأ أثناء جلب المنتجات'
      products.value = []
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  function setFilters(newFilters) {
    const merged = { ...filters.value, ...newFilters }
    if ('category_id' in newFilters && !('category_ids' in newFilters)) delete merged.category_ids
    if ('brand_id' in newFilters && !('brand_ids' in newFilters)) delete merged.brand_ids
    filters.value = normalizeCatalogFilters(merged)
    return fetchProducts(1)
  }

  function clearFilters() {
    filters.value = defaultCatalogFilters()
    return fetchProducts(1)
  }

  return {
    products,
    loading,
    error,
    pagination,
    filters,
    fetchProducts,
    setFilters,
    clearFilters
  }
})
