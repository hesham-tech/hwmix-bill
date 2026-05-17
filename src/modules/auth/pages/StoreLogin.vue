<template>
  <div class="store-login-wrapper" dir="rtl">
    <!-- Animated Background -->
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
    <div class="bg-blob blob-3"></div>

    <div class="login-container">
      <!-- Left Panel: Branding -->
      <div class="brand-panel">
        <div class="brand-panel-inner">
          <!-- Logo -->
          <div class="store-logo-wrap">
            <div class="store-logo-icon">
              <span>H</span>
            </div>
            <div>
              <div class="store-logo-name">HWNiX</div>
              <div class="store-logo-tagline">الثقة في كل اختيار</div>
            </div>
          </div>

          <!-- Hero Text -->
          <h1 class="brand-headline">
            مرحباً بك في<br />
            <span class="brand-headline-accent">عالم التسوق</span>
          </h1>
          <p class="brand-subtext">سجّل دخولك وتمتع بتجربة تسوق لا مثيل لها مع عروض حصرية وأسعار لا تُنسى.</p>

          <!-- Trust Badges -->
          <div class="trust-badges">
            <div v-for="badge in badges" :key="badge.icon" class="trust-badge">
              <div class="trust-badge-icon">
                <i :class="badge.icon"></i>
              </div>
              <span>{{ badge.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Form -->
      <div class="form-panel">
        <div class="form-panel-inner">
          <!-- Back to store -->
          <router-link to="/" class="back-link">
            <i class="ri-arrow-right-line"></i>
            العودة للمتجر
          </router-link>

          <div class="form-header">
            <h2 class="form-title">تسجيل الدخول <span class="wave">👋</span></h2>
            <p class="form-subtitle">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <!-- Success Message after Register -->
          <div v-if="justRegistered" class="success-alert">
            <i class="ri-checkbox-circle-fill"></i>
            تم إنشاء حسابك بنجاح! يمكنك تسجيل الدخول الآن.
          </div>

          <v-form ref="formRef" @submit.prevent="handleLogin" class="login-form">
            <div class="field-group">
              <label class="field-label">رقم الهاتف أو البريد الإلكتروني</label>
              <AppInput
                v-model="form.login"
                placeholder="أدخل بريدك أو رقم هاتفك"
                :rules="[required]"
                prepend-inner-icon="ri-user-6-line"
                class="store-input"
              />
            </div>

            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label mb-0">كلمة المرور</label>
              </div>
              <AppPasswordInput
                v-model="form.password"
                placeholder="أدخل كلمة المرور"
                :rules="[required]"
                prepend-inner-icon="ri-lock-2-line"
                class="store-input"
              />
            </div>

            <div class="remember-row">
              <v-checkbox v-model="form.remember" label="تذكرني على هذا الجهاز" color="primary" density="comfortable" hide-details />
            </div>

            <AppButton type="submit" color="primary" size="x-large" block active :loading="loading" class="login-btn">
              <i class="ri-login-circle-line me-2"></i>
              دخول إلى المتجر
            </AppButton>

            <div class="forgot-simple">
              <router-link to="/forgot-password">نسيت كلمة السر؟ اضغط هنا لاستعادتها</router-link>
            </div>
          </v-form>

          <div class="divider">
            <span>أو</span>
          </div>

          <div class="register-cta">
            <span class="register-cta-text">ليس لديك حساب؟</span>
            <router-link to="/register" class="register-cta-link">إنشاء حساب مجاني</router-link>
          </div>

          <!-- Staff login hint -->
          <!-- <div class="staff-hint">
            <i class="ri-admin-line"></i>
            <span>موظف أو صاحب شركة؟ </span>
            <router-link to="/saas/login" class="staff-link">دخول النظام</router-link>
          </div> -->
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

const badges = [
  { icon: 'ri-shield-check-line', text: 'دفع آمن 100%' },
  { icon: 'ri-truck-line', text: 'توصيل سريع' },
  { icon: 'ri-customer-service-2-line', text: 'دعم 24/7' },
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

* {
  box-sizing: border-box;
}

.store-login-wrapper {
  font-family: 'Cairo', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ede9fe 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Animated Blobs */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  z-index: 0;
  animation: blobFloat 10s ease-in-out infinite;
}
.blob-1 {
  width: 500px;
  height: 500px;
  background: #818cf8;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}
.blob-2 {
  width: 400px;
  height: 400px;
  background: #a78bfa;
  bottom: -100px;
  right: -100px;
  animation-delay: -3s;
}
.blob-3 {
  width: 300px;
  height: 300px;
  background: #60a5fa;
  top: 40%;
  left: 30%;
  animation-delay: -6s;
}
@keyframes blobFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, -20px) scale(1.05);
  }
}

/* Main Container */
.login-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 1050px;
  min-height: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(99, 102, 241, 0.2);
}

/* Brand Panel */
.brand-panel {
  background: linear-gradient(145deg, #1a3d8f 0%, #4f46e5 50%, #7c3aed 100%);
  position: relative;
  overflow: hidden;
  padding: 28px 32px;
  display: flex;
  align-items: center;
}
.brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.brand-panel-inner {
  position: relative;
  z-index: 1;
  width: 100%;
}

.store-logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.store-logo-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}
.store-logo-icon span {
  color: white;
  font-size: 1.4rem;
  font-weight: 900;
}
.store-logo-name {
  color: white;
  font-size: 1.1rem;
  font-weight: 900;
  line-height: 1.2;
}
.store-logo-tagline {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.7rem;
  font-weight: 600;
}

.brand-headline {
  color: white;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.35;
  margin-bottom: 16px;
}
.brand-headline-accent {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.brand-subtext {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 18px;
}

/* Trust Badges */
.trust-badges {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}
.trust-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 10px 16px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
}
.trust-badge-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

/* Floating Product Cards */
.floating-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.float-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  padding: 12px 16px;
  animation: cardFloat 4s ease-in-out infinite;
}
.card-2 {
  animation-delay: -2s;
}
.card-icon {
  font-size: 1.5rem;
  color: #fbbf24;
}
.card-name {
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
}
.card-price {
  color: #fbbf24;
  font-size: 0.8rem;
  font-weight: 800;
}
@keyframes cardFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

/* Form Panel */
.form-panel {
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 32px;
}
.form-panel-inner {
  width: 100%;
  max-width: 380px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6366f1;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 16px;
  transition: gap 0.2s;
}
.back-link:hover {
  gap: 10px;
}

.form-header {
  margin-bottom: 16px;
}
.form-title {
  font-size: 1.7rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 6px;
}
.wave {
  display: inline-block;
  animation: wave 2.5s infinite;
  transform-origin: 70% 70%;
}
@keyframes wave {
  0%,
  100% {
    transform: rotate(0);
  }
  20% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-8deg);
  }
  60% {
    transform: rotate(10deg);
  }
}
.form-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

/* Success Alert */
.success-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 12px 16px;
  color: #16a34a;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
}

/* Fields */
.field-group {
  margin-bottom: 10px;
}
.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
}
.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.forgot-link {
  color: #6366f1;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}
.forgot-link:hover {
  text-decoration: underline;
}

.store-input :deep(.v-field) {
  border-radius: 12px !important;
  background: #f8fafc !important;
  border: 1.5px solid #e2e8f0 !important;
  transition: all 0.25s;
}
.store-input :deep(.v-field--focused) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12) !important;
}

.remember-row {
  margin-bottom: 14px;
}

.login-btn {
  height: 56px !important;
  border-radius: 14px !important;
  font-size: 1.05rem !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35) !important;
  transition: all 0.25s !important;
}
.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.45) !important;
}

/* Forgot Password Row */
.forgot-password-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  padding: 10px 16px;
  background: #f8faff;
  border: 1px dashed #c7d2fe;
  border-radius: 12px;
  font-size: 0.83rem;
  color: #64748b;
}
.forgot-icon {
  color: #818cf8;
  font-size: 1rem;
  flex-shrink: 0;
}
.forgot-action-link {
  color: #6366f1;
  font-weight: 800;
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-action-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.forgot-simple {
  text-align: center;
  margin-top: 10px;
}
.forgot-simple a {
  color: #6366f1;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
}
.forgot-simple a:hover {
  text-decoration: underline;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 22px 0;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.register-cta {
  text-align: center;
  margin-bottom: 20px;
}
.register-cta-text {
  color: #64748b;
  font-size: 0.9rem;
}
.register-cta-link {
  color: #6366f1;
  font-weight: 800;
  font-size: 0.9rem;
  text-decoration: none;
  margin-right: 6px;
}
.register-cta-link:hover {
  text-decoration: underline;
}

.staff-hint {
  text-align: center;
  font-size: 0.8rem;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.staff-link {
  color: #6366f1;
  font-weight: 700;
  text-decoration: none;
}
.staff-link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
  }
  .brand-panel {
    display: none;
  }
  .form-panel {
    padding: 36px 24px;
  }
}
</style>
