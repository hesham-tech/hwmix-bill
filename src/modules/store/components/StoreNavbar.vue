<template>
  <div class="store-navigation" dir="rtl">
    <!-- ========================================== -->
    <!-- 1. ديستكتوب فقط (Desktop View >= 960px)   -->
    <!-- ========================================== -->
    <header class="store-desktop-header bg-white border-b d-none d-md-block">
      <v-container class="py-2" style="max-width: 1400px;">
        <div class="d-flex align-center justify-space-between gap-4">

          <!-- Logo -->
          <div class="d-flex align-center gap-2">
            <router-link to="/" aria-label="HWNix — الرئيسية" class="d-flex align-center gap-2 text-decoration-none">
              <v-avatar color="primary" size="40" rounded="lg">
                <v-icon icon="ri-store-2-fill" color="white" size="24"></v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-black text-primary" style="line-height: 1;">HWNix</div>
                <div class="text-caption text-grey-darken-1">المتجر</div>
              </div>
            </router-link>
          </div>

          <!-- Desktop Search -->
          <div class="flex-grow-1 mx-md-8" style="max-width: 600px;">
            <v-text-field
              v-model="searchQuery"
              @click:clear="clearSearch"
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

          <!-- Desktop Actions -->
          <div class="d-flex align-center gap-2">

            <!-- Wishlist -->
            <v-btn
              icon
              variant="text"
              color="grey-darken-3"
              to="/store/wishlist"
            >
              <v-badge
                v-if="wishlistStore.items?.length > 0"
                :content="wishlistStore.items.length"
                color="error"
                class="custom-badge"
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
                class="custom-badge"
              >
                <v-icon icon="ri-shopping-cart-2-line" size="24"></v-icon>
              </v-badge>
              <v-icon v-else icon="ri-shopping-cart-2-line" size="24"></v-icon>
            </v-btn>

            <!-- User Menu -->
            <v-menu v-if="authStore.isAuthenticated" transition="slide-y-transition">
              <template v-slot:activator="{ props }">
                <v-btn variant="text" v-bind="props" class="px-2" rounded="pill" min-width="48">
                  <v-avatar color="primary" size="32" class="text-white font-weight-bold">
                    <v-img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url"></v-img>
                    <span v-else>{{ authStore.user?.name?.charAt(0) || 'ح' }}</span>
                  </v-avatar>
                  <span class="ms-2 font-weight-medium">
                    {{ authStore.user?.name?.split(' ')[0] || 'حسابي' }}
                  </span>
                  <v-icon icon="ri-arrow-down-s-line" size="16" class="ms-1"></v-icon>
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
              <v-btn variant="flat" color="primary" :to="{ path: '/register', query: { type: 'customer', redirect: $route.fullPath } }" rounded="pill" class="px-3 px-sm-4 font-weight-bold" size="small">
                حساب جديد
              </v-btn>
            </template>

          </div>
        </div>

        <!-- Desktop Navigation Links -->
        <div class="d-flex align-center gap-8 mt-3 pt-3 border-t">
          <router-link to="/" class="nav-link text-body-2 font-weight-bold">
            <v-icon icon="ri-home-4-line" size="18" class="me-1"></v-icon> الرئيسية
          </router-link>
          <router-link to="/store" class="nav-link text-body-2 font-weight-bold">
            <v-icon icon="ri-shopping-bag-3-line" size="18" class="me-1"></v-icon> المنتجات
          </router-link>
          <router-link to="/store?sort=best_selling" class="nav-link text-body-2 font-weight-bold text-error">
            <v-icon icon="ri-fire-line" size="18" class="me-1"></v-icon> الأكثر مبيعاً
          </router-link>
          <router-link to="/tools" class="nav-link text-body-2 font-weight-bold text-primary">
            <v-icon icon="ri-apps-2-line" size="18" class="me-1"></v-icon> مركز الأدوات
          </router-link>
        </div>
      </v-container>
    </header>

    <!-- ========================================== -->
    <!-- 2. هاتف فقط (Mobile App Top Bar < 960px)   -->
    <!-- ========================================== -->
    <header
      class="store-mobile-appbar d-md-none"
      :class="{ 'nav-hidden': !isNavVisible, 'home-appbar': isLandingPage }"
      :inert="!isNavVisible"
    >
      <!-- نمط الصفحة الرئيسية للمتجر -->
      <div v-if="isStoreHome || isLandingPage" class="mobile-appbar-content d-flex align-center gap-2 px-3 py-2">
        <router-link to="/" aria-label="HWNix — الرئيسية" class="d-flex align-center gap-2 text-decoration-none flex-shrink-0">
          <v-avatar color="primary" size="34" rounded="lg">
            <v-icon icon="ri-store-2-fill" color="white" size="20"></v-icon>
          </v-avatar>
          <div class="appbar-brand-text">
            <div class="text-subtitle-2 font-weight-black text-primary" style="line-height: 1;">HWNix</div>
            <div class="text-caption text-grey-darken-1" style="font-size: 0.65rem !important;">المتجر</div>
          </div>
        </router-link>

        <v-btn v-if="isLandingPage" to="/store/wishlist" icon variant="text" color="primary" class="home-wishlist" aria-label="المفضلة">
          <v-badge :model-value="wishlistStore.items?.length > 0" :content="wishlistStore.items?.length" color="error">
            <v-icon icon="ri-heart-3-line" size="24" />
          </v-badge>
        </v-btn>
        <div class="flex-grow-1 mx-1" :class="{ 'home-search': isLandingPage }">
          <v-text-field
            v-model="searchQuery"
              @click:clear="clearSearch"
            placeholder="ابحث عن منتج..."
            aria-label="ابحث عن المنتجات"
            variant="solo-filled"
            flat
            density="compact"
            hide-details
            rounded="pill"
            bg-color="grey-lighten-4"
            prepend-inner-icon="ri-search-line"
            @keyup.enter="handleSearch"
            class="mobile-search-input"
            @focusin="searchFocused = true"
            @focusout="searchFocused = false"
            clearable
          ></v-text-field>
        </div>

        <v-btn
          icon
          variant="text"
          size="small"
          color="primary"
          class="flex-shrink-0"
          @click="isMobileFilterOpen = true"
          title="الأقسام والتصفية"
          v-if="!isLandingPage"
          aria-label="تصفية المنتجات"
          :aria-expanded="isMobileFilterOpen"
        >
          <v-icon icon="ri-filter-3-line" size="22"></v-icon>
        </v-btn>
      </div>

      <!-- نمط الصفحات الداخلية (تفاصيل المنتج، السلة، المفضلة، إلخ) -->
      <div v-else class="mobile-appbar-content d-flex align-center justify-space-between px-3 py-2">
        <v-btn
          icon
          variant="text"
          size="small"
          color="grey-darken-3"
          class="flex-shrink-0"
          @click="handleBack"
          title="رجوع"
        >
          <v-icon icon="ri-arrow-right-line" size="24"></v-icon>
        </v-btn>

        <div class="text-subtitle-2 font-weight-bold text-grey-darken-3 text-center flex-grow-1 px-2 text-truncate">
          {{ pageTitle }}
        </div>

        <div class="d-flex align-center gap-1 flex-shrink-0">
          <v-btn
            v-if="isProductDetailPage"
            icon
            variant="text"
            size="small"
            color="grey-darken-3"
            @click="handleShare"
            title="مشاركة"
          >
            <v-icon icon="ri-share-line" size="20"></v-icon>
          </v-btn>

          <v-btn
            icon
            variant="text"
            size="small"
            color="grey-darken-3"
            @click="cartStore.toggleDrawer"
            title="السلة"
          >
            <v-badge
              v-if="cartStore.itemCount > 0"
              :content="cartStore.itemCount"
              color="error"
              class="custom-badge"
            >
              <v-icon icon="ri-shopping-cart-2-line" size="22"></v-icon>
            </v-badge>
            <v-icon v-else icon="ri-shopping-cart-2-line" size="22"></v-icon>
          </v-btn>
        </div>
      </div>
    </header>

    <!-- فاصل علوي لتعويض الـ Fixed App Bar في الهاتف -->
    <div class="mobile-appbar-spacer d-md-none" :class="{ 'home-appbar-spacer': isLandingPage }"></div>

    <!-- ========================================== -->
    <!-- 3. شريط التنقل السفلي للهاتف                -->
    <!-- ========================================== -->
    <StoreBottomNav />
    <CartDrawer />
    <v-navigation-drawer v-model="isMobileCategoriesOpen" temporary location="right" width="320" :style="{ maxWidth: '100vw' }" :z-index="2200" aria-label="أقسام المتجر">
      <div class="d-flex align-center justify-space-between pa-4 border-b">
        <h2 class="text-h6">الأقسام</h2>
        <v-btn icon="ri-close-line" variant="text" aria-label="إغلاق الأقسام" @click="isMobileCategoriesOpen = false" />
      </div>
      <v-progress-linear v-if="categoriesLoading" indeterminate color="primary" />
      <div v-else-if="categoriesError" class="pa-4" role="alert">
        {{ categoriesError }}
        <v-btn block variant="tonal" class="mt-3" @click="loadCategories">إعادة المحاولة</v-btn>
      </div>
      <v-list v-else-if="categories.length">
        <v-list-item v-for="category in categories" :key="category.id" :title="category.name" @click="selectCategory(category.id)" />
      </v-list>
      <p v-else class="pa-4">لا توجد أقسام حاليًا</p>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
// شريط التنقل العلوي للمتجر مع دعم تجربة التطبيق الأصيل للهاتف وحركة الإخفاء التلقائي عند التمرير
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useStoreMobileNav, resetStoreMobileNav } from '../composables/useStoreMobileNav'
import { useStoreCategories } from '../composables/useStoreCategories'
import CartDrawer from './CartDrawer.vue'
import StoreBottomNav from './StoreBottomNav.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

const { isNavVisible, isMobileCategoriesOpen, isMobileFilterOpen, showAccountSheet, searchFocused, keyboardOpen, bottomNavHeight, purchaseHeight, overlayOpen } = useStoreMobileNav()
const { categories, loading: categoriesLoading, error: categoriesError, loadCategories } = useStoreCategories()
const selectCategory = (id) => {
  isMobileCategoriesOpen.value = false
  router.push({ path: '/store', query: { category_id: id } })
}
watch(isMobileCategoriesOpen, open => { if (open) loadCategories() })
watch(() => route.fullPath, () => {
  resetStoreMobileNav()
  cartStore.isDrawerOpen = false
}, { immediate: true })
watch(() => cartStore.isDrawerOpen, open => {
  if (open) {
    isMobileCategoriesOpen.value = false
    isMobileFilterOpen.value = false
    showAccountSheet.value = false
  }
})
watch([isMobileCategoriesOpen, isMobileFilterOpen, showAccountSheet], values => {
  if (values.some(Boolean)) cartStore.isDrawerOpen = false
})
const overlayVisible = computed(() => overlayOpen.value || cartStore.isDrawerOpen || isMobileCategoriesOpen.value || isMobileFilterOpen.value || showAccountSheet.value)
const syncMobileOffsets = () => {
  const root = document.documentElement
  root.style.setProperty('--store-bottom-height', `${bottomNavHeight.value}px`)
  root.style.setProperty('--store-nav-offset', `${isNavVisible.value && !keyboardOpen.value ? bottomNavHeight.value : 0}px`)
  root.style.setProperty('--store-purchase-height', `${purchaseHeight.value}px`)
  root.toggleAttribute('data-store-overlay', overlayVisible.value)
}
watch([isNavVisible, bottomNavHeight, purchaseHeight, keyboardOpen, overlayVisible], syncMobileOffsets)
onMounted(() => {
  document.documentElement.setAttribute('data-store-mobile', '')
  syncMobileOffsets()
})
onUnmounted(() => {
  document.documentElement.removeAttribute('data-store-mobile')
  document.documentElement.removeAttribute('data-store-overlay')
  document.documentElement.style.removeProperty('--store-bottom-height')
  document.documentElement.style.removeProperty('--store-nav-offset')
  document.documentElement.style.removeProperty('--store-purchase-height')
})

const searchQuery = ref('')
watch(() => route.query.q, value => { searchQuery.value = String(value || '') }, { immediate: true })

const isLandingPage = computed(() => route.path === '/')

const isStoreHome = computed(() => {
  return route.path === '/store' || route.name === 'store-home'
})

const isProductDetailPage = computed(() => {
  return route.name === 'store-product-detail' || route.path.startsWith('/store/product')
})

const pageTitle = computed(() => {
  if (isProductDetailPage.value) return 'تفاصيل المنتج'
  if (route.name === 'store-cart' || route.path === '/store/cart') return 'سلة المشتريات'
  if (route.name === 'store-checkout' || route.path === '/store/checkout') return 'إتمام الطلب'
  if (route.name === 'store-wishlist' || route.path === '/store/wishlist') return 'قائمة المفضلة'
  if (route.name === 'store-my-orders' || route.path === '/store/my-orders') return 'طلباتي ومشترياتي'
  if (route.name === 'store-order-confirmation' || route.path.startsWith('/store/order-confirmation')) return 'تأكيد الطلب'
  if (route.name === 'store-vendor' || route.path.startsWith('/store/vendor')) return 'صفحة البائع'
  return 'المتجر الإلكتروني'
})

const handleSearch = () => {
  const query = isLandingPage.value ? {} : { ...route.query }
  const value = (searchQuery.value || '').trim()
  if (value) query.q = value
  else delete query.q
  router.push({ path: '/store', query })
}
const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}
const handleBack = () => {
  const back = router.options.history.state.back
  if (typeof back === 'string' && back.startsWith('/') && !back.startsWith('//')) router.back()
  else router.push('/store')
}

const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: document.title || 'HWNix Store',
        url: window.location.href,
      })
    } catch {}
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {}
  }
}

const logout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
/* Keep the desktop sticky header attached to the page, not a short wrapper. */
.store-navigation { display: contents; }
@media (prefers-reduced-motion: reduce) {
  .store-mobile-appbar { transition: none; }
}
.home-appbar .mobile-appbar-content { height: 112px; flex-wrap: wrap; align-content: center; gap: 8px !important; }
.home-wishlist { margin-inline-start: auto; }
.home-search { flex-basis: 100%; margin: 0 !important; }
.home-appbar-spacer { height: calc(112px + env(safe-area-inset-top, 0px)); }
/* ديستكتوب */
.store-desktop-header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
  background-color: #ffffff !important;
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

/* هاتف - App Bar */
.store-mobile-appbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 998;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transform: translateY(0);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  padding-top: env(safe-area-inset-top, 0px);
}

.store-mobile-appbar.nav-hidden {
  transform: translateY(-100%);
}

.mobile-appbar-content {
  height: 54px;
}

.mobile-appbar-spacer {
  height: calc(54px + env(safe-area-inset-top, 0px));
  width: 100%;
}

.appbar-brand-text {
  display: flex;
  flex-direction: column;
}

:deep(.mobile-search-input .v-field) {
  border-radius: 9999px !important;
  font-size: 0.82rem !important;
  height: 38px !important;
}

:deep(.mobile-search-input .v-field__input) {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  min-height: 38px !important;
}

:deep(.custom-badge .v-badge__badge) {
  font-size: 0.65rem !important;
  min-width: 16px !important;
  height: 16px !important;
  padding: 0 4px !important;
  transform: translate(-25%, -25%) !important;
}
</style>
