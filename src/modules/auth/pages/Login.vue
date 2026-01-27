<template>
  <div class="login-page" :class="`mode-${loginMode}`">
    <!-- Background Animation -->
    <div class="background-animation">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <v-container fluid class="login-container">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12">
          <v-card class="login-card elevation-24" rounded="xl">
            <v-row no-gutters>
              <!-- Left Side - Branding (Changes based on mode) -->
              <v-col cols="12" md="6" class="brand-side transition-all">
                <div class="brand-content">
                  <div class="logo-container">
                    <div class="logo-circle">
                      <v-icon :icon="modeConfig.icon" size="48" color="white" />
                    </div>
                  </div>

                  <h1 class="brand-title">{{ modeConfig.brandTitle }}</h1>
                  <p class="brand-subtitle">{{ modeConfig.brandSubtitle }}</p>

                  <div class="features-list">
                    <div class="feature-item" v-for="(feature, i) in modeConfig.features" :key="i">
                      <v-icon icon="ri-checkbox-circle-fill" color="white" class="feature-icon" />
                      <span>{{ feature }}</span>
                    </div>
                  </div>

                  <div class="decorative-circles">
                    <div class="circle circle-1"></div>
                    <div class="circle circle-2"></div>
                    <div class="circle circle-3"></div>
                  </div>
                </div>
              </v-col>

              <!-- Right Side - Login Form -->
              <v-col cols="12" md="6" class="form-side">
                <div class="form-container">
                  <!-- Mode Switcher Tabs -->
                  <div class="mode-tabs mb-8 pa-1 bg-grey-lighten-4 rounded-xl d-flex">
                    <div
                      class="mode-tab flex-1 py-2 text-center cursor-pointer transition-all rounded-lg font-weight-bold"
                      :class="{ 'active elevation-2 bg-white primary--text': loginMode === 'customer' }"
                      @click="setMode('customer')"
                    >
                      دخول العملاء
                    </div>
                    <div
                      class="mode-tab flex-1 py-2 text-center cursor-pointer transition-all rounded-lg font-weight-bold"
                      :class="{ 'active elevation-2 bg-white primary--text': loginMode === 'staff' }"
                      @click="setMode('staff')"
                    >
                      دخول الموظفين
                    </div>
                  </div>

                  <div class="form-header">
                    <h2 class="welcome-title">{{ modeConfig.formTitle }} 👋</h2>
                    <p class="welcome-subtitle">{{ modeConfig.formSubtitle }}</p>
                  </div>

                  <v-form ref="formRef" @submit.prevent="handleLogin" class="login-form">
                    <div class="input-group">
                      <label class="input-label">البريد الإلكتروني أو اسم المستخدم</label>
                      <AppInput
                        v-model="form.login"
                        placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                        :rules="[required]"
                        prepend-inner-icon="ri-user-line"
                        class="modern-input"
                      />
                    </div>

                    <div class="input-group">
                      <label class="input-label">كلمة المرور</label>
                      <AppPasswordInput
                        v-model="form.password"
                        placeholder="أدخل كلمة المرور"
                        :rules="[required]"
                        prepend-inner-icon="ri-lock-line"
                        class="modern-input"
                      />
                    </div>

                    <div class="form-options">
                      <v-checkbox v-model="form.remember" label="تذكرني" density="compact" color="primary" hide-details />
                      <router-link to="/forgot-password" class="forgot-link"> نسيت كلمة المرور؟ </router-link>
                    </div>

                    <AppButton type="submit" color="primary" block :loading="loading" class="login-btn mb-6" size="large">
                      <v-icon icon="ri-login-box-line" start />
                      {{ modeConfig.btnText }}
                    </AppButton>

                    <div class="register-section">
                      <span class="register-text">ليس لديك حساب؟</span>
                      <router-link to="/register" class="register-link"> إنشاء حساب جديد </router-link>
                    </div>
                  </v-form>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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

const loginMode = ref('customer'); // default mode

const form = ref({
  login: '',
  password: '',
  remember: false,
});

const configs = {
  staff: {
    brandTitle: 'hwmix-bill',
    brandSubtitle: 'نظام الإدارة والعمليات المركزية',
    icon: 'ri-building-line',
    features: ['إدارة الفواتير والمخازن', 'تقارير مالية وتدفقات نقدية', 'صلاحيات وصول متقدمة'],
    formTitle: 'دخول الموظفين',
    formSubtitle: 'قم بتسجيل الدخول لمتابعة سير العمل اليومي',
    btnText: 'دخول الموظفين',
  },
  customer: {
    brandTitle: 'بوابة العميل',
    brandSubtitle: 'مساحتك الخاصة لمتابعة معاملاتك المالية',
    icon: 'ri-user-star-line',
    features: ['متابعة المشتريات والديون', 'جدول تقسيط واضح ومنظم', 'تنبيهات بمواعيد الاستحقاق'],
    formTitle: 'مرحباً بك',
    formSubtitle: 'سجل دخولك لمراجعة فواتيرك ومدفوعاتك',
    btnText: 'دخول بوابة العميل',
  },
};

const modeConfig = computed(() => configs[loginMode.value]);

const setMode = mode => {
  loginMode.value = mode;
  router.replace({ query: { ...route.query, type: mode } });
};

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
    // Error handled in AuthService
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (route.query.type && configs[route.query.type]) {
    loginMode.value = route.query.type;
  }
});

watch(
  () => route.query.type,
  newType => {
    if (newType && configs[newType]) {
      loginMode.value = newType;
    }
  }
);
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  transition: background 0.5s ease;
}

/* Dynamic Gradients based on mode */
.mode-staff {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.mode-customer {
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
}

.mode-staff .brand-side {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.mode-customer .brand-side {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

/* Background Animation */
.background-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
}
.shape-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 20%;
  animation-delay: 5s;
}
.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 30%;
  animation-delay: 10s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) translateX(0px);
  }
  33% {
    transform: translateY(-30px) translateX(30px);
  }
  66% {
    transform: translateY(30px) translateX(-30px);
  }
}

.login-container {
  z-index: 1;
  position: relative;
  max-width: 1100px !important;
  margin: 0 auto;
  width: 100%;
}

.login-card {
  overflow: hidden;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-side {
  color: white;
  padding: 48px 32px;
  position: relative;
  overflow: hidden;
}
.brand-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-circle {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  margin: 0 auto 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
  }
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
}
.brand-subtitle {
  font-size: 1.1rem;
  text-align: center;
  opacity: 0.9;
  margin-bottom: 40px;
}

.features-list {
  margin: 32px auto 0;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 1.05rem;
}

.decorative-circles .circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}
.circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -200px;
}
.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -150px;
}
.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -75px;
}

.form-side {
  padding: 40px;
}
.form-container {
  max-width: 450px;
  width: 100%;
  margin: 0 auto;
}

.mode-tabs {
  border: 1px solid #ebebeb;
}
.mode-tab {
  color: #64748b;
  font-size: 0.9rem;
}
.mode-tab.active {
  color: #2563eb !important;
}

.welcome-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}
.welcome-subtitle {
  font-size: 1.05rem;
  color: #64748b;
  margin-bottom: 32px;
}

.input-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}
.modern-input :deep(.v-field) {
  border-radius: 12px;
  background: #f8fafc !important;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0;
}
.forgot-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
}

.login-btn {
  border-radius: 14px !important;
  height: 56px !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2) !important;
}

.register-section {
  text-align: center;
  margin-top: 24px;
  color: #64748b;
  font-size: 0.95rem;
}
.register-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
  margin-inline-start: 4px;
}

.transition-all {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 960px) {
  .brand-side {
    display: none;
  }
  .form-side {
    padding: 32px 20px;
  }
}
</style>
