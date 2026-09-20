<template>
  <div class="cart-page pb-10">
    <StoreNavbar />
    
    <v-main class="bg-grey-lighten-4 min-vh-100">
      <v-container class="max-w-1200 py-8">
        <h1 class="text-h3 font-weight-black mb-8">سلة التسوق</h1>

        <v-row v-if="!cartStore.isEmpty">
          <!-- قائمة المنتجات -->
          <v-col cols="12" md="8">
            <v-card class="rounded-xl overflow-hidden elevation-1 mb-6">
              <div v-for="(group, index) in cartStore.groupedByVendor" :key="group.companyId">
                <div class="px-6 py-4 bg-grey-lighten-4 border-b d-flex align-center gap-3">
                  <v-avatar size="32" class="border bg-white">
                    <v-img :src="group.companyLogo || 'https://placehold.co/150x150?text=Logo'"></v-img>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-bold mb-0">{{ group.companyName }}</h3>
                </div>
                
                <div class="pa-4">
                  <div v-for="(item, i) in group.items" :key="item.variantId" 
                       class="d-flex gap-4 py-4" 
                       :class="{ 'border-b': i !== group.items.length - 1 }">
                    
                    <v-avatar size="100" rounded="lg" class="bg-grey-lighten-2 flex-shrink-0">
                      <v-img :src="item.image" cover></v-img>
                    </v-avatar>

                    <div class="flex-grow-1 d-flex flex-column">
                      <div class="d-flex justify-space-between align-start mb-2">
                        <div>
                          <h4 class="text-h6 font-weight-bold mb-1">{{ item.productName }}</h4>
                          <div class="text-caption text-grey" v-if="item.variantSku">SKU: {{ item.variantSku }}</div>
                        </div>
                        <div class="text-h6 font-weight-black text-primary">{{ item.unitPrice }} ج.م</div>
                      </div>

                      <div class="d-flex justify-space-between align-end mt-auto">
                        <div class="d-flex align-center border rounded pa-1">
                          <v-btn icon="ri-subtract-line" size="small" variant="text" @click="cartStore.updateQuantity(item.variantId, item.quantity - 1)"></v-btn>
                          <span class="px-4 text-h6 font-weight-medium">{{ item.quantity }}</span>
                          <v-btn icon="ri-add-line" size="small" variant="text" @click="cartStore.updateQuantity(item.variantId, item.quantity + 1)" :disabled="item.quantity >= (item.maxStock || 999)"></v-btn>
                        </div>
                        <v-btn color="error" variant="text" prepend-icon="ri-delete-bin-line" @click="cartStore.removeItem(item.variantId)">
                          حذف
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- ملخص الطلب -->
          <v-col cols="12" md="4">
            <v-card class="rounded-xl elevation-1 position-sticky" style="top: 24px">
              <v-card-title class="text-h5 font-weight-bold pa-6 pb-2">ملخص الطلب</v-card-title>
              <v-card-text class="pa-6">
                <div class="d-flex justify-space-between mb-4 text-body-1">
                  <span class="text-grey-darken-1">عدد المنتجات</span>
                  <span class="font-weight-medium">{{ cartStore.itemCount }} منتج</span>
                </div>
                
                <v-divider class="my-4"></v-divider>
                
                <div class="d-flex justify-space-between align-center mb-6">
                  <span class="text-h6 font-weight-bold">الإجمالي</span>
                  <span class="text-h4 font-weight-black text-primary">{{ cartStore.totalAmount }} ج.م</span>
                </div>

                <v-btn color="primary" block size="x-large" class="font-weight-bold rounded-lg mb-4" to="/store/checkout">
                  متابعة لإتمام الطلب
                </v-btn>
                <v-btn variant="text" block color="grey-darken-1" to="/store">
                  الاستمرار في التسوق
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- حالة فارغة -->
        <div v-else class="text-center py-16 bg-white rounded-xl elevation-1">
          <v-icon icon="ri-shopping-cart-2-line" size="96" color="grey-lighten-2" class="mb-6"></v-icon>
          <h2 class="text-h4 font-weight-bold text-grey-darken-2 mb-4">سلة التسوق فارغة</h2>
          <p class="text-h6 text-grey mb-8">لم تقم بإضافة أي منتجات إلى سلتك حتى الآن</p>
          <v-btn color="primary" size="x-large" to="/store" class="font-weight-bold px-8">
            تصفح المنتجات
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
</script>

<style scoped>
.max-w-1200 { max-width: 1200px; }
.min-vh-100 { min-height: 100vh; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
</style>
