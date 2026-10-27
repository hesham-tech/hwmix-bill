import { ref } from 'vue'
import { storeProductsApi } from '../api/storeProducts.api'

const categories = ref([])
const loading = ref(false)
const error = ref('')
let pending
let loaded = false

export function useStoreCategories() {
  const loadCategories = () => {
    if (loaded) return Promise.resolve()
    if (pending) return pending
    loading.value = true
    error.value = ''
    pending = storeProductsApi.getCategories().then(response => {
      categories.value = response.data?.data || []
      loaded = true
    }).catch(() => {
      error.value = 'تعذر تحميل الأقسام'
    }).finally(() => {
      loading.value = false
      pending = null
    })
    return pending
  }
  return { categories, loading, error, loadCategories }
}
