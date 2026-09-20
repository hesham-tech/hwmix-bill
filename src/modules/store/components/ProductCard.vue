<template>
  <v-card class="product-card h-100 d-flex flex-column" elevation="2" rounded="lg" hover @click="goToDetails">
    <!-- صورة المنتج -->
    <v-img
      :src="product.image || defaultImage"
      height="200"
      cover
      class="bg-grey-lighten-2 align-end"
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular color="primary" indeterminate></v-progress-circular>
        </div>
      </template>
      <template v-slot:error>
        <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3 text-grey">
          <v-icon size="48" icon="ri-image-line"></v-icon>
        </div>
      </template>
      <StockBadge v-if="product.stock_status" :status="product.stock_status" class="ma-2" />
    </v-img>

    <v-card-text class="flex-grow-1">
      <h3 class="text-h6 font-weight-bold text-truncate mb-1" :title="product.name">
        {{ product.name }}
      </h3>
      <div class="text-caption text-grey mb-3 d-flex align-center gap-1">
        <span>بواسطة:</span>
        <SellerBadge v-if="product.vendor" :company="product.vendor" />
        <span v-else class="font-weight-bold">غير محدد</span>
      </div>
      <div class="d-flex align-center justify-space-between mt-auto">
        <div>
          <span class="text-h6 text-primary font-weight-black">{{ product.price }}</span>
          <span class="text-caption text-grey ml-1">ج.م</span>
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="px-4 pb-4">
      <v-btn
        color="primary"
        variant="elevated"
        block
        prepend-icon="ri-shopping-cart-line"
        @click.stop="addToCart"
        :disabled="!isAvailable"
      >
        أضف للسلة
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import StockBadge from './StockBadge.vue'
import SellerBadge from './SellerBadge.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const defaultImage = 'https://placehold.co/400x300?text=No+Image'
const router = useRouter()
const cartStore = useCartStore()

const isAvailable = computed(() => {
  return props.product.stock_status === 'in_stock' || props.product.quantity > 0
})

const goToDetails = () => {
  router.push(`/store/product/${props.product.id}`)
}

const addToCart = () => {
  if (!isAvailable.value) return
  
  cartStore.addItem({
    variantId: props.product.default_variant_id || props.product.id,
    productId: props.product.id,
    companyId: props.product.vendor?.id,
    companyName: props.product.vendor?.name,
    companyLogo: props.product.vendor?.logo,
    productName: props.product.name,
    variantSku: props.product.sku,
    image: props.product.image || defaultImage,
    unitPrice: props.product.price,
    quantity: 1,
    maxStock: props.product.quantity
  })
}
</script>

<style scoped>
.product-card {
  transition: transform 0.2s;
}
.product-card:hover {
  transform: translateY(-4px);
}
</style>
