<template>
  <div class="my-orders-page" dir="rtl">
    <StoreNavbar />

    <v-main style="background: #f8fafc; min-height: 100vh;">
      <v-container style="max-width: 1100px;" class="py-8 py-md-12">

        <!-- Page Header -->
        <div class="page-header mb-8">
          <h1 class="page-title">طلباتي</h1>
          <p class="page-sub text-grey">متابعة ومراجعة جميع طلباتك</p>
        </div>

        <!-- Filter Tabs -->
        <div class="order-tabs mb-8">
          <div class="d-flex gap-2 overflow-x-auto pb-2">
            <v-chip
              v-for="tab in statusTabs"
              :key="tab.value"
              :color="activeTab === tab.value ? 'primary' : 'default'"
              :variant="activeTab === tab.value ? 'flat' : 'outlined'"
              class="tab-chip cursor-pointer font-weight-medium"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </v-chip>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="d-flex flex-column gap-4">
          <v-skeleton-loader
            v-for="i in 3"
            :key="i"
            type="card"
            class="rounded-2xl"
            height="160"
          ></v-skeleton-loader>
        </div>

        <!-- Error -->
        <v-alert v-else-if="error" type="error" variant="tonal" rounded="xl">{{ error }}</v-alert>

        <!-- Empty State -->
        <div v-else-if="filteredOrders.length === 0" class="empty-orders text-center py-16">
          <div class="empty-icon mb-6">
            <v-icon icon="ri-file-list-3-line" size="56" color="grey-lighten-2"></v-icon>
          </div>
          <h3 class="text-h5 font-weight-bold text-grey-darken-1 mb-2">
            {{ activeTab === 'all' ? 'لا توجد طلبات' : 'لا توجد طلبات بهذه الحالة' }}
          </h3>
          <p class="text-grey mb-6" v-if="!authStore.isAuthenticated">
            الزوار ليس لديهم سجل للطلبات السابقة. يمكنك عرض حالة طلبك من الرابط المرسل إليك، أو <router-link to="/login">تسجيل الدخول</router-link> لعرض جميع طلباتك.
          </p>
          <p class="text-grey mb-6" v-else>
            {{ activeTab === 'all' ? 'لم تقم بأي طلب حتى الآن. ابدأ التسوق الآن!' : 'حاول اختيار حالة أخرى' }}
          </p>
          <v-btn color="primary" rounded="pill" to="/store" prepend-icon="ri-store-2-line">
            تصفح المنتجات
          </v-btn>
        </div>

        <!-- Orders List -->
        <div v-else class="orders-list d-flex flex-column gap-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
          >
            <!-- Order Header -->
            <div class="order-header d-flex align-center justify-space-between flex-wrap gap-3">
              <div class="d-flex align-center gap-3">
                <div class="order-icon-bg">
                  <v-icon icon="ri-shopping-bag-3-line" color="white" size="18"></v-icon>
                </div>
                <div>
                  <div class="text-body-2 font-weight-black text-primary">#{{ order.order_number }}</div>
                  <div class="text-caption text-grey">{{ formatDate(order.created_at) }}</div>
                </div>
              </div>
              <div class="d-flex align-center gap-2">
                <OrderStatusBadge :status="order.status" />
                <span class="order-total-badge">{{ formatPrice(order.total_amount) }} ج.م</span>
              </div>
            </div>

            <v-divider class="my-3"></v-divider>

            <!-- Sub Orders -->
            <div
              v-for="subOrder in order.sub_orders"
              :key="subOrder.id"
              class="sub-order-row"
            >
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center gap-2">
                  <v-icon icon="ri-store-2-line" size="16" color="primary"></v-icon>
                  <span class="text-body-2 font-weight-semibold">{{ subOrder.company?.name }}</span>
                </div>
                <OrderStatusBadge :status="subOrder.status" size="small" />
              </div>

              <!-- Items Preview -->
              <div class="items-preview d-flex gap-2 overflow-x-auto pb-1">
                <div
                  v-for="item in subOrder.items?.slice(0, 4)"
                  :key="item.id"
                  class="item-thumb-wrapper flex-shrink-0"
                >
                  <v-tooltip :text="item.product_name_snapshot || 'منتج'" location="top">
                    <template v-slot:activator="{ props }">
                      <v-img
                        v-bind="props"
                        :src="item.variant_image_snapshot || defaultImage"
                        width="56"
                        height="56"
                        cover
                        class="rounded-xl border"
                      ></v-img>
                    </template>
                  </v-tooltip>
                </div>
                <div v-if="subOrder.items?.length > 4" class="more-items-badge">
                  +{{ subOrder.items.length - 4 }}
                </div>
              </div>
            </div>

            <!-- Order Footer -->
            <div class="order-footer d-flex align-center justify-space-between mt-4 flex-wrap gap-2">
              <div class="d-flex align-center gap-4">
                <div>
                  <span class="text-caption text-grey">الدفع: </span>
                  <span class="text-caption font-weight-bold">{{ order.payment_method === 'cod' ? 'عند الاستلام' : 'أونلاين' }}</span>
                </div>
                <div>
                  <span class="text-caption text-grey">المنتجات: </span>
                  <span class="text-caption font-weight-bold">{{ getTotalItems(order) }}</span>
                </div>
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  variant="outlined"
                  color="primary"
                  size="small"
                  class="rounded-pill"
                  :to="`/store/orders/${order.id}`"
                >
                  <v-icon icon="ri-eye-line" size="16" class="me-1"></v-icon>
                  التفاصيل
                </v-btn>
                <v-btn
                  v-if="order.status === 'pending' || order.status === 'confirmed'"
                  variant="tonal"
                  color="error"
                  size="small"
                  class="rounded-pill"
                  @click="cancelOrder(order.id)"
                >
                  إلغاء
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeOrdersApi } from '@/modules/store/api/storeOrders.api.js'
import { useAuthStore } from '@/stores/auth'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import OrderStatusBadge from '@/modules/store/components/OrderStatusBadge.vue'

const authStore = useAuthStore()

const orders = ref([])
const loading = ref(true)
const error = ref(null)
const activeTab = ref('all')
const defaultImage = 'https://placehold.co/56x56?text=P'

const statusTabs = [
  { label: 'الكل', value: 'all' },
  { label: 'قيد المعالجة', value: 'pending' },
  { label: 'تم التأكيد', value: 'confirmed' },
  { label: 'في الطريق', value: 'shipped' },
  { label: 'تم التسليم', value: 'delivered' },
  { label: 'ملغي', value: 'cancelled' },
]

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === activeTab.value)
})

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('ar-EG').format(Number(price))
}

const formatDate = (dateString) => {
  if (!dateString) return '---'
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

const getTotalItems = (order) => {
  return order.sub_orders?.reduce((sum, sub) => sum + (sub.items?.length || 0), 0) || 0
}

const cancelOrder = async (orderId) => {
  try {
    await storeOrdersApi.cancelOrder(orderId)
    const i = orders.value.findIndex(o => o.id === orderId)
    if (i !== -1) orders.value[i].status = 'cancelled'
  } catch {}
}

const fetchOrders = async () => {
  try {
    const res = await storeOrdersApi.getOrders()
    orders.value = res.data?.data || res.data || []
  } catch {
    error.value = 'تعذر تحميل قائمة الطلبات'
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchOrders() })
</script>

<style scoped>
.my-orders-page { direction: rtl; }

.page-title {
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 900;
  color: #0f172a;
}

.page-sub { font-size: 15px; margin-top: 4px; }

/* Tabs */
.tab-chip {
  white-space: nowrap;
  cursor: pointer;
}

/* Order Card */
.order-card {
  background: white;
  border-radius: 20px;
  padding: 20px 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
}

.order-icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1a73e8, #6c47ff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.order-total-badge {
  font-size: 18px;
  font-weight: 800;
  color: #e53935;
}

.sub-order-row {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.items-preview {
  scrollbar-width: none;
}

.item-thumb-wrapper {
  border-radius: 12px;
  overflow: hidden;
}

.more-items-badge {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #64748b;
  flex-shrink: 0;
}

.order-footer {
  border-top: 1px solid #f8fafc;
  padding-top: 12px;
}

/* Empty */
.empty-orders {
  background: white;
  border-radius: 24px;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.rounded-2xl { border-radius: 20px !important; }
.cursor-pointer { cursor: pointer; }
.border { border: 1px solid #f1f5f9 !important; }
</style>
