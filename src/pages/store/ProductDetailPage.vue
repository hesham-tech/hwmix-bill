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
                <div
                  class="main-image-wrapper mb-3"
                  style="cursor: zoom-in;"
                  @click="openLightbox(selectedImage)"
                >
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

                  <!-- Click hint -->
                  <div class="zoom-hint">
                    <v-icon icon="ri-fullscreen-line" size="14" class="me-1"></v-icon>
                    <span>اضغط للتكبير</span>
                  </div>
                </div>

                <!-- Thumbnails -->
                <div v-if="displayImages?.length > 0" class="thumbnails-row d-flex gap-2 overflow-x-auto">
                  <div
                    v-for="img in displayImages"
                    :key="img.id"
                    class="thumbnail-item flex-shrink-0"
                    :class="{ 'thumbnail-active': selectedImage === img.url }"
                    @click="selectedImage = img.url"
                    @mouseover="selectedImage = img.url"
                  >
                    <v-img :src="img.url" cover width="72" height="72" class="rounded-xl"></v-img>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- ===== Lightbox Overlay ===== -->
            <teleport to="body">
              <transition name="lightbox-fade">
                <div
                  v-if="lightboxOpen"
                  class="lightbox-overlay"
                  @click.self="closeLightbox"
                  @keydown.esc="closeLightbox"
                >
                  <!-- Close button -->
                  <button class="lightbox-close" @click="closeLightbox">
                    <v-icon icon="ri-close-line" size="28" color="white"></v-icon>
                  </button>

                  <!-- Image counter -->
                  <div v-if="displayImages.length > 1" class="lightbox-counter">
                    {{ lightboxIndex + 1 }} / {{ displayImages.length }}
                  </div>

                  <!-- Main lightbox image -->
                  <div class="lightbox-image-wrapper" @click.self="closeLightbox">
                    <img
                      :src="lightboxImages[lightboxIndex]"
                      class="lightbox-img"
                      @error="$event.target.src = defaultImage"
                    />
                  </div>

                  <!-- Navigation arrows (desktop) + dots (below) -->
                  <div v-if="displayImages.length > 1" class="lightbox-nav" @click.self="closeLightbox">
                    <!-- Prev arrow -->
                    <button
                      class="lightbox-arrow lightbox-arrow-prev"
                      :disabled="lightboxIndex === 0"
                      @click="lightboxIndex--"
                    >
                      <v-icon icon="ri-arrow-right-s-line" size="32" color="white"></v-icon>
                    </button>

                    <!-- Thumbnail dots -->
                    <div class="lightbox-dots" @click.self="closeLightbox">
                      <div
                        v-for="(img, i) in lightboxImages"
                        :key="i"
                        class="lightbox-dot"
                        :class="{ 'lightbox-dot-active': lightboxIndex === i }"
                        @click="lightboxIndex = i"
                      >
                        <img :src="img" />
                      </div>
                    </div>

                    <!-- Next arrow -->
                    <button
                      class="lightbox-arrow lightbox-arrow-next"
                      :disabled="lightboxIndex === lightboxImages.length - 1"
                      @click="lightboxIndex++"
                    >
                      <v-icon icon="ri-arrow-left-s-line" size="32" color="white"></v-icon>
                    </button>
                  </div>
                </div>
              </transition>
            </teleport>

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

                <!-- Title & Wishlist -->
                <div class="d-flex justify-space-between align-start mb-4">
                  <h1 class="product-title">{{ product.name }}</h1>
                  <v-btn
                    :icon="isFavorite ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
                    variant="tonal"
                    :color="isFavorite ? 'error' : 'grey-darken-2'"
                    @click="toggleFavorite"
                    class="ms-4 rounded-circle flex-shrink-0"
                  ></v-btn>
                </div>

                <!-- Price & Stock -->
                <div class="price-stock-row mb-6">
                  <div class="d-flex align-end gap-2 mb-2">
                    <span class="detail-price">{{ formatPrice(selectedVariant?.price || product.price) }}</span>
                    <span class="detail-currency mb-2">ج.م</span>
                  </div>
                  
                  <div class="d-flex align-center gap-3">
                    <v-chip
                      v-if="isAvailable"
                      color="success"
                      variant="flat"
                      size="small"
                      prepend-icon="ri-checkbox-circle-fill"
                    >
                      متوفر في المخزون
                    </v-chip>
                    <v-chip
                      v-else
                      color="error"
                      variant="flat"
                      size="small"
                      prepend-icon="ri-close-circle-fill"
                    >
                      نفذ المخزون
                    </v-chip>
                    <span class="text-caption text-grey">السعر شامل الضريبة</span>
                  </div>
                </div>

                <!-- Description -->
                <div class="product-desc mb-6" v-if="product.description || product.desc_long">
                  <div v-if="product.description" class="text-body-1 text-medium-emphasis mb-3" style="line-height: 1.7;" v-html="product.description"></div>
                  <div v-if="product.desc_long" class="text-body-1 text-medium-emphasis" style="line-height: 1.7;" v-html="product.desc_long"></div>
                </div>

                <v-divider class="mb-6"></v-divider>

                <!-- Variants (if multiple) -->
                <div v-if="product.variants?.length > 1" class="variants-section mb-6">
                  <div class="text-body-2 font-weight-bold mb-3">الخيار المتاح:</div>
                  <div class="d-flex flex-wrap gap-3">
                    <div
                      v-for="variant in product.variants"
                      :key="variant.id"
                      class="variant-box cursor-pointer d-flex align-center gap-2 px-3 py-2"
                      :class="{ 'variant-active': selectedVariant?.id === variant.id, 'variant-disabled': variant.available_stock <= 0 }"
                      @click="variant.available_stock > 0 ? selectVariant(variant) : null"
                    >
                      <v-img v-if="variant.image" :src="variant.image" width="40" height="40" cover class="rounded-sm flex-shrink-0"></v-img>
                      <div class="variant-info">
                        <div class="text-caption font-weight-bold mb-1">{{ variant.name }}</div>
                        <div class="text-body-2 font-weight-bold text-primary">{{ formatPrice(variant.price) }} ج.م</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quantity & Actions -->
                <div class="quantity-actions mb-6">
                  <div class="text-body-2 font-weight-bold mb-3">الكمية:</div>
                  <div class="d-flex flex-column flex-sm-row align-sm-center gap-4">
                    <!-- Quantity Stepper -->
                    <div class="d-flex align-center gap-3 flex-shrink-0">
                      <v-btn
                        icon="ri-add-line"
                        size="small"
                        variant="outlined"
                        class="rounded-lg"
                        :disabled="quantity >= (product.quantity || 99)"
                        @click="quantity++"
                        color="grey-darken-2"
                      ></v-btn>
                      <span class="quantity-num">{{ quantity }}</span>
                      <v-btn
                        icon="ri-subtract-line"
                        size="small"
                        variant="outlined"
                        class="rounded-lg"
                        :disabled="quantity <= 1"
                        @click="quantity = Math.max(1, quantity - 1)"
                        color="grey-darken-2"
                      ></v-btn>
                    </div>

                    <div class="d-flex flex-column flex-sm-row gap-3 flex-grow-1">
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
                      <tr v-if="selectedVariant?.barcode || product.barcode">
                        <td class="text-grey spec-label">الباركود</td>
                        <td class="font-weight-medium spec-value">{{ selectedVariant?.barcode || product.barcode }}</td>
                      </tr>
                      <tr v-if="product.brand?.name || product.brand">
                        <td class="text-grey spec-label">الماركة</td>
                        <td class="font-weight-medium spec-value">{{ product.brand?.name || product.brand }}</td>
                      </tr>
                      <tr v-if="product.category?.name">
                        <td class="text-grey spec-label">التصنيف</td>
                        <td class="font-weight-medium spec-value">{{ product.category?.name }}</td>
                      </tr>
                      <tr v-if="product.unit?.name || product.unit">
                        <td class="text-grey spec-label">وحدة القياس</td>
                        <td class="font-weight-medium spec-value">{{ product.unit?.name || product.unit }}</td>
                      </tr>

                      <tr v-if="selectedVariant?.dimensions || product.dimensions">
                        <td class="text-grey spec-label">الأبعاد</td>
                        <td class="font-weight-medium spec-value">{{ selectedVariant?.dimensions || product.dimensions }}</td>
                      </tr>
                      <tr v-if="selectedVariant?.warranty_days || product.warranty_days">
                        <td class="text-grey spec-label">الضمان</td>
                        <td class="font-weight-medium spec-value">{{ selectedVariant?.warranty_days || product.warranty_days }} يوم</td>
                      </tr>
                      <tr v-if="product.vendor?.name">
                        <td class="text-grey spec-label">البائع</td>
                        <td class="font-weight-medium spec-value">{{ product.vendor?.name }}</td>
                      </tr>
                      <tr v-for="attr in selectedVariant?.attributes || []" :key="attr.name">
                        <td class="text-grey spec-label">{{ attr.name }}</td>
                        <td class="font-weight-medium spec-value">{{ attr.value }}</td>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useHead } from '@vueuse/head'
import { storeProductsApi } from '@/modules/store/api/storeProducts.api.js'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import CartDrawer from '@/modules/store/components/CartDrawer.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const quantity = ref(1)
const selectedImage = ref(null)
const selectedVariant = ref(null)
const displayImages = ref([])
const addingToCart = ref(false)

// حالة الـ Lightbox
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const lightboxImages = computed(() => displayImages.value.map(img => img.url))

useHead({
  title: computed(() => product.value?.name ? `${product.value.name} - هونكس` : 'هونكس'),
  meta: [
    { name: 'description', content: computed(() => product.value?.description || 'وصف المنتج') },
    { property: 'og:title', content: computed(() => product.value?.name ? `${product.value.name} - هونكس` : 'هونكس') },
    { property: 'og:description', content: computed(() => product.value?.description || '') },
    { property: 'og:image', content: computed(() => product.value?.image || '') }
  ]
})

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

const isFavorite = computed(() => {
  return wishlistStore.items.some(i => i.productId === product.value?.id)
})

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('en-US').format(Number(price))
}

const fetchProduct = async () => {
  try {
    const res = await storeProductsApi.getProduct(route.params.id)
    product.value = res.data?.data || res.data
    selectedImage.value = product.value?.image || null
    if (product.value?.variants?.length > 0) {
      selectVariant(product.value.variants[0])
    } else {
      displayImages.value = product.value?.images || []
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

  // جمع صور المنتج الأصلية
  const productImages = product.value?.images || []

  if (variant.images && variant.images.length > 0) {
    // صور الفيرنت أولاً + صور المنتج الأصلية (تجنب التكرار)
    const variantImageUrls = new Set(variant.images.map(i => i.url))
    const extraProductImages = productImages.filter(i => !variantImageUrls.has(i.url))
    displayImages.value = [...variant.images, ...extraProductImages]
    selectedImage.value = variant.images[0].url
  } else if (variant.image) {
    // صورة الفيرنت الواحدة + صور المنتج
    const variantImg = { id: 'var-' + variant.id, url: variant.image }
    const extraProductImages = productImages.filter(i => i.url !== variant.image)
    displayImages.value = [variantImg, ...extraProductImages]
    selectedImage.value = variant.image
  } else {
    // لا توجد صور للفيرنت، اعرض صور المنتج
    displayImages.value = productImages
    selectedImage.value = product.value?.image || productImages[0]?.url || null
  }
}

const toggleFavorite = () => {
  if (!product.value) return
  if (isFavorite.value) {
    wishlistStore.removeItem(product.value.id)
  } else {
    wishlistStore.addItem({
      productId: product.value.id,
      name: product.value.name,
      image: product.value.image || defaultImage,
      price: product.value.price,
      discount: product.value.discount || 0
    })
  }
}

const openLightbox = (imageUrl) => {
  const idx = lightboxImages.value.indexOf(imageUrl)
  lightboxIndex.value = idx >= 0 ? idx : 0
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

// إغلاق الـ Lightbox بمفتاح Escape
const handleKeydown = (e) => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight' && lightboxIndex.value > 0) lightboxIndex.value--
  if (e.key === 'ArrowLeft' && lightboxIndex.value < lightboxImages.value.length - 1) lightboxIndex.value++
}

onMounted(() => {
  fetchProduct()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

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


</script>

<style scoped>
.product-detail-page {
  direction: rtl;
}

/* ===== Lightbox ===== */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.15); /* شفافية عالية جدا - يظهر ما في الخلفية بوضوح */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6); /* خلفية داكنة لتكون واضحة */
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
}
.lightbox-close:hover { background: rgba(0, 0, 0, 0.8); }

.lightbox-counter {
  margin-bottom: 8px; /* مسافة بسيطة فوق الصورة فقط */
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 12px;
  border-radius: 20px;
  flex-shrink: 0; /* منع الانضغاط */
}

.lightbox-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 75vh; /* ارتفاع ثابت لضمان عدم تحرك العناصر العلوية والسفلية */
}

.lightbox-img {
  max-width: 90vw;
  max-height: 100%; /* تتمدد بحد أقصى للارتفاع الثابت الخاص بالحاوية */
  object-fit: contain;
  border-radius: 12px;
  user-select: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); /* ظل للصورة لتمييزها عن الخلفية الشفافة */
}

/* Navigation bar below image */
.lightbox-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px; /* ملاصق للصورة من الأسفل */
  width: 100%;
  max-width: 700px;
  justify-content: center;
}

.lightbox-arrow {
  background: rgba(0, 0, 0, 0.6); /* خلفية داكنة للوضوح */
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.lightbox-arrow:hover:not(:disabled) { background: rgba(0, 0, 0, 0.8); }
.lightbox-arrow:disabled { opacity: 0.3; cursor: default; }

/* Thumbnail dots strip */
.lightbox-dots {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  max-width: 500px;
  padding: 4px;
  scrollbar-width: none;
}
.lightbox-dots::-webkit-scrollbar { display: none; }

.lightbox-dot {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.6;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.7); /* لون المكان اسود غامق */
  padding: 4px;
}
.lightbox-dot img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* تملا المكان المخصص للصور بالكامل */
  border-radius: 4px;
}
.lightbox-dot:hover { opacity: 0.85; }
.lightbox-dot-active {
  border-color: white;
  opacity: 1;
  background: rgba(0, 0, 0, 0.9);
}

/* Transition */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active { transition: opacity 0.25s ease; }
.lightbox-fade-enter-from,
.lightbox-fade-leave-to { opacity: 0; }

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
  transition: transform 0.1s ease-out;
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
  pointer-events: none;
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

.variant-box {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
  background: white;
}
.variant-box:hover:not(.variant-disabled) {
  border-color: #93c5fd;
}
.variant-active {
  border-color: #1a73e8 !important;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
  background: #f8fafc;
}
.variant-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  background: #f1f5f9;
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
