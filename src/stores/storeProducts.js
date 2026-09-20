import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storeProductsApi } from '@/modules/store/api/storeProducts.api.js'

export const useStoreProductsStore = defineStore('storeProducts', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15
  })

  const filters = ref({
    category_id: null,
    search: '',
    company_id: null,
    min_price: null,
    max_price: null
  })

  async function fetchProducts(page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await storeProductsApi.getProducts({
        page,
        per_page: pagination.value.perPage,
        ...filters.value
      })
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
      error.value = err.response?.data?.message || err.message || 'حدث خطأ أثناء جلب المنتجات'
      products.value = []
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    fetchProducts(1)
  }

  function clearFilters() {
    filters.value = {
      category_id: null,
      search: '',
      company_id: null,
      min_price: null,
      max_price: null
    }
    fetchProducts(1)
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
