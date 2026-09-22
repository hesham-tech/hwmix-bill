<template>
  <div class="store-page-wrapper" dir="rtl">
    <StoreNavbar />

    <div class="store-main-bg py-8">
      <v-container style="max-width: 1400px;">
        <v-row>
          <!-- Sidebar Filters (Desktop) -->
          <v-col cols="12" md="3" lg="3" class="hidden-sm-and-down">
            <FiltersSidebar
              :categories="categories"
              :brands="brands"
              :filters="storeProductsStore.filters"
              @update:filters="applyFilters"
            />
          </v-col>

          <!-- Products Area -->
          <v-col cols="12" md="9" lg="9">
            
            <!-- Toolbar -->
            <v-card class="mb-4 rounded-xl border-0 bg-white" elevation="0">
              <v-card-text class="d-flex align-center justify-space-between flex-wrap gap-4 py-3 px-4">
                
                <div class="d-flex align-center gap-3">
                  <v-btn
                    class="d-md-none"
                    variant="tonal"
                    color="primary"
                    prepend-icon="ri-filter-3-line"
                    @click="showMobileFilter = true"
                    rounded="pill"
                    size="small"
                  >
                    تصفية
                  </v-btn>

                  <div class="text-body-2 font-weight-medium text-grey-darken-2">
                    عرض <span class="font-weight-black text-primary mx-1">{{ storeProductsStore.pagination.total || 0 }}</span> منتج
                  </div>
                </div>

                <div class="d-flex align-center gap-3">
                  <v-select
                    v-model="sortBy"
                    :items="sortOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    style="min-width: 160px; max-width: 220px;"
                    rounded="lg"
                    @update:model-value="applySort"
                  ></v-select>

                  <v-btn
                    variant="outlined"
                    color="grey-darken-1"
                    :icon="viewMode === 'grid' ? 'ri-list-check' : 'ri-grid-fill'"
                    @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
                    density="comfortable"
                    rounded="lg"
                    class="border-grey-lighten-2"
                  ></v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Active Filters -->
            <div v-if="hasActiveFilters" class="d-flex flex-wrap gap-2 mb-4 px-1">
              <v-chip
                v-if="storeProductsStore.filters.search"
                closable
                @click:close="clearFilter('search')"
                color="primary"
                variant="flat"
                size="small"
              >
                البحث: {{ storeProductsStore.filters.search }}
              </v-chip>
              <v-chip
                v-if="storeProductsStore.filters.category_id"
                closable
                @click:close="clearFilter('category_id')"
                color="primary"
                variant="flat"
                size="small"
              >
                تصفية بالقسم
              </v-chip>
              <v-btn
                variant="text"
                color="error"
                size="small"
                @click="clearAllFilters"
                class="font-weight-bold"
              >
                مسح الكل
              </v-btn>
            </div>

            <!-- Error -->
            <v-alert v-if="storeProductsStore.error" type="error" variant="tonal" class="mb-6 rounded-xl">
              {{ storeProductsStore.error }}
            </v-alert>

            <!-- Loading Skeleton -->
            <v-row v-if="storeProductsStore.loading && storeProductsStore.products.length === 0">
              <v-col 
                v-for="i in 8" :key="i" 
                :cols="viewMode === 'grid' ? 6 : 12" 
                :md="viewMode === 'grid' ? 6 : 12" 
                :lg="viewMode === 'grid' ? 4 : 12"
              >
                <ProductCardSkeleton :list-view="viewMode === 'list'" />
              </v-col>
            </v-row>

            <!-- Products Grid -->
            <v-row v-else-if="storeProductsStore.products.length > 0" class="justify-start">
              <v-col
                v-for="product in storeProductsStore.products"
                :key="product.id"
                :cols="viewMode === 'grid' ? 6 : 12"
                :md="viewMode === 'grid' ? 6 : 12"
                :lg="viewMode === 'grid' ? 4 : 12"
              >
                <ProductCard :product="product" :list-view="viewMode === 'list'" />
              </v-col>
            </v-row>

            <!-- Empty -->
            <v-card v-else class="rounded-xl border-0 bg-white py-16" elevation="0">
              <v-card-text class="text-center">
                <v-icon icon="ri-search-2-line" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
                <h3 class="text-h6 font-weight-bold text-grey-darken-2 mb-2">لا توجد منتجات</h3>
                <p class="text-grey mb-6">جرب تغيير كلمات البحث أو إزالة الفلاتر المحددة</p>
                <v-btn color="primary" variant="tonal" rounded="pill" @click="clearAllFilters">
                  إزالة جميع الفلاتر
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- Pagination -->
            <div v-if="storeProductsStore.pagination.lastPage > 1" class="d-flex justify-center mt-8">
              <v-pagination
                v-model="storeProductsStore.pagination.currentPage"
                :length="storeProductsStore.pagination.lastPage"
                @update:model-value="onPageChange"
                color="primary"
                rounded="circle"
                :total-visible="5"
              ></v-pagination>
            </div>

          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Mobile Drawer -->
    <v-navigation-drawer v-model="showMobileFilter" location="right" temporary width="300" class="bg-white">
      <div class="pa-4 d-flex align-center justify-space-between border-b">
        <h3 class="text-h6 font-weight-bold mb-0">تصفية</h3>
        <v-btn icon="ri-close-line" variant="text" density="comfortable" @click="showMobileFilter = false"></v-btn>
      </div>
      <div class="pa-4">
        <FiltersSidebar
          :categories="categories"
          :brands="brands"
          :filters="storeProductsStore.filters"
          @update:filters="applyFilters"
        />
      </div>
    </v-navigation-drawer>

    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreProductsStore } from '@/stores/storeProducts'
import { storeProductsApi } from '@/modules/store/api/storeProducts.api.js'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import ProductCard from '@/modules/store/components/ProductCard.vue'
import ProductCardSkeleton from '@/modules/store/components/ProductCardSkeleton.vue'
import CartDrawer from '@/modules/store/components/CartDrawer.vue'
import FiltersSidebar from '@/modules/store/components/FiltersSidebar.vue'

const route = useRoute()
const router = useRouter()
const storeProductsStore = useStoreProductsStore()

const viewMode = ref('grid')
const sortBy = ref('newest')
const showMobileFilter = ref(false)
const categories = ref([])
const brands = ref([])

const sortOptions = [
  { label: 'الأحدث', value: 'newest' },
  { label: 'السعر: من الأقل', value: 'price_asc' },
  { label: 'السعر: من الأعلى', value: 'price_desc' },
  { label: 'الأكثر مبيعاً', value: 'best_selling' },
]

const hasActiveFilters = computed(() => {
  const f = storeProductsStore.filters
  return f.search || f.category_id || f.brand_id || f.in_stock
})

const applyFilters = (newFilters) => {
  storeProductsStore.setFilters(newFilters)
  showMobileFilter.value = false
}

const applySort = (value) => {
  storeProductsStore.setFilters({ sort: value })
}

const clearFilter = (key) => {
  storeProductsStore.setFilters({ [key]: null })
}

const clearAllFilters = () => {
  storeProductsStore.clearFilters()
  if (route.query.q) {
    router.replace({ path: '/store' })
  }
}

const onPageChange = (page) => {
  storeProductsStore.fetchProducts(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const loadCategories = async () => {
  try {
    const res = await storeProductsApi.getCategories()
    categories.value = res.data?.data || []
  } catch {}
}

const loadBrands = async () => {
  try {
    const res = await storeProductsApi.getBrands()
    brands.value = res.data?.data || []
  } catch {}
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
  loadCategories()
  loadBrands()
})
</script>

<style scoped>
.store-page-wrapper {
  background: #f8fafc;
  min-height: 100vh;
}
.store-main-bg {
  background: #f8fafc;
}
</style>
