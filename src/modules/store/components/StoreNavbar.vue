<template>
  <header class="store-header bg-white border-b" dir="rtl">
    <v-container class="py-2" style="max-width: 1400px;">
      <div class="d-flex align-center justify-space-between gap-4">
        
        <!-- Hamburger & Logo -->
        <div class="d-flex align-center gap-2">
          <!-- Mobile Menu Toggle -->
          <v-btn
            icon
            variant="text"
            class="d-md-none"
            @click="mobileMenu = true"
          >
            <v-icon icon="ri-menu-line" size="24"></v-icon>
          </v-btn>

          <router-link to="/store" class="d-flex align-center gap-2 text-decoration-none">
            <v-avatar color="primary" size="40" rounded="lg">
              <v-icon icon="ri-store-2-fill" color="white" size="24"></v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-black text-primary" style="line-height: 1;">HWNix</div>
              <div class="text-caption text-grey-darken-1">المتجر</div>
            </div>
          </router-link>
        </div>

        <!-- Search -->
        <div class="flex-grow-1 mx-md-8 hidden-sm-and-down" style="max-width: 600px;">
          <v-text-field
            v-model="searchQuery"
            placeholder="ابحث عن المنتجات..."
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            bg-color="grey-lighten-4"
            prepend-inner-icon="ri-search-line"
            @keyup.enter="handleSearch"
          >
            <template v-slot:append-inner>
              <v-btn
                color="primary"
                size="small"
                variant="flat"
                class="rounded-pill px-4 me-1"
                height="32"
                @click="handleSearch"
                elevation="0"
              >
                بحث
              </v-btn>
            </template>
          </v-text-field>
        </div>

        <!-- Actions -->
        <div class="d-flex align-center gap-2">
          
          <!-- Wishlist -->
          <v-btn
            icon
            variant="text"
            color="grey-darken-3"
            to="/store/wishlist"
            class="hidden-xs"
          >
            <v-badge
              v-if="wishlistStore.items.length > 0"
              :content="wishlistStore.items.length"
              color="error"
              floating
            >
              <v-icon icon="ri-heart-3-line" size="24"></v-icon>
            </v-badge>
            <v-icon v-else icon="ri-heart-3-line" size="24"></v-icon>
          </v-btn>

          <!-- Cart -->
          <v-btn
            icon
            variant="text"
            color="grey-darken-3"
            @click="cartStore.toggleDrawer"
          >
            <v-badge
              v-if="cartStore.itemCount > 0"
              :content="cartStore.itemCount"
              color="error"
              floating
            >
              <v-icon icon="ri-shopping-cart-2-line" size="24"></v-icon>
            </v-badge>
            <v-icon v-else icon="ri-shopping-cart-2-line" size="24"></v-icon>
          </v-btn>

          <!-- User Menu -->
          <v-menu v-if="authStore.isAuthenticated" transition="slide-y-transition">
            <template v-slot:activator="{ props }">
              <v-btn variant="text" v-bind="props" class="px-2" rounded="pill" min-width="48">
                <v-avatar color="primary-lighten-1" size="32" class="text-white font-weight-bold">
                  <v-img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url"></v-img>
                  <v-icon v-else icon="ri-user-smile-line" size="20"></v-icon>
                </v-avatar>
                <span class="hidden-sm-and-down ms-2 font-weight-medium">
                  {{ authStore.user?.name?.split(' ')[0] || 'حسابي' }}
                </span>
                <v-icon icon="ri-arrow-down-s-line" size="16" class="ms-1 hidden-sm-and-down"></v-icon>
              </v-btn>
            </template>
            <v-list min-width="200" rounded="xl" elevation="4" class="mt-2">
              <v-list-item to="/store/my-orders" prepend-icon="ri-file-list-3-line" title="طلباتي"></v-list-item>
              <v-list-item to="/app/portal" prepend-icon="ri-dashboard-line" title="حسابي"></v-list-item>
              <v-divider class="my-2"></v-divider>
              <v-list-item @click="logout" prepend-icon="ri-logout-circle-line" title="تسجيل الخروج" color="error"></v-list-item>
            </v-list>
          </v-menu>

          <template v-else>
            <v-btn variant="text" color="primary" :to="{ path: '/login', query: { redirect: $route.fullPath } }" class="px-2 font-weight-medium">
              دخول
            </v-btn>
            <v-btn variant="flat" color="primary" :to="{ path: '/register', query: { type: 'customer', redirect: $route.fullPath } }" rounded="pill" class="px-3 px-sm-4 font-weight-bold d-none d-sm-flex" size="small">
              حساب جديد
            </v-btn>
            <v-btn variant="flat" color="primary" :to="{ path: '/register', query: { type: 'customer', redirect: $route.fullPath } }" rounded="pill" class="px-3 font-weight-bold d-sm-none" size="small">
              جديد
            </v-btn>
          </template>

        </div>
      </div>

      <!-- Mobile Search -->
      <div class="d-md-none mt-3">
        <v-text-field
          v-model="searchQuery"
          placeholder="ابحث عن منتج..."
          variant="outlined"
          density="compact"
          hide-details
          rounded="pill"
          bg-color="grey-lighten-4"
          prepend-inner-icon="ri-search-line"
          @keyup.enter="handleSearch"
        ></v-text-field>
      </div>
      <!-- Desktop Navigation Links -->
      <div class="d-none d-md-flex align-center gap-8 mt-3 pt-3 border-t">
        <router-link to="/store" class="nav-link text-body-2 font-weight-bold">
          <v-icon icon="ri-home-4-line" size="18" class="me-1"></v-icon> الرئيسية
        </router-link>
        <router-link to="/store?sort=newest" class="nav-link text-body-2 font-weight-bold">
          <v-icon icon="ri-shopping-bag-3-line" size="18" class="me-1"></v-icon> المنتجات
        </router-link>
        <router-link to="/store?sort=best_selling" class="nav-link text-body-2 font-weight-bold text-error">
          <v-icon icon="ri-fire-line" size="18" class="me-1"></v-icon> الأكثر مبيعاً
        </router-link>
      </div>
    </v-container>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="mobileMenu" temporary location="right" class="d-md-none">
      <div class="pa-4">
        <div class="text-h6 font-weight-black text-primary mb-6">HWNix</div>
        <v-list nav>
          <v-list-item to="/store" prepend-icon="ri-home-4-line" title="الرئيسية"></v-list-item>
          <v-list-item to="/store?sort=newest" prepend-icon="ri-shopping-bag-3-line" title="المنتجات"></v-list-item>
          <v-list-item to="/store?sort=best_selling" prepend-icon="ri-fire-line" title="الأكثر مبيعاً" class="text-error"></v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'

const mobileMenu = ref(false)

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/store', query: { q: searchQuery.value } })
  }
}

const logout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.store-header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
  background-color: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
}
.nav-link {
  text-decoration: none;
  color: #334155;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}
.nav-link:hover {
  color: #1a73e8 !important;
}
</style>
