<template>
  <div class="login-page">
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
              <!-- Left Side - Branding -->
              <v-col cols="12" md="6" class="brand-side">
                <div class="brand-content">
                  <div class="logo-container">
                    <div class="logo-circle">
                      <v-icon icon="ri-building-line" size="48" color="white" />
                    </div>
                  </div>

                  <h1 class="brand-title">hwmix-bill</h1>
                  <p class="brand-subtitle">نظام إدارة الفواتير الاحترافي</p>

                  <div class="features-list">
                    <div class="feature-item" v-for="(feature, i) in features" :key="i">
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
                  <div class="form-header">
                    <h2 class="welcome-title">مرحباً بك 👋</h2>
                    <p class="welcome-subtitle">قم بتسجيل الدخول لمتابعة العمل</p>
                  </div>

                  <v-form ref="formRef" @submit.prevent="handleLogin" class="login-form">
                    <!-- Login Input -->
                    <div class="input-group">
                      <label class="input-label">البريد الإلكتروني أو اسم المستخدم</label>
                      <v-text-field
                        v-model="form.login"
                        placeholder="admin@example.com"
                        variant="outlined"
                        :rules="[required]"
                        prepend-inner-icon="ri-user-line"
                        color="primary"
                        class="modern-input"
                        hide-details="auto"
                      />
                    </div>

                    <!-- Password Input -->
                    <div class="input-group">
                      <label class="input-label">كلمة المرور</label>
                      <v-text-field
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="••••••••"
                        variant="outlined"
                        :rules="[required]"
                        prepend-inner-icon="ri-lock-line"
                        :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                        @click:append-inner="showPassword = !showPassword"
                        color="primary"
                        class="modern-input"
                        hide-details="auto"
                      />
                    </div>

                    <!-- Remember & Forgot -->
                    <div class="form-options">
                      <v-checkbox v-model="form.remember" label="تذكرني" density="compact" color="primary" hide-details />

                      <router-link to="/forgot-password" class="forgot-link"> نسيت كلمة المرور؟ </router-link>
                    </div>

                    <!-- Login Button -->
                    <v-btn type="submit" color="primary" size="x-large" block :loading="loading" class="login-btn" elevation="0">
                      <v-icon icon="ri-login-box-line" start />
                      تسجيل الدخول
                    </v-btn>

                    <!-- Register Link -->
                    <div class="register-section">
                      <span class="register-text">ليس لديك حساب؟</span>
                      <router-link to="/register" class="register-link"> إنشاء حساب جديد </router-link>
                    </div>
                    <!-- Divider -->
                    <div class="divider-section">
                      <div class="divider-line"></div>
                      <span class="divider-text">أو</span>
                      <div class="divider-line"></div>
                    </div>

                    <!-- Social Login -->
                    <div class="social-login">
                      <v-btn variant="outlined" size="large" class="social-btn" @click="handleGoogleLogin">
                        <v-icon icon="ri-google-fill" color="#DB4437" />
                      </v-btn>

                      <v-btn variant="outlined" size="large" class="social-btn" @click="handleFacebookLogin">
                        <v-icon icon="ri-facebook-fill" color="#1877F2" />
                      </v-btn>

                      <v-btn variant="outlined" size="large" class="social-btn" @click="handleTwitterLogin">
                        <v-icon icon="ri-twitter-fill" color="#1DA1F2" />
                      </v-btn>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/api';
import { required, email } from '@/utils/validators';
import { toast } from 'vue3-toastify';

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);
const showPassword = ref(false);

const form = ref({
  login: '',
  password: '',
  remember: false,
});

const features = ['إدارة شاملة للفواتير', 'تقارير مفصلة واحترافية', 'واجهة سهلة الاستخدام'];

const handleLogin = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    await authService.login(form.value);
    toast.success('تم تسجيل الدخول بنجاح');
    router.push('/dashboard');
  } catch (error) {
    toast.error('فشل تسجيل الدخول - تحقق من البيانات');
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = () => {
  toast.info('Google login - قريباً');
};

const handleFacebookLogin = () => {
  toast.info('Facebook login - قريباً');
};

const handleTwitterLogin = () => {
  toast.info('Twitter login - قريباً');
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
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
  animation-delay: 0s;
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
  position: relative;
  z-index: 1;
  padding: 24px;
  max-width: 100%;
  height: 100%;
}

.login-card {
  overflow: hidden;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 1100px !important;
  margin: 0 auto;
  width: 100%;
}

/* Brand Side */
.brand-side {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.logo-container {
  margin-bottom: 24px;
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
  margin: 0 auto;
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
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.brand-subtitle {
  font-size: 1.1rem;
  text-align: center;
  opacity: 0.95;
  margin-bottom: 40px;
}

.features-list {
  margin: 32px auto 0;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 1.05rem;
  animation: slideInRight 0.5s ease-out;
  animation-fill-mode: both;
  width: 100%;
}

.feature-item:nth-child(1) {
  animation-delay: 0.1s;
}
.feature-item:nth-child(2) {
  animation-delay: 0.2s;
}
.feature-item:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feature-icon {
  font-size: 20px !important;
}

.decorative-circles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
}

.circle {
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

/* Form Side */
.form-side {
  padding: 56px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  max-width: 450px;
  width: 100%;
  padding: 24px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 40px;
  animation: fadeInDown 0.6s ease-out;
  text-align: center;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 1.05rem;
  color: #7f8c8d;
  line-height: 1.5;
}

.login-form {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.input-group {
  margin-bottom: 28px;
}

.input-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  letter-spacing: 0.01em;
}

.modern-input :deep(.v-field) {
  border-radius: 12px;
  font-size: 1rem;
  min-height: 56px;
}

.modern-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.modern-input :deep(.v-field__input) {
  padding: 16px 12px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  margin-top: -4px;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.forgot-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.login-btn {
  border-radius: 14px !important;
  font-size: 1.05rem !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.02em !important;
  height: 56px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25) !important;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4) !important;
}

.divider-section {
  display: flex;
  align-items: center;
  margin: 36px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
}

.divider-text {
  padding: 0 20px;
  color: #95a5a6;
  font-size: 0.9rem;
  font-weight: 500;
}

.social-login {
  display: flex;
  gap: 14px;
  justify-content: center;
  margin-bottom: 32px;
}

.social-btn {
  flex: 1;
  border-radius: 12px !important;
  border: 2px solid #e0e0e0 !important;
  transition: all 0.3s ease !important;
  height: 52px !important;
  padding: 15px;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-color: #667eea !important;
}

.register-section {
  text-align: center;
  margin-top: 28px;
  padding-top: 8px;
}

.register-text {
  color: #7f8c8d;
  margin-left: 8px;
  font-size: 0.95rem;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.register-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 960px) {
  .brand-side {
    padding: 48px 32px;
    text-align: center;
  }

  .brand-title {
    font-size: 2rem;
  }

  .form-side {
    padding: 40px 24px;
  }

  .welcome-title {
    font-size: 1.75rem;
  }

  .form-container {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .login-card {
    border-radius: 0 !important;
  }

  .brand-side {
    padding: 56px 24px 40px;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-container {
    margin-bottom: 32px;
  }

  .brand-content {
    padding-top: 24px;
  }

  .form-side {
    padding: 32px 20px;
  }

  .form-container {
    padding: 12px;
  }

  .welcome-title {
    font-size: 1.6rem;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .social-login {
    flex-direction: column;
    gap: 12px;
  }

  .social-btn {
    width: 100%;
  }
}
</style>
