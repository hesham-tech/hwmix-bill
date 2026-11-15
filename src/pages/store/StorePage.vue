<template>
  <div class="store-page-wrapper" dir="rtl">
    <StoreNavbar />

    <div class="store-main-bg py-4 py-md-8">
      <v-container class="px-1 px-md-4" style="max-width: 1400px;">
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
          <v-col cols="12" md="9" lg="9" class="pa-2 pa-md-3">


            <!-- Toolbar -->
            <v-card class="mb-4 rounded-xl border-0 bg-white" elevation="0">
              <v-card-text class="d-flex align-center justify-space-between flex-wrap gap-4 py-2 px-3 py-md-3 px-md-4">
                
                <div class="d-flex align-center gap-3">
                  <div class="text-body-2 font-weight-medium text-grey-darken-2" role="status" aria-live="polite" data-testid="catalog-total">
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
                    style="min-width: 140px; max-width: 200px;"
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
            <v-progress-linear v-if="storeProductsStore.loading && storeProductsStore.products.length" indeterminate color="primary" aria-label="جارٍ تحديث المنتجات" class="mb-3" />

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
                v-for="id in storeProductsStore.filters.category_ids"
                :key="`category-${id}`"
                :data-testid="`category-filter-${id}`"
                closable
                @click:close="removeSelection('category_ids', id)"
                color="primary"
                variant="flat"
                size="small"
              >
                {{ categories.find(category => Number(category.id) === id)?.name || 'تصنيف محدد' }}
              </v-chip>
              <v-chip v-for="id in storeProductsStore.filters.brand_ids" :key="`brand-${id}`" :data-testid="`brand-filter-${id}`" closable color="primary" variant="flat" size="small" @click:close="removeSelection('brand_ids', id)">
                {{ brands.find(brand => Number(brand.id) === id)?.name || 'علامة محددة' }}
              </v-chip>
              <v-chip v-if="storeProductsStore.filters.in_stock" closable size="small" @click:close="applyFilters({ in_stock: false })">متوفر فقط</v-chip>
              <v-chip v-if="storeProductsStore.filters.min_price != null" closable size="small" @click:close="clearFilter('min_price')">من {{ storeProductsStore.filters.min_price }} ج.م</v-chip>
              <v-chip v-if="storeProductsStore.filters.max_price != null" closable size="small" @click:close="clearFilter('max_price')">إلى {{ storeProductsStore.filters.max_price }} ج.م</v-chip>
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
            <v-row v-if="storeProductsStore.loading && storeProductsStore.products.length === 0" no-gutters>
              <v-col 
                v-for="i in 8" :key="i" 
                :cols="viewMode === 'grid' ? 6 : 12" 
                :md="viewMode === 'grid' ? 6 : 12" 
                :lg="viewMode === 'grid' ? 4 : 12"
                class="pa-1"
              >
                <ProductCardSkeleton :list-view="viewMode === 'list'" />
              </v-col>
            </v-row>

            <!-- Products Grid -->
            <v-row v-else-if="storeProductsStore.products.length > 0" class="justify-start" no-gutters>
              <v-col
                v-for="product in storeProductsStore.products"
                :key="product.id"
                :cols="viewMode === 'grid' ? 6 : 12"
                :md="viewMode === 'grid' ? 6 : 12"
                :lg="viewMode === 'grid' ? 4 : 12"
                class="pa-1"
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
    <v-navigation-drawer v-model="showMobileFilter" location="right" temporary disable-route-watcher width="320" :z-index="2200" :style="{ maxWidth: '100vw' }" class="bg-white store-filters-drawer" aria-label="تصفية المنتجات">
      <div class="pa-4 d-flex align-center justify-space-between border-b flex-shrink-0">
        <h3 class="text-h6 font-weight-bold mb-0">تصفية</h3>
        <v-btn variant="text" size="small" @click="clearAllFilters">مسح الكل</v-btn>
        <v-btn icon="ri-close-line" variant="text" density="comfortable" aria-label="إغلاق الفلاتر" @click="showMobileFilter = false"></v-btn>
      </div>
      <div class="pa-4 mobile-filter-body">
        <FiltersSidebar
          mobile
          :categories="categories"
          :brands="brands"
          :filters="storeProductsStore.filters"
          @update:filters="applyFilters"
        />
      </div>
      <div class="pa-3 border-t flex-shrink-0 mobile-filter-footer">
        <v-btn color="primary" block rounded="pill" height="48" @click="showMobileFilter = false">عرض النتائج ({{ storeProductsStore.pagination.total }})</v-btn>
      </div>
    </v-navigation-drawer>

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
import FiltersSidebar from '@/modules/store/components/FiltersSidebar.vue'
import { useStoreMobileNav } from '@/modules/store/composables/useStoreMobileNav'
import { useStoreCategories } from '@/modules/store/composables/useStoreCategories'
import { catalogFiltersFromQuery, catalogFiltersToQuery, normalizeCatalogFilters, defaultCatalogFilters } from '@/modules/store/utils/catalogFilters'

const route = useRoute()
const router = useRouter()
const storeProductsStore = useStoreProductsStore()
const { isMobileFilterOpen: showMobileFilter } = useStoreMobileNav()

const viewMode = ref('grid')
const sortBy = ref('newest')
const { categories, loadCategories } = useStoreCategories()
const brands = ref([])

const sortOptions = [
  { label: 'الأحدث', value: 'newest' },
  { label: 'السعر: من الأقل', value: 'price_asc' },
  { label: 'السعر: من الأعلى', value: 'price_desc' },
  { label: 'الأكثر مبيعاً', value: 'best_selling' },
]

const hasActiveFilters = computed(() => {
  const f = storeProductsStore.filters
  return f.search || f.category_ids.length || f.brand_ids.length || f.in_stock || f.min_price != null || f.max_price != null
})

const applyFilters = (newFilters) => {
  const filters = normalizeCatalogFilters({ ...storeProductsStore.filters, ...newFilters })
  router.replace({ path: '/store', query: catalogFiltersToQuery(filters) })
}

const applySort = (value) => {
  applyFilters({ sort: value })
}

const clearFilter = (key) => {
  applyFilters({ [key]: key === 'search' ? '' : null })
}

const removeSelection = (key, id) => applyFilters({ [key]: storeProductsStore.filters[key].filter(value => value !== id) })

const clearAllFilters = () => {
  sortBy.value = 'newest'
  if (Object.keys(route.query).length) router.replace({ path: '/store' })
  else storeProductsStore.setFilters(defaultCatalogFilters())
}

const onPageChange = (page) => {
  storeProductsStore.fetchProducts(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const loadBrands = async () => {
  try {
    const res = await storeProductsApi.getBrands()
    brands.value = res.data?.data || []
  } catch {}
}

watch(() => route.query, (newQuery) => {
  const filters = catalogFiltersFromQuery(newQuery)
  sortBy.value = filters.sort
  storeProductsStore.setFilters(filters)
}, { deep: true, immediate: true })

onMounted(() => {
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
.store-filters-drawer :deep(.v-navigation-drawer__content) { display: flex; flex-direction: column; overflow: hidden; }
.mobile-filter-body { flex: 1; min-height: 0; overflow-y: auto; }
.mobile-filter-footer { background: white; padding-bottom: max(12px, env(safe-area-inset-bottom, 0px)) !important; }

/* مساحة أمان سفلية للهاتف - تمنع تغطية الشريط السفلي للمحتوى */
@media (max-width: 959px) {
  .store-page-wrapper {
    padding-bottom: calc(var(--store-bottom-height, calc(66px + env(safe-area-inset-bottom, 0px))) + var(--store-purchase-height, 0px) + 12px) !important;
  }
}
</style>
