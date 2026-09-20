<template>
  <div class="order-confirmation-page pb-10">
    <StoreNavbar />
    
    <v-main class="bg-grey-lighten-4 min-vh-100 d-flex align-center justify-center">
      <v-container class="max-w-600">
        <v-card class="rounded-xl pa-8 text-center elevation-2">
          <div class="mb-6">
            <v-icon icon="ri-check-double-line" size="96" color="success" class="mb-4"></v-icon>
            <h1 class="text-h3 font-weight-black text-success mb-2">تم تأكيد طلبك بنجاح!</h1>
            <p class="text-h6 text-grey-darken-1">شكراً لتسوقك معنا.</p>
          </div>

          <div class="bg-grey-lighten-4 rounded-lg pa-6 mb-8 text-start">
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-grey-darken-1 font-weight-medium">رقم الطلب</span>
              <span class="text-h6 font-weight-bold">#{{ orderId }}</span>
            </div>
            <p class="text-body-2 text-grey">
              لقد تلقينا طلبك وسنقوم بتجهيزه قريباً. يمكنك متابعة حالة الطلب من خلال صفحة "طلباتي".
            </p>
          </div>

          <div class="d-flex flex-column gap-3">
            <v-btn color="primary" block size="x-large" class="font-weight-bold rounded-lg" to="/store/orders">
              متابعة حالة الطلب
            </v-btn>
            <v-btn variant="outlined" block size="large" class="rounded-lg" color="primary" to="/store">
              العودة للمتجر
            </v-btn>
          </div>
        </v-card>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'

const route = useRoute()
const orderId = route.params.id || '---'
</script>

<style scoped>
.max-w-600 { max-width: 600px; }
.min-vh-100 { min-height: 100vh; }
.gap-3 { gap: 1rem; }
</style>
