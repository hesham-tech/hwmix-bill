<template>
  <nav
    ref="navElement"
    class="store-mobile-bottom-nav d-md-none"
    :class="{ 'nav-hidden': !isNavVisible || keyboardOpen }"
    :inert="!isNavVisible || keyboardOpen"
    aria-label="شريط التنقل السفلي للمتجر"
  >
    <div class="bottom-nav-inner d-flex align-center justify-space-around">

      <!-- 1. الرئيسية -->
      <router-link
        to="/store"
        @click="goHome"
        :aria-current="isRouteActive('/store') ? 'page' : undefined"
        class="nav-tab-item"
        :class="{ 'active': isRouteActive('/store') }"
      >
        <div class="icon-wrap">
          <v-icon
            :icon="isRouteActive('/store') ? 'ri-store-2-fill' : 'ri-store-2-line'"
            size="22"
          ></v-icon>
        </div>
        <span class="tab-label">الرئيسية</span>
      </router-link>

      <!-- 2. الأقسام -->
      <button
        type="button"
        class="nav-tab-item"
        :class="{ 'active': isMobileCategoriesOpen }"
        @click="handleCategoriesClick"
        :aria-expanded="isMobileCategoriesOpen"
      >
        <div class="icon-wrap">
          <v-icon
            :icon="isMobileCategoriesOpen ? 'ri-apps-2-fill' : 'ri-apps-2-line'"
            size="22"
          ></v-icon>
        </div>
        <span class="tab-label">الأقسام</span>
      </button>

      <!-- 3. السلة (الزر المميز في المنتصف) -->
      <button
        type="button"
        class="nav-tab-item cart-highlight-tab"
        @click="openCart"
      >
        <div class="cart-icon-bubble">
          <v-badge
            v-if="cartStore.itemCount > 0"
            :content="cartStore.itemCount"
            color="error"
            max="99"
            class="cart-badge-counter"
          >
            <v-icon icon="ri-shopping-cart-2-line" size="22" color="white"></v-icon>
          </v-badge>
          <v-icon v-else icon="ri-shopping-cart-2-line" size="22" color="white"></v-icon>
        </div>
        <span class="tab-label">السلة</span>
      </button>

      <!-- 4. المفضلة -->
      <router-link
        to="/store/wishlist"
        :aria-current="isRouteActive('/store/wishlist') ? 'page' : undefined"
        class="nav-tab-item"
        :class="{ 'active': isRouteActive('/store/wishlist') }"
      >
        <div class="icon-wrap">
          <v-badge
            v-if="wishlistStore.items?.length > 0"
            :content="wishlistStore.items.length"
            color="error"
            max="99"
            class="mini-badge"
          >
            <v-icon
              :icon="isRouteActive('/store/wishlist') ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
              size="22"
            ></v-icon>
          </v-badge>
          <v-icon
            v-else
            :icon="isRouteActive('/store/wishlist') ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
            size="22"
          ></v-icon>
        </div>
        <span class="tab-label">المفضلة</span>
      </router-link>

      <!-- 5. حسابي -->
      <button
        type="button"
        class="nav-tab-item"
        :class="{ 'active': isRouteActive('/store/my-orders') || showAccountSheet }"
        @click="handleAccountClick"
        :aria-expanded="showAccountSheet"
      >
        <div class="icon-wrap">
          <v-avatar
            v-if="authStore.isAuthenticated && authStore.user?.avatar_url"
            size="24"
            class="border"
          >
            <v-img :src="authStore.user.avatar_url" alt="avatar"></v-img>
          </v-avatar>
          <v-icon
            v-else
            :icon="authStore.isAuthenticated ? 'ri-user-3-fill' : 'ri-user-3-line'"
            size="22"
          ></v-icon>
        </div>
        <span class="tab-label">{{ authStore.isAuthenticated ? 'حسابي' : 'دخول' }}</span>
      </button>

    </div>

    <!-- قائمة حسابي السريعة للهاتف (Bottom Sheet) -->
    <v-bottom-sheet v-model="showAccountSheet" :z-index="2200">
      <v-card class="rounded-t-xl pa-4 bg-white" dir="rtl">
        <div class="d-flex align-center justify-space-between mb-4 pb-2 border-b">
          <div class="d-flex align-center gap-3">
            <v-avatar color="primary" size="42" class="text-white font-weight-bold">
              <v-img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url"></v-img>
              <span v-else>{{ authStore.user?.name?.charAt(0) || 'ح' }}</span>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ authStore.user?.name || 'مرحباً بك' }}</div>
              <div class="text-caption text-grey">{{ authStore.user?.phone || authStore.user?.email || 'عميل المتجر' }}</div>
            </div>
          </div>
          <v-btn icon="ri-close-line" variant="text" size="small" @click="showAccountSheet = false"></v-btn>
        </div>

        <v-list density="compact" nav class="pa-0">
          <v-list-item
            to="/store/my-orders"
            prepend-icon="ri-file-list-3-line"
            title="طلباتي ومشترياتي"
            rounded="lg"
            @click="showAccountSheet = false"
          ></v-list-item>
          <v-list-item
            to="/store/wishlist"
            prepend-icon="ri-heart-3-line"
            title="قائمة المفضلة"
            rounded="lg"
            @click="showAccountSheet = false"
          ></v-list-item>
          <v-list-item
            to="/app/portal"
            prepend-icon="ri-dashboard-line"
            title="لوحة التحكم / الحساب"
            rounded="lg"
            @click="showAccountSheet = false"
          ></v-list-item>
          <v-divider class="my-2"></v-divider>
          <v-list-item
            prepend-icon="ri-logout-circle-line"
            title="تسجيل الخروج"
            color="error"
            rounded="lg"
            @click="handleLogout"
          ></v-list-item>
        </v-list>
      </v-card>
    </v-bottom-sheet>
  </nav>
</template>

<script setup>
// شريط التنقل السفلي للمتجر في الهواتف الذكية مع تأثير الإخفاء والإظهار التلقائي عند التمرير
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { useStoreMobileNav } from '../composables/useStoreMobileNav'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()

const { isNavVisible, isMobileCategoriesOpen, isMobileFilterOpen, showAccountSheet, keyboardOpen, bottomNavHeight, toggleCategoriesDrawer } = useStoreMobileNav()
const navElement = ref(null)
let observer
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    bottomNavHeight.value = entry.target.getBoundingClientRect().height
  })
  observer.observe(navElement.value, { box: 'border-box' })
})
onUnmounted(() => observer?.disconnect())
const goHome = () => {
  isNavVisible.value = true
  isMobileCategoriesOpen.value = false
  isMobileFilterOpen.value = false
  showAccountSheet.value = false
  cartStore.isDrawerOpen = false
  if (route.path === '/store') window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
const openCart = () => {
  isMobileCategoriesOpen.value = false
  isMobileFilterOpen.value = false
  showAccountSheet.value = false
  cartStore.toggleDrawer()
}



const isRouteActive = (path) => {
  if (path === '/store') {
    return route.path === '/store'
  }
  return route.path.startsWith(path)
}

const handleCategoriesClick = () => toggleCategoriesDrawer()

const handleAccountClick = () => {
  if (!authStore.isAuthenticated) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
  } else {
    isMobileCategoriesOpen.value = false
    isMobileFilterOpen.value = false
    cartStore.isDrawerOpen = false
    showAccountSheet.value = true
  }
}

const handleLogout = async () => {
  showAccountSheet.value = false
  await authStore.logout()
  router.push('/store')
}
</script>

<style scoped>
.store-mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  transform: translateY(0);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  padding-bottom: max(env(safe-area-inset-bottom, 0px), 6px);
  user-select: none;
  -webkit-user-select: none;
}

.store-mobile-bottom-nav.nav-hidden {
  transform: translateY(100%);
}

.bottom-nav-inner {
  height: 60px;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 8px;
}

.nav-tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: #64748b;
  text-decoration: none;
  background: transparent;
  border: none;
  outline-offset: -3px;
  cursor: pointer;
  padding: 4px 2px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-tab-item .icon-wrap {
  position: relative;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.nav-tab-item .tab-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  line-height: 1;
  transition: color 0.2s ease;
}

/* حالة الزر النشط */
.nav-tab-item.active {
  color: #1a73e8;
}

.nav-tab-item.active .icon-wrap {
  transform: translateY(-2px);
}

.nav-tab-item.active .tab-label {
  font-weight: 700;
}

.nav-tab-item:active {
  transform: scale(0.94);
}

/* الزر المميز للسلة في المنتصف */
.cart-highlight-tab {
  margin-top: 0;
}

.cart-icon-bubble {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(26, 115, 232, 0.4);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cart-highlight-tab:active .cart-icon-bubble {
  transform: scale(0.9);
}

.cart-highlight-tab .tab-label {
  color: #1a73e8;
  font-weight: 700;
  margin-top: 3px;
}

:deep(.cart-badge-counter .v-badge__badge) {
  font-size: 0.65rem !important;
  height: 18px !important;
  min-width: 18px !important;
  padding: 0 4px !important;
  border: 2px solid #ffffff !important;
  font-weight: bold;
}

:deep(.mini-badge .v-badge__badge) {
  font-size: 0.6rem !important;
  height: 16px !important;
  min-width: 16px !important;
  padding: 0 3px !important;
  transform: translate(-30%, -30%) !important;
}
</style>

<style scoped>
.nav-tab-item:focus-visible { outline: 2px solid #1a73e8; }
@media (prefers-reduced-motion: reduce) {
  .store-mobile-bottom-nav, .nav-tab-item, .icon-wrap, .cart-icon-bubble { transition: none; }
}
</style>
