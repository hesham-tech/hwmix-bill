<template>
  <div class="saas-page" dir="rtl">
    <!-- Navbar -->
    <nav class="saas-nav">
      <div class="nav-inner">
        <div class="brand">
          <div class="brand-logo" :style="logoUrl ? 'background: transparent; box-shadow: none;' : ''">
            <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="logo-img-saas" />
            <span v-else class="logo-h">{{ companyName.charAt(0) }}</span>
          </div>
          <div class="brand-text-group">
            <span class="brand-name">{{ companyName }}</span>
            <span class="brand-tagline">{{ tagline }}</span>
          </div>
          <span class="brand-badge">SaaS</span>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">المتجر</router-link>
          <a href="#features" class="nav-link">المميزات</a>
          <a href="#pricing" class="nav-link">الأسعار</a>
          <template v-if="!authStore.isAuthenticated">
            <router-link to="/saas/login" class="btn-ghost">دخول</router-link>
            <router-link to="/saas/register" class="btn-primary-nav">ابدأ مجاناً ←</router-link>
          </template>
          <template v-else>
            <AppUserBalanceProfile
              v-if="authStore.isAuthenticated"
              :user="userStore.currentUser || authStore.user || {}"
              hide-phone
              hide-balance
              :clickable="false"
              avatar-size="32"
              class="mx-2"
            />
            <router-link :to="userStore.isStaff ? '/app/admin/dashboard' : '/app/portal'" class="btn-primary-nav">
              {{ userStore.isStaff ? 'لوحة التحكم' : 'حسابي' }}
            </router-link>
          </template>
        </div>
        <button class="menu-toggle" @click="mobileDrawer = !mobileDrawer">☰</button>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="mobileDrawer" class="mobile-menu">
      <template v-if="!authStore.isAuthenticated">
        <router-link to="/saas/login" class="mobile-link" @click="mobileDrawer = false">دخول</router-link>
        <router-link to="/saas/register" class="btn-primary-full" @click="mobileDrawer = false">ابدأ مشروعك مجاناً</router-link>
      </template>
      <template v-else>
        <div class="d-flex justify-center mb-4">
          <AppUserBalanceProfile
            v-if="authStore.isAuthenticated"
            :user="userStore.currentUser || authStore.user || {}"
            hide-phone
            hide-balance
            :clickable="false"
            avatar-size="48"
          />
        </div>
        <router-link :to="userStore.isStaff ? '/app/admin/dashboard' : '/app/portal'" class="btn-primary-full" @click="mobileDrawer = false">
          {{ userStore.isStaff ? 'لوحة التحكم' : 'حسابي' }}
        </router-link>
      </template>
    </div>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">✦ النظام المحاسبي الأول للشركات العربية</div>
      <h1 class="hero-title">
        توقف عن إضاعة وقتك<br />
        <span class="highlight">ادر أعمالك بذكاء</span>
      </h1>
      <p class="hero-sub">نظام HWNix يوفر عليك ساعات يومياً — فواتير، مخازن، تقسيط، وتقارير مالية في مكان واحد آمن وسريع.</p>
      <div class="hero-cta">
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/saas/register" class="btn-hero">ابدأ تجربتك المجانية ← </router-link>
          <a href="#features" class="btn-outline-hero">شاهد كيف يعمل</a>
        </template>
        <template v-else>
          <router-link :to="userStore.isStaff ? '/app/admin/dashboard' : '/app/portal'" class="btn-hero">
            {{ userStore.isStaff ? 'لوحة التحكم الخاصة بك ←' : 'انتقل إلى حسابك ←' }}
          </router-link>
        </template>
      </div>
      <p class="hero-note">✓ بدون بطاقة ائتمان &nbsp;✓ إعداد في 5 دقائق &nbsp;✓ دعم فني 24/7</p>
    </section>

    <!-- Social Proof Bar -->
    <div class="proof-bar">
      <span>يثق بنا أكثر من</span>
      <strong>+100 شركة</strong>
      <span>في 5 دول عربية</span>
      <span class="stars">★★★★★ 4.9/5</span>
    </div>

    <!-- Features -->
    <section class="features" id="features">
      <div class="section-header">
        <h2>كل ما تحتاجه في مكان واحد</h2>
        <p>لا تحتاج 5 أنظمة مختلفة — HWNix يغطي كل شيء</p>
      </div>
      <div class="features-grid">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <div class="feature-icon">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
          <div class="feature-benefit">✓ {{ f.benefit }}</div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how-it-works">
      <div class="section-header light">
        <h2>ابدأ خلال 5 دقائق فقط</h2>
        <p>أبسط نظام تسجيل في السوق</p>
      </div>
      <div class="steps-grid">
        <div v-for="(s, i) in steps" :key="i" class="step-item">
          <div class="step-num">{{ i + 1 }}</div>
          <h4>{{ s.title }}</h4>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section">
      <div class="stats-grid">
        <div v-for="s in stats" :key="s.label" class="stat-item">
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials">
      <div class="section-header">
        <h2>ماذا يقول عملاؤنا؟</h2>
      </div>
      <div class="testimonials-grid">
        <div v-for="t in testimonials" :key="t.name" class="testimonial-card">
          <div class="stars-sm">★★★★★</div>
          <p>"{{ t.text }}"</p>
          <div class="testimonial-author">
            <strong>{{ t.name }}</strong>
            <span>{{ t.role }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section" id="pricing">
      <div class="section-header">
        <h2>خطط الأسعار لتناسب كافة الاحتياجات</h2>
        <p>اختر الباقة المناسبة لأعمالك وابدأ فوراً. بدون عقود طويلة الأجل أو التزامات خفية.</p>
      </div>

      <div v-if="loadingPlans" class="pricing-loading py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
        <div class="mt-4 text-body-2 text-grey">جاري جلب الباقات المتاحة...</div>
      </div>

      <div v-else class="pricing-grid">
        <div v-for="plan in plans" :key="plan.id" :class="['pricing-card', { featured: plan.price > 0 }]">
          <div class="card-header-plan">
            <div class="plan-badge-label" v-if="plan.price > 0">موصى به</div>
            <div class="plan-icon-wrap mb-4">
              <v-icon :icon="plan.icon || 'ri-vip-crown-line'" color="primary" size="32" />
            </div>
            <h3 class="plan-name-title">{{ plan.name }}</h3>
            <p class="plan-desc-text">{{ plan.description }}</p>
          </div>

          <div class="plan-price-block">
            <span class="price-amount">{{ plan.price }}</span>
            <span class="price-curr">EGP</span>
            <span class="price-period">لكل شهر</span>
          </div>

          <!-- سكشن عرض الفروق السعرية للمدد المختلفة (ديناميكي) -->
          <div v-if="plan.price > 0" class="plan-tiered-prices-list mb-6">
            <div class="tiered-title">خيارات الاشتراك المخفضة:</div>
            <div class="tiered-grid-options">
              <div v-for="m in [3, 6, 12]" :key="m" class="tiered-option-item" @click="handleSelectPlan(plan, m)">
                <span class="tiered-months">{{ m }} أشهر:</span>
                <span class="tiered-price-val">
                  <strong>{{ getTierPriceForMonths(plan, m) }}</strong> EGP/شهر
                </span>
                <span v-if="getTierSavingsPercent(plan, m) > 0" class="tiered-save-badge"> (وفر {{ getTierSavingsPercent(plan, m) }}%) </span>
                <v-icon icon="ri-arrow-left-s-line" size="14" class="ms-1" color="grey" />
              </div>
            </div>
          </div>

          <div class="plan-trial-pill" v-if="plan.trial_days > 0">
            <v-icon icon="ri-check-double-line" class="me-1" color="success" size="18" />
            <span>تجربة مجانية لمدة {{ plan.trial_days }} يوم</span>
          </div>

          <div class="plan-features-list">
            <div class="feature-item-row limit">
              <v-icon icon="ri-checkbox-circle-fill" color="success" class="me-2" size="18" />
              <span
                >عدد المستخدمين: <strong>{{ plan.max_users === -1 || plan.max_users === null ? 'غير محدود' : plan.max_users }}</strong></span
              >
            </div>
            <div class="feature-item-row limit">
              <v-icon icon="ri-checkbox-circle-fill" color="success" class="me-2" size="18" />
              <span
                >المنتجات المخزنة:
                <strong>{{ plan.max_products === -1 || plan.max_products === null ? 'غير محدود' : plan.max_products }}</strong></span
              >
            </div>
            <div class="feature-item-row limit">
              <v-icon icon="ri-checkbox-circle-fill" color="success" class="me-2" size="18" />
              <span
                >الفواتير الصادرة:
                <strong>{{ plan.max_invoices === -1 || plan.max_invoices === null ? 'غير محدود' : plan.max_invoices }}</strong></span
              >
            </div>

            <div class="feature-item-row" :class="{ disabled: !getFeatureFlag(plan, 'payment_gateways') }">
              <v-icon
                :icon="getFeatureFlag(plan, 'payment_gateways') ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                :color="getFeatureFlag(plan, 'payment_gateways') ? 'success' : 'grey'"
                class="me-2"
                size="18"
              />
              <span>بوابات الدفع الإلكتروني</span>
            </div>
            <div class="feature-item-row" :class="{ disabled: !getFeatureFlag(plan, 'installment_system') }">
              <v-icon
                :icon="getFeatureFlag(plan, 'installment_system') ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                :color="getFeatureFlag(plan, 'installment_system') ? 'success' : 'grey'"
                class="me-2"
                size="18"
              />
              <span>نظام البيع بالتقسيط</span>
            </div>
            <div class="feature-item-row" :class="{ disabled: !getFeatureFlag(plan, 'warehouses_multi') }">
              <v-icon
                :icon="getFeatureFlag(plan, 'warehouses_multi') ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                :color="getFeatureFlag(plan, 'warehouses_multi') ? 'success' : 'grey'"
                class="me-2"
                size="18"
              />
              <span>المخازن المتعددة</span>
            </div>
            <div class="feature-item-row" :class="{ disabled: !getFeatureFlag(plan, 'reports_advanced') }">
              <v-icon
                :icon="getFeatureFlag(plan, 'reports_advanced') ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                :color="getFeatureFlag(plan, 'reports_advanced') ? 'success' : 'grey'"
                class="me-2"
                size="18"
              />
              <span>التقارير المالية المتقدمة</span>
            </div>
          </div>

          <v-btn
            block
            :color="plan.price > 0 ? 'primary' : 'secondary'"
            class="rounded-pill font-weight-bold card-btn py-3 mt-6"
            elevation="1"
            size="large"
            @click="handleSelectPlan(plan, 1)"
          >
            {{ plan.price > 0 ? 'اشترك الآن' : 'ابدأ مجاناً' }}
          </v-btn>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta">
      <h2>جاهز لتحويل طريقة إدارة أعمالك؟</h2>
      <p>انضم الآن واحصل على باقتك المجانية للبدء فوراً وبدون أي تعقيد</p>
      <router-link to="/saas/register" class="btn-hero-lg">سجّل شركتك الآن ←</router-link>
      <div class="cta-guarantees">
        <span>✓ إلغاء في أي وقت</span>
        <span>✓ بياناتك محمية 100%</span>
        <span>✓ دعم فني مخصص</span>
      </div>
    </section>

    <!-- Footer -->
    <footer class="saas-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <v-avatar v-if="logoUrl" rounded="md" size="28" class="me-2">
            <v-img :src="logoUrl" alt="Logo" />
          </v-avatar>
          <span v-else class="brand-icon me-2">⚡</span>
          <strong>{{ companyName }}</strong>
        </div>
        <div class="footer-links">
          <router-link to="/">المتجر الرئيسي</router-link>
          <router-link to="/login">تسجيل الدخول</router-link>
          <router-link to="/legal/privacy-policy">سياسة الخصوصية</router-link>
          <router-link to="/legal/terms-of-use">شروط الاستخدام</router-link>
          <router-link to="/legal/refund-policy">سياسة الاسترجاع</router-link>
        </div>
        <div class="footer-copy">© {{ new Date().getFullYear() }} {{ companyName }} — جميع الحقوق محفوظة</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
//   صفحة الهبوط الخاصة بنظام إدارة المنشأة (SaaS) لعرض المميزات والأسعار وخطط الاشتراك
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useApi } from '@/composables/useApi';
import { useBranding } from '@/composables/useBranding';
import AppUserBalanceProfile from '@/components/common/AppUserBalanceProfile.vue';

const router = useRouter();
const mobileDrawer = ref(false);
const authStore = useAuthStore();
const userStore = useUserStore();

const { logoUrl, companyName, tagline, fetchBranding } = useBranding();

const plansApi = useApi('/api/public/plans');
const plans = ref([]);
const loadingPlans = ref(false);

const loadPlans = async () => {
  loadingPlans.value = true;
  try {
    const response = await plansApi.get();
    plans.value = response.data || [];
  } catch (error) {
    console.error('Failed to load plans:', error);
  } finally {
    loadingPlans.value = false;
  }
};

const getDurationUnitLabel = unit => {
  if (unit === 'days') return 'يوم';
  if (unit === 'months') return 'شهر';
  if (unit === 'years') return 'سنة';
  return unit;
};

const getFeatureFlag = (plan, key) => {
  let feats = plan.features || {};
  if (typeof feats === 'string') {
    try {
      feats = JSON.parse(feats);
    } catch (e) {
      feats = {};
    }
  }
  return !!feats[key];
};

const getTierPriceForMonths = (plan, months) => {
  const tiers = plan.pricing_tiers || [];
  const basePrice = parseFloat(plan.price) || 0;
  if (basePrice === 0) return 0;

  const tier = tiers.find(t => months >= t.min_months && (t.max_months === null || months <= t.max_months));
  if (tier) {
    if (parseFloat(tier.price_per_month) > 0) {
      return parseFloat(tier.price_per_month);
    } else if (parseFloat(tier.discount_percent) > 0) {
      return basePrice * (1 - parseFloat(tier.discount_percent) / 100);
    }
  }
  return basePrice;
};

const getTierSavingsPercent = (plan, months) => {
  const tiers = plan.pricing_tiers || [];
  const basePrice = parseFloat(plan.price) || 0;
  if (basePrice === 0) return 0;

  const tier = tiers.find(t => months >= t.min_months && (t.max_months === null || months <= t.max_months));
  if (tier) {
    if (parseFloat(tier.discount_percent) > 0) {
      return Math.round(parseFloat(tier.discount_percent));
    } else if (parseFloat(tier.price_per_month) > 0) {
      const price = parseFloat(tier.price_per_month);
      return Math.round(((basePrice - price) / basePrice) * 100);
    }
  }
  return 0;
};

const handleSelectPlan = (plan, months = 1) => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'my-subscription', query: { upgrade_plan_id: plan.id, months: months } });
  } else {
    router.push({ name: 'saas-register', query: { plan_id: plan.id, months: months } });
  }
};

onMounted(async () => {
  fetchBranding();
  loadPlans();
  if (authStore.token && !userStore.currentUser) {
    try {
      await userStore.fetchUser();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }
});

const features = [
  {
    icon: '🧾',
    title: 'فواتير احترافية في ثوانٍ',
    desc: 'أصدر فواتير ضريبية نظامية مع QR والباركود بضغطة واحدة.',
    benefit: 'وفّر 3 ساعات يومياً على إدارة الفواتير',
  },
  {
    icon: '📦',
    title: 'مخزن تحت السيطرة دائماً',
    desc: 'تتبع المنتجات والمستودعات لحظة بلحظة مع تنبيهات النفاد.',
    benefit: 'لا خسائر بسبب نقص أو زيادة المخزون',
  },
  { icon: '💳', title: 'تقسيط ذكي بدون متاعب', desc: 'جدولة آلية للأقساط مع تذكيرات تلقائية للعملاء.', benefit: 'حصّل ديونك أسرع بنسبة 40%' },
  {
    icon: '📊',
    title: 'قرارات بالأرقام لا بالتخمين',
    desc: 'تقارير مالية لحظية — أرباح، تدفق نقدي، وضرائب.',
    benefit: 'اعرف وضعك المالي في أي لحظة',
  },
  { icon: '👥', title: 'فريقك بصلاحيات دقيقة', desc: 'أضف موظفين وحدد صلاحيات كل شخص بدقة متناهية.', benefit: 'أمان كامل وتحكم تام في بياناتك' },
  { icon: '🔒', title: 'أمان بنكي لبياناتك', desc: 'تشفير كامل وحماية متعددة الطبقات لجميع بياناتك.', benefit: 'نومك هادئ وبياناتك محمية' },
];

const steps = [
  { title: 'سجّل شركتك', desc: 'أدخل اسم شركتك وبياناتك الأساسية خلال دقيقتين.' },
  { title: 'خصّص نظامك', desc: 'أضف منتجاتك وموظفيك والفروع بسهولة تامة.' },
  { title: 'ابدأ الإدارة الذكية', desc: 'أصدر فواتير، تابع المخزون، وراجع تقاريرك فوراً.' },
];

const stats = [
  { value: '+100', label: 'شركة تثق بنا' },
  { value: '+1M', label: 'فاتورة صدرت' },
  { value: '99.9%', label: 'وقت تشغيل مضمون' },
  { value: '24/7', label: 'دعم فني متاح' },
];

const testimonials = [
  { text: 'قبل HWNix كنت أضيع ساعات في الفواتير، الآن الأمر لا يأخذ دقائق. استثمار يستحق كل قرش.', name: 'أحمد الشمري', role: 'مدير مطعم — الرياض' },
  { text: 'نظام التقسيط رائع جداً، وفّر عليّ متابعة العملاء يدوياً وزاد تحصيلي بشكل ملحوظ.', name: 'سارة الزهراني', role: 'صاحبة محل أثاث — جدة' },
  { text: 'التقارير المالية ساعدتني أتخذ قرار توسعة فرعي الجديد بثقة. أنصح به بشدة.', name: 'خالد العتيبي', role: 'مدير شركة مقاولات — الكويت' },
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Montserrat:wght@400;600;700;800&display=swap');

* {
  box-sizing: border-box;
}

.saas-page {
  font-family: 'Cairo', 'Montserrat', sans-serif;
  color: #1e293b;
  background: #fff;
  direction: rtl;
}

/* Navbar */
.saas-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-icon {
  font-size: 1.4rem;
}
.brand-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #312e81;
}
.brand-badge {
  font-size: 0.65rem;
  background: #312e81;
  color: #fff;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 700;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}
.nav-link {
  text-decoration: none;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-link:hover {
  color: #312e81;
}
.btn-ghost {
  text-decoration: none;
  color: #312e81;
  font-weight: 700;
  padding: 8px 16px;
  border: 2px solid #312e81;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.btn-ghost:hover {
  background: #312e81;
  color: #fff;
}
.btn-primary-nav {
  text-decoration: none;
  background: #f59e0b;
  color: #fff;
  font-weight: 800;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
}
.btn-primary-nav:hover {
  background: #d97706;
  transform: translateY(-1px);
}
.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #312e81;
}

/* Mobile */
.mobile-menu {
  position: fixed;
  inset: 0;
  top: 65px;
  background: #fff;
  z-index: 99;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px 24px;
  border-top: 1px solid #e2e8f0;
}
.mobile-link {
  text-decoration: none;
  color: #312e81;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}
.btn-primary-full {
  text-decoration: none;
  background: #f59e0b;
  color: #fff;
  font-weight: 800;
  padding: 16px;
  border-radius: 10px;
  text-align: center;
  font-size: 1rem;
}

/* Hero */
.hero {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%);
  color: #fff;
  text-align: center;
  padding: 100px 24px 80px;
}
.hero-badge {
  display: inline-block;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fcd34d;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 28px;
}
.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: 24px;
  letter-spacing: -1px;
}
.highlight {
  color: #fcd34d;
}
.hero-sub {
  font-size: 1.15rem;
  opacity: 0.88;
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.8;
}
.hero-cta {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.btn-hero {
  text-decoration: none;
  background: #f59e0b;
  color: #fff;
  font-weight: 800;
  padding: 16px 36px;
  border-radius: 10px;
  font-size: 1.05rem;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.5);
  transition: all 0.25s;
}
.btn-hero:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.6);
}
.btn-outline-hero {
  text-decoration: none;
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  font-weight: 700;
  padding: 16px 32px;
  border-radius: 10px;
  font-size: 1.05rem;
  transition: all 0.25s;
}
.btn-outline-hero:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}
.hero-note {
  font-size: 0.85rem;
  opacity: 0.7;
  letter-spacing: 0.5px;
}

/* Proof Bar */
.proof-bar {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.95rem;
  color: #475569;
}
.proof-bar strong {
  color: #312e81;
  font-size: 1.1rem;
}
.stars {
  color: #f59e0b;
  font-weight: 700;
}

/* Features */
.features {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.section-header {
  text-align: center;
  margin-bottom: 56px;
}
.section-header h2 {
  font-size: 2rem;
  font-weight: 900;
  color: #1e1b4b;
  margin-bottom: 12px;
}
.section-header p {
  color: #64748b;
  font-size: 1.05rem;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
.feature-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s;
}
.feature-card:hover {
  border-color: #312e81;
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(49, 46, 129, 0.1);
}
.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}
.feature-card h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e1b4b;
  margin-bottom: 10px;
}
.feature-card p {
  color: #64748b;
  line-height: 1.7;
  font-size: 0.95rem;
  margin-bottom: 16px;
}
.feature-benefit {
  font-size: 0.85rem;
  color: #16a34a;
  font-weight: 700;
  background: #f0fdf4;
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
}

/* How it works */
.how-it-works {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  padding: 80px 24px;
}
.section-header.light h2 {
  color: #fff;
}
.section-header.light p {
  color: rgba(255, 255, 255, 0.75);
}
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}
.step-item {
  text-align: center;
  color: #fff;
}
.step-num {
  width: 56px;
  height: 56px;
  background: #f59e0b;
  border-radius: 50%;
  font-size: 1.4rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}
.step-item h4 {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 10px;
}
.step-item p {
  opacity: 0.8;
  font-size: 0.95rem;
  line-height: 1.7;
}

/* Stats */
.stats-section {
  background: #f8fafc;
  padding: 64px 24px;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}
.stat-item {
  padding: 32px 16px;
  border-left: 1px solid #e2e8f0;
}
.stat-item:last-child {
  border-left: none;
}
.stat-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #312e81;
  margin-bottom: 8px;
}
.stat-label {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}

/* Testimonials */
.testimonials {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
.testimonial-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
}
.stars-sm {
  color: #f59e0b;
  font-size: 1.1rem;
  margin-bottom: 16px;
}
.testimonial-card p {
  color: #334155;
  line-height: 1.8;
  font-size: 0.95rem;
  margin-bottom: 20px;
  font-style: italic;
}
.testimonial-author {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.testimonial-author strong {
  color: #1e1b4b;
  font-size: 0.95rem;
}
.testimonial-author span {
  color: #64748b;
  font-size: 0.85rem;
}

/* Final CTA */
.final-cta {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  padding: 80px 24px;
  text-align: center;
  color: #fff;
}
.final-cta h2 {
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 16px;
}
.final-cta p {
  font-size: 1.05rem;
  opacity: 0.9;
  margin-bottom: 36px;
}
.btn-hero-lg {
  text-decoration: none;
  background: #1e1b4b;
  color: #fff;
  font-weight: 800;
  padding: 18px 48px;
  border-radius: 12px;
  font-size: 1.1rem;
  display: inline-block;
  transition: all 0.25s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.btn-hero-lg:hover {
  background: #312e81;
  transform: translateY(-2px);
}
.cta-guarantees {
  margin-top: 24px;
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 600;
}

/* Footer */
.saas-footer {
  background: #1e1b4b;
  padding: 32px 24px;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 1.05rem;
}
.footer-links {
  display: flex;
  gap: 20px;
}
.footer-links a {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
  transition: color 0.2s;
}
.footer-links a:hover {
  color: #fff;
}
.footer-copy {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.8rem;
}

/* Brand Logo */
.brand-logo {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #1a3d8f, #6a5ae0);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(26, 61, 143, 0.35);
  flex-shrink: 0;
}
.logo-img-saas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.logo-h {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 900;
  font-family: 'Montserrat', sans-serif;
  line-height: 1;
}
.brand-text-group {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.brand-name {
  font-size: 1.1rem;
  font-weight: 900;
  color: #1a3d8f;
  font-family: 'Montserrat', sans-serif;
  line-height: 1.1;
  letter-spacing: -0.5px;
}
.brand-tagline {
  font-size: 0.6rem;
  color: #6a5ae0;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.brand-badge {
  font-size: 0.6rem;
  background: linear-gradient(135deg, #1a3d8f, #6a5ae0);
  color: #fff;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 700;
  align-self: flex-start;
}

/* Color overrides */
.btn-ghost {
  border-color: #1a3d8f !important;
  color: #1a3d8f !important;
}
.btn-ghost:hover {
  background: #1a3d8f !important;
  color: #fff !important;
}
.btn-primary-nav {
  background: linear-gradient(135deg, #2d5ddb, #6a5ae0) !important;
  box-shadow: 0 4px 16px rgba(106, 90, 224, 0.4) !important;
}
.btn-primary-nav:hover {
  background: linear-gradient(135deg, #1a3d8f, #2d5ddb) !important;
  box-shadow: 0 8px 24px rgba(106, 90, 224, 0.5) !important;
}
.btn-primary-full {
  background: linear-gradient(135deg, #2d5ddb, #6a5ae0) !important;
}

.hero {
  background: linear-gradient(140deg, #0d1b4b 0%, #1a3d8f 45%, #2d5ddb 75%, #6a5ae0 100%) !important;
}
.hero-badge {
  background: rgba(106, 90, 224, 0.2) !important;
  border-color: rgba(106, 90, 224, 0.45) !important;
  color: #c4b5fd !important;
}
.btn-hero {
  background: linear-gradient(135deg, #2d5ddb, #6a5ae0) !important;
  box-shadow: 0 8px 24px rgba(106, 90, 224, 0.5) !important;
}
.btn-hero:hover {
  background: linear-gradient(135deg, #1a3d8f, #2d5ddb) !important;
}
.highlight {
  background: linear-gradient(90deg, #c4b5fd, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.proof-bar {
  background: #f5f7fa !important;
}
.proof-bar strong {
  color: #1a3d8f !important;
}
.stars {
  color: #6a5ae0 !important;
}

.section-header h2 {
  color: #1a3d8f !important;
}
.feature-card:hover {
  border-color: #6a5ae0 !important;
  box-shadow: 0 20px 40px rgba(106, 90, 224, 0.12) !important;
}
.feature-benefit {
  color: #2d5ddb !important;
  background: #eff6ff !important;
}

.how-it-works {
  background: linear-gradient(140deg, #0d1b4b, #1a3d8f, #2d5ddb) !important;
}
.step-num {
  background: linear-gradient(135deg, #2d5ddb, #6a5ae0) !important;
  box-shadow: 0 8px 20px rgba(106, 90, 224, 0.4) !important;
}

.stat-value {
  color: #1a3d8f !important;
}

.final-cta {
  background: linear-gradient(135deg, #1a3d8f, #2d5ddb, #6a5ae0) !important;
}
.btn-hero-lg {
  background: #fff !important;
  color: #1a3d8f !important;
}
.btn-hero-lg:hover {
  background: #f5f7fa !important;
  color: #1a3d8f !important;
}

.saas-footer {
  background: #0d1b4b !important;
}

/* Pricing Section */
.pricing-section {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.pricing-loading {
  text-align: center;
}
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin-top: 40px;
  justify-content: center;
}
.pricing-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 40px 32px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.pricing-card.featured {
  border: 2px solid #6a5ae0;
  box-shadow: 0 20px 40px rgba(106, 90, 224, 0.08);
}
.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px rgba(106, 90, 224, 0.15);
}
.card-header-plan {
  margin-bottom: 24px;
  position: relative;
}
.plan-badge-label {
  position: absolute;
  top: -20px;
  left: -20px;
  background: linear-gradient(135deg, #1a3d8f, #6a5ae0);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}
.plan-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.plan-name-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #1a3d8f !important;
  margin-bottom: 8px;
}
.plan-desc-text {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.6;
}
.plan-price-block {
  margin-bottom: 24px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.price-amount {
  font-size: 3rem;
  font-weight: 900;
  color: #1e1b4b;
}
.price-curr {
  font-size: 1rem;
  font-weight: 700;
  color: #64748b;
}
.price-period {
  font-size: 0.88rem;
  color: #64748b;
  margin-right: 4px;
}
.plan-trial-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 30px;
  margin-bottom: 24px;
  align-self: flex-start;
}
.plan-features-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 32px;
  flex-grow: 1;
}
.feature-item-row {
  display: flex;
  align-items: center;
  font-size: 0.92rem;
  color: #334155;
}
.feature-item-row.disabled {
  color: #94a3b8;
  text-decoration: line-through;
  opacity: 0.6;
}
.feature-item-row.limit strong {
  color: #1a3d8f;
}
.card-btn {
  height: 52px !important;
  font-size: 1rem !important;
}

/* Tiered Pricing List Styles */
.plan-tiered-prices-list {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px 18px;
  margin-top: -8px;
  transition: all 0.2s ease;
}
.pricing-card.featured .plan-tiered-prices-list {
  background: #f5f3ff;
  border-color: #e4dffd;
}
.tiered-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
  text-align: right;
}
.tiered-grid-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tiered-option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #334155;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}
.tiered-option-item:hover {
  background: #ffffff;
  border-color: #6a5ae0;
  transform: translateX(-3px);
  box-shadow: 0 4px 12px rgba(106, 90, 224, 0.08);
}
.tiered-months {
  font-weight: 700;
  color: #475569;
}
.tiered-price-val {
  color: #1a3d8f;
  font-weight: 600;
}
.tiered-price-val strong {
  font-size: 0.95rem;
  color: #1a3d8f;
}
.tiered-save-badge {
  font-size: 0.72rem;
  color: #16a34a;
  font-weight: 700;
  background: #eafaf1;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .menu-toggle {
    display: block;
  }
  .stat-item {
    border-left: none;
    border-bottom: 1px solid #e2e8f0;
  }
  .stat-item:last-child {
    border-bottom: none;
  }
  .footer-inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
