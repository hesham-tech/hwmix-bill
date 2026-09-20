<template>
  <div class="my-orders-page pb-10">
    <StoreNavbar />
    
    <v-main class="bg-grey-lighten-4 min-vh-100">
      <v-container class="max-w-1200 py-8">
        <h1 class="text-h3 font-weight-black mb-8">طلباتي</h1>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-6">{{ error }}</v-alert>

        <div v-if="loading" class="text-center py-16">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>

        <div v-else-if="orders.length > 0" class="d-flex flex-column gap-4">
          <v-card v-for="order in orders" :key="order.id" class="rounded-xl elevation-1 border">
            <div class="pa-4 pa-md-6 border-b bg-grey-lighten-5 d-flex flex-wrap justify-space-between align-center gap-4">
              <div>
                <div class="text-caption text-grey mb-1">الطلب #{{ order.id }}</div>
                <div class="font-weight-medium">{{ formatDate(order.created_at) }}</div>
              </div>
              <div class="text-start text-md-end">
                <div class="text-caption text-grey mb-1">الإجمالي</div>
                <div class="text-h6 font-weight-bold text-primary">{{ order.total_amount }} ج.م</div>
              </div>
              <div>
                <OrderStatusBadge :status="order.status" />
              </div>
            </div>

            <div class="pa-4 pa-md-6">
              <div class="d-flex flex-column gap-4">
                <div v-for="item in order.items" :key="item.id" class="d-flex gap-4">
                  <v-avatar size="64" rounded class="bg-grey-lighten-2 border">
                    <v-img :src="item.variant?.product?.images?.[0]?.url || 'https://placehold.co/150x150?text=Logo'"></v-img>
                  </v-avatar>
                  <div class="flex-grow-1 min-w-0">
                    <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ item.variant?.product?.name || 'منتج' }}</h4>
                    <div class="text-body-2 text-grey-darken-1 mb-1">المتجر: {{ item.company?.name || '---' }}</div>
                    <div class="d-flex justify-space-between align-center">
                      <span class="text-caption text-grey">الكمية: {{ item.quantity }}</span>
                      <span class="font-weight-bold">{{ item.total_price }} ج.م</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </div>

        <div v-else class="text-center py-16 bg-white rounded-xl elevation-1">
          <v-icon icon="ri-file-list-3-line" size="96" color="grey-lighten-2" class="mb-6"></v-icon>
          <h2 class="text-h4 font-weight-bold text-grey-darken-2 mb-4">لا توجد طلبات</h2>
          <p class="text-h6 text-grey mb-8">لم تقم بإجراء أي طلبات حتى الآن</p>
          <v-btn color="primary" size="x-large" to="/store" class="font-weight-bold px-8">
            تصفح المنتجات
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeOrdersApi } from '@/modules/store/api/storeOrders.api.js'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import OrderStatusBadge from '@/modules/store/components/OrderStatusBadge.vue'

const orders = ref([])
const loading = ref(true)
const error = ref(null)

const fetchOrders = async () => {
  try {
    const res = await storeOrdersApi.getOrders()
    orders.value = res.data?.data || res.data || []
  } catch (err) {
    error.value = 'تعذر تحميل قائمة الطلبات'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '---'
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.max-w-1200 { max-width: 1200px; }
.min-vh-100 { min-height: 100vh; }
.gap-4 { gap: 1rem; }
.min-w-0 { min-width: 0; }
</style>
