<template>
  <div class="checkout-page pb-10">
    <StoreNavbar />
    
    <v-main class="bg-grey-lighten-4 min-vh-100">
      <v-container class="max-w-1200 py-8">
        <v-btn variant="text" prepend-icon="ri-arrow-right-line" class="mb-6 px-0" to="/store/cart">
          العودة للسلة
        </v-btn>

        <h1 class="text-h3 font-weight-black mb-8">إتمام الطلب</h1>

        <v-row>
          <v-col cols="12" md="8">
            <!-- العناوين -->
            <v-card class="rounded-xl elevation-1 mb-6 pa-6">
              <div class="d-flex justify-space-between align-center mb-6">
                <h2 class="text-h5 font-weight-bold d-flex align-center">
                  <v-icon icon="ri-map-pin-line" class="me-2" color="primary"></v-icon>
                  عنوان التوصيل
                </h2>
                <v-btn color="primary" variant="outlined" prepend-icon="ri-add-line" @click="showAddressDialog = true">
                  عنوان جديد
                </v-btn>
              </div>

              <div v-if="addresses.length === 0" class="text-center py-8 bg-grey-lighten-4 rounded-lg border">
                <v-icon icon="ri-map-pin-add-line" size="48" color="grey" class="mb-3"></v-icon>
                <p class="text-body-1 text-grey-darken-1">لا توجد عناوين محفوظة. أضف عنواناً للمتابعة.</p>
              </div>

              <v-radio-group v-model="selectedAddressId" v-else>
                <v-card 
                  v-for="addr in addresses" 
                  :key="addr.id"
                  class="mb-3 border"
                  :class="{ 'border-primary bg-blue-lighten-5': selectedAddressId === addr.id }"
                  variant="flat"
                  @click="selectedAddressId = addr.id"
                  style="cursor: pointer;"
                >
                  <div class="d-flex align-start pa-4">
                    <v-radio :value="addr.id" color="primary" class="mt-0" hide-details></v-radio>
                    <div class="ms-3 flex-grow-1">
                      <div class="d-flex align-center mb-1">
                        <span class="font-weight-bold me-2">{{ addr.first_name }} {{ addr.last_name }}</span>
                        <v-chip v-if="addr.is_default" size="x-small" color="primary">افتراضي</v-chip>
                      </div>
                      <div class="text-body-2 text-grey-darken-1 mb-1">{{ addr.address_line_1 }}, {{ addr.city }}</div>
                      <div class="text-caption text-grey" dir="ltr">{{ addr.phone }}</div>
                    </div>
                  </div>
                </v-card>
              </v-radio-group>
            </v-card>

            <!-- طريقة الدفع -->
            <v-card class="rounded-xl elevation-1 mb-6 pa-6">
              <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center">
                <v-icon icon="ri-wallet-3-line" class="me-2" color="primary"></v-icon>
                طريقة الدفع
              </h2>
              
              <v-card class="border border-primary bg-blue-lighten-5" variant="flat">
                <div class="d-flex align-center pa-4">
                  <v-radio-group model-value="cod" hide-details>
                    <v-radio value="cod" color="primary"></v-radio>
                  </v-radio-group>
                  <div class="ms-3">
                    <div class="font-weight-bold">الدفع عند الاستلام (COD)</div>
                    <div class="text-caption text-grey">ادفع نقداً عند استلام طلبك</div>
                  </div>
                </div>
              </v-card>
            </v-card>
            
            <!-- ملاحظات -->
            <v-card class="rounded-xl elevation-1 mb-6 pa-6">
              <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
                <v-icon icon="ri-sticky-note-line" class="me-2" color="primary"></v-icon>
                ملاحظات إضافية (اختياري)
              </h2>
              <v-textarea
                v-model="orderNotes"
                variant="outlined"
                placeholder="أي تعليمات خاصة بالتوصيل..."
                hide-details
                rows="3"
              ></v-textarea>
            </v-card>
          </v-col>

          <!-- ملخص الطلب والتأكيد -->
          <v-col cols="12" md="4">
            <v-card class="rounded-xl elevation-1 position-sticky" style="top: 24px">
              <v-card-title class="text-h5 font-weight-bold pa-6 pb-2">تفاصيل الطلب</v-card-title>
              
              <v-card-text class="pa-6">
                <!-- المنتجات المصغرة -->
                <div class="mb-6">
                  <div v-for="item in cartStore.items" :key="item.variantId" class="d-flex gap-3 mb-3">
                    <v-avatar size="48" rounded class="bg-grey-lighten-3 border">
                      <v-img :src="item.image" cover></v-img>
                    </v-avatar>
                    <div class="flex-grow-1 min-w-0">
                      <div class="text-body-2 font-weight-medium text-truncate" :title="item.productName">{{ item.productName }}</div>
                      <div class="text-caption text-grey">{{ item.quantity }} × {{ item.unitPrice }} ج.م</div>
                    </div>
                    <div class="font-weight-bold text-body-2">{{ item.quantity * item.unitPrice }} ج.م</div>
                  </div>
                </div>

                <v-divider class="mb-6"></v-divider>

                <div class="d-flex justify-space-between mb-3 text-body-1">
                  <span class="text-grey-darken-1">المجموع الفرعي</span>
                  <span class="font-weight-medium">{{ cartStore.totalAmount }} ج.م</span>
                </div>
                <div class="d-flex justify-space-between mb-4 text-body-1 text-success">
                  <span>رسوم التوصيل</span>
                  <span>مجاناً</span>
                </div>
                
                <v-divider class="my-4"></v-divider>
                
                <div class="d-flex justify-space-between align-center mb-6">
                  <span class="text-h6 font-weight-bold">الإجمالي النهائي</span>
                  <span class="text-h4 font-weight-black text-primary">{{ cartStore.totalAmount }} ج.م</span>
                </div>

                <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4 text-caption py-2">{{ errorMsg }}</v-alert>

                <v-btn 
                  color="primary" 
                  block 
                  size="x-large" 
                  class="font-weight-bold rounded-lg" 
                  @click="placeOrder"
                  :loading="submitting"
                  :disabled="!selectedAddressId || cartStore.isEmpty"
                >
                  تأكيد الطلب
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Address Dialog -->
      <v-dialog v-model="showAddressDialog" max-width="600">
        <v-card class="rounded-xl">
          <v-card-title class="pa-6 border-b text-h5 font-weight-bold">إضافة عنوان جديد</v-card-title>
          <v-card-text class="pa-6">
            <AddressForm @submit="saveAddress" @cancel="showAddressDialog = false" :loading="savingAddress" />
          </v-card-text>
        </v-card>
      </v-dialog>

    </v-main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import AddressForm from '@/modules/store/components/AddressForm.vue'
import { customerAddressesApi } from '@/modules/store/api/customerAddresses.api.js'
import { storeOrdersApi } from '@/modules/store/api/storeOrders.api.js'

const router = useRouter()
const cartStore = useCartStore()

const addresses = ref([])
const selectedAddressId = ref(null)
const orderNotes = ref('')
const showAddressDialog = ref(false)
const submitting = ref(false)
const savingAddress = ref(false)
const errorMsg = ref('')

const fetchAddresses = async () => {
  try {
    const res = await customerAddressesApi.getAddresses()
    addresses.value = res.data?.data || res.data
    const defaultAddr = addresses.value.find(a => a.is_default)
    if (defaultAddr) selectedAddressId.value = defaultAddr.id
    else if (addresses.value.length > 0) selectedAddressId.value = addresses.value[0].id
  } catch (err) {
    console.error('Error fetching addresses:', err)
  }
}

const saveAddress = async (addrData) => {
  savingAddress.value = true
  try {
    await customerAddressesApi.createAddress(addrData)
    await fetchAddresses()
    showAddressDialog.value = false
  } catch (err) {
    console.error('Error saving address:', err)
  } finally {
    savingAddress.value = false
  }
}

const placeOrder = async () => {
  if (!selectedAddressId.value) {
    errorMsg.value = 'الرجاء اختيار عنوان التوصيل'
    return
  }
  
  errorMsg.value = ''
  submitting.value = true
  
  try {
    const payload = cartStore.buildOrderPayload(selectedAddressId.value, orderNotes.value)
    const res = await storeOrdersApi.placeOrder(payload)
    const orderId = res.data?.data?.id || res.data?.id
    
    cartStore.clearCart()
    router.push(`/store/order-confirmation/${orderId}`)
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'حدث خطأ أثناء إنشاء الطلب'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (cartStore.isEmpty) {
    router.push('/store/cart')
    return
  }
  fetchAddresses()
})
</script>

<style scoped>
.max-w-1200 { max-width: 1200px; }
.min-vh-100 { min-height: 100vh; }
.gap-3 { gap: 0.75rem; }
.min-w-0 { min-width: 0; }
</style>
