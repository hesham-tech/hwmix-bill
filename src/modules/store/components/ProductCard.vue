<template>
  <v-card 
    class="product-card h-100 rounded-xl bg-white border-0 transition-swing overflow-hidden d-flex flex-column" 
    :class="{ 'flex-row': listView }"
    elevation="0"
    :to="`/store/product/${product.slug || product.id}`"
  >
    <!-- Card Image -->
    <div :class="listView ? 'w-25' : 'w-100'" class="position-relative bg-grey-lighten-5">
      <v-img
        :src="imageUrl"
        :aspect-ratio="1"
        cover
        class="w-100 h-100"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center h-100 bg-grey-lighten-4">
            <v-icon icon="ri-image-2-line" color="grey-lighten-1" size="48"></v-icon>
          </div>
        </template>
      </v-img>

      <!-- Status Badges & Wishlist -->
      <div class="position-absolute top-0 left-0 right-0 pa-2 w-100 d-flex justify-space-between align-start pointer-events-none">
        <div class="d-flex flex-column gap-1">
          <v-chip v-if="product.featured" color="warning" size="small" label class="font-weight-bold shadow-1 rounded-lg w-auto">
            مميز
          </v-chip>
          <v-chip v-if="product.discount > 0" color="error" size="small" label class="font-weight-bold shadow-1 rounded-lg w-auto">
            خصم
          </v-chip>
        </div>
        <v-btn
          :icon="isFavorite ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
          variant="flat"
          size="small"
          :color="isFavorite ? 'error' : 'white'"
          class="shadow-1"
          :class="isFavorite ? 'text-white' : 'text-grey-darken-2'"
          style="pointer-events: auto;"
          @click.prevent="toggleFavorite"
        ></v-btn>
      </div>
    </div>

    <!-- Card Content -->
    <div class="d-flex flex-column flex-grow-1 pa-4">
        <!-- Vendor Info -->
        <div class="d-flex align-center gap-2 mb-2" v-if="product.company || product.vendor">
          <v-avatar size="24" color="grey-lighten-4" class="border">
            <v-img v-if="product.company?.logo?.url || product.vendor?.logo" :src="product.company?.logo?.url || product.vendor?.logo"></v-img>
            <v-icon v-else icon="ri-store-2-fill" size="14" color="grey-darken-1"></v-icon>
          </v-avatar>
          <span class="text-caption text-grey-darken-2 font-weight-medium text-truncate">{{ product.company?.name || product.vendor?.name }}</span>
        </div>

        <!-- Product Title -->
        <h3 class="text-body-1 font-weight-bold text-truncate mb-1 text-grey-darken-4 line-clamp-2" :title="product.name" style="line-height: 1.5; text-align: right;">
          {{ product.name }}
        </h3>

        <!-- Rating -->
        <div class="d-flex align-center gap-1 mb-2">
          <v-rating
            :model-value="product.rating || 0"
            color="amber"
            density="compact"
            size="x-small"
            half-increments
            readonly
          ></v-rating>
          <span class="text-caption text-grey-darken-1">({{ product.reviews_count || 0 }})</span>
        </div>

        <!-- Description (List View Only) -->
        <p v-if="listView && product.description" class="text-body-2 text-grey-darken-2 mb-2 line-clamp-2" style="text-align: right;">
          {{ product.description }}
        </p>

        <div class="flex-grow-1"></div> <!-- Spacer -->

        <!-- Price -->
        <div class="d-flex align-center flex-wrap gap-2 mt-2 mb-2">
          <div class="d-flex align-end">
            <span class="text-h6 font-weight-black text-primary">{{ formatPrice(price) }}</span>
            <span class="text-caption text-primary ms-1 font-weight-bold mb-1">ج.م</span>
          </div>
          <div v-if="product.old_price > price" class="d-flex align-end text-decoration-line-through text-grey-darken-1">
            <span class="text-body-2">{{ formatPrice(product.old_price) }}</span>
            <span class="text-caption ms-1 mb-1">ج.م</span>
          </div>
        </div>

        <!-- Stock Status -->
        <div class="d-flex align-center mb-4">
          <v-icon :icon="inStock ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'" 
                  :color="inStock ? 'success' : 'error'" 
                  size="16" class="me-1"></v-icon>
          <span class="text-caption font-weight-bold" :class="inStock ? 'text-success' : 'text-error'">
            {{ inStock ? 'متوفر' : 'غير متوفر' }}
          </span>
        </div>

      <!-- Card Actions -->
      <div class="d-flex flex-column gap-2 mt-auto">
        <v-btn 
          color="primary" 
          variant="flat" 
          class="w-100 rounded-xl font-weight-bold" 
          height="40"
          @click.prevent="buyNow" 
          :disabled="!inStock"
        >
          شراء الآن
        </v-btn>
        
        <v-btn 
          color="primary" 
          variant="tonal" 
          class="w-100 rounded-xl font-weight-bold" 
          height="40"
          @click.prevent="addToCart" 
          :loading="isAdding" 
          :disabled="!inStock"
        >
          <v-icon icon="ri-shopping-cart-2-line" class="me-2"></v-icon>
          أضف للسلة
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

const props = defineProps({
  product: { type: Object, required: true },
  listView: { type: Boolean, default: false }
})

const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const isAdding = ref(false)

const imageUrl = computed(() => {
  return props.product.image || props.product.images?.[0]?.url || ''
})

const defaultVariant = computed(() => {
  if (!props.product.variants?.length) return null
  return props.product.variants.find(v => v.id === props.product.default_variant_id) || props.product.variants[0]
})

const price = computed(() => {
  return props.product.price || defaultVariant.value?.price || 0
})

const inStock = computed(() => {
  if (props.product.stock_status) return props.product.stock_status === 'in_stock'
  if (props.product.quantity !== undefined) return props.product.quantity > 0
  
  if (!defaultVariant.value) return false
  return (defaultVariant.value.available_stock || 0) > 0
})

const isFavorite = computed(() => {
  return wishlistStore.isFavorite(props.product.id)
})

const formatPrice = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 })

const toggleFavorite = () => {
  wishlistStore.toggle(props.product.id)
}

const addToCart = async () => {
  if (!defaultVariant.value || !inStock.value) return
  isAdding.value = true
  
  const totalQty = props.product.quantity ?? defaultVariant.value.available_stock ?? 1

  cartStore.addItem({
    productId: props.product.id,
    variantId: defaultVariant.value.id,
    productName: props.product.name,
    companyId: props.product.company?.id || props.product.company_id || props.product.vendor?.id,
    companyName: props.product.company?.name || props.product.vendor?.name || 'البائع',
    companyLogo: props.product.company?.logo?.url || props.product.vendor?.logo,
    unitPrice: defaultVariant.value.price || price.value,
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
