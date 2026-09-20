<template>
  <v-app-bar color="white" elevation="1" class="border-b">
    <v-container class="d-flex align-center py-0 px-2 px-md-4 max-w-1200 mx-auto w-100">
      
      <!-- Brand / Logo -->
      <router-link to="/store" class="text-decoration-none d-flex align-center me-6">
        <div class="text-h5 font-weight-black text-primary">المتجر</div>
      </router-link>

      <v-spacer></v-spacer>

      <!-- Search (Desktop) -->
      <div class="hidden-sm-and-down w-50 max-w-600 me-6">
        <v-text-field
          v-model="searchQuery"
          variant="solo-filled"
          density="compact"
          flat
          hide-details
          placeholder="ابحث عن منتج..."
          prepend-inner-icon="ri-search-line"
          rounded="pill"
          bg-color="grey-lighten-4"
          @keyup.enter="handleSearch"
        ></v-text-field>
      </div>

      <!-- Actions -->
      <div class="d-flex align-center gap-2">
        <v-btn icon @click="cartStore.toggleDrawer">
          <v-badge :content="cartStore.itemCount" color="error" v-if="cartStore.itemCount > 0">
            <v-icon icon="ri-shopping-cart-2-line"></v-icon>
          </v-badge>
          <v-icon v-else icon="ri-shopping-cart-2-line"></v-icon>
        </v-btn>

        <!-- User Menu -->
        <v-menu v-if="authStore.isAuthenticated" transition="slide-y-transition">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar color="primary" size="32">
                <span class="text-caption">{{ authStore.user?.name?.charAt(0) || 'م' }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list min-width="200" elevation="3" class="mt-2 rounded-lg">
            <v-list-item to="/store/orders" prepend-icon="ri-file-list-3-line" title="طلباتي"></v-list-item>
            <v-list-item to="/dashboard" prepend-icon="ri-dashboard-line" title="لوحة التحكم"></v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item @click="logout" prepend-icon="ri-logout-circle-line" title="تسجيل الخروج" color="error"></v-list-item>
          </v-list>
        </v-menu>

        <v-btn v-else variant="outlined" color="primary" to="/login" rounded="pill" class="font-weight-bold">
          تسجيل الدخول
        </v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/store', query: { q: searchQuery.value } })
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.max-w-1200 {
  max-width: 1200px;
}
.max-w-600 {
  max-width: 600px;
}
</style>
