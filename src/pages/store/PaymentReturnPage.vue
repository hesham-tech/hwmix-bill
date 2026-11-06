<template><div dir="rtl"><StoreNavbar /><v-main><v-container class="py-12 text-center"><v-progress-circular v-if="redirecting" indeterminate color="primary" /><v-alert v-else type="info" variant="tonal" class="mx-auto" style="max-width:640px">ارجع إلى طلباتك للتحقق من حالة الدفع. <v-btn variant="text" to="/store/my-orders">طلباتي</v-btn></v-alert></v-container></v-main></div></template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import { readJson } from '@/modules/store/utils/checkoutSession'
const router = useRouter(), redirecting = ref(true)
onMounted(() => {
  const checkout = readJson(sessionStorage, 'hwnix_last_checkout')
  if (checkout?.order_number && /^[a-zA-Z0-9-]+$/.test(checkout.order_number)) router.replace({ name: 'store-order-confirmation', params: { id: checkout.order_number } })
  else redirecting.value = false
})
</script>
