<template>
  <div class="login-wrapper">
    <!-- Immersive Animated Background -->
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <v-container class="fill-height d-flex align-center justify-center pa-4">
      <div class="glass-login-card elevation-24 pa-4 pa-md-6">
        <v-row class="fill-height justify-center" align="stretch">
          <!-- Left Side: Visual/Branding -->
          <v-col cols="12" md="5" class="d-none d-md-flex">
            <div class="visual-card-premium h-100 w-100 d-flex align-center justify-center">
              <div class="brand-content text-center pa-10">
                <div class="logo-orb-premium mb-8">
                  <v-icon icon="ri-shield-keyhole-fill" size="56" color="white" />
                </div>
                <h1 class="text-h3 font-weight-black text-white mb-4 tracking-tight">مرحباً بك</h1>
                <p class="text-h6 text-white opacity-80 mb-10 font-weight-medium leading-relaxed">
                  سجل دخولك للوصول إلى كافة الخدمات الرقمية والعمليات المتكاملة بشكل آمن.
                </p>

                <div class="features-grid">
                  <div
                    v-for="(feature, i) in ['وصول آمن وسريع', 'واجهة مستخدم عصرية', 'بيئة عمل متكاملة']"
                    :key="i"
                    class="feature-tag mb-3 d-flex align-center gap-3"
                  >
                    <v-icon icon="ri-checkbox-circle-fill" size="20" color="white" />
                    <span class="text-body-2 font-weight-bold">{{ feature }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Right Side: Login Form -->
          <v-col cols="12" md="7" class="d-flex">
            <div class="form-card-premium h-100 pa-8 pa-md-12 pa-lg-15 w-100 d-flex flex-column justify-center">
              <div class="form-content-wrapper">
                <div class="form-header mb-8">
                  <h2 class="text-h4 font-weight-black text-slate-900 mb-2">تسجيل الدخول <span class="wave-emoji">👋</span></h2>
                  <p class="text-body-1 text-slate-500">سعداء برؤيتك مرة أخرى في منصتنا</p>
                </div>

                <v-form ref="formRef" @submit.prevent="handleLogin" class="login-form">
                  <div class="input-group mb-5">
                    <label class="custom-label">رقم الهاتف أو البريد الإلكتروني</label>
                    <AppInput
                      v-model="form.login"
                      placeholder="أدخل بريدك أو رقم هاتفك"
                      :rules="[required]"
                      prepend-inner-icon="ri-user-6-line"
                      class="premium-input-field"
                    />
                  </div>

                  <div class="input-group mb-6">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <label class="custom-label mb-0">كلمة المرور</label>
                      <router-link to="/forgot-password" class="text-caption font-weight-bold text-primary text-decoration-none">
                        نسيت كلمة المرور؟
                      </router-link>
                    </div>
                    <AppPasswordInput
                      v-model="form.password"
                      placeholder="أدخل كلمة المرور"
                      :rules="[required]"
                      prepend-inner-icon="ri-lock-2-line"
                      class="premium-input-field"
                    />
                  </div>

                  <div class="d-flex align-center mb-8">
                    <v-checkbox
                      v-model="form.remember"
                      label="تذكرني على هذا الجهاز"
                      color="primary"
                      density="comfortable"
                      hide-details
                      class="remember-checkbox"
                    />
                  </div>

                  <AppButton type="submit" color="primary" size="x-large" block active :loading="loading" class="login-submit-btn">
                    <v-icon icon="ri-login-circle-line" start />
                    بدء الدخول
                  </AppButton>

                  <div class="mt-8 text-center">
                    <span class="text-slate-500">ليس لديك حساب؟</span>
                    <router-link to="/register" class="text-primary font-weight-bold ms-2 text-decoration-none hover-underline">
                      إنشاء حساب جديد
                    </router-link>
                  </div>
                </v-form>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/api';
import { required } from '@/utils/validators';
import AppInput from '@/components/common/AppInput.vue';
import AppPasswordInput from '@/components/common/AppPasswordInput.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

const form = ref({
  login: '',
  password: '',
  remember: false,
});

const handleLogin = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const { useUserStore } = await import('@/stores/user');
    const userStore = useUserStore();

    await authService.login(form.value);
    await userStore.fetchUser();

    if (userStore.isStaff) {
      router.push('/app/admin/dashboard');
    } else {
      router.push('/app/portal');
    }
  } catch (error) {
    // Interceptor handles UI
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: #0f172a;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  /* Removed transition and mode-specific backgrounds */
}

/* Premium Glass Card */
.glass-login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  width: 100%;
  max-width: 1100px;
  min-height: 700px;
  overflow: hidden;
  z-index: 2;
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5) !important;
}

/* Visual Card */
.visual-card-premium {
  position: relative;
  color: white;
  overflow: hidden;
  /* Removed transition */
  border-radius: 20px;
  /* Hardcoded background */
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
}

/* Form Card */
.form-card-premium {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.logo-orb-premium {
  width: 110px;
  height: 110px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transform: rotate(-15deg);
  animation: float-rotate 6s ease-in-out infinite;
}

@keyframes float-rotate {
  0%,
  100% {
    transform: rotate(-15deg) translateY(0);
  }
  50% {
    transform: rotate(-5deg) translateY(-15px);
  }
}

.features-grid {
  display: inline-block;
  text-align: right;
  margin: 0 auto;
}

.feature-tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Removed Premium Tabs styles */

/* Form Elements */
.custom-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
}

.premium-input-field :deep(.v-field) {
  border-radius: 12px !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  transition: all 0.3s ease;
}

.premium-input-field :deep(.v-field--focused) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

.login-submit-btn {
  height: 64px !important;
  border-radius: 14px !important;
  font-weight: 800 !important;
  font-size: 1.1rem !important;
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3) !important;
  text-transform: none;
}

/* Background Orbs */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 1;
  opacity: 0.4;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: #4f46e5;
  top: -200px;
  left: -200px;
}
.orb-2 {
  width: 500px;
  height: 500px;
  background: #ec4899;
  bottom: -150px;
  right: -150px;
}
.orb-3 {
  width: 400px;
  height: 400px;
  background: #6366f1;
  top: 30%;
  right: 10%;
}

.wave-emoji {
  display: inline-block;
  animation: wave 2.5s infinite;
  transform-origin: 70% 70%;
}

@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10%,
  30% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(0deg);
  }
}

@media (max-width: 960px) {
  .glass-login-card {
    border-radius: 16px;
    margin: 15px;
    min-height: auto;
  }
}
</style>
