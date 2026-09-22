<template>
  <v-navigation-drawer
    v-model="cartStore.isDrawerOpen"
    location="left"
    temporary
    width="420"
    dir="rtl"
  >
    <div class="cart-drawer d-flex flex-column h-100">

      <!-- Header -->
      <div class="cart-header pa-5 d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-3">
          <div class="cart-icon-bg">
            <v-icon icon="ri-shopping-bag-3-line" color="white" size="20"></v-icon>
          </div>
          <div>
            <h2 class="text-h6 font-weight-bold mb-0">سلة التسوق</h2>
            <p class="text-caption text-grey mb-0">{{ cartStore.itemCount }} منتج</p>
          </div>
        </div>
        <v-btn icon="ri-close-line" variant="tonal" size="small" @click="cartStore.toggleDrawer" color="grey"></v-btn>
      </div>

      <v-divider></v-divider>

      <!-- Cart Content -->
      <div class="cart-body flex-grow-1 overflow-y-auto">

        <!-- Empty State -->
        <div v-if="cartStore.isEmpty" class="empty-cart d-flex flex-column align-center justify-center pa-8 text-center h-100">
          <div class="empty-cart-icon mb-6">
            <v-icon icon="ri-shopping-cart-2-line" size="56" color="grey-lighten-2"></v-icon>
          </div>
          <h3 class="text-h6 font-weight-medium text-grey-darken-1 mb-2">سلتك فارغة!</h3>
          <p class="text-body-2 text-grey mb-6">أضف بعض المنتجات الرائعة للبدء في التسوق</p>
          <v-btn
            color="primary"
            variant="outlined"
            rounded="pill"
            @click="cartStore.toggleDrawer"
            prepend-icon="ri-store-2-line"
          >
            تصفح المنتجات
          </v-btn>
        </div>

        <!-- Items -->
        <div v-else>
          <!-- Group by Vendor -->
          <div v-for="group in cartStore.groupedByVendor" :key="group.companyId" class="vendor-group mb-2">
            <!-- Vendor Header -->
            <div class="vendor-header d-flex align-center gap-2 px-4 py-3">
              <v-avatar size="24" class="border" style="border: 1px solid #e2e8f0;">
                <v-img :src="group.companyLogo || 'https://placehold.co/50x50?text=S'" cover></v-img>
              </v-avatar>
              <span class="text-body-2 font-weight-semibold">{{ group.companyName }}</span>
              <v-spacer></v-spacer>
              <span class="text-caption text-grey">{{ formatPrice(group.subtotal) }} ج.م</span>
            </div>

            <!-- Cart Items -->
            <div v-for="item in group.items" :key="item.variantId" class="cart-item px-4 py-3">
              <div class="d-flex gap-3">
                <!-- Image -->
                <div class="item-image-wrapper flex-shrink-0">
                  <v-img
                    :src="item.image"
                    width="72"
                    height="72"
                    cover
                    class="rounded-xl"
                  ></v-img>
                </div>

                <!-- Details -->
                <div class="item-details flex-grow-1 min-width-0">
                  <p class="item-name mb-1">{{ item.productName }}</p>
                  <p v-if="item.variantSku" class="text-caption text-grey mb-2">SKU: {{ item.variantSku }}</p>

                  <div class="d-flex align-center justify-space-between">
                    <!-- Quantity Controls -->
                    <div class="qty-control d-flex align-center">
                      <v-btn
                        icon="ri-subtract-line"
                        size="x-small"
                        variant="outlined"
                        color="primary"
                        @click="cartStore.updateQuantity(item.variantId, item.quantity - 1)"
                      ></v-btn>
                      <span class="qty-num">{{ item.quantity }}</span>
                      <v-btn
                        icon="ri-add-line"
                        size="x-small"
                        variant="outlined"
                        color="primary"
                        @click="cartStore.updateQuantity(item.variantId, item.quantity + 1)"
                        :disabled="item.quantity >= item.maxStock"
                      ></v-btn>
                    </div>

                    <!-- Price -->
                    <span class="item-price">{{ formatPrice(Number(item.unitPrice) * Number(item.quantity)) }} <span class="text-caption text-grey">ج.م</span></span>
                  </div>
                </div>

                <!-- Remove -->
                <v-btn
                  icon="ri-delete-bin-6-line"
                  size="x-small"
                  variant="text"
                  color="error"
                  class="flex-shrink-0 mt-n1 me-n2"
                  @click="cartStore.removeItem(item.variantId)"
                ></v-btn>
              </div>
            </div>

            <v-divider></v-divider>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="!cartStore.isEmpty" class="cart-footer pa-5">
        <!-- Summary -->
        <div class="summary-box rounded-xl pa-4 mb-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2 text-grey">المجموع الفرعي</span>
            <span class="text-body-2 font-weight-medium">{{ formatPrice(cartStore.totalAmount) }} ج.م</span>
          </div>
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2 text-grey">الشحن</span>
            <span class="text-body-2 text-success font-weight-medium">مجاني</span>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-1 font-weight-bold">الإجمالي</span>
            <span class="total-amount">{{ formatPrice(cartStore.totalAmount) }} <span class="text-body-2">ج.م</span></span>
          </div>
        </div>

        <!-- Actions -->
        <v-btn
          color="primary"
          block
          size="large"
          class="font-weight-bold rounded-xl mb-3"
          height="52"
          elevation="2"
          @click="goToCheckout"
          prepend-icon="ri-secure-payment-line"
        >
          إتمام الشراء
        </v-btn>
        <v-btn
          variant="text"
          block
          color="grey"
          @click="cartStore.toggleDrawer"
          size="small"
        >
          متابعة التسوق
        </v-btn>
      </div>

    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('ar-EG').format(Number(price))
}

const goToCheckout = () => {
  cartStore.isDrawerOpen = false
  router.push('/store/checkout')
}
</script>

<style scoped>
.cart-drawer {
  background: white;
}

.cart-header {
  background: white;
}

.cart-icon-bg {
  background: linear-gradient(135deg, #1a73e8, #6c47ff);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cart-body {
  background: #fafafa;
}

.empty-cart {
  min-height: 400px;
}

.empty-cart-icon {
  width: 100px;
  height: 100px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vendor-group {
  background: white;
  border-radius: 0;
}

.vendor-header {
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.cart-item {
  transition: background 0.15s;
}

.cart-item:hover {
  background: #fafafa;
}

.item-image-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.qty-control {
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  gap: 0;
  overflow: hidden;
}

.qty-num {
  min-width: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
}

.item-price {
  font-size: 16px;
  font-weight: 800;
  color: #e53935;
}

.cart-footer {
  border-top: 1px solid #f1f5f9;
  background: white;
}

.summary-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.total-amount {
  font-size: 22px;
  font-weight: 900;
  color: #e53935;
}

.min-width-0 {
  min-width: 0;
}
</style>
