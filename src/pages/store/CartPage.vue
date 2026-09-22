<template>
  <div class="cart-page" dir="rtl">
    <StoreNavbar />
    
    <v-main style="background: #f8fafc; min-height: 100vh;">
      <v-container style="max-width: 1200px;" class="py-8 py-md-12">
        
        <div class="d-flex align-center gap-3 mb-8">
          <div class="cart-icon-bg">
            <v-icon icon="ri-shopping-cart-2-line" color="primary" size="24"></v-icon>
          </div>
          <h1 class="text-h4 font-weight-black text-grey-darken-4 mb-0">سلة التسوق</h1>
        </div>

        <v-row v-if="!cartStore.isEmpty">
          <!-- قائمة المنتجات -->
          <v-col cols="12" md="8">
            <div class="d-flex flex-column gap-6">
              <v-card
                v-for="(group, index) in cartStore.groupedByVendor"
                :key="group.companyId"
                class="vendor-group-card"
                elevation="0"
              >
                <!-- Vendor Header -->
                <div class="vendor-header d-flex align-center gap-3 pa-4 px-sm-6 border-b">
                  <v-avatar size="36" class="border bg-white rounded-lg">
                    <v-img :src="group.companyLogo || 'https://placehold.co/150x150?text=Logo'"></v-img>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-bold mb-0">{{ group.companyName }}</h3>
                </div>
                
                <!-- Items -->
                <div class="pa-4 px-sm-6">
                  <div
                    v-for="(item, i) in group.items"
                    :key="item.variantId" 
                    class="d-flex flex-column flex-sm-row gap-4 py-4" 
                    :class="{ 'border-b': i !== group.items.length - 1 }"
                  >
                    
                    <!-- Item Image -->
                    <v-avatar size="100" class="rounded-xl flex-shrink-0 align-self-center align-self-sm-start border bg-white">
                      <v-img :src="item.image" cover></v-img>
                    </v-avatar>

                    <!-- Item Details -->
                    <div class="flex-grow-1 d-flex flex-column">
                      <div class="d-flex flex-column flex-sm-row justify-space-between align-start mb-4">
                        <div class="mb-2 mb-sm-0">
                          <h4 class="text-body-1 font-weight-bold mb-1">{{ item.productName }}</h4>
                          <div class="text-caption text-grey d-flex align-center gap-2">
                            <span v-if="item.variantSku">كود: {{ item.variantSku }}</span>
                            <v-chip v-if="item.maxStock && item.maxStock < 5" size="x-small" color="error" variant="flat">
                              باقي {{ item.maxStock }} فقط
                            </v-chip>
                          </div>
                        </div>
                        <div class="text-h6 font-weight-black text-primary text-start text-sm-end w-100 w-sm-auto">
                          {{ formatPrice(item.unitPrice) }} ج.م
                        </div>
                      </div>

                      <div class="d-flex justify-space-between align-end mt-auto">
                        <!-- Quantity Stepper -->
                        <div class="quantity-stepper d-flex align-center">
                          <v-btn
                            icon="ri-subtract-line"
                            size="small"
                            variant="outlined"
                            :disabled="item.quantity <= 1"
                            @click="cartStore.updateQuantity(item.variantId, item.quantity - 1)"
                            color="primary"
                          ></v-btn>
                          <span class="quantity-num">{{ item.quantity }}</span>
                          <v-btn
                            icon="ri-add-line"
                            size="small"
                            variant="outlined"
                            :disabled="item.quantity >= (item.maxStock || 999)"
                            @click="cartStore.updateQuantity(item.variantId, item.quantity + 1)"
                            color="primary"
                          ></v-btn>
                        </div>

                        <!-- Remove Button -->
                        <v-btn
                          color="error"
                          variant="tonal"
                          size="small"
                          prepend-icon="ri-delete-bin-line"
                          class="rounded-lg font-weight-bold"
                          @click="cartStore.removeItem(item.variantId)"
                        >
                          <span class="d-none d-sm-inline">إزالة</span>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
          </v-col>

          <!-- ملخص الطلب -->
          <v-col cols="12" md="4">
            <div class="order-summary-card">
              <v-card-title class="summary-header font-weight-bold">
                <v-icon icon="ri-file-list-3-line" class="me-2" color="primary"></v-icon>
                ملخص الطلب
              </v-card-title>
              
              <v-card-text class="pa-6 pt-4">
                <div class="d-flex justify-space-between mb-4 text-body-2">
                  <span class="text-grey-darken-1">عدد المنتجات</span>
                  <span class="font-weight-bold">{{ cartStore.itemCount }} منتجات</span>
                </div>
                
                <v-divider class="mb-4 border-dashed"></v-divider>
                
                <div class="d-flex justify-space-between align-center mb-6">
                  <span class="text-h6 font-weight-bold text-grey-darken-3">الإجمالي الكلي</span>
                  <div class="text-end">
                    <span class="summary-total">{{ formatPrice(cartStore.totalAmount) }}</span>
                    <span class="text-caption ms-1 text-grey">ج.م</span>
                  </div>
                </div>

                <v-btn
                  color="primary"
                  block
                  height="56"
                  class="font-weight-black rounded-xl mb-3 text-body-1"
                  to="/store/checkout"
                  elevation="2"
                >
                  إتمام عملية الشراء
                  <v-icon icon="ri-arrow-left-line" class="ms-2"></v-icon>
                </v-btn>
                <v-btn
                  variant="outlined"
                  block
                  height="50"
                  color="grey-darken-2"
                  to="/store"
                  class="font-weight-bold rounded-xl"
                >
                  الاستمرار في التسوق
                </v-btn>
              </v-card-text>
            </div>
          </v-col>
        </v-row>

        <!-- حالة فارغة -->
        <div v-else class="empty-state-card d-flex flex-column align-center justify-center text-center">
          <div class="empty-icon-bg mb-6">
            <v-icon icon="ri-shopping-cart-2-line" size="64" color="primary"></v-icon>
          </div>
          <h2 class="text-h4 font-weight-black text-grey-darken-4 mb-3">سلتك فارغة تماماً!</h2>
          <p class="text-body-1 text-grey mb-8" style="max-width: 400px;">
            اكتشف تشكيلتنا الواسعة من المنتجات الرائعة وأضف ما يعجبك إلى سلة التسوق الخاصة بك.
          </p>
          <v-btn
            color="primary"
            size="x-large"
            to="/store"
            class="font-weight-bold px-8 rounded-xl"
            elevation="2"
          >
            تصفح المنتجات الآن
            <v-icon icon="ri-arrow-left-line" class="ms-2"></v-icon>
          </v-btn>
        </div>

      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'

const cartStore = useCartStore()

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('ar-EG').format(Number(price))
}
</script>

<style scoped>
.cart-page {
  direction: rtl;
}

.cart-icon-bg {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vendor-group-card {
  background: white;
  border-radius: 20px !important;
  border: 1px solid #f1f5f9;
}

.vendor-header {
  background: #f8fafc;
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
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.order-summary-card {
  background: white;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  position: sticky;
  top: 90px;
}

.summary-header {
  padding: 24px 24px 16px !important;
  font-size: 18px !important;
  border-bottom: 1px solid #f8fafc;
}

.summary-total {
  font-size: 32px;
  font-weight: 900;
  color: #e53935;
  line-height: 1;
}

.border-dashed {
  border-style: dashed !important;
  border-color: #e2e8f0 !important;
}

.empty-state-card {
  background: white;
  border-radius: 32px;
  padding: 64px 24px;
  border: 1px solid #f1f5f9;
  min-height: 500px;
}

.empty-icon-bg {
  width: 120px;
  height: 120px;
  background: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
