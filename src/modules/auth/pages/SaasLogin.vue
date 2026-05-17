<template>
  <div class="saas-login-wrapper" dir="rtl">
    <!-- Mesh Gradient Background -->
    <div class="mesh-bg">
      <div class="mesh-orb orb-1"></div>
      <div class="mesh-orb orb-2"></div>
      <div class="mesh-orb orb-3"></div>
    </div>

    <!-- Grid Pattern -->
    <div class="grid-pattern"></div>

    <div class="saas-login-container">
      <!-- Left Panel: Social Proof -->
      <div class="saas-brand-panel">
        <div class="saas-brand-inner">
          <!-- Logo -->
          <div class="saas-logo-wrap">
            <div class="saas-logo-icon">
              <i class="ri-building-2-fill"></i>
            </div>
            <div>
              <div class="saas-logo-name">HWNiX</div>
              <div class="saas-logo-badge">SaaS Platform</div>
            </div>
          </div>

          <h1 class="saas-headline">
            النظام الذي يُدير<br />
            <span class="saas-headline-gold">أعمالك بذكاء</span>
          </h1>
          <p class="saas-subtext">
            انضم لآلاف الشركات التي تعتمد على HWNix في إدارة فواتيرها، مخازنها، وتقاريرها المالية بكل سهولة وأمان.
          </p>

          <!-- Stats Bar -->
          <div class="stats-bar">
            <div v-for="stat in stats" :key="stat.label" class="stat-item">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>

          <!-- Features -->
          <div class="saas-features">
            <div v-for="feat in features" :key="feat.text" class="saas-feature">
              <i class="ri-checkbox-circle-fill feature-check"></i>
              <span>{{ feat.text }}</span>
            </div>
          </div>

          <!-- Trust Badge -->
          <div class="trust-strip">
            <i class="ri-shield-keyhole-fill"></i>
            <span>بيانات مشفرة بالكامل · SSL · ISO 27001</span>
          </div>
        </div>
      </div>

      <!-- Right Panel: Login Form -->
      <div class="saas-form-panel">
        <div class="saas-form-inner">
          <router-link to="/saas" class="saas-back-link">
            <i class="ri-arrow-right-line"></i> العودة للرئيسية
          </router-link>

          <div class="saas-form-header">
            <div class="saas-shield-icon">
              <i class="ri-shield-keyhole-fill"></i>
            </div>
            <h2 class="saas-form-title">تسجيل الدخول</h2>
            <p class="saas-form-subtitle">ادخل بيانات شركتك للوصول للوحة التحكم</p>
          </div>

          <!-- Success Message -->
          <div v-if="justRegistered" class="saas-success-alert">
            <i class="ri-checkbox-circle-fill"></i>
            تم تسجيل شركتك بنجاح! راجع بريدك الإلكتروني لتأكيد الحساب.
          </div>

          <v-form ref="formRef" @submit.prevent="handleLogin" class="saas-form">
            <div class="saas-field-group">
              <label class="saas-field-label">رقم الهاتف أو البريد الإلكتروني</label>
              <AppInput
                v-model="form.login"
                placeholder="أدخل بريدك أو رقم هاتفك"
                :rules="[required]"
                prepend-inner-icon="ri-building-line"
                class="saas-input"
              />
            </div>

            <div class="saas-field-group">
              <div class="saas-field-label-row">
                <label class="saas-field-label mb-0">كلمة المرور</label>
              </div>
              <AppPasswordInput
                v-model="form.password"
                placeholder="أدخل كلمة المرور"
                :rules="[required]"
                prepend-inner-icon="ri-lock-2-line"
                class="saas-input"
              />
            </div>

            <div class="saas-remember-row">
              <v-checkbox
                v-model="form.remember"
                label="تذكرني"
                color="warning"
                density="comfortable"
                hide-details
                class="saas-checkbox"
              />
            </div>

            <AppButton
              type="submit"
              color="warning"
              size="x-large"
              block
              active
              :loading="loading"
              class="saas-login-btn"
            >
              <i class="ri-dashboard-line me-2"></i>
              دخول لوحة التحكم
            </AppButton>

            <div class="saas-forgot-simple">
              <router-link to="/forgot-password">نسيت كلمة السر؟ اضغط هنا لاستعادتها</router-link>
            </div>
          </v-form>

          <div class="saas-divider"><span>ليس لديك شركة مسجلة؟</span></div>

          <router-link to="/saas/register" class="saas-register-cta">
            <i class="ri-rocket-line me-2"></i>
            سجّل شركتك وابدأ مجاناً
          </router-link>

          <div class="customer-hint">
            <i class="ri-shopping-bag-line"></i>
            <span>تريد التسوق فقط؟ </span>
            <router-link to="/login" class="customer-link">دخول المتجر</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/api';
import { required } from '@/utils/validators';
import AppInput from '@/components/common/AppInput.vue';
import AppPasswordInput from '@/components/common/AppPasswordInput.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const loading = ref(false);
const justRegistered = computed(() => !!route.query.registered);
const form = ref({ login: '', password: '', remember: false });

const stats = [
  { value: '2,400+', label: 'شركة نشطة' },
  { value: '99.9%', label: 'وقت تشغيل' },
  { value: '24/7', label: 'دعم فني' },
];

const features = [
  { text: 'فواتير ضريبية احترافية مع QR' },
  { text: 'إدارة مخازن ومنتجات متعددة' },
  { text: 'تقسيط ذكي مع تتبع الأقساط' },
  { text: 'تقارير مالية لحظية' },
  { text: 'صلاحيات دقيقة لكل موظف' },
];

const handleLogin = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  loading.value = true;
  try {
    const { useUserStore } = await import('@/stores/user');
    const userStore = useUserStore();
    await authService.login(form.value);
    await userStore.fetchUser();
    const redirectPath = route.query.redirect;
    if (redirectPath) {
      router.push(redirectPath);
    } else if (userStore.isStaff) {
      router.push('/app/admin/dashboard');
    } else {
      router.push('/app/portal');
    }
  } catch (error) {
    // Handled by interceptor
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
* { box-sizing: border-box; }

.saas-login-wrapper {
  font-family: 'Cairo', sans-serif;
  min-height: 100vh;
  background: #060b18;
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

/* Mesh Background */
.mesh-bg { position: absolute; inset: 0; z-index: 0; }
.mesh-orb {
  position: absolute; border-radius: 50%;
  filter: blur(100px); opacity: 0.18;
  animation: meshFloat 12s ease-in-out infinite;
}
.orb-1 { width: 600px; height: 600px; background: #4f46e5; top: -200px; left: -200px; }
.orb-2 { width: 500px; height: 500px; background: #f59e0b; bottom: -150px; right: -150px; animation-delay: -4s; }
.orb-3 { width: 400px; height: 400px; background: #7c3aed; top: 40%; left: 40%; animation-delay: -8s; }
@keyframes meshFloat {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

/* Grid Pattern */
.grid-pattern {
  position: absolute; inset: 0; z-index: 0;
  background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Main Container */
.saas-login-container {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1.1fr 0.9fr;
  width: 100%; max-width: 1050px;
  border-radius: 24px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(245, 158, 11, 0.1);
}

/* Brand Panel */
.saas-brand-panel {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255,255,255,0.08);
  padding: 20px 24px;
  display: flex; align-items: center;
}
.saas-brand-inner { width: 100%; }

.saas-logo-wrap { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.saas-logo-icon {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; color: white;
  box-shadow: 0 8px 20px rgba(245,158,11,0.4);
}
.saas-logo-name { color: white; font-size: 1.2rem; font-weight: 900; }
.saas-logo-badge {
  display: inline-block;
  background: rgba(245,158,11,0.15);
  color: #f59e0b;
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: 20px;
  padding: 1px 10px;
  font-size: 0.68rem;
  font-weight: 700;
}

.saas-headline { color: white; font-size: 1.65rem; font-weight: 900; line-height: 1.35; margin-bottom: 10px; }
.saas-headline-gold {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.saas-subtext { color: rgba(255,255,255,0.55); font-size: 0.85rem; line-height: 1.6; margin-bottom: 18px; }

/* Stats */
.stats-bar {
  display: flex; gap: 0;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; overflow: hidden;
  margin-bottom: 18px;
}
.stat-item {
  flex: 1; text-align: center; padding: 10px 8px;
  border-left: 1px solid rgba(255,255,255,0.08);
}
.stat-item:last-child { border-left: none; }
.stat-value { color: #f59e0b; font-size: 1.2rem; font-weight: 900; }
.stat-label { color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-top: 2px; }

/* Features */
.saas-features { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.saas-feature { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.8); font-size: 0.88rem; font-weight: 600; }
.feature-check { color: #f59e0b; font-size: 1rem; flex-shrink: 0; }

/* Trust Strip */
.trust-strip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: 10px; padding: 10px 14px;
  color: rgba(245,158,11,0.9); font-size: 0.78rem; font-weight: 600;
}

/* Form Panel */
.saas-form-panel {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  padding: 20px 24px;
  display: flex; align-items: center; justify-content: center;
}
.saas-form-inner { width: 100%; max-width: 360px; }

.saas-back-link {
  display: inline-flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.5); font-size: 0.82rem; font-weight: 600;
  text-decoration: none; margin-bottom: 10px;
  transition: color 0.2s;
}
.saas-back-link:hover { color: #f59e0b; }

.saas-form-header { text-align: center; margin-bottom: 12px; }
.saas-shield-icon {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05));
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; color: #f59e0b;
  margin: 0 auto 10px;
  box-shadow: 0 0 20px rgba(245,158,11,0.15);
}
.saas-form-title { color: white; font-size: 1.2rem; font-weight: 900; margin-bottom: 4px; }
.saas-form-subtitle { color: rgba(255,255,255,0.5); font-size: 0.83rem; }

/* Success Alert */
.saas-success-alert {
  display: flex; align-items: center; gap: 10px;
  background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
  border-radius: 12px; padding: 12px 16px;
  color: #fbbf24; font-size: 0.88rem; font-weight: 600;
  margin-bottom: 20px;
}

/* Fields */
.saas-field-group { margin-bottom: 6px; }
.saas-field-label { display: block; font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 5px; }
.saas-field-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
.saas-forgot-link { color: #f59e0b; font-size: 0.78rem; font-weight: 700; text-decoration: none; }

.saas-input :deep(.v-field) {
  border-radius: 12px !important;
  background: rgba(255,255,255,0.07) !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  color: white !important;
}
.saas-input :deep(.v-field--focused) {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.15) !important;
}
.saas-input :deep(.v-field__input) { color: white !important; }
.saas-input :deep(.v-icon) { color: rgba(255,255,255,0.4) !important; }
.saas-input :deep(input::placeholder) { color: rgba(255,255,255,0.3) !important; }

/* Fix browser autofill white background */
.saas-input :deep(input:-webkit-autofill),
.saas-input :deep(input:-webkit-autofill:hover),
.saas-input :deep(input:-webkit-autofill:focus),
.saas-input :deep(input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0 1000px #1a1f35 inset !important;
  -webkit-text-fill-color: white !important;
  transition: background-color 9999s ease-in-out 0s;
  caret-color: white;
}

.saas-remember-row { margin-bottom: 10px; }
.saas-checkbox :deep(.v-label) { color: rgba(255,255,255,0.6); font-size: 0.85rem; }

.saas-login-btn {
  height: 48px !important;
  border-radius: 12px !important;
  font-size: 0.95rem !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  box-shadow: 0 6px 18px rgba(245,158,11,0.4) !important;
  transition: all 0.25s !important;
}
.saas-login-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(245,158,11,0.5) !important; }

/* Forgot Password Row */
.saas-forgot-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  padding: 10px 16px;
  background: rgba(245,158,11,0.05);
  border: 1px dashed rgba(245,158,11,0.25);
  border-radius: 12px;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.45);
}
.saas-forgot-row i { color: #f59e0b; font-size: 0.95rem; flex-shrink: 0; }
.saas-forgot-action {
  color: #f59e0b;
  font-weight: 800;
  text-decoration: none;
  transition: color 0.2s;
}
.saas-forgot-action:hover { color: #fbbf24; text-decoration: underline; }

.saas-forgot-simple {
  text-align: center;
  margin-top: 10px;
}
.saas-forgot-simple a {
  color: rgba(245,158,11,0.8);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
}
.saas-forgot-simple a:hover { color: #f59e0b; text-decoration: underline; }

.saas-divider {
  display: flex; align-items: center; gap: 12px;
  color: rgba(255,255,255,0.3); font-size: 0.82rem;
  margin: 12px 0;
}
.saas-divider::before, .saas-divider::after {
  content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08);
}

.saas-register-cta {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 10px;
  border: 1px solid rgba(245,158,11,0.4);
  border-radius: 12px;
  background: rgba(245,158,11,0.05);
  color: #f59e0b; font-size: 0.88rem; font-weight: 800;
  text-decoration: none; margin-bottom: 12px;
  transition: all 0.25s;
}
.saas-register-cta:hover { background: rgba(245,158,11,0.15); border-color: #f59e0b; }

.customer-hint {
  text-align: center; font-size: 0.78rem;
  color: rgba(255,255,255,0.3);
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 16px;
  display: flex; align-items: center; justify-content: center; gap: 5px;
}
.customer-link { color: #818cf8; font-weight: 700; text-decoration: none; }

@media (max-width: 768px) {
  .saas-login-container { grid-template-columns: 1fr; }
  .saas-brand-panel { display: none; }
  .saas-form-panel { padding: 36px 24px; }
}
</style>
