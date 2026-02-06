<template>
  <div class="saas-redesign">
    <!-- Clean Navbar -->
    <nav class="saas-nav border-b">
      <v-container class="py-2 d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-3">
          <v-avatar color="indigo-darken-4" rounded="md" size="40">
            <v-icon icon="ri-shield-flash-line" color="white" />
          </v-avatar>
          <span class="text-h6 font-weight-bold text-indigo-darken-4">HWNix Solutions</span>
        </div>

        <div class="d-flex align-center gap-2">
          <div class="d-none d-md-flex align-center gap-6">
            <router-link to="/" class="nav-link text-indigo-darken-2">المتجر الرئيسي</router-link>
            <v-btn color="indigo-darken-4" variant="elevated" class="rounded-md px-6 font-weight-bold" to="/login"> تسجيل الدخول </v-btn>
          </div>

          <!-- Mobile Menu Toggle -->
          <v-btn icon="ri-menu-line" variant="text" color="indigo-darken-4" class="d-flex d-md-none" @click="mobileDrawer = !mobileDrawer" />
        </div>
      </v-container>
    </nav>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="mobileDrawer" location="right" temporary class="pa-4">
      <div class="d-flex flex-column gap-4 mt-4">
        <div class="d-flex align-center gap-3 mb-6 px-2">
          <v-avatar color="indigo-darken-4" rounded="md" size="32">
            <v-icon icon="ri-shield-flash-line" color="white" size="18" />
          </v-avatar>
          <span class="text-subtitle-1 font-weight-bold text-indigo-darken-4">HWNix Solutions</span>
        </div>

        <router-link to="/" class="nav-link px-2 py-2 d-flex align-center gap-2" @click="mobileDrawer = false">
          <v-icon icon="ri-store-2-line" color="indigo-darken-2" />
          المتجر الرئيسي
        </router-link>

        <v-divider />

        <v-btn color="indigo-darken-4" block variant="elevated" class="rounded-md mt-4" to="/login">تسجيل الدخول</v-btn>
        <v-btn color="amber-darken-2" block variant="elevated" class="rounded-md mt-2 text-white font-weight-bold" to="/register">ابدأ الآن</v-btn>
      </div>
    </v-navigation-drawer>

    <v-main>
      <!-- Professional Hero -->
      <section class="hero-section bg-indigo-darken-4 text-white text-right py-16">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="7">
              <v-chip color="amber-lighten-3" variant="tonal" class="mb-4 font-weight-bold px-4"> نظام إدارة متكامل للمؤسسات والشركات </v-chip>
              <h1 class="text-h2 font-weight-bold mb-6 main-title leading-tight">
                اجعل إدارة أعمالك <br />
                <span class="text-amber-lighten-2">أكثر سهولة ودقة</span>
              </h1>
              <p class="text-h6 opacity-90 mb-10 leading-relaxed font-weight-medium">
                نظام HWNix (SaaS) هو شريكك التقني لإدارة الفواتير، الحسابات، المخازن، والتقسيط بذكاء وأمان فائق.
              </p>
              <div class="d-flex gap-4 justify-end flex-wrap">
                <v-btn size="x-large" color="amber-darken-2" class="rounded-md px-10 font-weight-bold" to="/register" height="56">
                  ابدأ تجربتك المجانية
                </v-btn>
                <v-btn size="x-large" variant="outlined" color="white" class="rounded-md px-10 font-weight-bold" height="56">
                  تعرف على المميزات
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12" md="5" class="d-none d-md-flex">
              <div class="hero-image-vibe pa-4 bg-white rounded-md shadow-2xl border-4 border-indigo-lighten-4">
                <v-icon icon="ri-dashboard-3-line" size="200" color="indigo-lighten-4" />
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- High Contrast Features -->
      <section class="py-16 bg-grey-lighten-5">
        <v-container>
          <div class="text-center mb-16">
            <h2 class="text-h3 font-weight-bold text-indigo-darken-4 mb-4">لماذا تختار HWNix؟</h2>
            <p class="text-h6 text-grey-darken-2">حلول ذكية صممت لتلبي تطلعاتك وتدفع أعمالك للأمام</p>
          </div>

          <v-row>
            <v-col v-for="(feature, i) in features" :key="i" cols="12" md="4">
              <v-card class="feature-card pa-8 rounded-md h-100 border" elevation="0">
                <v-avatar :color="feature.color + '-lighten-5'" rounded="md" size="64" class="mb-6">
                  <v-icon :icon="feature.icon" :color="feature.color" size="32" />
                </v-avatar>
                <h3 class="text-h5 font-weight-bold text-indigo-darken-4 mb-4">{{ feature.title }}</h3>
                <p class="text-body-1 text-grey-darken-2 leading-relaxed font-weight-medium">
                  {{ feature.desc }}
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- Stats with Solid Backgrounds -->
      <section class="py-16 bg-white border-y">
        <v-container>
          <v-row class="text-center">
            <v-col v-for="(stat, i) in stats" :key="i" cols="12" sm="6" md="3">
              <div class="pa-8">
                <div class="text-h2 font-weight-bold text-indigo-darken-4 mb-2">{{ stat.value }}</div>
                <div class="text-h6 text-grey-darken-1">{{ stat.label }}</div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- Clear Call to Action -->
      <section class="py-16 bg-white">
        <v-container>
          <v-card color="indigo-darken-4" class="rounded-md pa-12 text-center shadow-xl overflow-hidden" elevation="10">
            <div class="cta-pattern"></div>
            <h2 class="text-h3 font-weight-bold mb-6 text-white position-relative">ابدأ تحويل أعمالك اليوم</h2>
            <p class="text-h6 opacity-90 mb-10 position-relative max-w-700 mx-auto">
              انضم إلى شبكة عملاء HWNix واحصل على نظام إدارة متكامل يضمن لك الكفاءة والأمان.
            </p>
            <v-btn size="x-large" color="amber-darken-2" class="rounded-md px-12 font-weight-bold position-relative" height="60" to="/register">
              سجل حسابك مجاناً
            </v-btn>
          </v-card>
        </v-container>
      </section>

      <!-- Simple Footer -->
      <footer class="bg-grey-lighten-4 py-8 border-t">
        <v-container class="text-center">
          <div class="text-body-2 text-indigo-darken-3 font-weight-bold mb-2">HWNix Solutions &copy; {{ new Date().getFullYear() }}</div>
          <div class="text-caption text-grey-darken-1">نظام إدارة المحتوى والمبيعات الأكثر موثوقية</div>
        </v-container>
      </footer>
    </v-main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const mobileDrawer = ref(false);

const features = [
  {
    title: 'نظام فواتير ذكي',
    desc: 'إصدار فواتير ضريبية نظامية بضغطة زر واحدة، مع دعم كود QR والباركود، وإدارة كاملة للمبيعات والمشتريات.',
    icon: 'ri-bill-line',
    color: 'indigo',
  },
  {
    title: 'إدارة التقسيط الآلي',
    desc: 'جدولة الأقساط بشكل آلي، تنبيهات بمواعيد التحصيل، وتقارير دورية عن حالة العملاء المالية والتعثّر.',
    icon: 'ri-calendar-check-line',
    color: 'amber-darken-2',
  },
  {
    title: 'تقارير مالية شاملة',
    desc: 'لوحات تحكم تفاعلية توضح التدفق النقدي، صافي الأرباح، حركة المخازن، والضرائب بدقة متناهية.',
    icon: 'ri-pie-chart-2-line',
    color: 'teal',
  },
];

const stats = [
  { value: '24/7', label: 'دعم فني متميز' },
  { value: '+100', label: 'عميل مشترك' },
  { value: '+1M', label: 'عملية محاسبية' },
  { value: '100%', label: 'دقة البيانات' },
];
</script>

<style scoped>
section {
  padding: 10px;
}
.saas-redesign {
  font-family: 'Cairo', 'Inter', sans-serif;
  color: #1e293b;
  overflow-x: hidden;
}

.saas-nav {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
}

.nav-link {
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.nav-link:hover {
  color: #fbbf24 !important;
}

.main-title {
  line-height: 1.1;
  letter-spacing: -1px;
}

.leading-relaxed {
  line-height: 1.8;
}

.feature-card {
  transition: all 0.3s ease;
  background: white;
}
.feature-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05) !important;
  transform: translateY(-5px);
  border-color: #312e81 !important;
}

.cta-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(#ffffff08 1px, transparent 1px);
  background-size: 20px 20px;
}

.hero-image-vibe {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.max-w-700 {
  max-width: 700px;
}

@media (max-width: 960px) {
  .text-h2 {
    font-size: 2.8rem !important;
  }
}
</style>
