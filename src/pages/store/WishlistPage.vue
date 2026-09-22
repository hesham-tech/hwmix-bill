<template>
  <div class="store-page-wrapper" dir="rtl">
    <StoreNavbar />

    <div class="wishlist-page pb-16 pt-8">
      <v-container style="max-width: 1400px;">
        <!-- Page Header -->
        <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-8">
          <div>
            <div class="d-flex align-center gap-2 mb-2">
              <v-btn icon="ri-arrow-right-line" variant="text" size="small" to="/store" class="text-grey-darken-1"></v-btn>
              <h1 class="text-h4 font-weight-black text-grey-darken-4 mb-0">قائمة المفضلة</h1>
            </div>
            <p class="text-body-1 text-grey-darken-1 ms-12">المنتجات التي قمت بحفظها لشرائها لاحقاً</p>
          </div>
          <v-btn 
            v-if="!wishlistStore.loading && wishlistProducts.length > 0"
            variant="tonal" 
            color="error"
            class="rounded-pill px-6"
            @click="clearWishlist"
          >
            <v-icon icon="ri-delete-bin-line" class="me-2"></v-icon>
            إفراغ المفضلة
          </v-btn>
        </div>

        <!-- Loading State -->
        <v-row v-if="wishlistStore.loading || loadingProducts">
          <v-col v-for="i in 4" :key="i" cols="12" sm="6" md="4" lg="3">
            <v-skeleton-loader type="card, article, button" class="rounded-xl"></v-skeleton-loader>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-card v-else-if="wishlistProducts.length === 0" class="text-center pa-16 rounded-xl bg-white border-0 shadow-sm" elevation="0">
          <v-icon icon="ri-heart-3-line" size="80" color="grey-lighten-2" class="mb-4"></v-icon>
          <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-2">المفضلة فارغة</h2>
          <p class="text-body-1 text-grey-darken-1 mb-6">لم تقم بإضافة أي منتجات إلى قائمة المفضلة بعد.</p>
          <v-btn color="primary" size="large" rounded="pill" class="px-8 font-weight-bold" to="/store">
            تصفح المنتجات
          </v-btn>
        </v-card>

        <!-- Wishlist Grid -->
        <v-row v-else class="justify-start">
          <v-col 
            v-for="product in wishlistProducts" 
            :key="product.id" 
            cols="12" sm="6" md="4" lg="3"
          >
            <ProductCard :product="product" />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useWishlistStore } from '@/stores/wishlist'
import api from '@/services/api'
import ProductCard from '@/modules/store/components/ProductCard.vue'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import CartDrawer from '@/modules/store/components/CartDrawer.vue'

const wishlistStore = useWishlistStore()
const wishlistProducts = ref([])
const loadingProducts = ref(true)

const loadProducts = async () => {
  if (wishlistStore.items.length === 0) {
    wishlistProducts.value = []
    loadingProducts.value = false
    return
  }

  loadingProducts.value = true
  try {
    // Fetch using public API so guests can also load their local wishlist
    const response = await api.get('/store/public/products', {
      params: { 
        ids: wishlistStore.items,
        per_page: 50
      }
    })
    if (response.data?.data) {
      // The API returns a paginated response inside 'data', so the actual items are in response.data.data.data
      wishlistProducts.value = Array.isArray(response.data.data) ? response.data.data : (response.data.data.data || [])
    }
  } catch (error) {
    console.error('Error fetching wishlist products:', error)
  } finally {
    loadingProducts.value = false
  }
}

const clearWishlist = async () => {
  if (confirm('هل أنت متأكد من إفراغ قائمة المفضلة؟')) {
    // Iterate and remove all or just clear local if guest
    // For simplicity, we just clear the store
    for (const id of [...wishlistStore.items]) {
      await wishlistStore.toggle(id)
    }
    wishlistProducts.value = []
  }
}

onMounted(() => {
  loadProducts()
})

// Watch for changes in the store (e.g., if a user removes an item from the card while on this page)
watch(() => wishlistStore.items, (newItems) => {
  wishlistProducts.value = wishlistProducts.value.filter(p => newItems.includes(p.id))
}, { deep: true })
</script>

<style scoped>
.store-page-wrapper {
  background: #f8fafc;
  min-height: 100vh;
}
.wishlist-page {
  min-height: calc(100vh - 80px);
}
</style>
