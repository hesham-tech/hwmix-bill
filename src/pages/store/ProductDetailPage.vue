<template>
  <div class="product-detail-page pb-10">
    <StoreNavbar />
    
    <v-main class="bg-grey-lighten-4 min-vh-100">
      <v-container class="max-w-1200 py-8">
        <v-btn variant="text" prepend-icon="ri-arrow-right-line" class="mb-6 px-0" @click="$router.back()">
          العودة
        </v-btn>

        <div v-if="loading" class="d-flex justify-center py-16">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>

        <v-alert v-else-if="error" type="error" variant="tonal">{{ error }}</v-alert>

        <v-row v-else-if="product">
          <!-- الصور -->
          <v-col cols="12" md="6">
            <v-card elevation="0" class="rounded-xl overflow-hidden bg-white pa-4">
              <v-img 
                :src="selectedImage || defaultImage" 
                height="400" 
                contain
                class="bg-grey-lighten-4 rounded-lg mb-4"
              ></v-img>
              <div class="d-flex gap-2 overflow-x-auto pb-2" v-if="product.images?.length > 1">
                <v-card 
                  v-for="img in product.images" 
                  :key="img.id"
                  width="80" 
                  height="80" 
                  class="flex-shrink-0 cursor-pointer border"
                  :class="{ 'border-primary border-opacity-100': selectedImage === img.url }"
                  @click="selectedImage = img.url"
                  flat
                >
                  <v-img :src="img.url" cover height="100%"></v-img>
                </v-card>
              </div>
            </v-card>
          </v-col>

            <!-- التفاصيل -->
            <v-col cols="12" md="6">
              <div class="ps-md-6">
                <h1 class="text-h3 font-weight-black mb-2">{{ product.name }}</h1>
                <div class="mb-6 d-flex align-center gap-2">
                  <span class="text-subtitle-1 text-grey">بواسطة:</span>
                  <div @click="goToVendor(product.vendor?.id)" style="cursor:pointer">
                    <SellerBadge v-if="product.vendor" :company="product.vendor" />
                    <span v-else class="text-subtitle-1 text-grey font-weight-bold">غير محدد</span>
                  </div>
                </div>
              
              <div class="d-flex align-center gap-4 mb-6">
                <div class="text-h4 font-weight-bold text-primary">{{ product.price }} ج.م</div>
                <StockBadge v-if="product.stock_status" :status="product.stock_status" />
              </div>

              <div class="text-body-1 text-grey-darken-1 mb-8">
                {{ product.description || 'لا يوجد وصف متاح لهذا المنتج.' }}
              </div>

              <v-divider class="mb-8"></v-divider>

              <div class="d-flex gap-4 align-center mb-8">
                <div style="width: 150px">
                  <v-text-field
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    :max="product.quantity || 1"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    label="الكمية"
                  >
                    <template v-slot:append-inner>
                      <div class="d-flex flex-column" style="margin-top:-8px; margin-bottom:-8px">
                        <v-icon icon="ri-arrow-up-s-line" size="small" @click="quantity++" :disabled="quantity >= product.quantity"></v-icon>
                        <v-icon icon="ri-arrow-down-s-line" size="small" @click="quantity > 1 ? quantity-- : null"></v-icon>
                      </div>
                    </template>
                  </v-text-field>
                </div>
                <v-btn
                  color="primary"
                  size="x-large"
                  class="flex-grow-1 font-weight-bold"
                  prepend-icon="ri-shopping-cart-add-line"
                  @click="addToCart"
                  :disabled="!isAvailable"
                  variant="outlined"
                >
                  أضف للسلة
                </v-btn>
                <v-btn
                  color="primary"
                  size="x-large"
                  class="flex-grow-1 font-weight-bold"
                  prepend-icon="ri-money-dollar-circle-line"
                  @click="buyNow"
                  :disabled="!isAvailable"
                  elevation="2"
                >
                  شراء الآن
                </v-btn>
              </div>

              <!-- تفاصيل إضافية -->
              <v-card variant="outlined" class="rounded-lg">
                <v-list lines="one">
                  <v-list-item v-if="product.sku" prepend-icon="ri-barcode-line" title="رمز المنتج (SKU)">
                    <template v-slot:append><span class="text-medium-emphasis">{{ product.sku }}</span></template>
                  </v-list-item>
                  <v-list-item prepend-icon="ri-archive-line" title="التصنيف">
                    <template v-slot:append><span class="text-medium-emphasis">{{ product.category?.name || 'غير محدد' }}</span></template>
                  </v-list-item>
                </v-list>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { storeProductsApi } from '@/modules/store/api/storeProducts.api.js'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import StockBadge from '@/modules/store/components/StockBadge.vue'
import SellerBadge from '@/modules/store/components/SellerBadge.vue'
import CartDrawer from '@/modules/store/components/CartDrawer.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const quantity = ref(1)
const selectedImage = ref(null)

const defaultImage = 'https://placehold.co/600x600?text=No+Image'

const isAvailable = computed(() => {
  return product.value && (product.value.stock_status === 'in_stock' || product.value.quantity > 0)
})

const fetchProduct = async () => {
  try {
    const res = await storeProductsApi.getProduct(route.params.id)
    product.value = res.data?.data || res.data
    if (product.value.image) {
      selectedImage.value = product.value.image
    }
  } catch (err) {
    error.value = 'تعذر تحميل بيانات المنتج'
  } finally {
    loading.value = false
  }
}

const goToVendor = (id) => {
  if (id) router.push(`/store/vendor/${id}`)
}

const addToCart = () => {
  if (!isAvailable.value) return
  cartStore.addItem({
    variantId: product.value.default_variant_id || product.value.id,
    productId: product.value.id,
    companyId: product.value.vendor?.id,
    companyName: product.value.vendor?.name,
    companyLogo: product.value.vendor?.logo,
    productName: product.value.name,
    variantSku: product.value.sku,
    image: product.value.image || defaultImage,
    unitPrice: product.value.price,
    quantity: quantity.value,
    maxStock: product.value.quantity
  })
}

const buyNow = () => {
  if (!isAvailable.value) return
  cartStore.addItem({
    variantId: product.value.default_variant_id || product.value.id,
    productId: product.value.id,
    companyId: product.value.vendor?.id,
    companyName: product.value.vendor?.name,
    companyLogo: product.value.vendor?.logo,
    productName: product.value.name,
    variantSku: product.value.sku,
    image: product.value.image || defaultImage,
    unitPrice: product.value.price,
    quantity: quantity.value,
    maxStock: product.value.quantity
  })
  cartStore.isDrawerOpen = false
  router.push('/store/checkout')
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.max-w-1200 { max-width: 1200px; }
.min-vh-100 { min-height: 100vh; }
.gap-4 { gap: 1rem; }
.gap-2 { gap: 0.5rem; }
</style>
