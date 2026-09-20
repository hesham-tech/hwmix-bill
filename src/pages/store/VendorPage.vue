<template>
  <div class="vendor-page pb-10">
    <StoreNavbar />
    
    <v-main class="bg-grey-lighten-4 min-vh-100">
      <!-- Cover & Info -->
      <div class="bg-white border-b mb-8 pb-8">
        <div class="vendor-cover bg-grey-lighten-3 mb-n12" style="height: 200px; background-size: cover; background-position: center;">
          <!-- يمكن إضافة صورة غلاف هنا -->
        </div>
        <v-container class="max-w-1200 position-relative">
          <div class="d-flex flex-column flex-md-row align-center align-md-end gap-6">
            <v-avatar size="150" class="border-4 border-white elevation-2 bg-white mt-n12">
              <v-img :src="vendor?.logo || 'https://placehold.co/150x150?text=Logo'"></v-img>
            </v-avatar>
            <div class="text-center text-md-start flex-grow-1 pb-md-2">
              <h1 class="text-h3 font-weight-black mb-2">{{ vendor?.name || 'جاري التحميل...' }}</h1>
              <p class="text-h6 text-grey-darken-1">{{ vendor?.description || 'متجر مميز يقدم أفضل المنتجات' }}</p>
            </div>
          </div>
        </v-container>
      </div>

      <v-container class="max-w-1200">
        <!-- Error State -->
        <v-alert v-if="error" type="error" variant="tonal" class="mb-6">{{ error }}</v-alert>

        <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center">
          <v-icon icon="ri-store-2-line" class="me-2" color="primary"></v-icon>
          منتجات المتجر
        </h2>

        <!-- Loading State -->
        <v-row v-if="loading && products.length === 0">
          <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
            <ProductCardSkeleton />
          </v-col>
        </v-row>

        <!-- Products Grid -->
        <v-row v-else-if="products.length > 0">
          <v-col 
            v-for="product in products" 
            :key="product.id"
            cols="12" sm="6" md="4" lg="3"
          >
            <ProductCard :product="product" />
          </v-col>
        </v-row>

        <!-- Empty State -->
        <div v-else class="text-center py-16 bg-white rounded-lg elevation-1">
          <v-icon icon="ri-archive-line" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
          <h3 class="text-h5 text-grey-darken-1 mb-2">لا توجد منتجات حالياً</h3>
        </div>
      </v-container>
    </v-main>
    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { vendorApi } from '@/modules/store/api/vendor.api.js'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import ProductCard from '@/modules/store/components/ProductCard.vue'
import ProductCardSkeleton from '@/modules/store/components/ProductCardSkeleton.vue'
import CartDrawer from '@/modules/store/components/CartDrawer.vue'

const route = useRoute()
const vendorId = route.params.id

const vendor = ref(null)
const products = ref([])
const loading = ref(true)
const error = ref(null)

const fetchVendorData = async () => {
  try {
    const res = await vendorApi.getVendor(vendorId)
    vendor.value = res.data?.data || res.data
    
    // جلب منتجات البائع
    const pRes = await vendorApi.getVendorProducts(vendorId)
    const prodsData = pRes.data?.data
    products.value = prodsData?.data ? prodsData.data : (Array.isArray(prodsData) ? prodsData : [])
  } catch (err) {
    error.value = 'تعذر تحميل بيانات المتجر'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVendorData()
})
</script>

<style scoped>
.max-w-1200 { max-width: 1200px; }
.min-vh-100 { min-height: 100vh; }
.border-4 { border-width: 4px !important; border-style: solid; }
.gap-6 { gap: 1.5rem; }
</style>
