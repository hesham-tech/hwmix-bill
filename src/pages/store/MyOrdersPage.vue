<template>
  <div dir="rtl"><StoreNavbar /><v-main class="orders-main"><v-container class="orders-container py-8">
    <h1 class="text-h4 font-weight-bold mb-6">طلباتي</h1>
    <v-card v-if="!authStore.isAuthenticated" rounded="xl" class="pa-6"><p class="mb-4">سجل الدخول إلى حسابك لعرض مشترياتك ومتابعة طلباتك.</p><v-btn color="primary" :to="{ path: '/login', query: { redirect: '/store/my-orders' } }">تسجيل الدخول</v-btn></v-card>
    <template v-else>
      <StoreNotificationsPanel/>
      <v-progress-linear v-if="loading" indeterminate />
      <v-alert v-if="error" type="error" variant="tonal" class="my-4">{{ error }} <v-btn variant="text" @click="load">إعادة المحاولة</v-btn></v-alert>
      <v-alert v-if="!loading && !error && !orders.length" type="info" variant="tonal">لا توجد طلبات حتى الآن. <router-link to="/store">ابدأ التسوق</router-link></v-alert>
      <v-card v-for="order in orders" :key="order.id" rounded="xl" class="pa-5 mb-4">
        <div class="d-flex flex-wrap justify-space-between ga-3 mb-3"><strong dir="ltr">{{ order.order_number }}</strong><OrderStatusBadge :status="order.status" /></div>
        <p>{{ formatDate(order.created_at) }}</p>
        <p class="my-3">الإجمالي: {{ formatStoreMoney(order.total_amount, order.currency || 'EGP') }}</p>
        <p class="text-body-2 mb-4">{{ order.sub_orders?.length || 0 }} شحنة — {{ order.payment_method === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني' }}</p>
        <v-btn color="primary" variant="tonal" :to="{ name: 'store-order-confirmation', params: { id: order.order_number } }">تفاصيل الطلب ومتابعته</v-btn>
      </v-card>
      <v-pagination v-if="meta.last_page > 1" v-model="page" :length="meta.last_page" :disabled="loading" :total-visible="5" @update:model-value="load" aria-label="صفحات الطلبات" />
    </template>
  </v-container></v-main></div>
</template>
<script setup>
import StoreNotificationsPanel from '@/modules/store/components/StoreNotificationsPanel.vue'
import { ref, onMounted } from 'vue'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import OrderStatusBadge from '@/modules/store/components/OrderStatusBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { storeOrdersApi } from '@/modules/store/api/storeOrders.api'
import { storePage, formatStoreMoney } from '@/modules/store/utils/checkoutSession'
import { parseApiError } from '@/utils/errorParser'
const authStore = useAuthStore()
const orders = ref([]), meta = ref({}), page = ref(1), loading = ref(false), error = ref('')
function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' }).format(new Date(value))
}
async function load() {
  if (!authStore.isAuthenticated) return
  loading.value = true; error.value = ''
  try { const result = storePage(await storeOrdersApi.getOrders({ page: page.value })); orders.value = result.items; meta.value = result.meta }
  catch (err) { error.value = parseApiError(err, 'تعذر تحميل الطلبات.') }
  finally { loading.value = false }
}
onMounted(load)
</script>
<style scoped>.orders-main{min-height:100vh;background:#f8fafc}.orders-container{max-width:1000px}</style>
