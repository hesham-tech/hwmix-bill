<template>
  <div dir="rtl">
    <StoreNavbar />
    <v-main class="order-page"><v-container class="order-container py-8">
      <v-btn variant="text" to="/store/my-orders" prepend-icon="ri-arrow-right-line" class="mb-4">طلباتي</v-btn>
      <v-progress-linear v-if="loading && !order" indeterminate />
      <v-alert v-else-if="loadError" type="error" variant="tonal">{{ loadError }}<div class="mt-3"><v-btn variant="text" @click="load">إعادة المحاولة</v-btn><v-btn v-if="!authStore.isAuthenticated" :to="{ path: '/login', query: { redirect: route.fullPath } }" variant="text">تسجيل الدخول</v-btn></div></v-alert>
      <template v-if="order">
        <v-card rounded="xl" class="pa-5 mb-5">
          <h1 class="text-h5 font-weight-bold mb-3">{{ heading }}</h1>
          <p class="mb-3">رقم الطلب: <strong dir="ltr">{{ order.order_number }}</strong></p>
          <div class="d-flex flex-wrap ga-3 align-center"><OrderStatusBadge :status="order.status" /><v-chip variant="tonal">{{ paymentLabel }}</v-chip></div>
          <p class="mt-4">الإجمالي المسجل: {{ money(order.total_amount) }}</p>
          <p v-if="order.payment_method === 'cod' && order.status === 'pending'" class="text-body-2 mt-3">طلبك قيد المراجعة والتأكيد الهاتفي. لم يُحصّل المبلغ بعد.</p>
          <p v-if="order.payment_method === 'online' && order.payment_status === 'unpaid'" class="text-body-2 mt-3">يُثبت الدفع بعد تحقق النظام من بوابة الدفع. الرجوع إلى هذه الصفحة لا يعني نجاح التحصيل.</p>
          <v-btn variant="text" size="small" :loading="refreshing" class="mt-3" @click="load">تحديث حالة الطلب</v-btn>
        </v-card>
        <v-alert v-if="actionError" type="error" variant="tonal" class="mb-4">{{ actionError }}</v-alert>
        <v-card v-if="order.refunds?.length" rounded="xl" class="pa-5 mb-4"><h2 class="text-h6 mb-3">متابعة الاسترداد</h2><p v-for="refund in order.refunds" :key="refund.id" class="mb-2">{{ money(refund.amount_minor / 100) }} — {{ refund.status === 'completed' ? 'اكتمل تنفيذ الاسترداد' : 'قيد التنفيذ والمتابعة' }}</p></v-card>
        <StoreReturnsPanel :order="order" />
        <v-alert v-if="order.cancellation_requested_at && order.status !== 'cancelled'" type="info" variant="tonal" class="mb-4">طلب الإلغاء قيد مراجعة الإدارة.</v-alert>
        <v-card v-if="order.status === 'cancelled' && order.sub_orders?.some(sub => sub.items?.length)" rounded="xl" class="pa-5 mb-4">
          <p class="mb-3">لأي تغيير في الأسعار أو الشحن، راجع طلبًا جديدًا بالأسعار الحالية. الطلب الجديد مستقل عن متابعة استرداد الطلب السابق.</p>
          <v-alert v-if="reorderError" type="error" class="mb-3">{{ reorderError }}</v-alert>
          <v-btn :loading="reordering" @click="reorder">مراجعة طلب جديد بالأسعار الحالية</v-btn>
        </v-card>
        <v-card v-if="canPay" rounded="xl" class="pa-5 mb-5">
          <h2 class="text-h6 mb-3">إكمال الدفع</h2>
          <p v-if="order.payment_attempt" class="mb-3">توجد محاولة سابقة؛ سيتابع النظام نتيجتها أو يستأنف جلستها دون إنشاء طلب آخر.</p>
          <v-select v-else v-model="gatewayId" :items="gateways" item-title="name" item-value="id" label="بوابة الدفع" />
          <v-btn color="primary" :loading="paying" :disabled="!gatewayId && !order.payment_attempt" @click="pay">{{ order.payment_attempt ? 'متابعة محاولة الدفع' : 'الانتقال إلى صفحة الدفع' }}</v-btn>
        </v-card>
        <v-card v-for="shipment in order.sub_orders || []" :key="shipment.id" rounded="xl" class="pa-5 mb-4">
          <div class="d-flex justify-space-between flex-wrap ga-3 mb-4"><h2 class="text-h6">{{ shipment.vendor?.store_name || shipment.vendor?.name || 'شحنة البائع' }}</h2><OrderStatusBadge :status="shipment.status" /></div>
          <div v-for="item in shipment.items || []" :key="item.id" class="order-item py-2">
            <div><strong>{{ item.product?.name }}</strong><p class="text-body-2">{{ item.variant?.sku }} — {{ Number(item.quantity) }} {{ item.unit_name || '' }}</p></div>
            <span>{{ money(item.subtotal) }}</span>
          </div>
          <v-divider class="my-3" /><p>الشحن: {{ money(shipment.shipping_cost) }}</p>
          <p v-if="shipment.tracking_number" class="mt-2">شركة الشحن: {{ shipment.shipping_carrier }} — رقم التتبع: <b dir="ltr">{{ shipment.tracking_number }}</b></p>
        </v-card>
        <v-card rounded="xl" class="pa-5 mb-4">
          <h2 class="text-h6 mb-3">عنوان التوصيل</h2>
          <p>{{ order.shipping_address?.recipient_name }} — {{ order.shipping_address?.phone }}</p>
          <p class="mt-2">{{ order.shipping_address?.city }}، {{ order.shipping_address?.street }} {{ order.shipping_address?.building }}</p>
          <p v-if="order.customer_notes" class="mt-3">ملاحظاتك: {{ order.customer_notes }}</p>
        </v-card>
        <v-btn v-if="canCancel" color="error" variant="outlined" :disabled="!!order.cancellation_requested_at" @click="cancelDialog = true">{{ directCancellation ? 'إلغاء الطلب' : 'طلب إلغاء لدى الإدارة' }}</v-btn>
        <v-dialog v-model="cancelDialog" max-width="480"><v-card rounded="xl" class="pa-5"><h2 class="text-h6 mb-3">تأكيد طلب الإلغاء</h2><p>{{ directCancellation ? 'سنلغي الأجزاء التي لم يبدأ تجهيزها. إذا تم الدفع فسنتابع الاسترداد عبر البوابة.' : 'بدأ تنفيذ الطلب؛ سنرسل طلب الإلغاء للإدارة لمراجعته.' }}</p><v-card-actions class="mt-3"><v-btn @click="cancelDialog = false">رجوع</v-btn><v-btn color="error" :loading="cancelling" @click="cancel">تأكيد</v-btn></v-card-actions></v-card></v-dialog>
      </template>
    </v-container></v-main>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import OrderStatusBadge from '@/modules/store/components/OrderStatusBadge.vue'
import StoreReturnsPanel from '@/modules/store/components/StoreReturnsPanel.vue'
import { useAuthStore } from '@/stores/auth'
import { storeOrdersApi } from '@/modules/store/api/storeOrders.api'
import { storeProductsApi } from '@/modules/store/api/storeProducts.api'
import { useCartStore } from '@/stores/cart'
import { storePayload, formatStoreMoney, paymentRedirect } from '@/modules/store/utils/checkoutSession'
import { parseApiError } from '@/utils/errorParser'
const route = useRoute(), router = useRouter(), authStore = useAuthStore()
const order = ref(null), loading = ref(true), refreshing = ref(false), loadError = ref(''), actionError = ref('')
const gateways = ref([]), gatewayId = ref(null), paying = ref(false), cancelling = ref(false), cancelDialog = ref(false)
let poll
const reordering=ref(false),reorderError=ref(''),cart=useCartStore()
async function reorder(){
  if(reordering.value)return
  reordering.value=true;reorderError.value=''
  try {
    const lines=(order.value.sub_orders||[]).flatMap(sub=>sub.items||[])
    const ids=[...new Set(lines.map(item=>Number(item.product?.id)).filter(Boolean))]
    const products=[]
    for(let start=0;start<ids.length;start+=48){const data=storePayload(await storeProductsApi.getProducts({ids:ids.slice(start,start+48),per_page:48}));products.push(...(data.data||[]))}
    const additions=lines.map(item=>{
      const product=products.find(p=>p.id===Number(item.product?.id)),variant=product?.variants?.find(v=>v.id===Number(item.variant?.id))
      const quantity=Number(item.quantity),existing=cart.items.find(i=>i.variantId===variant?.id)
      if(!variant||quantity<1||quantity+Number(existing?.quantity||0)>Number(variant.available_stock))throw new Error('بعض الخيارات أو الكميات لم تعد متاحة. راجع السلة والمنتجات قبل إنشاء الطلب الجديد.')
      return {variantId:variant.id,productId:product.id,companyId:product.company_id,companyName:product.vendor?.name||product.vendor?.store_name,productName:product.name,variantSku:variant.sku,image:variant.image||product.image,unitPrice:variant.price,quantity,maxStock:variant.available_stock}
    })
    for(const item of additions)cart.addItem(item)
    cart.isDrawerOpen=false;await router.push('/store/cart')
  }catch(error){reorderError.value=error.response?parseApiError(error,'تعذر تحديث المنتجات.'):error.message}
  finally{reordering.value=false}
}
const money = value => formatStoreMoney(value, order.value?.currency || 'EGP')
const heading = computed(() => order.value?.status === 'cancelled' ? 'الطلب ملغى' : order.value?.payment_method === 'online' && order.value?.payment_status === 'unpaid' ? 'طلبك بانتظار إكمال الدفع' : 'تفاصيل طلبك')
const paymentLabel = computed(() => ({ unpaid: order.value?.payment_method === 'cod' ? 'الدفع عند الاستلام — غير محصل' : 'بانتظار التحقق من الدفع', paid: 'تم التحصيل', partial: order.value?.payment_method === 'online' ? 'استرداد جزئي' : 'تحصيل جزئي', refunded: 'تم الاسترداد' })[order.value?.payment_status] || 'قيد المراجعة')
const canPay = computed(() => order.value?.payment_method === 'online' && order.value?.payment_status === 'unpaid' && order.value?.status !== 'cancelled' && (gateways.value.length > 0 || !!order.value?.payment_attempt))
const canCancel = computed(() => order.value && !['cancelled', 'delivered', 'returned'].includes(order.value.status))
const directCancellation = computed(() => (order.value?.sub_orders || []).every(s => ['pending', 'confirmed', 'cancelled'].includes(s.status)))
async function load() {
  if (refreshing.value) return
  refreshing.value = true; loadError.value = ''
  try { order.value = storePayload(await storeOrdersApi.getOrder(String(route.params.id))) }
  catch (err) { loadError.value = err.response?.status === 404 ? 'لا يمكن عرض هذا الطلب. تأكد من تسجيل الدخول بالحساب الذي أنشأه.' : parseApiError(err, 'تعذر تحميل الطلب.') }
  finally { loading.value = false; refreshing.value = false }
}
async function pay() {
  if ((!gatewayId.value && !order.value?.payment_attempt) || paying.value) return
  paying.value = true; actionError.value = ''
  try {
    const result = storePayload(await storeOrdersApi.pay(order.value.order_number, gatewayId.value))
    if (result.status === 'completed') { await load(); paying.value = false }
    else paymentRedirect(result.payment_url)
  } catch (err) { actionError.value = parseApiError(err, 'تعذر بدء الدفع. لم ننشئ طلبًا آخر.'); paying.value = false }
}
async function cancel() {
  cancelling.value = true; actionError.value = ''
  try { order.value = storePayload(await storeOrdersApi.cancelOrder(order.value.order_number)); cancelDialog.value = false }
  catch (err) { actionError.value = parseApiError(err, 'تعذر تنفيذ طلب الإلغاء.') }
  finally { cancelling.value = false }
}
function pollVisible() { if (!document.hidden) load() }
onMounted(async () => {
  const token = new URLSearchParams(route.hash.slice(1)).get('token')
  if (token && /^[a-f0-9]{64}$/.test(token)) { sessionStorage.setItem('hwnix_order_access:' + route.params.id, token); await router.replace({ hash: '' }) }
  await load()
  try {
    const config = storePayload(await storeOrdersApi.configuration())
    gateways.value = config?.gateways || []
    gatewayId.value = gateways.value.find(g => String(g.id) === String(route.query.gateway))?.id || gateways.value.find(g => g.is_default)?.id || gateways.value[0]?.id
  } catch { /* Order tracking remains available when new payments are disabled. */ }
  const autoPay = route.query.pay === '1'
  if (autoPay) { const query = { ...route.query }; delete query.pay; delete query.gateway; await router.replace({ query }); if (canPay.value) pay() }
  poll = setInterval(pollVisible, 20000)
  document.addEventListener('visibilitychange', pollVisible)
})
onUnmounted(() => { clearInterval(poll); document.removeEventListener('visibilitychange', pollVisible) })
</script>
<style scoped>.order-page{background:#f8fafc;min-height:100vh}.order-container{max-width:960px}.order-item{display:flex;justify-content:space-between;gap:16px}.order-item>div{min-width:0;overflow-wrap:anywhere}.order-item>span{white-space:nowrap}</style>
