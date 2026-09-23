<template>
  <div class="product-detail-page" dir="rtl">
    <StoreNavbar />

    <v-main style="background: #f8fafc; min-height: 100vh;">
      <v-container style="max-width: 1400px;" class="py-6 py-md-10">

        <!-- Breadcrumb -->
        <v-breadcrumbs
          :items="breadcrumbs"
          class="pa-0 mb-6"
          density="compact"
        >
          <template v-slot:divider>
            <v-icon icon="ri-arrow-left-s-line" size="16"></v-icon>
          </template>
        </v-breadcrumbs>

        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 400px;">
          <div class="text-center">
            <v-progress-circular indeterminate color="primary" size="64" width="4"></v-progress-circular>
            <p class="text-body-2 text-grey mt-4">جاري تحميل المنتج...</p>
          </div>
        </div>

        <!-- Error -->
        <v-alert v-else-if="error" type="error" variant="tonal" rounded="xl">{{ error }}</v-alert>

        <!-- Product -->
        <div v-else-if="product">
          <v-row>
            <!-- Images Column -->
            <v-col cols="12" md="5">
              <div class="sticky-images">
                <!-- Main Image -->
                <div class="main-image-wrapper mb-3">
                  <v-img
                    :src="selectedImage || defaultImage"
                    :aspect-ratio="1"
                    cover
                    class="rounded-2xl main-product-img"
                  >
                    <template v-slot:error>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                        <v-icon icon="ri-image-line" size="64" color="grey-lighten-2"></v-icon>
                      </div>
                    </template>
                  </v-img>

                  <!-- Zoom badge -->
                  <div class="zoom-hint">
                    <v-icon icon="ri-zoom-in-line" size="14" class="me-1"></v-icon>
                    <span>اضغط للتكبير</span>
                  </div>
                </div>

                <!-- Thumbnails -->
                <div v-if="product.images?.length > 1" class="thumbnails-row d-flex gap-2 overflow-x-auto">
                  <div
                    v-for="img in product.images"
                    :key="img.id"
                    class="thumbnail-item flex-shrink-0"
                    :class="{ 'thumbnail-active': selectedImage === img.url }"
                    @click="selectedImage = img.url"
                  >
                    <v-img :src="img.url" cover width="72" height="72" class="rounded-xl"></v-img>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- Details Column -->
            <v-col cols="12" md="7">
              <div class="product-details-panel px-4 px-md-8 py-6 py-md-8">

                <!-- Vendor -->
                <div class="d-flex align-center gap-2 mb-4">
                  <v-chip
                    class="vendor-chip cursor-pointer"
                    size="small"
                    variant="outlined"
                    color="primary"
                    @click="goToVendor(product.vendor?.id)"
                  >
                    <v-avatar start size="18">
                      <v-img :src="product.vendor?.logo || defaultImage"></v-img>
                    </v-avatar>
                    {{ product.vendor?.name || 'بائع' }}
                  </v-chip>
                  <v-chip v-if="product.category?.name" size="small" variant="tonal" color="primary">
                    {{ product.category?.name }}
                  </v-chip>
                </div>

                <!-- Title -->
                <h1 class="product-title mb-4">{{ product.name }}</h1>

                <!-- Price & Stock -->
                <div class="price-stock-row d-flex align-center flex-wrap gap-2 justify-space-between mb-6">
                  <div>
                    <span class="detail-price">{{ formatPrice(product.price) }}</span>
                    <span class="detail-currency">ج.م</span>
                    <div class="text-caption text-grey mt-1">السعر شامل الضريبة</div>
                  </div>
                  <div>
                    <v-chip
                      v-if="isAvailable"
                      color="success"
                      variant="tonal"
                      size="small"
                      prepend-icon="ri-checkbox-circle-fill"
                    >
                      متوفر في المخزون
                    </v-chip>
                    <v-chip
                      v-else
                      color="error"
                      variant="tonal"
                      size="small"
                      prepend-icon="ri-close-circle-fill"
                    >
                      نفذ المخزون
                    </v-chip>
                  </div>
                </div>

                <!-- Description -->
                <div class="product-desc mb-6" v-if="product.description">
                  <div class="text-body-1 text-medium-emphasis" style="line-height: 1.7;" v-html="product.description"></div>
                </div>

                <v-divider class="mb-6"></v-divider>

                <!-- Variants (if multiple) -->
                <div v-if="product.variants?.length > 1" class="variants-section mb-6">
                  <div class="text-body-2 font-weight-bold mb-3">الخيار المتاح:</div>
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="variant in product.variants"
                      :key="variant.id"
                      :color="selectedVariant?.id === variant.id ? 'primary' : 'default'"
                      :variant="selectedVariant?.id === variant.id ? 'flat' : 'outlined'"
                      class="cursor-pointer"
                      @click="selectVariant(variant)"
                      :disabled="variant.available_stock <= 0"
                    >
                      {{ variant.name }}
                      <span class="text-caption ms-1">({{ formatPrice(variant.price) }})</span>
                    </v-chip>
                  </div>
                </div>

                <!-- Quantity & Actions -->
                <div class="quantity-actions mb-6">
                  <div class="text-body-2 font-weight-bold mb-3">الكمية:</div>
                  <div class="d-flex flex-column flex-sm-row align-sm-center gap-4">
                    <!-- Quantity Stepper -->
                    <div class="quantity-stepper d-flex align-center align-self-start align-self-sm-auto">
                      <v-btn
                        icon="ri-subtract-line"
                        size="small"
                        variant="outlined"
                        :disabled="quantity <= 1"
                        @click="quantity = Math.max(1, quantity - 1)"
                        color="primary"
                      ></v-btn>
                      <span class="quantity-num">{{ quantity }}</span>
                      <v-btn
                        icon="ri-add-line"
                        size="small"
                        variant="outlined"
                        :disabled="quantity >= (product.quantity || 99)"
                        @click="quantity++"
                        color="primary"
                      ></v-btn>
                    </div>

                    <div class="d-flex flex-column flex-sm-row gap-3 flex-grow-1 w-100">
                      <v-btn
                        :disabled="!isAvailable || addingToCart"
                        :loading="addingToCart"
                        variant="outlined"
                        color="primary"
                        size="large"
                        class="flex-grow-1 rounded-xl font-weight-bold"
                        height="52"
                        @click="addToCart"
                      >
                        <v-icon icon="ri-shopping-cart-add-line" class="me-2" size="20"></v-icon>
                        أضف للسلة
                      </v-btn>
                      <v-btn
                        :disabled="!isAvailable"
                        color="primary"
                        size="large"
                        class="flex-grow-1 rounded-xl font-weight-bold"
                        height="52"
                        elevation="2"
                        @click="buyNow"
                      >
                        <v-icon icon="ri-flash-line" class="me-2" size="20"></v-icon>
                        شراء الآن
                      </v-btn>
                    </div>
                  </div>
                </div>

                <!-- Trust Badges -->
                <div class="trust-badges d-flex flex-wrap gap-3 mb-6">
                  <div class="trust-badge d-flex align-center gap-2" v-for="badge in trustBadges" :key="badge.label">
                    <div class="trust-icon">
                      <v-icon :icon="badge.icon" size="18" color="primary"></v-icon>
                    </div>
                    <span class="text-caption font-weight-medium">{{ badge.label }}</span>
                  </div>
                </div>

                <v-divider class="mb-6"></v-divider>

                <!-- Product Details Table -->
                <div class="product-specs">
                  <div class="text-body-1 font-weight-bold mb-4">تفاصيل المنتج</div>
                  <v-table density="compact" class="specs-table rounded-xl">
                    <tbody>
                      <tr v-if="product.sku">
                        <td class="text-grey spec-label">كود المنتج</td>
                        <td class="font-weight-medium spec-value">{{ product.sku }}</td>
                      </tr>
                      <tr v-if="product.barcode">
                        <td class="text-grey spec-label">الباركود</td>
                        <td class="font-weight-medium spec-value">{{ product.barcode }}</td>
                      </tr>
                      <tr v-if="product.brand?.name || product.brand">
                        <td class="text-grey spec-label">الماركة</td>
                        <td class="font-weight-medium spec-value">{{ product.brand?.name || product.brand }}</td>
                      </tr>
                      <tr v-if="product.category?.name">
                        <td class="text-grey spec-label">التصنيف</td>
                        <td class="font-weight-medium spec-value">{{ product.category?.name }}</td>
                      </tr>
                      <tr v-if="product.unit">
                        <td class="text-grey spec-label">وحدة القياس</td>
                        <td class="font-weight-medium spec-value">{{ product.unit }}</td>
                      </tr>
                      <tr v-if="product.weight">
                        <td class="text-grey spec-label">الوزن</td>
                        <td class="font-weight-medium spec-value">{{ product.weight }}</td>
                      </tr>
                      <tr v-if="product.dimensions">
                        <td class="text-grey spec-label">الأبعاد</td>
                        <td class="font-weight-medium spec-value">{{ product.dimensions }}</td>
                      </tr>
                      <tr v-if="product.warranty_days">
                        <td class="text-grey spec-label">الضمان</td>
                        <td class="font-weight-medium spec-value">{{ product.warranty_days }} يوم</td>
                      </tr>
                      <tr v-if="product.vendor?.name">
                        <td class="text-grey spec-label">البائع</td>
                        <td class="font-weight-medium spec-value">{{ product.vendor?.name }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>

              </div>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>

    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { storeProductsApi } from '@/modules/store/api/storeProducts.api.js'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import CartDrawer from '@/modules/store/components/CartDrawer.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const quantity = ref(1)
const selectedImage = ref(null)
const selectedVariant = ref(null)
const addingToCart = ref(false)

const defaultImage = 'https://placehold.co/600x600?text=No+Image'

const breadcrumbs = computed(() => [
  { title: 'المتجر', to: '/store' },
  { title: product.value?.category?.name || 'منتجات', to: '/store' },
  { title: product.value?.name || '...', disabled: true }
])

const trustBadges = [
  { icon: 'ri-shield-check-line', label: 'دفع آمن 100%' },
  { icon: 'ri-truck-line', label: 'شحن سريع' },
  { icon: 'ri-refresh-line', label: 'إرجاع مجاني' },
  { icon: 'ri-customer-service-2-line', label: 'دعم 24/7' },
]

const isAvailable = computed(() =>
  product.value && (product.value.stock_status === 'in_stock' || product.value.quantity > 0)
)

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('ar-EG').format(Number(price))
}

const fetchProduct = async () => {
  try {
    const res = await storeProductsApi.getProduct(route.params.id)
    product.value = res.data?.data || res.data
    selectedImage.value = product.value?.image || null
    if (product.value?.variants?.length > 0) {
      selectedVariant.value = product.value.variants[0]
    }
  } catch {
    error.value = 'تعذر تحميل بيانات المنتج'
  } finally {
    loading.value = false
  }
}

const goToVendor = (id) => {
  if (id) router.push(`/store/vendor/${id}`)
}

const selectVariant = (variant) => {
  selectedVariant.value = variant
}

const buildCartItem = () => ({
  variantId: selectedVariant.value?.id || product.value.default_variant_id || product.value.id,
  productId: product.value.id,
  companyId: product.value.vendor?.id,
  companyName: product.value.vendor?.name,
  companyLogo: product.value.vendor?.logo,
  productName: product.value.name,
  variantSku: selectedVariant.value?.sku || product.value.sku,
  image: product.value.image || defaultImage,
  unitPrice: selectedVariant.value?.price || product.value.price,
  quantity: quantity.value,
  maxStock: product.value.quantity
})

const addToCart = async () => {
  if (!isAvailable.value) return
  addingToCart.value = true
  setTimeout(() => { addingToCart.value = false }, 600)
  cartStore.addItem(buildCartItem())
}

const buyNow = () => {
  if (!isAvailable.value) return
  cartStore.addItem(buildCartItem())
  cartStore.isDrawerOpen = false
  router.push('/store/checkout')
}

onMounted(() => { fetchProduct() })
</script>

<style scoped>
.product-detail-page {
  direction: rtl;
}

.sticky-images {
  position: sticky;
  top: 90px;
}

.main-image-wrapper {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

.main-product-img {
  border-radius: 20px;
}

.zoom-hint {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  color: white;
  border-radius: 50px;
  padding: 4px 12px;
  font-size: 11px;
  display: flex;
  align-items: center;
}

.thumbnails-row {
  padding-bottom: 4px;
}

.thumbnail-item {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.thumbnail-item:hover {
  border-color: #93c5fd;
}

.thumbnail-active {
  border-color: #1a73e8 !important;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.15);
}

.product-details-panel {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}

.vendor-chip {
  cursor: pointer;
}

.product-title {
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}

.detail-price {
  font-size: 36px;
  font-weight: 900;
  color: #e53935;
}

.detail-currency {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  margin-right: 4px;
}

.quantity-stepper {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  gap: 0;
}

.quantity-num {
  min-width: 48px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.trust-badges {
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.trust-badge {
  min-width: 140px;
}

.trust-icon {
  background: #eff6ff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.specs-table {
  border: 1px solid #f1f5f9 !important;
}

.spec-label {
  width: 40%;
  padding: 10px 16px !important;
  font-size: 13px;
  border-bottom: 1px solid #f8fafc !important;
}

.spec-value {
  padding: 10px 16px !important;
  font-size: 13px;
  border-bottom: 1px solid #f8fafc !important;
}

.rounded-2xl {
  border-radius: 20px !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
