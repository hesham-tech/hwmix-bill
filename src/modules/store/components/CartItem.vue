<template>
  <div class="cart-item d-flex pa-3 border-b">
    <v-avatar size="60" rounded="lg" class="bg-grey-lighten-2 me-3">
      <v-img :src="item.image" cover></v-img>
    </v-avatar>
    
    <div class="flex-grow-1 d-flex flex-column min-w-0">
      <div class="d-flex justify-space-between align-start mb-1">
        <h4 class="text-subtitle-2 font-weight-bold text-truncate pr-2" :title="item.productName">
          {{ item.productName }}
        </h4>
        <v-btn
          icon="ri-delete-bin-line"
          size="x-small"
          color="error"
          variant="text"
          @click="cartStore.removeItem(item.variantId)"
        ></v-btn>
      </div>
      
      <div class="text-caption text-grey mb-2">{{ item.companyName }}</div>
      
      <div class="d-flex justify-space-between align-center mt-auto">
        <div class="text-primary font-weight-bold">{{ item.unitPrice }} ج.م</div>
        
        <div class="d-flex align-center border rounded pa-1">
          <v-btn
            icon="ri-subtract-line"
            size="x-small"
            variant="text"
            density="comfortable"
            @click="cartStore.updateQuantity(item.variantId, item.quantity - 1)"
          ></v-btn>
          <span class="px-2 text-body-2 font-weight-medium">{{ item.quantity }}</span>
          <v-btn
            icon="ri-add-line"
            size="x-small"
            variant="text"
            density="comfortable"
            @click="cartStore.updateQuantity(item.variantId, item.quantity + 1)"
            :disabled="item.quantity >= (item.maxStock || 999)"
          ></v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
</script>
