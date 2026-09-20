<template>
  <v-navigation-drawer
    v-model="cartStore.isDrawerOpen"
    location="end"
    temporary
    width="400"
    class="cart-drawer"
  >
    <div class="d-flex flex-column h-100">
      <!-- Header -->
      <div class="pa-4 d-flex align-center justify-space-between border-b bg-grey-lighten-4">
        <div class="d-flex align-center">
          <v-icon icon="ri-shopping-cart-line" class="me-2" color="primary"></v-icon>
          <h2 class="text-h6 mb-0 font-weight-bold">السلة</h2>
          <v-chip size="small" color="primary" class="ms-2 font-weight-bold">{{ cartStore.itemCount }}</v-chip>
        </div>
        <v-btn icon="ri-close-line" variant="text" density="comfortable" @click="cartStore.toggleDrawer"></v-btn>
      </div>

      <!-- Content -->
      <div class="flex-grow-1 overflow-y-auto bg-white">
        <template v-if="!cartStore.isEmpty">
          <div v-for="group in cartStore.groupedByVendor" :key="group.companyId" class="mb-4">
            <div class="px-4 py-2 bg-grey-lighten-5 text-subtitle-2 font-weight-bold d-flex align-center">
              <v-avatar size="24" class="me-2 border bg-white">
                <v-img :src="group.companyLogo || 'https://placehold.co/150x150?text=Logo'" />
              </v-avatar>
              {{ group.companyName }}
            </div>
            <CartItem v-for="item in group.items" :key="item.variantId" :item="item" />
          </div>
        </template>
        <div v-else class="h-100 d-flex flex-column align-center justify-center pa-6 text-center text-grey">
          <v-icon icon="ri-shopping-cart-2-line" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
          <h3 class="text-h6 mb-2">السلة فارغة</h3>
          <p class="text-body-2">أضف بعض المنتجات لتتمكن من إتمام الطلب</p>
          <v-btn color="primary" variant="outlined" class="mt-4" @click="cartStore.toggleDrawer">
            متابعة التسوق
          </v-btn>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="!cartStore.isEmpty" class="pa-4 border-t bg-white elevation-4">
        <div class="d-flex justify-space-between align-center mb-4">
          <span class="text-subtitle-1 font-weight-medium">الإجمالي:</span>
          <span class="text-h5 font-weight-black text-primary">{{ cartStore.totalAmount }} ج.م</span>
        </div>
        <v-btn
          color="primary"
          block
          size="large"
          class="font-weight-bold"
          @click="goToCheckout"
        >
          إتمام الطلب
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import CartItem from './CartItem.vue'

const router = useRouter()
const cartStore = useCartStore()

const goToCheckout = () => {
  cartStore.isDrawerOpen = false
  router.push('/store/cart')
}
</script>

<style scoped>
.cart-drawer {
  z-index: 1000 !important;
}
</style>
