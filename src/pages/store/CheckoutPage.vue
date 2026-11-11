<template>
  <div class="checkout-page" dir="rtl">
    <StoreNavbar />
    <v-main class="checkout-main">
      <v-container class="checkout-container py-7">
        <v-btn variant="text" to="/store/cart" prepend-icon="ri-arrow-right-line" class="mb-4">العودة للسلة</v-btn>
        <h1 class="text-h4 font-weight-bold mb-6">إتمام الطلب</h1>
        <v-progress-linear v-if="loading" indeterminate aria-label="تحميل إعدادات الشراء" />
        <v-alert v-else-if="loadError" type="error" variant="tonal">{{ loadError }} <v-btn variant="text" @click="load">إعادة المحاولة</v-btn></v-alert>
        <v-alert v-else-if="!config.enabled" type="info" variant="tonal">المتجر لا يستقبل طلبات جديدة حاليًا. يمكنك متابعة تصفح المنتجات.</v-alert>
        <v-card v-else-if="config.requires_account && !authStore.isAuthenticated" rounded="xl" class="pa-6">
          <h2 class="text-h6 mb-3">حسابك يحفظ مشترياتك</h2>
          <p class="mb-5">سجل الدخول أو أنشئ حسابًا لإتمام الشراء ومتابعة الطلبات والمرتجعات. سنحتفظ بسلتك.</p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn color="primary" :to="{ path: '/login', query: { redirect: '/store/checkout' } }">تسجيل الدخول</v-btn>
            <v-btn variant="outlined" :to="{ path: '/register', query: { redirect: '/store/checkout' } }">إنشاء حساب</v-btn>
          </div>
        </v-card>
        <StoreEmailVerification v-else-if="authStore.isAuthenticated && config.requires_verified_email && !account.email_verified" :email="account.email || authStore.user?.email || ''" @verified="onVerified" />
        <v-alert v-else-if="cartStore.isEmpty" type="info" variant="tonal">سلتك فارغة. <router-link to="/store">تصفح المنتجات</router-link></v-alert>
        <v-row v-else class="mt-1">
          <v-col cols="12" md="8">
            <ol class="checkout-steps mb-5" aria-label="خطوات الشراء">
              <li v-for="(label, index) in steps" :key="label" :aria-current="step === index ? 'step' : undefined" :class="{ active: step === index }">{{ index + 1 }}. {{ label }}</li>
            </ol>
            <v-card rounded="xl" class="pa-5">
              <v-form v-if="step === 0" @submit.prevent="continueAddress">
                <h2 class="text-h6 mb-4">عنوان التوصيل</h2>
                <v-radio-group v-if="addresses.length" v-model="addressId">
                  <v-radio v-for="address in addresses" :key="address.id" :value="address.id" :label="address.recipient_name + ' — ' + address.city + '، ' + address.street" />
                  <v-radio :value="null" label="عنوان جديد" />
                </v-radio-group>
                <template v-if="!addressId">
                  <v-row>
                    <v-col cols="12" sm="6"><v-text-field v-model="newAddress.recipient_name" label="اسم المستلم" autocomplete="name" maxlength="150" required /></v-col>
                    <v-col cols="12" sm="6"><v-text-field v-model="newAddress.phone" label="رقم الهاتف" autocomplete="tel" inputmode="tel" dir="ltr" required /></v-col>
                    <v-col cols="12" sm="6"><v-select v-model="newAddress.governorate_code" :items="config.governorates" item-title="name" item-value="id" label="المحافظة" required /></v-col>
                    <v-col cols="12" sm="6"><v-text-field v-model="newAddress.city" label="المدينة أو المنطقة" autocomplete="address-level2" required /></v-col>
                    <v-col cols="12"><v-text-field v-model="newAddress.street" label="الشارع والعنوان التفصيلي" autocomplete="street-address" required /></v-col>
                    <v-col cols="12" sm="4"><v-text-field v-model="newAddress.building" label="المبنى" /></v-col>
                    <v-col cols="6" sm="4"><v-text-field v-model="newAddress.floor" label="الدور" /></v-col>
                    <v-col cols="6" sm="4"><v-text-field v-model="newAddress.apartment" label="الشقة" /></v-col>
                    <v-col cols="12"><v-text-field v-model="newAddress.landmark" label="علامة مميزة (اختياري)" /></v-col>
                  </v-row>
                </template>
                <StoreLocationPicker v-if="requiresLocation" v-model="locationAddress" :required="true" /><v-alert v-if="error" type="error" class="mb-3">{{ error }}</v-alert>
                <v-btn type="submit" color="primary" :loading="savingAddress" :disabled="!addressReady">المتابعة إلى الدفع</v-btn>
              </v-form>
              <v-form v-else-if="step === 1" @submit.prevent="requestQuote">
                <h2 class="text-h6 mb-4">طريقة الدفع</h2>
                <v-radio-group v-model="paymentMethod">
                  <v-radio v-if="config.cod_enabled" value="cod" label="الدفع عند الاستلام" />
                  <v-radio v-if="config.online_enabled" value="online" label="الدفع بالبطاقة عبر بوابة الدفع" />
                </v-radio-group>
                <v-select v-if="paymentMethod === 'online'" v-model="gatewayId" :items="config.gateways" item-title="name" item-value="id" label="بوابة الدفع" />
                <p v-if="paymentMethod === 'online'" class="text-body-2 mb-4">تُدخل بيانات البطاقة على صفحة مزود الدفع الآمنة.</p>
                <v-textarea v-model="notes" label="ملاحظات الطلب (اختياري)" rows="2" maxlength="2000" />
                <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
                <div class="d-flex ga-3"><v-btn variant="outlined" @click="step = 0">رجوع</v-btn><v-btn type="submit" color="primary" :loading="quoting" :disabled="!paymentMethod || (paymentMethod === 'online' && !gatewayId)">مراجعة السعر النهائي</v-btn></div>
              </v-form>
              <div v-else>
                <h2 class="text-h6 mb-4">مراجعة الطلب</h2>
                <p class="mb-4">{{ deliveryAddress?.recipient_name }} — {{ deliveryAddress?.city }}، {{ deliveryAddress?.street }}</p>
                <v-alert v-if="quoteExpired" type="warning" variant="tonal" class="mb-4">انتهى عرض السعر. <v-btn variant="text" :loading="quoting" @click="requestQuote">تحديث السعر</v-btn></v-alert>
                <section v-for="group in quote?.groups || []" :key="group.company_id" class="shipment-summary mb-4">
                  <p class="font-weight-bold mb-2">شحنة مستقلة — {{ group.carrier_name }}</p>
                  <p v-for="item in group.items" :key="item.variant_id" class="text-body-2 mb-1">{{ item.product_name }} × {{ item.quantity }} — {{ money(item.total_minor / 100) }}</p>
                  <p class="text-body-2 mt-2">الشحن: {{ money(group.shipping_minor / 100) }}</p>
                </section>
                <div class="d-flex flex-wrap ga-2 mb-3"><v-btn v-for="document in quote?.legal_documents || []" :key="document.version_id" variant="text" size="small" @click="openDocument(document)">{{ document.title }}</v-btn></div>
                <v-checkbox v-model="legalAccepted" label="قرأت شروط الشراء وسياسة الخصوصية والمرتجعات المعروضة وأوافق عليها" />
                <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
                <div class="d-flex flex-wrap ga-3">
                  <v-btn variant="outlined" :disabled="placing" @click="step = 1">تعديل</v-btn>
                  <v-btn color="primary" :loading="placing" :disabled="!legalAccepted || quoteExpired || !quote" @click="placeOrder">{{ paymentMethod === 'cod' ? 'تأكيد طلب الدفع عند الاستلام' : 'إنشاء الطلب والمتابعة إلى الدفع' }}</v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card rounded="xl" class="pa-5 checkout-summary">
              <h2 class="text-h6 mb-4">ملخص الطلب</h2>
              <p v-for="item in cartStore.items" :key="item.variantId" class="mb-2">{{ item.productName }} × {{ item.quantity }}</p>
              <v-divider class="my-4" />
              <template v-if="quote">
                <p class="summary-row"><span>المنتجات قبل الضريبة</span><strong>{{ money(quote.subtotal_minor / 100) }}</strong></p>
                <p class="summary-row"><span>الضريبة</span><strong>{{ money(quote.tax_minor / 100) }}</strong></p>
                <p class="summary-row"><span>الشحن</span><strong>{{ money(quote.shipping_minor / 100) }}</strong></p>
                <p class="summary-row text-h6 mt-4"><span>الإجمالي</span><strong>{{ money(quote.total_minor / 100) }}</strong></p>
              </template>
              <template v-else><p>قيمة المنتجات المبدئية: {{ money(cartStore.totalAmount) }}</p><p class="text-caption mt-3">نحسب الشحن والضريبة والسعر النهائي بعد تحديد العنوان وطريقة الدفع.</p></template>
            </v-card>
          </v-col>
        </v-row>
        <v-dialog v-model="legalDialog" max-width="760" scrollable>
          <v-card rounded="xl"><v-card-title>{{ legalDocument?.title }}</v-card-title><v-card-text><v-progress-linear v-if="legalLoading" indeterminate /><div v-else v-html="safeHtml(legalDocument?.content)" /></v-card-text><v-card-actions><v-btn @click="legalDialog = false">إغلاق</v-btn></v-card-actions></v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import StoreLocationPicker from '@/modules/store/components/StoreLocationPicker.vue'
import {storeProductsApi} from '@/modules/store/api/storeProducts.api'
import StoreEmailVerification from '@/modules/store/components/StoreEmailVerification.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { storeOrdersApi } from '@/modules/store/api/storeOrders.api'
import { customerAddressesApi } from '@/modules/store/api/customerAddresses.api'
import { checkoutAttempt, finishCheckoutAttempt, saveOrderAccess, storePayload, formatStoreMoney } from '@/modules/store/utils/checkoutSession'
import { safeHtml } from '@/utils/safeHtml'
import { parseApiError } from '@/utils/errorParser'
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const loading = ref(true), loadError = ref(''), error = ref('')
const config = ref({ enabled: false, requires_account: true, requires_verified_email: true, governorates: [], gateways: [] })
const requiresLocation=ref(false),savingAddress=ref(false),addressLocationDirty=ref(false)
const account = ref({ email_verified: false })
const addresses = ref([]), addressId = ref(null), step = ref(0)
const paymentMethod = ref('cod'), gatewayId = ref(null), notes = ref('')
const quoting = ref(false), placing = ref(false), quote = ref(null), quoteExpired = ref(false), legalAccepted = ref(false)
const legalDialog = ref(false), legalLoading = ref(false), legalDocument = ref(null)
const newAddress = ref({ recipient_name: authStore.user?.full_name || authStore.user?.name || '', phone: authStore.user?.phone || '', governorate_code: '', city: '', street: '', building: '', floor: '', apartment: '', landmark: '' })
const steps = ['عنوان التوصيل', 'طريقة الدفع', 'مراجعة الطلب']
let expirationTimer
const money = value => formatStoreMoney(value, config.value.currency || 'EGP')
const deliveryAddress = computed(() => addressId.value ? addresses.value.find(a => a.id === addressId.value) : newAddress.value)
const locationAddress=computed({get:()=>deliveryAddress.value||{},set:value=>{if(addressId.value){addresses.value=addresses.value.map(a=>a.id===addressId.value?value:a);addressLocationDirty.value=true}else newAddress.value=value;quote.value=null;legalAccepted.value=false}})
const addressReady = computed(() => {
  const a = deliveryAddress.value
  return !!(a?.recipient_name && a?.phone && a?.governorate_code && a?.city && a?.street && (!requiresLocation.value || (a.location_confirmed && a.latitude!=null && a.longitude!=null)))
})
function payload() {
  const data = cartStore.buildOrderPayload(addressId.value, notes.value, paymentMethod.value)
  data.checkout_key = checkoutAttempt()
  if (!addressId.value) { delete data.shipping_address_id; data.guest_address = { ...newAddress.value } }
  return data
}
async function load() {
  loading.value = true; loadError.value = ''
  try {
    config.value = { ...config.value, ...storePayload(await storeOrdersApi.configuration()) }
    const check=storePayload(await storeProductsApi.validateCart(cartStore.buildOrderPayload(null).items));requiresLocation.value=!!check?.requires_delivery_location
    if (!config.value.cod_enabled) paymentMethod.value = config.value.online_enabled ? 'online' : ''
    gatewayId.value = config.value.gateways.find(g => g.is_default)?.id || config.value.gateways[0]?.id || null
    if (authStore.isAuthenticated) {
      account.value = storePayload(await storeOrdersApi.accountStatus())
      addresses.value = storePayload(await customerAddressesApi.getAddresses()) || []
      addressId.value = addresses.value.find(a => a.is_default && a.governorate_code)?.id || null
    }
  } catch (err) { loadError.value = parseApiError(err, 'تعذر تحميل بيانات إتمام الطلب.') }
  finally { loading.value = false }
}
async function continueAddress(){if(!addressReady.value||savingAddress.value)return;savingAddress.value=true;error.value='';try{if(addressId.value&&addressLocationDirty.value){await customerAddressesApi.updateAddress(addressId.value,{...deliveryAddress.value});addressLocationDirty.value=false}step.value=1}catch(e){error.value=parseApiError(e,'تعذر حفظ موقع العنوان')}finally{savingAddress.value=false}}
function onVerified(result) { account.value = { ...account.value, ...result, email_verified: true } }
async function requestQuote() {
  quoting.value = true; error.value = ''; legalAccepted.value = false
  try {
    quote.value = storePayload(await storeOrdersApi.quote(payload()))
    quoteExpired.value = false; step.value = 2
    clearTimeout(expirationTimer)
    expirationTimer = setTimeout(() => { quoteExpired.value = true }, Math.max(0, Date.parse(quote.value.expires_at) - Date.now()))
  } catch (err) { error.value = parseApiError(err, 'تعذر تسعير الطلب. راجع المنتجات والعنوان.') }
  finally { quoting.value = false }
}
async function placeOrder() {
  if (placing.value || !legalAccepted.value || !quote.value || quoteExpired.value) return
  placing.value = true; error.value = ''
  try {
    const data = { ...payload(), quote_id: quote.value.id, legal_accepted: true, legal_version_ids: quote.value.legal_documents.map(d => d.version_id) }
    if (paymentMethod.value === 'online') data.payment_gateway_id = gatewayId.value
    const response = await storeOrdersApi.placeOrder(data)
    const order = storePayload(response)
    saveOrderAccess(order, response.data.access_token)
    finishCheckoutAttempt()
    cartStore.clearCart()
    await router.replace({ name: 'store-order-confirmation', params: { id: order.order_number }, query: paymentMethod.value === 'online' ? { pay: '1', gateway: gatewayId.value } : {} })
  } catch (err) { error.value = parseApiError(err, 'تعذر إنشاء الطلب. أعد المحاولة بالمحاولة نفسها.') }
  finally { placing.value = false }
}
async function openDocument(document) {
  legalDialog.value = true; legalLoading.value = true; legalDocument.value = { title: document.title, content: '' }
  try { legalDocument.value = storePayload(await storeOrdersApi.legal(document.version_id)) }
  catch (err) { error.value = parseApiError(err, 'تعذر تحميل المستند.'); legalDialog.value = false }
  finally { legalLoading.value = false }
}
watch([addressId, newAddress, notes, paymentMethod], () => { quote.value = null; legalAccepted.value = false }, { deep: true })
watch(() => cartStore.items, async () => {
  quote.value = null; legalAccepted.value = false; step.value = 0
  if (loading.value || placing.value || !cartStore.items.length) return
  try {
    const check = storePayload(await storeProductsApi.validateCart(cartStore.buildOrderPayload(null).items))
    requiresLocation.value = !!check?.requires_delivery_location
  } catch (err) { loadError.value = parseApiError(err, 'تعذر التحقق من متطلبات عنوان التوصيل. أعد المحاولة.') }
}, { deep: true })
onMounted(load)
onUnmounted(() => clearTimeout(expirationTimer))
</script>
<style scoped>
.checkout-page{direction:rtl}.checkout-main{background:#f8fafc;min-height:100vh}.checkout-container{max-width:1200px}.checkout-steps{display:flex;flex-wrap:wrap;gap:12px;list-style:none;padding:0}.checkout-steps li{padding:8px 12px;border-radius:20px;background:#e8edf4;color:#475569}.checkout-steps .active{background:#1a3d8f;color:white}.shipment-summary{padding:14px;border:1px solid #e2e8f0;border-radius:14px}.summary-row{display:flex;justify-content:space-between;gap:8px;margin-bottom:12px}.summary-row strong{white-space:nowrap}@media(min-width:960px){.checkout-summary{position:sticky;top:110px}}
</style>
