import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'

export const useWishlistStore = defineStore('wishlist', () => {
  const saved = localStorage.getItem('hwnix_store_wishlist')
  const items = ref(saved ? JSON.parse(saved) : [])
  const loading = ref(false)
  const authStore = useAuthStore()

  // Sync to localStorage on every change
  watch(items, (newItems) => {
    localStorage.setItem('hwnix_store_wishlist', JSON.stringify(newItems))
  }, { deep: true })

  const fetchWishlist = async () => {
    if (!authStore.isAuthenticated) return
    loading.value = true
    try {
      const response = await api.get('/store/wishlist/ids')
      if (response.data?.status === 'success') {
        items.value = response.data.data
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch immediately if authenticated
  if (authStore.isAuthenticated) {
    fetchWishlist()
  }

  const toggle = async (productId) => {
    const id = Number(productId)
    const index = items.value.indexOf(id)
    
    // Optimistic UI update
    if (index === -1) {
      items.value.push(id)
    } else {
      items.value.splice(index, 1)
    }

    // Sync with API if logged in
    if (authStore.isAuthenticated) {
      try {
        await api.post('/store/wishlist/toggle', { product_id: id })
      } catch (error) {
        console.error('Failed to toggle wishlist on server', error)
        // Revert optimistic update on failure
        if (index === -1) {
          items.value = items.value.filter(i => i !== id)
        } else {
          items.value.push(id)
        }
      }
    }
  }

  const isFavorite = (productId) => {
    return items.value.includes(Number(productId))
  }

  const clear = () => {
    items.value = []
  }

  return {
    items,
    loading,
    fetchWishlist,
    toggle,
    isFavorite,
    clear,
  }
})
