<template>
  <div class="landing-page">
    <!-- Navigation Bar -->
    <nav class="landing-nav pa-4 d-flex align-center justify-space-between glass-effect">
      <div class="d-flex align-center gap-2">
        <v-avatar color="primary" rounded="lg" size="40">
          <v-icon icon="ri-building-line" color="white" />
        </v-avatar>
        <span class="text-h6 font-weight-black text-primary">hwmix-bill</span>
      </div>

      <!-- Center Links (Desktop) -->
      <div class="d-none d-md-flex gap-6">
        <a href="#features" class="nav-link">المميزات</a>
        <a href="#categories" class="nav-link">الأقسام</a>
        <a href="#products" class="nav-link">المنتجات</a>
        <router-link to="/saas" class="nav-link gold-text font-weight-black">نظام الإدارة</router-link>
      </div>

      <div class="d-flex align-center gap-3">
        <v-btn variant="text" color="primary" class="font-weight-bold d-none d-sm-flex" to="/register">إنشاء حساب</v-btn>
        <v-btn
          prepend-icon="ri-login-box-line"
          color="primary"
          variant="elevated"
          class="rounded-pill px-6 font-weight-bold"
          to="/login?type=customer"
        >
          دخول
        </v-btn>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section d-flex align-center justify-center text-center">
      <div class="content-wrapper">
        <div class="vibrant-bg"></div>
        <v-chip color="primary" variant="tonal" class="mb-4 font-weight-bold py-4 px-6 border slide-up">
          تسوق بذكاء وقم بإدارة فواتيرك في مكان واحد
        </v-chip>
        <h1 class="text-h2 font-weight-black mb-6 hero-title slide-up-delay-1">
          تجربة تسوق <span class="primary-gradient-text">فريدة</span> <br />
          وإدارة مالية متكاملة.
        </h1>
        <p class="text-h6 text-grey-darken-1 mb-10 max-w-700 mx-auto leading-relaxed slide-up-delay-2">
          اكتشف أحدث المنتجات من أفضل العلامات التجارية، واستمتع بنظام تقسيط مرن وواجهة إدارة فواتير احترافية مصممة خصيصاً لراحتك.
        </p>
        <div class="d-flex gap-4 justify-center flex-wrap slide-up-delay-3">
          <v-btn size="x-large" color="primary" class="rounded-xl px-12 font-weight-black elevation-8" to="/login?type=customer" height="56">
            تصفح المتجر الآن
          </v-btn>
          <v-btn size="x-large" variant="outlined" color="primary" class="rounded-xl px-12 font-weight-black" height="56" to="/register">
            إنشاء حساب جديد
          </v-btn>
        </div>
      </div>
    </section>

    <!-- Category Section -->
    <section id="categories" class="py-16 bg-white">
      <v-container>
        <div class="d-flex align-center justify-space-between mb-10">
          <div>
            <h2 class="text-h4 font-weight-black mb-2">تسوق حسب القسم</h2>
            <p class="text-grey">اختر ما يناسبك من بين تشكيلاتنا الواسعة</p>
          </div>
          <v-btn variant="text" color="primary" append-icon="ri-arrow-left-line">عرض الكل</v-btn>
        </div>

        <v-row>
          <v-col v-for="(cat, i) in categories" :key="i" cols="6" md="3">
            <v-card variant="flat" border class="category-card rounded-xl text-center pa-6 hover-lift-up">
              <v-avatar :color="cat.color + '-lighten-5'" rounded="circle" size="80" class="mb-4">
                <v-icon :icon="cat.icon" :color="cat.color" size="40" />
              </v-avatar>
              <h3 class="text-h6 font-weight-bold">{{ cat.name }}</h3>
              <p class="text-caption text-grey">{{ cat.count }} منتج</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Featured Products Section -->
    <section id="products" class="py-16 bg-grey-lighten-5">
      <v-container>
        <h2 class="text-h4 font-weight-black text-center mb-12">المنتجات الأكثر مبيعاً</h2>

        <v-row>
          <v-col v-for="(prod, i) in featuredProducts" :key="i" cols="12" sm="6" md="3">
            <v-card variant="flat" border class="product-card rounded-xl overflow-hidden hover-lift h-100">
              <div class="product-image-container pa-4 bg-white d-flex align-center justify-center">
                <v-icon :icon="prod.icon" size="100" class="text-grey-lighten-2" />
                <v-chip color="error" class="product-badge" size="small" v-if="prod.discount">خصم {{ prod.discount }}%</v-chip>
              </div>
              <v-card-text class="pa-4">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption text-grey">{{ prod.category }}</span>
                  <div class="d-flex align-center">
                    <v-icon icon="ri-star-fill" color="orange" size="14" />
                    <span class="text-caption ms-1 text-grey">{{ prod.rating }}</span>
                  </div>
                </div>
                <h3 class="text-body-1 font-weight-bold mb-3 line-clamp-1">{{ prod.name }}</h3>
                <div class="d-flex align-center gap-2">
                  <span class="text-h6 font-weight-black text-primary">{{ prod.price }} ج.م</span>
                  <span class="text-caption text-grey text-decoration-line-through" v-if="prod.oldPrice"> {{ prod.oldPrice }} ج.م </span>
                </div>
              </v-card-text>
              <v-divider class="mx-4" />
              <v-card-actions class="pa-4">
                <v-btn color="primary" variant="flat" block class="rounded-lg font-weight-bold" prepend-icon="ri-shopping-cart-line">
                  أضف للسلة
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
              <v-avatar color="primary-lighten-5" rounded="lg" size="48">
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
    <footer class="footer pa-12 bg-grey-darken-4 text-white">
      <v-container>
        <v-row>
          <v-col cols="12" md="4" class="mb-8 mb-md-0">
            <div class="d-flex align-center gap-2 mb-6">
              <v-avatar color="primary" rounded="lg" size="40">
                <v-icon icon="ri-building-line" color="white" />
              </v-avatar>
              <span class="text-h5 font-weight-black">hwmix-bill</span>
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
              <router-link to="/saas" class="footer-link gold-text">نظام HWNix (SaaS)</router-link>
              <router-link to="/products" class="footer-link">المنتجات</router-link>
              <router-link to="/categories" class="footer-link">الأقسام</router-link>
              <router-link to="/brands" class="footer-link">العلامات التجارية</router-link>
            </div>
          </v-col>

          <v-col cols="12" sm="6" md="2" class="mb-8 mb-md-0">
            <h4 class="text-h6 font-weight-bold mb-6">الدعم</h4>
            <div class="d-flex flex-column gap-3">
              <a href="#" class="footer-link">الأسئلة الشائعة</a>
              <a href="#" class="footer-link">سياسة الاسترجاع</a>
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
                bg-color="grey-darken-3"
                class="rounded-lg"
              />
              <v-btn color="primary" height="48" class="px-6 rounded-lg font-weight-bold">اشترك</v-btn>
            </div>
            <div class="mt-8 text-caption text-grey-lighten-2 d-flex align-center gap-2">
              <v-icon icon="ri-admin-line" size="14" />
              <router-link to="/login?type=staff" class="text-grey-lighten-2 text-decoration-none hover-primary">دخول الموظفين</router-link>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-10 border-grey-darken-3" />

        <div class="d-flex flex-column flex-md-row justify-space-between align-center gap-4">
          <div class="text-caption text-grey-lighten-1">جميع الحقوق محفوظة © {{ new Date().getFullYear() }} - hwmix-bill</div>
          <div class="d-flex gap-6 text-caption text-grey-lighten-1">
            <a href="#" class="text-decoration-none text-inherit">سياسة الخصوصية</a>
            <a href="#" class="text-decoration-none text-inherit">شروط الخدمة</a>
          </div>
        </div>
      </v-container>
    </footer>
  </div>
</template>

<script setup>
const categories = [
  { name: 'موبايلات', count: 125, icon: 'ri-smartphone-line', color: 'primary' },
  { name: 'إكسسوارات', count: 86, icon: 'ri-headphone-line', color: 'orange' },
  { name: 'لابتوب', count: 42, icon: 'ri-macbook-line', color: 'info' },
  { name: 'ساعات ذكية', count: 34, icon: 'ri-watch-2-line', color: 'success' },
];

const featuredProducts = [
  {
    name: 'iPhone 15 Pro Max - 256GB',
    price: '65,000',
    oldPrice: '72,000',
    discount: 10,
    category: 'موبايلات',
    rating: 4.8,
    icon: 'ri-smartphone-line',
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    price: '58,000',
    oldPrice: '62,000',
    discount: 6,
    category: 'موبايلات',
    rating: 4.9,
    icon: 'ri-smartphone-line',
  },
  { name: 'AirPods Pro (2nd Gen)', price: '12,500', category: 'إكسسوارات', rating: 4.7, icon: 'ri-headphone-line' },
  { name: 'PlayStation 5 Slim Edition', price: '28,000', oldPrice: '30,000', discount: 7, category: 'ألعاب', rating: 4.9, icon: 'ri-gamepad-line' },
  { name: 'MacBook Air M2 - 13 inch', price: '45,000', category: 'لابتوب', rating: 4.8, icon: 'ri-macbook-line' },
  { name: 'Apple Watch Series 9', price: '18,500', oldPrice: '20,000', discount: 8, category: 'ساعات', rating: 4.6, icon: 'ri-watch-2-line' },
  { name: 'iPad Pro M2 - 11 inch', price: '38,000', category: 'تابلت', rating: 4.7, icon: 'ri-tablet-line' },
  { name: 'Sony WH-1000XM5', price: '15,000', oldPrice: '16,500', discount: 9, category: 'إكسسوارات', rating: 4.9, icon: 'ri-headphone-line' },
];

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
.landing-page {
  font-family: 'Cairo', 'Inter', sans-serif;
  scroll-behavior: smooth;
}

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
  color: rgb(var(--v-theme-primary));
}

.hero-section {
  min-height: 90vh;
  padding: 140px 24px 80px;
  position: relative;
  overflow: hidden;
  background-color: #f8fafc;
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
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.08) 0%, transparent 70%);
  z-index: -1;
}

.hero-title {
  line-height: 1.2;
  font-size: 3.5rem !important;
}
.primary-gradient-text {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #1a237e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

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

.category-card {
  transition: all 0.3s ease;
  cursor: pointer;
}
.hover-lift-up:hover {
  transform: translateY(-10px);
  border-color: rgb(var(--v-theme-primary)) !important;
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

.curved-divider svg {
  width: 100%;
  height: 80px;
}
.curved-divider .shape-fill {
  fill: #f8fafc;
}

.footer-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}
.footer-link:hover {
  color: rgb(var(--v-theme-primary));
}

.hover-primary:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.5rem !important;
  }
}
</style>
