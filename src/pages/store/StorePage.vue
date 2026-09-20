<template>
  <div class="store-page pb-10">
    <StoreNavbar />
    
    <v-main class="bg-grey-lighten-4 min-vh-100">
      <v-container class="max-w-1200 py-8">
        
        <!-- Header -->
        <div class="d-flex align-center justify-space-between mb-8">
          <h1 class="text-h4 font-weight-black">المنتجات</h1>
          <div class="d-flex gap-2">
            <!-- Filter stub -->
            <v-btn icon="ri-filter-3-line" variant="tonal" color="primary"></v-btn>
          </div>
        </div>

        <!-- Error State -->
        <v-alert v-if="storeProductsStore.error" type="error" variant="tonal" class="mb-6">
          {{ storeProductsStore.error }}
        </v-alert>

        <!-- Loading State -->
        <v-row v-if="storeProductsStore.loading && storeProductsStore.products.length === 0">
          <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
            <ProductCardSkeleton />
          </v-col>
        </v-row>

        <!-- Products Grid -->
        <v-row v-else-if="storeProductsStore.products.length > 0">
          <v-col 
            v-for="product in storeProductsStore.products" 
            :key="product.id"
            cols="12" sm="6" md="4" lg="3"
          >
            <ProductCard :product="product" />
          </v-col>
        </v-row>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <v-icon icon="ri-search-2-line" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
          <h3 class="text-h5 text-grey-darken-1 mb-2">لا توجد منتجات</h3>
          <p class="text-grey">جرب البحث بكلمات مختلفة أو إزالة الفلاتر</p>
        </div>

        <!-- Pagination -->
        <div v-if="storeProductsStore.pagination.lastPage > 1" class="d-flex justify-center mt-8">
          <v-pagination
            v-model="storeProductsStore.pagination.currentPage"
            :length="storeProductsStore.pagination.lastPage"
            @update:model-value="onPageChange"
            color="primary"
            rounded="circle"
          ></v-pagination>
        </div>
      </v-container>
    </v-main>
    <CartDrawer />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStoreProductsStore } from '@/stores/storeProducts'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import ProductCard from '@/modules/store/components/ProductCard.vue'
import ProductCardSkeleton from '@/modules/store/components/ProductCardSkeleton.vue'
import CartDrawer from '@/modules/store/components/CartDrawer.vue'

const route = useRoute()
const storeProductsStore = useStoreProductsStore()

const onPageChange = (page) => {
  storeProductsStore.fetchProducts(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(() => route.query, (newQuery) => {
  storeProductsStore.setFilters({ 
    search: newQuery.q || '',
    vendor_id: newQuery.vendor_id || '',
    category_id: newQuery.category_id || ''
  })
}, { deep: true })

onMounted(() => {
  storeProductsStore.setFilters({ 
    search: route.query.q || '',
    vendor_id: route.query.vendor_id || '',
    category_id: route.query.category_id || ''
  })
})
</script>

<style scoped>
.max-w-1200 { max-width: 1200px; }
.min-vh-100 { min-height: 100vh; }
</style>
