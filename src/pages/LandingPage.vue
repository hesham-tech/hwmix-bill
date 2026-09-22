<template>
  <div class="landing-page">
    <StoreNavbar />
    <CartDrawer />

    <v-main>
      <!-- Hero Carousel -->
      <section class="banner-carousel-section">
        <v-carousel cycle hide-delimiter-background show-arrows="hover" :height="$vuetify.display.smAndDown ? 200 : 450" class="mb-8">
          <v-carousel-item
            v-for="(banner, i) in banners"
            :key="i"
            :src="banner.image"
            cover
          >
          </v-carousel-item>
        </v-carousel>
      </section>

      <!-- Category Section -->
      <section id="categories" class="py-16 bg-white">
        <v-container>
          <div class="d-flex align-center justify-space-between mb-10">
            <div>
              <h2 class="text-h4 font-weight-bold mb-2">تسوق حسب القسم</h2>
              <p class="text-grey">اختر ما يناسبك من بين تشكيلاتنا الواسعة</p>
            </div>
            <v-btn variant="text" color="primary" append-icon="ri-arrow-left-line">عرض الكل</v-btn>
          </div>

          <v-row>
            <v-col v-for="(cat, i) in categories" :key="i" cols="6" md="3">
              <v-card variant="flat" border class="category-card rounded-md text-center pa-6 hover-lift-up" :to="`/store?category_id=${cat.id}`">
                <v-avatar :color="(cat.color || 'primary') + '-lighten-5'" rounded="circle" size="80" class="mb-4">
                  <v-icon :icon="cat.icon || 'ri-layout-grid-line'" :color="cat.color || 'primary'" size="40" />
                </v-avatar>
                <h3 class="text-h6 font-weight-bold">{{ cat.name }}</h3>
                <p class="text-caption text-grey" v-if="cat.products_count">{{ cat.products_count }} منتج</p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- Featured Products Section -->
      <section id="products" class="py-16 bg-grey-lighten-5">
        <v-container>
          <h2 class="text-h4 font-weight-bold text-center mb-12">المنتجات الأكثر مبيعاً</h2>

          <v-row>
            <v-col v-for="(prod, i) in featuredProducts" :key="i" cols="12" sm="6" md="3">
              <v-card variant="flat" border class="product-card rounded-md overflow-hidden hover-lift h-100" :to="`/store/product/${prod.id}`">
                <div class="product-image-container pa-4 bg-white d-flex align-center justify-center">
                  <v-img v-if="prod.image" :src="prod.image" height="150" contain></v-img>
                  <v-icon v-else icon="ri-image-line" size="100" class="text-grey-lighten-2" />
                  <v-chip color="error" class="product-badge" size="small" v-if="prod.discount">خصم {{ prod.discount }}%</v-chip>
                </div>
                <v-card-text class="pa-4">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-grey">{{ prod.category?.name || 'غير محدد' }}</span>
                    <div class="d-flex align-center">
                      <v-icon icon="ri-star-fill" color="orange" size="14" />
                      <span class="text-caption ms-1 text-grey">{{ prod.rating || '4.5' }}</span>
                    </div>
                  </div>
                  <h3 class="text-body-1 font-weight-bold mb-1 line-clamp-1">{{ prod.name }}</h3>
                  <div class="text-caption text-grey mb-3 d-flex align-center gap-1">
                    <span>بواسطة:</span>
                    <SellerBadge v-if="prod.vendor" :company="prod.vendor" />
                    <span v-else class="font-weight-bold">غير محدد</span>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <span class="text-h6 font-weight-bold text-primary">{{ prod.price }} ج.م</span>
                    <span class="text-caption text-grey text-decoration-line-through" v-if="prod.oldPrice"> {{ prod.oldPrice }} ج.م </span>
                  </div>
                </v-card-text>
                <v-divider class="mx-4" />
                <v-card-actions class="pa-4">
                  <v-btn color="primary" variant="flat" block class="rounded-md font-weight-bold" prepend-icon="ri-shopping-cart-line">
                    عرض المنتج
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- Why Us Section -->
      <section class="py-16 bg-white border-y">
        <v-container>
          <v-row>
            <v-col v-for="(item, i) in trustBadges" :key="i" cols="12" sm="6" md="3">
              <div class="d-flex align-start gap-4">
                <v-avatar color="primary-lighten-5" rounded="md" size="48">
                  <v-icon :icon="item.icon" color="primary" />
                </v-avatar>
                <div>
                  <h4 class="text-body-1 font-weight-bold mb-1">{{ item.title }}</h4>
                  <p class="text-caption text-grey">{{ item.desc }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- Footer -->
      <footer class="footer pa-12 bg-primary-darken-1 text-white">
        <v-container>
          <v-row>
            <v-col cols="12" md="4" class="mb-8 mb-md-0">
              <div class="d-flex align-center gap-2 mb-6">
                <v-avatar color="primary" rounded="md" size="40">
                  <v-icon icon="ri-shopping-bag-3-line" color="white" />
                </v-avatar>
                <span class="text-h5 font-weight-bold">متجر HWNix</span>
              </div>
              <p class="text-body-2 text-grey-lighten-1 mb-6 leading-relaxed">
                نحن نوفر لك أفضل المنتجات الإلكترونية بأعلى جودة، مع نظام إدارة مالية وتقسيط يضمن لك راحة البال والتحكم الكامل في ميزانيتك.
              </p>
              <div class="d-flex gap-4">
                <v-btn icon="ri-facebook-fill" variant="text" color="white" />
                <v-btn icon="ri-twitter-fill" variant="text" color="white" />
                <v-btn icon="ri-instagram-line" variant="text" color="white" />
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="2" class="mb-8 mb-md-0">
              <h4 class="text-h6 font-weight-bold mb-6">المتجر</h4>
              <div class="d-flex flex-column gap-3">
                <router-link to="/" class="footer-link">الرئيسية</router-link>
                <router-link to="/saas" class="footer-link gold-text">انضم كتاجر (SaaS)</router-link>
                <router-link to="/store" class="footer-link">تصفح المنتجات</router-link>
                <a href="#categories" class="footer-link">الأقسام</a>
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="2" class="mb-8 mb-md-0">
              <h4 class="text-h6 font-weight-bold mb-6">الدعم</h4>
              <div class="d-flex flex-column gap-3">
                <a href="#" class="footer-link">الأسئلة الشائعة</a>
                <router-link to="/legal/refund-policy" class="footer-link">سياسة الاسترجاع</router-link>
                <a href="#" class="footer-link">طرق الدفع</a>
                <a href="#" class="footer-link">تواصل معنا</a>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <h4 class="text-h6 font-weight-bold mb-6">النشرة البريدية</h4>
              <p class="text-body-2 text-grey-lighten-1 mb-4">احصل على أحدث العروض والخصومات مباشرة في بريدك.</p>
              <div class="d-flex gap-2">
                <v-text-field
                  placeholder="بريدك الإلكتروني"
                  variant="solo-filled"
                  density="comfortable"
                  hide-details
                  bg-color="primary-lighten-5"
                  class="rounded-md"
                />
                <v-btn color="primary" height="48" class="px-6 rounded-md font-weight-bold">اشترك</v-btn>
              </div>
              <div class="mt-8 text-caption text-grey-lighten-2 d-flex align-center gap-2">
                <v-icon icon="ri-admin-line" size="14" />
                <router-link to="/saas" class="text-grey-lighten-2 text-decoration-none hover-primary">نظام إدارة الشركات</router-link>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-10 border-primary-lighten-4" />

          <div class="d-flex flex-column flex-md-row justify-space-between align-center gap-4">
            <div class="text-caption text-grey-lighten-1">جميع الحقوق محفوظة © {{ new Date().getFullYear() }} - متجر HWNix</div>
            <div class="d-flex gap-6 text-caption text-grey-lighten-1">
              <router-link to="/legal/privacy-policy" class="text-decoration-none text-inherit">سياسة الخصوصية</router-link>
              <router-link to="/legal/terms-of-use" class="text-decoration-none text-inherit">شروط الاستخدام</router-link>
              <router-link to="/legal/refund-policy" class="text-decoration-none text-inherit">سياسة الاسترجاع</router-link>
            </div>
          </div>
        </v-container>
      </footer>
    </v-main>
  </div>
</template>

<script setup>
//   صفحة الهبوط الرئيسية الخاصة بمتجر المنتجات وإتاحة التصفح والطلب المباشر للعملاء
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useBranding } from '@/composables/useBranding';
import SellerBadge from '@/modules/store/components/SellerBadge.vue';
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue';
import CartDrawer from '@/modules/store/components/CartDrawer.vue';
import { storeProductsApi } from '@/modules/store/api/storeProducts.api.js';

const authStore = useAuthStore();
const userStore = useUserStore();

const { logoUrl, companyName, tagline, fetchBranding } = useBranding();

const categories = ref([]);
const featuredProducts = ref([]);

const banners = [
  { image: '/images/banner1.jpg', title: 'عروض كبرى' },
  { image: '/images/banner2.jpg', title: 'إلكترونيات حديثة' }
];

onMounted(async () => {
  fetchBranding();
  if (authStore.token && !userStore.currentUser) {
    try {
      await userStore.fetchUser();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }

  try {
    const catsRes = await storeProductsApi.getCategories();
    categories.value = catsRes.data?.data || catsRes.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }

  try {
    const prodsRes = await storeProductsApi.getFeatured();
    let productsList = [];
    if (prodsRes.data?.data?.data && Array.isArray(prodsRes.data.data.data)) {
        productsList = prodsRes.data.data.data;
    } else if (prodsRes.data?.data && Array.isArray(prodsRes.data.data)) {
        productsList = prodsRes.data.data;
    }
    featuredProducts.value = productsList;
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
  }
});

const trustBadges = [
  { title: 'شحن سريع', desc: 'توصيل في أقل من 24 ساعة', icon: 'ri-truck-line' },
  { title: 'دفع آمن', desc: 'بوابات دفع مشفرة بالكامل', icon: 'ri-shield-check-line' },
  { title: 'دعم 24/7', desc: 'فريق جاهز لخدمتك دائماً', icon: 'ri-customer-service-2-line' },
  { title: 'ضمان الجودة', desc: 'منتجات أصلية 100%', icon: 'ri-medal-line' },
];

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Montserrat:wght@400;600;700;800&display=swap');

.landing-page {
  font-family: 'Cairo', 'Montserrat', sans-serif;
  scroll-behavior: smooth;
}

/* Brand Logo */
.store-logo {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #1a3d8f, #6a5ae0);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(26, 61, 143, 0.3);
  flex-shrink: 0;
}
.logo-img-store {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.logo-h-store {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 900;
  font-family: 'Montserrat', sans-serif;
  line-height: 1;
}
.brand-text-group {
  display: flex;
  flex-direction: column;
}
.store-brand-name {
  font-size: 1.05rem;
  font-weight: 900;
  color: #1a3d8f;
  font-family: 'Montserrat', sans-serif;
  line-height: 1.1;
}
.store-tagline {
  font-size: 0.58rem;
  color: #6a5ae0;
  font-weight: 700;
}

/* Navbar */
.landing-nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.glass-effect {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
}
.nav-link {
  text-decoration: none;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.3s;
}
.nav-link:hover {
  color: #1a3d8f;
}
.gold-text {
  color: #6a5ae0 !important;
}

/* Hero */
.hero-section {
  min-height: 90vh;
  padding: 140px 24px 80px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #f5f7fa 0%, #eff2ff 100%);
}
.content-wrapper {
  position: relative;
  z-index: 2;
}
.vibrant-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(106, 90, 224, 0.1) 0%, transparent 70%);
  z-index: -1;
}
.hero-title {
  line-height: 1.2;
  font-size: 3.5rem !important;
}
.hwnix-chip {
  border-color: rgba(26, 61, 143, 0.2) !important;
}
.hwnix-gradient-text,
.primary-gradient-text {
  background: linear-gradient(135deg, #1a3d8f, #6a5ae0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Utilities */
.max-w-700 {
  max-width: 700px;
}
.leading-relaxed {
  line-height: 1.8;
}

/* Animations */
.slide-up {
  animation: slideUp 0.8s ease-out both;
}
.slide-up-delay-1 {
  animation: slideUp 0.8s ease-out 0.2s both;
}
.slide-up-delay-2 {
  animation: slideUp 0.8s ease-out 0.4s both;
}
.slide-up-delay-3 {
  animation: slideUp 0.8s ease-out 0.6s both;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Cards */
.category-card {
  transition: all 0.3s ease;
  cursor: pointer;
}
.hover-lift-up:hover {
  transform: translateY(-10px);
  border-color: #1a3d8f !important;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08) !important;
}
.product-card {
  transition: all 0.3s ease;
  position: relative;
}
.product-image-container {
  position: relative;
  height: 200px;
  width: 100%;
}
.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06) !important;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.footer {
  background: #0d1b4b !important;
}
.footer-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}
.footer-link:hover {
  color: #6a5ae0;
}
.hover-primary:hover {
  color: #1a3d8f !important;
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.5rem !important;
  }
}
</style>
