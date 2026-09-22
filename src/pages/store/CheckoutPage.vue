<template>
  <div class="checkout-page" dir="rtl">
    <StoreNavbar />

    <v-main style="background: #f8fafc; min-height: 100vh;">
      <v-container style="max-width: 1200px;" class="py-8 py-md-12">

        <!-- Checkout Steps -->
        <div class="checkout-steps mb-6 mb-md-10 overflow-x-auto">
          <div class="d-flex align-center justify-center justify-md-center gap-0 min-w-max pa-2">
            <div
              v-for="(step, i) in steps"
              :key="i"
              class="d-flex align-center"
            >
              <div class="step-item d-flex flex-column align-center text-center">
                <div
                  class="step-circle mb-2"
                  :class="{
                    'step-active': currentStep === i,
                    'step-done': currentStep > i
                  }"
                >
                  <v-icon v-if="currentStep > i" icon="ri-check-line" size="20" color="white"></v-icon>
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <span class="step-label text-caption" :class="currentStep >= i ? 'text-primary font-weight-bold' : 'text-grey'">
                  {{ step }}
                </span>
              </div>
              <div v-if="i < steps.length - 1" class="step-line mx-2 mx-md-3" :class="{ 'step-line-done': currentStep > i }"></div>
            </div>
          </div>
        </div>

        <v-row>
          <!-- Left: Steps Forms -->
          <v-col cols="12" md="7" lg="8">

            <!-- Step 1: Address -->
            <v-card v-if="currentStep === 0" class="checkout-card mb-4" elevation="0">
              <v-card-title class="step-card-title">
                <div class="d-flex align-center gap-3">
                  <div class="step-num-badge">1</div>
                  <span>عنوان التوصيل</span>
                </div>
              </v-card-title>
              <v-card-text class="pa-6 pt-0">

                <v-alert v-if="!authStore.isAuthenticated" type="info" variant="tonal" class="mb-6" rounded="xl">
                  <template v-slot:prepend>
                    <v-icon icon="ri-information-line"></v-icon>
                  </template>
                  <span>للاستمتاع بتجربة تسوق أفضل، يمكنك <router-link :to="{ path: '/login', query: { redirect: $route.fullPath } }" class="font-weight-bold">تسجيل الدخول</router-link> أو <router-link :to="{ path: '/register', query: { type: 'customer', redirect: $route.fullPath } }" class="font-weight-bold">إنشاء حساب</router-link>. أو يمكنك المتابعة كزائر.</span>
                </v-alert>

                <div>
                  <!-- Saved Addresses -->
                  <div v-if="authStore.isAuthenticated && savedAddresses.length > 0" class="mb-6">
                    <p class="text-body-2 font-weight-bold mb-3">العناوين المحفوظة</p>
                    <div class="d-flex flex-column gap-3">
                      <div
                        v-for="addr in savedAddresses"
                        :key="addr.id"
                        class="address-card d-flex align-start gap-3 pa-4 rounded-xl cursor-pointer"
                        :class="{ 'address-selected': selectedAddressId === addr.id }"
                        @click="selectedAddressId = addr.id"
                      >
                        <v-radio :model-value="selectedAddressId === addr.id" color="primary" hide-details></v-radio>
                        <div class="flex-grow-1">
                          <div class="d-flex align-center justify-space-between">
                            <span class="text-body-2 font-weight-bold">{{ addr.recipient_name }}</span>
                            <v-chip v-if="addr.is_default" size="x-small" color="primary" variant="tonal">الافتراضي</v-chip>
                          </div>
                          <p class="text-caption text-grey mt-1">
                            {{ addr.street }}, {{ addr.district }}, {{ addr.city }}
                          </p>
                          <p class="text-caption text-grey">{{ addr.phone }}</p>
                        </div>
                      </div>
                    </div>
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      prepend-icon="ri-add-line"
                      class="mt-3"
                      @click="showNewAddressForm = !showNewAddressForm"
                    >
                      إضافة عنوان جديد
                    </v-btn>
                  </div>

                  <!-- New Address Form -->
                  <div v-if="showNewAddressForm || !authStore.isAuthenticated || savedAddresses.length === 0">
                    <p class="text-body-2 font-weight-bold mb-3">عنوان التوصيل</p>
                    <v-row dense>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="newAddress.recipient_name"
                          label="اسم المستلم *"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="newAddress.phone"
                          label="رقم الهاتف *"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          type="tel"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="newAddress.city"
                          label="المدينة *"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="newAddress.district"
                          label="الحي"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="newAddress.street"
                          label="الشارع والرقم *"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model="newAddress.building"
                          label="المبنى"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model="newAddress.floor"
                          label="الدور"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model="newAddress.apartment"
                          label="الشقة"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="newAddress.landmark"
                          label="علامة مميزة (اختياري)"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          rows="2"
                          hint="مثال: بجوار مسجد النور"
                        ></v-textarea>
                      </v-col>
                      <v-col cols="12" v-if="authStore.isAuthenticated">
                        <v-checkbox
                          v-model="newAddress.is_default"
                          label="جعله العنوان الافتراضي"
                          color="primary"
                          hide-details
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </div>

                  <v-btn
                    color="primary"
                    block
                    height="52"
                    class="rounded-xl font-weight-bold mt-4"
                    @click="goToStep(1)"
                    :disabled="!canProceedToStep1"
                  >
                    التالي: طريقة الدفع
                    <v-icon icon="ri-arrow-left-line" class="ms-2" size="18"></v-icon>
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Step 2: Payment -->
            <v-card v-if="currentStep === 1" class="checkout-card mb-4" elevation="0">
              <v-card-title class="step-card-title">
                <div class="d-flex align-center gap-3">
                  <div class="step-num-badge">2</div>
                  <span>طريقة الدفع</span>
                </div>
              </v-card-title>
              <v-card-text class="pa-6 pt-0">
                <div class="payment-options d-flex flex-column gap-3 mb-6">
                  <div
                    class="payment-option d-flex align-center gap-4 pa-4 rounded-xl cursor-pointer"
                    :class="{ 'payment-selected': paymentMethod === 'cod' }"
                    @click="paymentMethod = 'cod'"
                  >
                    <v-radio :model-value="paymentMethod === 'cod'" color="primary" hide-details></v-radio>
                    <div class="payment-icon-bg cod-bg">
                      <v-icon icon="ri-money-dollar-circle-line" color="white" size="22"></v-icon>
                    </div>
                    <div>
                      <div class="text-body-2 font-weight-bold">الدفع عند الاستلام</div>
                      <div class="text-caption text-grey">ادفع نقداً عند وصول طلبك</div>
                    </div>
                    <v-spacer></v-spacer>
                    <v-chip color="success" variant="tonal" size="x-small">متاح</v-chip>
                  </div>

                  <div class="payment-option payment-disabled d-flex align-center gap-4 pa-4 rounded-xl">
                    <v-radio disabled hide-details></v-radio>
                    <div class="payment-icon-bg card-bg">
                      <v-icon icon="ri-bank-card-line" color="white" size="22"></v-icon>
                    </div>
                    <div>
                      <div class="text-body-2 font-weight-bold text-grey">بطاقة ائتمان / فيزا</div>
                      <div class="text-caption text-grey">قريباً</div>
                    </div>
                    <v-spacer></v-spacer>
                    <v-chip color="warning" variant="tonal" size="x-small">قريباً</v-chip>
                  </div>
                </div>

                <!-- Notes -->
                <v-textarea
                  v-model="orderNotes"
                  label="ملاحظات للطلب (اختياري)"
                  variant="outlined"
                  rounded="xl"
                  rows="3"
                  hint="أضف أي تعليمات خاصة للبائع أو الشاحن"
                  class="mb-4"
                ></v-textarea>

                <div class="d-flex gap-3">
                  <v-btn
                    variant="outlined"
                    color="grey"
                    @click="currentStep = 0"
                    class="rounded-xl"
                    height="52"
                  >
                    <v-icon icon="ri-arrow-right-line" class="me-2" size="18"></v-icon>
                    رجوع
                  </v-btn>
                  <v-btn
                    color="primary"
                    flex-grow-1
                    class="flex-grow-1 rounded-xl font-weight-bold"
                    height="52"
                    @click="goToStep(2)"
                  >
                    مراجعة الطلب
                    <v-icon icon="ri-arrow-left-line" class="ms-2" size="18"></v-icon>
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Step 3: Review & Place Order -->
            <v-card v-if="currentStep === 2" class="checkout-card" elevation="0">
              <v-card-title class="step-card-title">
                <div class="d-flex align-center gap-3">
                  <div class="step-num-badge">3</div>
                  <span>مراجعة الطلب</span>
                </div>
              </v-card-title>
              <v-card-text class="pa-6 pt-0">

                <!-- Review Address -->
                <div class="review-section mb-4">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <span class="text-body-2 font-weight-bold text-grey">عنوان التوصيل</span>
                    <v-btn variant="text" size="x-small" color="primary" @click="currentStep = 0">تعديل</v-btn>
                  </div>
                  <div class="review-box rounded-xl pa-4">
                    <template v-if="selectedAddressObj">
                      <p class="text-body-2 font-weight-bold mb-1">{{ selectedAddressObj.recipient_name }}</p>
                      <p class="text-caption text-grey">{{ selectedAddressObj.street }}, {{ selectedAddressObj.district }}, {{ selectedAddressObj.city }}</p>
                      <p class="text-caption text-grey">{{ selectedAddressObj.phone }}</p>
                    </template>
                  </div>
                </div>

                <!-- Review Payment -->
                <div class="review-section mb-4">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <span class="text-body-2 font-weight-bold text-grey">طريقة الدفع</span>
                    <v-btn variant="text" size="x-small" color="primary" @click="currentStep = 1">تعديل</v-btn>
                  </div>
                  <div class="review-box rounded-xl pa-4 d-flex align-center gap-2">
                    <v-icon icon="ri-money-dollar-circle-line" color="success"></v-icon>
                    <span class="text-body-2 font-weight-medium">الدفع عند الاستلام</span>
                  </div>
                </div>

                <!-- Order Items -->
                <div class="review-section mb-6">
                  <div class="text-body-2 font-weight-bold text-grey mb-3">المنتجات</div>
                  <div class="review-box rounded-xl pa-4">
                    <div v-for="group in cartStore.groupedByVendor" :key="group.companyId" class="mb-4 last-child-no-mb">
                      <div class="text-caption font-weight-bold text-primary mb-2">{{ group.companyName }}</div>
                      <div v-for="item in group.items" :key="item.variantId" class="d-flex align-center gap-3 mb-3">
                        <v-img :src="item.image" width="48" height="48" cover class="rounded-lg flex-shrink-0"></v-img>
                        <div class="flex-grow-1">
                          <p class="text-body-2 font-weight-medium">{{ item.productName }}</p>
                          <p class="text-caption text-grey">الكمية: {{ item.quantity }}</p>
                        </div>
                        <span class="text-body-2 font-weight-bold text-error">
                          {{ formatPrice(Number(item.unitPrice) * Number(item.quantity)) }} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Error -->
                <v-alert v-if="placeOrderError" type="error" variant="tonal" class="mb-4" rounded="xl">
                  {{ placeOrderError }}
                </v-alert>

                <div class="d-flex gap-3">
                  <v-btn variant="outlined" color="grey" @click="currentStep = 1" class="rounded-xl" height="52">
                    <v-icon icon="ri-arrow-right-line" class="me-2" size="18"></v-icon>
                    رجوع
                  </v-btn>
                  <v-btn
                    color="success"
                    class="flex-grow-1 rounded-xl font-weight-black"
                    height="52"
                    elevation="2"
                    :loading="placingOrder"
                    @click="placeOrder"
                    prepend-icon="ri-shield-check-line"
                  >
                    تأكيد الطلب
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right: Order Summary -->
          <v-col cols="12" md="5" lg="4">
            <div class="order-summary-card">
              <div class="summary-header d-flex align-center gap-2 mb-4">
                <v-icon icon="ri-receipt-line" color="primary"></v-icon>
                <span class="text-h6 font-weight-bold">ملخص الطلب</span>
              </div>

              <!-- Items -->
              <div class="summary-items mb-4">
                <div
                  v-for="group in cartStore.groupedByVendor"
                  :key="group.companyId"
                  class="mb-3"
                >
                  <p class="text-caption font-weight-bold text-grey mb-2">{{ group.companyName }}</p>
                  <div v-for="item in group.items" :key="item.variantId" class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center gap-2">
                      <v-img :src="item.image" width="36" height="36" cover class="rounded-lg flex-shrink-0"></v-img>
                      <span class="text-caption summary-item-name">{{ item.productName }} × {{ item.quantity }}</span>
                    </div>
                    <span class="text-caption font-weight-bold">{{ formatPrice(Number(item.unitPrice) * Number(item.quantity)) }}</span>
                  </div>
                </div>
              </div>

              <v-divider class="mb-4"></v-divider>

              <!-- Totals -->
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2 text-grey">المجموع</span>
                <span class="text-body-2 font-weight-medium">{{ formatPrice(cartStore.totalAmount) }} ج.م</span>
              </div>
              <div class="d-flex justify-space-between mb-3">
                <span class="text-body-2 text-grey">الشحن</span>
                <span class="text-body-2 text-success font-weight-bold">مجاني 🎉</span>
              </div>

              <v-divider class="mb-4"></v-divider>

              <div class="d-flex justify-space-between align-center">
                <span class="text-body-1 font-weight-black">الإجمالي الكلي</span>
                <span class="summary-total">{{ formatPrice(cartStore.totalAmount) }}<span class="text-caption ms-1 text-grey">ج.م</span></span>
              </div>

              <!-- Trust -->
              <div class="trust-footer mt-6">
                <div v-for="t in trustItems" :key="t.label" class="d-flex align-center gap-2 mb-2">
                  <v-icon :icon="t.icon" size="16" color="success"></v-icon>
                  <span class="text-caption text-grey">{{ t.label }}</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { customerAddressesApi } from '@/modules/store/api/customerAddresses.api.js'
import { storeOrdersApi } from '@/modules/store/api/storeOrders.api.js'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const currentStep = ref(0)
const steps = ['العنوان', 'الدفع', 'المراجعة']
const savedAddresses = ref([])
const selectedAddressId = ref(null)
const showNewAddressForm = ref(false)
const paymentMethod = ref('cod')
const orderNotes = ref('')
const placingOrder = ref(false)
const placeOrderError = ref(null)

const newAddress = ref({
  recipient_name: '', phone: '', city: '', district: '',
  street: '', building: '', floor: '', apartment: '',
  landmark: '', is_default: false, label: 'home'
})

const trustItems = [
  { icon: 'ri-shield-check-line', label: 'بيانات محمية بتشفير SSL' },
  { icon: 'ri-truck-line', label: 'شحن مجاني على الطلبات فوق 200 ج.م' },
  { icon: 'ri-refresh-line', label: 'إمكانية الإرجاع خلال 14 يوم' },
]

const selectedAddressObj = computed(() => {
  if (selectedAddressId.value) {
    return savedAddresses.value.find(a => a.id === selectedAddressId.value)
  }
  return newAddress.value.recipient_name ? newAddress.value : null
})

const canProceedToStep1 = computed(() =>
  selectedAddressId.value ||
  (newAddress.value.recipient_name && newAddress.value.phone && newAddress.value.city && newAddress.value.street)
)

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  return new Intl.NumberFormat('ar-EG').format(Number(price))
}

const loadAddresses = async () => {
  if (!authStore.isAuthenticated) return
  try {
    const res = await customerAddressesApi.getAddresses()
    savedAddresses.value = res.data?.data || res.data || []
    const def = savedAddresses.value.find(a => a.is_default)
    if (def) selectedAddressId.value = def.id
    else if (savedAddresses.value.length > 0) selectedAddressId.value = savedAddresses.value[0].id
  } catch {}
}

const goToStep = async (step) => {
  if (step === 1 && !selectedAddressId.value && showNewAddressForm.value && authStore.isAuthenticated) {
    try {
      const res = await customerAddressesApi.createAddress(newAddress.value)
      const created = res.data?.data || res.data
      savedAddresses.value.push(created)
      selectedAddressId.value = created.id
      showNewAddressForm.value = false
    } catch (err) {
      return
    }
  }
  currentStep.value = step
}

const placeOrder = async () => {
  placeOrderError.value = null
  placingOrder.value = true
  try {
    const payload = cartStore.buildOrderPayload(selectedAddressId.value, orderNotes.value)
    
    // If not authenticated or creating a new address directly without saving
    if (!selectedAddressId.value) {
      delete payload.shipping_address_id;
      payload.guest_address = { ...newAddress.value };
    }
    
    const res = await storeOrdersApi.placeOrder(payload)
    const order = res.data?.data || res.data
    cartStore.clearCart()
    router.push(`/store/order-confirmation/${order.id || order.order_number}`)
  } catch (err) {
    placeOrderError.value = err.response?.data?.message || 'حدث خطأ أثناء إتمام الطلب. حاول مجدداً.'
  } finally {
    placingOrder.value = false
  }
}

onMounted(() => { 
  loadAddresses() 
  if (authStore.user) {
    newAddress.value.recipient_name = authStore.user.name || ''
    newAddress.value.phone = authStore.user.phone || ''
  }
})
</script>

<style scoped>
.checkout-page {
  direction: rtl;
}

/* Steps */
.checkout-steps {
  direction: rtl;
}

.step-item {
  min-width: 80px;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  background: #e2e8f0;
  color: #94a3b8;
  transition: all 0.3s;
}

.step-active {
  background: linear-gradient(135deg, #1a73e8, #6c47ff) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(26, 115, 232, 0.4);
}

.step-done {
  background: #10b981 !important;
  color: white !important;
}

.step-label {
  font-size: 12px;
  white-space: nowrap;
}

.step-line {
  width: 30px;
  height: 2px;
  background: #e2e8f0;
  flex-shrink: 0;
  margin-bottom: 20px;
  transition: background 0.3s;
}

@media (min-width: 600px) {
  .step-line {
    width: 60px;
  }
}

.step-line-done {
  background: #10b981;
}

/* Cards */
.checkout-card {
  background: white;
  border-radius: 16px !important;
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.step-card-title {
  padding: 16px 16px 12px !important;
  font-size: 16px !important;
  font-weight: 800 !important;
  color: #0f172a;
  border-bottom: 1px solid #f8fafc;
}

@media (min-width: 600px) {
  .checkout-card {
    border-radius: 24px !important;
  }
  .step-card-title {
    padding: 24px 24px 20px !important;
    font-size: 18px !important;
  }
}

.step-num-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a73e8, #6c47ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
}

/* Address */
.address-card {
  border: 2px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
}

.address-card:hover {
  border-color: #bfdbfe;
}

.address-selected {
  border-color: #1a73e8 !important;
  background: #eff6ff;
}

/* Payment */
.payment-option {
  border: 2px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover:not(.payment-disabled) {
  border-color: #bfdbfe;
}

.payment-selected {
  border-color: #1a73e8 !important;
  background: #eff6ff;
}

.payment-disabled {
  opacity: 0.55;
  cursor: default;
}

.payment-icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cod-bg { background: linear-gradient(135deg, #10b981, #059669); }
.card-bg { background: linear-gradient(135deg, #6c47ff, #4f46e5); }

/* Review */
.review-section {}
.review-box {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

/* Summary Card */
.order-summary-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  position: sticky;
  top: 90px;
  border: 1px solid #f1f5f9;
}

.summary-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.summary-items {
  max-height: 300px;
  overflow-y: auto;
}

.summary-item-name {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 130px;
}

.summary-total {
  font-size: 24px;
  font-weight: 900;
  color: #e53935;
}

.trust-footer {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.cursor-pointer { cursor: pointer; }
</style>
