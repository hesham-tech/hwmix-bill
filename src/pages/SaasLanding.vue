<template>
  <div class="saas-container">
    <!-- Navbar -->
    <nav class="saas-nav glass">
      <div class="nav-content d-flex align-center justify-space-between">
        <div class="logo d-flex align-center gap-2">
          <v-avatar color="amber" rounded="lg" size="40">
            <v-icon icon="ri-shield-flash-line" color="black" />
          </v-avatar>
          <span class="text-h6 font-weight-black gold-text">HWNix SaaS</span>
        </div>
        <div class="nav-actions d-flex align-center gap-4">
          <router-link to="/" class="nav-link">المتجر</router-link>
          <v-btn color="amber" variant="elevated" class="rounded-pill font-weight-bold" to="/login">ابدأ الآن</v-btn>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="saas-hero">
      <div class="hero-glow"></div>
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6" class="text-right">
            <v-chip color="amber" variant="outlined" class="mb-4 glow-border">نظام الإدارة المتكامل</v-chip>
            <h1 class="text-h2 font-weight-black mb-6 main-title">
              أدر تجارتك <span class="gold-text">بذكاء</span> <br />
              وتوسع بلا حدود
            </h1>
            <p class="text-h6 text-grey-lighten-1 mb-8 leading-relaxed">
              HWNix يوفر لك كل ما تحتاجه لإدارة المحاسبة، المخازن، والتقسيط في منصة واحدة قوية وآمنة.
            </p>
            <div class="d-flex gap-4 justify-end flex-wrap">
              <v-btn size="x-large" color="amber" class="rounded-xl px-12 font-weight-black" to="/register">احصل على نسخة تجريبية</v-btn>
              <v-btn size="x-large" variant="outlined" color="white" class="rounded-xl px-12 font-weight-black">شاهد العرض</v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="d-none d-md-flex justify-center position-relative">
            <div class="dashboard-preview glass">
              <v-img src="https://api.placeholder.com/600/400" class="rounded-lg shadow-2xl" cover></v-img>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </header>

    <!-- Stats -->
    <section class="stats-section py-16">
      <v-container>
        <v-row>
          <v-col v-for="(stat, i) in stats" :key="i" cols="6" md="3">
            <div class="stat-card glass text-center pa-8">
              <div class="text-h4 font-weight-black mb-1 gold-text">{{ stat.value }}</div>
              <div class="text-caption text-grey-lighten-1">{{ stat.label }}</div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features -->
    <section class="features-section py-16" id="features">
      <v-container>
        <h2 class="text-h3 font-weight-black text-center mb-16 white--text">حلول متكاملة لنمو أعمالك</h2>
        <v-row>
          <v-col v-for="(feature, i) in features" :key="i" cols="12" md="4">
            <v-card class="feature-card glass pa-8 h-100" variant="flat">
              <v-avatar :color="feature.color" rounded="lg" size="60" class="mb-6 elevation-4">
                <v-icon :icon="feature.icon" color="white" size="32" />
              </v-avatar>
              <h3 class="text-h5 font-weight-bold mb-4 white--text">{{ feature.title }}</h3>
              <p class="text-body-1 text-grey-lighten-1 leading-relaxed">{{ feature.desc }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA -->
    <section class="cta-section py-16 text-center">
      <div class="cta-bg-glow"></div>
      <v-container>
        <div class="glass-panel pa-12 rounded-xl border-amber">
          <h2 class="text-h4 font-weight-black mb-6 white--text">هل أنت جاهز للتحول الرقمي؟</h2>
          <p class="text-h6 text-grey-lighten-1 mb-10 max-w-700 mx-auto">
            انضم إلى مئات الشركات التي تثق في HWNix لإدارة عملياتها اليومية وتأمين مستقبلها المالي.
          </p>
          <v-btn size="x-large" color="amber" class="rounded-xl px-12 font-weight-black" to="/register">ابدأ الآن مجاناً</v-btn>
        </div>
      </v-container>
    </section>

    <footer class="saas-footer py-12 border-t">
      <v-container class="text-center">
        <div class="text-caption text-grey-lighten-1">جميع الحقوق محفوظة © {{ new Date().getFullYear() }} - HWNix Solutions</div>
      </v-container>
    </footer>
  </div>
</template>

<script setup>
const stats = [
  { value: '+50K', label: 'عملية ناجحة' },
  { value: '+1.2M', label: 'فاتورة مصدرة' },
  { value: '+120', label: 'علامة تجارية' },
  { value: '99.9%', label: 'استقرار النظام' },
];

const features = [
  {
    title: 'الفواتير الذكية',
    desc: 'إصدار فواتير احترافية بضغطة زر واحدة مع دعم كامل لضريبة القيمة المضافة.',
    icon: 'ri-bill-line',
    color: 'blue-darken-3',
  },
  {
    title: 'إدارة التقسيط',
    desc: 'نظام آلي لمتابعة الأقساط والتنبيهات المتأخرة وجدولة المدفوعات.',
    icon: 'ri-calendar-check-line',
    color: 'amber-darken-3',
  },
  {
    title: 'تقارير مالية',
    desc: 'تحليل لحظي للأرباح والخسائر والتدفق النقدي بتقارير بيانية تفصيلية.',
    icon: 'ri-pie-chart-2-line',
    color: 'teal-darken-2',
  },
];
</script>

<style scoped>
.saas-container {
  background-color: #0f172a;
  color: white;
  min-height: 100vh;
  font-family: 'Cairo', sans-serif;
  overflow-x: hidden;
}

.glass {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.saas-nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  padding: 1rem 2rem;
}

.nav-link {
  color: #94a3b8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}
.nav-link:hover {
  color: #fbbf24;
}

.gold-text {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.saas-hero {
  padding-top: 180px;
  padding-bottom: 100px;
  position: relative;
}

.hero-glow {
  position: absolute;
  top: -200px;
  right: -200px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%);
  filter: blur(60px);
}

.main-title {
  line-height: 1.2;
}

.dashboard-preview {
  padding: 20px;
  border-radius: 20px;
  transform: rotate(-2deg) scale(1.05);
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5);
}

.feature-card {
  transition:
    transform 0.3s ease,
    border-color 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-10px);
  border-color: rgba(251, 191, 36, 0.3) !important;
}

.cta-section {
  position: relative;
}

.cta-bg-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 300px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.05) 0%, transparent 70%);
}

.border-amber {
  border: 1px solid rgba(251, 191, 36, 0.2) !important;
}

.max-w-700 {
  max-width: 700px;
}

@media (max-width: 960px) {
  .saas-hero {
    text-align: center;
  }
  .main-title {
    font-size: 2.5rem !important;
  }
}
</style>
