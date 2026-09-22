<template>
  <v-card 
    class="product-card h-100 rounded-xl bg-white border-0 transition-swing overflow-hidden" 
    :class="{ 'd-flex flex-row': listView }"
    elevation="0"
    :to="`/store/products/${product.slug || product.id}`"
  >
    <!-- Card Image -->
    <div :class="listView ? 'w-25' : 'w-100'" class="position-relative bg-grey-lighten-4">
      <v-img
        :src="imageUrl"
        :aspect-ratio="1"
        cover
        class="w-100 h-100"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center h-100 bg-grey-lighten-4">
            <v-icon icon="ri-image-line" color="grey-lighten-1" size="48"></v-icon>
          </div>
        </template>
      </v-img>

      <!-- Status Badges -->
      <div class="position-absolute top-0 right-0 pa-2 w-100 d-flex justify-space-between pointer-events-none">
        <v-chip v-if="product.featured" color="warning" size="x-small" label class="font-weight-bold shadow-1">
          مميز
        </v-chip>
      </div>
    </div>

    <!-- Card Content -->
    <div class="d-flex flex-column flex-grow-1">
      <v-card-text class="pa-2 pa-sm-4 pb-1 pb-sm-2 d-flex flex-column flex-grow-1">
        
        <!-- Vendor Info -->
        <div class="d-flex align-center gap-1 mb-2" v-if="product.company">
          <v-avatar size="16" color="grey-lighten-2">
            <v-img v-if="product.company.logo?.url" :src="product.company.logo.url"></v-img>
            <v-icon v-else icon="ri-store-2-fill" size="10" color="grey-darken-1"></v-icon>
          </v-avatar>
          <span class="text-caption text-grey-darken-1 text-truncate">{{ product.company.name }}</span>
        </div>

        <!-- Product Title -->
        <h3 class="text-body-1 font-weight-bold text-truncate mb-1 text-grey-darken-4 line-clamp-2" :title="product.name" style="line-height: 1.4;">
          {{ product.name }}
        </h3>

        <div class="flex-grow-1"></div> <!-- Spacer -->

        <!-- Price -->
        <div class="d-flex align-center mt-3 mb-1">
          <span class="text-h6 font-weight-black text-primary">{{ formatPrice(price) }}</span>
          <span class="text-caption text-primary ms-1 font-weight-bold">ج.م</span>
        </div>

        <!-- Stock Status -->
        <div class="d-flex align-center mt-1">
          <v-icon :icon="inStock ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'" 
                  :color="inStock ? 'success' : 'error'" 
                  size="14" class="me-1"></v-icon>
          <span class="text-caption font-weight-medium" :class="inStock ? 'text-success' : 'text-error'">
            {{ inStock ? 'متوفر' : 'غير متوفر' }}
          </span>
        </div>
      </v-card-text>

      <!-- Card Actions -->
      <v-card-actions class="pa-2 pa-sm-4 pt-0 mt-auto d-flex flex-column flex-sm-row gap-2">
        <v-btn 
          color="primary" 
          variant="flat" 
          class="flex-grow-1 w-100 rounded-pill font-weight-bold ma-0" 
          @click.prevent="buyNow" 
          :disabled="!inStock"
        >
          شراء الآن
        </v-btn>
        
        <v-btn 
          color="primary" 
          variant="tonal" 
          class="flex-grow-1 w-100 rounded-pill ma-0" 
          @click.prevent="addToCart" 
          :loading="isAdding" 
          :disabled="!inStock"
        >
          السلة
        </v-btn>
      </v-card-actions>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  product: { type: Object, required: true },
  listView: { type: Boolean, default: false }
})

const router = useRouter()
const cartStore = useCartStore()
const isAdding = ref(false)

const imageUrl = computed(() => {
  return props.product.images?.[0]?.url || ''
})

const defaultVariant = computed(() => {
  if (!props.product.variants?.length) return null
  return props.product.variants.find(v => v.id === props.product.default_variant_id) || props.product.variants[0]
})

const price = computed(() => {
  return defaultVariant.value?.retail_price || 0
})

const inStock = computed(() => {
  if (!defaultVariant.value) return false
  const totalQty = defaultVariant.value.stocks?.reduce((sum, stock) => sum + (stock.quantity - stock.reserved), 0) || 0
  return totalQty > 0
})

const formatPrice = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })

const addToCart = async () => {
  if (!defaultVariant.value || !inStock.value) return
  isAdding.value = true
  
  const totalQty = defaultVariant.value.stocks?.reduce((sum, stock) => sum + (stock.quantity - stock.reserved), 0) || 0

  cartStore.addItem({
    productId: props.product.id,
    variantId: defaultVariant.value.id,
    productName: props.product.name,
    companyId: props.product.company?.id || props.product.company_id,
    companyName: props.product.company?.name || 'البائع',
    companyLogo: props.product.company?.logo?.url,
    unitPrice: price.value,
    image: imageUrl.value,
    quantity: 1,
    maxStock: totalQty
  })

  setTimeout(() => {
    isAdding.value = false
    cartStore.isDrawerOpen = true
  }, 400)
}

const buyNow = async () => {
  await addToCart()
  router.push('/store/checkout')
}
</script>

<style scoped>
.product-card {
  border: 1px solid #f1f5f9 !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
}
.product-card:hover {
  box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
  transform: translateY(-2px);
  border-color: #e2e8f0 !important;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.shadow-1 {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
