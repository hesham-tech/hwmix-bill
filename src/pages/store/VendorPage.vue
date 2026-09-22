<template>
  <div class="vendor-page" dir="rtl">
    <StoreNavbar />

    <v-main style="background: #f8fafc; min-height: 100vh;">

      <!-- Loading -->
      <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 400px;">
        <v-progress-circular indeterminate color="primary" size="56" width="4"></v-progress-circular>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="d-flex justify-center pt-16">
        <v-alert type="error" variant="tonal" rounded="xl" max-width="500">{{ error }}</v-alert>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Hero Cover -->
        <div
          class="vendor-hero"
          :style="vendor?.cover_image ? `background-image: url(${vendor.cover_image})` : ''"
        >
          <div class="vendor-hero-overlay"></div>
          <v-container style="max-width: 1400px;" class="hero-container">
            <div class="d-flex align-end gap-6 flex-wrap">

              <!-- Logo -->
              <div class="vendor-logo-wrapper">
                <v-avatar size="110" class="vendor-logo">
                  <v-img :src="vendor?.logo || defaultLogo" cover></v-img>
                </v-avatar>
                <div class="verified-badge">
                  <v-icon icon="ri-verified-badge-fill" color="primary" size="22"></v-icon>
                </div>
              </div>

              <!-- Info -->
              <div class="vendor-hero-info flex-grow-1 pb-2">
                <h1 class="vendor-name">{{ vendor?.name || 'متجر' }}</h1>
                <p class="vendor-description text-white opacity-80 mb-3">
                  {{ vendor?.description || 'متجر متميز يقدم أفضل المنتجات بأسعار تنافسية' }}
                </p>
                <div class="d-flex align-center gap-4 flex-wrap">
                  <div class="vendor-stat">
                    <v-icon icon="ri-box-3-line" size="16" class="me-1"></v-icon>
                    {{ products.length }} منتج
                  </div>
                  <div v-if="vendor?.rating" class="vendor-stat">
                    <v-icon icon="ri-star-fill" size="16" color="yellow" class="me-1"></v-icon>
                    {{ vendor.rating }}
                  </div>
                </div>
              </div>

              <!-- Follow Button -->
              <v-btn
                variant="outlined"
                color="white"
                class="rounded-xl font-weight-bold hidden-xs"
                height="44"
                prepend-icon="ri-store-2-line"
              >
                متابعة المتجر
              </v-btn>
            </div>
          </v-container>
        </div>

        <!-- Main Content -->
        <v-container style="max-width: 1400px;" class="py-8">
          <v-row>
            <!-- Sidebar -->
            <v-col cols="12" md="3" class="hidden-sm-and-down">
              <!-- Vendor Info Card -->
              <v-card class="vendor-info-card mb-4" elevation="0">
                <v-card-text class="pa-5">
                  <div class="text-body-2 font-weight-bold mb-4">معلومات المتجر</div>
                  <div class="info-row" v-if="vendor?.address">
                    <v-icon icon="ri-map-pin-line" size="16" color="grey" class="me-2"></v-icon>
                    <span class="text-caption text-grey">{{ vendor.address }}</span>
                  </div>
                  <div class="info-row" v-if="vendor?.phone">
                    <v-icon icon="ri-phone-line" size="16" color="grey" class="me-2"></v-icon>
                    <span class="text-caption text-grey">{{ vendor.phone }}</span>
                  </div>
                  <div class="info-row" v-if="vendor?.email">
                    <v-icon icon="ri-mail-line" size="16" color="grey" class="me-2"></v-icon>
                    <span class="text-caption text-grey">{{ vendor.email }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Products -->
            <v-col cols="12" md="9">
              <!-- Section Title -->
              <div class="d-flex align-center justify-space-between mb-6">
                <div class="d-flex align-center gap-2">
                  <div class="section-title-bar"></div>
                  <h2 class="text-h6 font-weight-bold">منتجات المتجر</h2>
                </div>
                <span class="text-caption text-grey">{{ products.length }} منتج</span>
              </div>

              <!-- Loading Products -->
              <v-row v-if="loading">
                <v-col v-for="i in 8" :key="i" cols="6" md="4">
                  <ProductCardSkeleton />
                </v-col>
              </v-row>

              <!-- Products Grid -->
              <v-row v-else-if="products.length > 0">
                <v-col
                  v-for="product in products"
                  :key="product.id"
                  cols="6" sm="6" md="4"
                >
                  <ProductCard :product="product" />
                </v-col>
              </v-row>

              <!-- Empty -->
              <div v-else class="empty-products text-center py-16 rounded-2xl">
                <v-icon icon="ri-archive-line" size="56" color="grey-lighten-2" class="mb-4"></v-icon>
                <h3 class="text-h6 text-grey-darken-1">لا توجد منتجات حالياً</h3>
                <p class="text-caption text-grey mt-2">لم يضف هذا المتجر أي منتجات بعد</p>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>
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
const defaultLogo = 'https://placehold.co/150x150?text=متجر'

const fetchVendorData = async () => {
  try {
    const res = await vendorApi.getVendor(vendorId)
    vendor.value = res.data?.data || res.data

    const pRes = await vendorApi.getVendorProducts(vendorId)
    const prodsData = pRes.data?.data
    products.value = prodsData?.data ? prodsData.data : (Array.isArray(prodsData) ? prodsData : [])
  } catch {
    error.value = 'تعذر تحميل بيانات المتجر'
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchVendorData() })
</script>

<style scoped>
.vendor-page { direction: rtl; }

/* Hero */
.vendor-hero {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1a237e 100%);
  background-size: cover;
  background-position: center;
  min-height: 240px;
  padding-top: 56px;
  padding-bottom: 0;
}

.vendor-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
}

.hero-container {
  position: relative;
  z-index: 1;
  padding-bottom: 32px;
}

.vendor-logo-wrapper {
  position: relative;
  flex-shrink: 0;
}

.vendor-logo {
  border: 4px solid white;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.verified-badge {
  position: absolute;
  bottom: 0;
  right: -4px;
  background: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.vendor-name {
  font-size: clamp(24px, 3vw, 38px);
  font-weight: 900;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.vendor-stat {
  display: flex;
  align-items: center;
  color: rgba(255,255,255,0.85);
  font-size: 13px;
  font-weight: 500;
}

/* Info Card */
.vendor-info-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

/* Section */
.section-title-bar {
  width: 4px;
  height: 22px;
  background: linear-gradient(135deg, #1a73e8, #6c47ff);
  border-radius: 2px;
}

/* Empty */
.empty-products {
  background: white;
  border: 2px dashed #e2e8f0;
}

.rounded-2xl { border-radius: 20px !important; }
</style>
