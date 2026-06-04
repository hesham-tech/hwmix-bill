<template>
  <div class="forgot-password-page" dir="rtl">
    <!-- Mesh Gradient Background -->
    <div class="mesh-bg">
      <div class="mesh-orb orb-1"></div>
      <div class="mesh-orb orb-2"></div>
      <div class="mesh-orb orb-3"></div>
    </div>

    <!-- Grid Pattern -->
    <div class="grid-pattern"></div>

    <div class="forgot-container">
      <!-- القسم الترحيبي الجانبي - يتم إخفاؤه في الموبايل لتوفير مساحة العرض وتقليل التمرير -->
      <div class="forgot-brand">
        <div class="brand-content">
          <div class="brand-icon-wrap">
            <v-icon icon="ri-lock-password-line" size="48" color="white" />
          </div>
          <h1 class="brand-title mt-4">استعادة الحساب</h1>
          <p class="brand-subtitle">خطوات بسيطة واستعد التحكم بحسابك بالكامل</p>
        </div>
      </div>

      <div class="forgot-form-wrapper">
        <div class="forgot-form">
          <!-- الشعار للأجهزة المحمولة فقط -->
          <div class="mobile-logo text-center mb-6 d-md-none">
            <div class="mobile-icon-wrap mb-2">
              <v-icon icon="ri-lock-password-line" size="32" color="warning" />
            </div>
            <h2 class="text-h5 font-weight-bold text-white">استعادة كلمة المرور</h2>
          </div>

          <div v-if="!sent">
            <!-- العنوان والتوجيهات -->
            <div class="mb-6">
              <h2 class="text-h5 font-weight-bold mb-2 text-white text-md-right text-center d-none d-md-block">نسيت كلمة المرور؟</h2>
              <p class="text-body-2 text-grey-darken-1 text-md-right text-center" v-if="step === 1">
                أدخل بريدك الإلكتروني لتلقي رمز التحقق (OTP) ورابط الاستعادة المباشر.
              </p>
              <p class="text-body-2 text-grey-darken-1 text-md-right text-center" v-else-if="step === 2">
                أدخل رمز التحقق (OTP) المكون من 6 أرقام وكلمة المرور الجديدة.
              </p>
            </div>

            <!-- الخطوة 1: إدخال البريد الإلكتروني لإرسال الـ OTP -->
            <v-form v-if="step === 1" ref="formRefStep1" @submit.prevent="handleSendOtp">
              <div class="field-group mb-4">
                <label class="field-label">البريد الإلكتروني *</label>
                <AppInput
                  v-model="form.email"
                  placeholder="أدخل بريدك الإلكتروني المسجل"
                  type="email"
                  :rules="[required, email]"
                  prepend-inner-icon="ri-mail-line"
                  class="custom-input"
                />
              </div>

              <AppButton type="submit" color="warning" size="large" block :loading="loading" class="custom-btn mb-4">
                إرسال رمز التحقق (OTP)
              </AppButton>

              <div class="text-center">
                <router-link :to="loginPath" class="back-link font-weight-bold text-body-2">
                  <v-icon icon="ri-arrow-right-line" size="small" class="me-1" />
                  العودة لتسجيل الدخول
                </router-link>
              </div>
            </v-form>

            <!-- الخطوة 2: التحقق من الـ OTP وإدخال كلمة المرور الجديدة -->
            <v-form v-else-if="step === 2" ref="formRefStep2" @submit.prevent="handleResetPassword">
              <!-- رسالة تنبيهية عند إرسال الكود بنجاح (تختفي لو الزيارة من إيميل الاستعادة المباشر) -->
              <v-alert
                v-if="!cameFromEmail"
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4 text-body-2 custom-alert"
                border="start"
              >
                تم إرسال رمز التحقق (OTP) إلى:
                <strong class="d-block mt-1 text-warning text-ltr" style="direction: ltr; text-align: right;">{{ form.email }}</strong>
                يرجى مراجعة بريدك الإلكتروني (الوارد والرسائل غير المرغوب فيها).
              </v-alert>

              <div class="field-group mb-4">
                <label class="field-label">رمز التحقق (OTP) *</label>
                <AppInput
                  v-model="form.otp"
                  placeholder="------"
                  type="text"
                  :rules="[required, otpRule]"
                  prepend-inner-icon="ri-key-line"
                  maxlength="6"
                  class="custom-input text-center font-weight-bold"
                  style="letter-spacing: 4px;"
                  :loading="otpStatus === 'loading'"
                  :append-inner-icon="otpStatus === 'valid' ? 'ri-checkbox-circle-fill' : (otpStatus === 'invalid' ? 'ri-close-circle-fill' : '')"
                  :error-messages="otpErrorMessage"
                  :color="otpStatus === 'valid' ? 'success' : (otpStatus === 'invalid' ? 'error' : '')"
                />
              </div>

              <!-- زر إعادة إرسال الرمز مع التايمر -->
              <div class="d-flex justify-center align-center mb-4">
                <v-btn
                  variant="text"
                  size="small"
                  color="warning"
                  :disabled="timer > 0 || resendLoading"
                  :loading="resendLoading"
                  @click="handleResendOtp"
                  class="font-weight-bold resend-btn"
                >
                  <v-icon icon="ri-refresh-line" size="small" class="me-1" />
                  {{ timer > 0 ? `إعادة إرسال الرمز خلال (${timer}ث)` : 'إعادة إرسال رمز التحقق' }}
                </v-btn>
              </div>

              <div class="field-group mb-4">
                <label class="field-label">كلمة المرور الجديدة *</label>
                <AppInput
                  v-model="form.password"
                  placeholder="أدخل 8 أحرف أو أكثر"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="[required, minLengthRule(8)]"
                  prepend-inner-icon="ri-lock-line"
                  :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="showPassword = !showPassword"
                  class="custom-input"
                />
              </div>

              <div class="field-group mb-4">
                <label class="field-label">تأكيد كلمة المرور الجديدة *</label>
                <AppInput
                  v-model="form.password_confirmation"
                  placeholder="أعد إدخال كلمة المرور"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  :rules="[required, confirmPasswordRule]"
                  prepend-inner-icon="ri-lock-check-line"
                  :append-inner-icon="showPasswordConfirm ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
                  class="custom-input"
                />
              </div>

              <AppButton type="submit" color="warning" size="large" block :loading="loading" class="custom-btn mb-4">
                تحديث كلمة المرور
              </AppButton>

              <div class="d-flex justify-space-between align-center px-1">
                <v-btn variant="text" size="small" color="secondary" @click="step = 1" class="font-weight-bold text-caption edit-email-btn">
                  تعديل البريد الإلكتروني
                </v-btn>
                <router-link :to="loginPath" class="back-link font-weight-bold text-caption">
                  العودة لتسجيل الدخول
                </router-link>
              </div>
            </v-form>
          </div>

          <!-- رسالة النجاح بعد تحديث كلمة السر بنجاح -->
          <div v-else class="success-message">
            <div class="success-icon-wrap mb-4">
              <v-icon icon="ri-checkbox-circle-fill" size="48" color="success" class="animate-scale" />
            </div>
            <h3 class="text-h5 font-weight-bold text-white mb-2">تم تحديث كلمة المرور!</h3>
            <p class="text-body-2 text-grey-darken-1 mb-6">لقد تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بحسابك الجديد.</p>
            <AppButton color="warning" :to="loginPath" block class="custom-btn"> تسجيل الدخول </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// تعليق عربي: مكون استعادة كلمة المرور عبر الـ OTP مع دعم التجاوب الكامل للأجهزة المحمولة ومؤقت التنازل والتحقق التلقائي في الخلفية وعين إظهار الباسورد
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { authService } from '@/api';
import { required, email } from '@/utils/validators';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';

const route = useRoute();
const loginPath = computed(() => {
  if (route.query.from === 'saas') {
    return '/saas/login';
  }
  return '/login';
});

const step = ref(1);
const formRefStep1 = ref(null);
const formRefStep2 = ref(null);
const loading = ref(false);
const resendLoading = ref(false);
const sent = ref(false);
const timer = ref(0);
let timerInterval = null;

// حالات التحقق في الخلفية
const otpStatus = ref(null); // null, 'loading', 'valid', 'invalid'
const otpErrorMessage = ref('');
const cameFromEmail = ref(false);

// إظهار وإخفاء الباسورد
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

const form = ref({
  email: '',
  otp: '',
  password: '',
  password_confirmation: '',
});

// دالة بدء التايمر التنازلي
const startTimer = () => {
  timer.value = 60;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
};

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// دالة التحقق من كود الـ OTP في الخلفية
const checkOtp = async () => {
  const otpVal = form.value.otp;
  if (!otpVal || otpVal.length !== 6) {
    otpStatus.value = null;
    otpErrorMessage.value = '';
    return;
  }

  otpStatus.value = 'loading';
  try {
    await authService.verifyOtp({
      email: form.value.email,
      otp: otpVal,
    });
    otpStatus.value = 'valid';
    otpErrorMessage.value = '';
  } catch (error) {
    otpStatus.value = 'invalid';
    otpErrorMessage.value = error.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية';
  }
};

// مراقبة حقل الـ OTP للتحقق الفوري عند بلوغ 6 أرقام
watch(
  () => form.value.otp,
  (newVal) => {
    if (newVal && newVal.length === 6) {
      checkOtp();
    } else {
      otpStatus.value = null;
      otpErrorMessage.value = '';
    }
  }
);

// استقبال البارامترات تلقائياً من الرابط عند نقر زر الإيميل المباشر
onMounted(() => {
  const emailParam = route.query.email;
  const otpParam = route.query.otp;

  if (emailParam) {
    form.value.email = decodeURIComponent(emailParam);
  }
  if (otpParam) {
    form.value.otp = decodeURIComponent(otpParam);
    step.value = 2; // الانتقال التلقائي للخطوة الثانية مباشرة
    cameFromEmail.value = true;
    checkOtp(); // التحقق التلقائي الفوري في الخلفية
  }
});

// القواعد والتحققات
const otpRule = (val) => {
  return (val && val.length === 6 && /^\d+$/.test(val)) || 'يجب إدخال رمز التحقق المكون من 6 أرقام';
};

const minLengthRule = (min) => (val) => {
  return (val && val.length >= min) || `يجب ألا تقل كلمة المرور عن ${min} أحرف`;
};

const confirmPasswordRule = (val) => {
  return val === form.value.password || 'تأكيد كلمة المرور غير متطابق';
};

// طلب إرسال الـ OTP
const handleSendOtp = async () => {
  const { valid } = await formRefStep1.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    await authService.forgotPassword({
      email: form.value.email,
      frontend_url: window.location.origin + window.location.pathname,
    });
    step.value = 2;
    startTimer();
  } catch (error) {
    // معالجة الخطأ تتم تلقائياً عبر axios interceptors
  } finally {
    loading.value = false;
  }
};

// إعادة إرسال الـ OTP
const handleResendOtp = async () => {
  if (timer.value > 0 || resendLoading.value) return;

  resendLoading.value = true;
  try {
    await authService.forgotPassword({
      email: form.value.email,
      frontend_url: window.location.origin + window.location.pathname,
    });
    startTimer();
  } catch (error) {
    // معالجة الخطأ
  } finally {
    resendLoading.value = false;
  }
};

// إرسال الكود وتحديث كلمة المرور
const handleResetPassword = async () => {
  // التأكد من أن الكود تم التحقق منه ونجح
  if (otpStatus.value === 'invalid') {
    return;
  }
  
  const { valid } = await formRefStep2.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    await authService.resetPassword({
      email: form.value.email,
      otp: form.value.otp,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
    });
    sent.value = true;
  } catch (error) {
    // معالجة الخطأ
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

.forgot-password-page {
  font-family: 'Cairo', sans-serif;
  min-height: 100vh;
  background: #060b18;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100%;
  max-width: 100vw;
}

/* Mesh Background */
.mesh-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.mesh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
  animation: meshFloat 12s ease-in-out infinite;
}
.orb-1 {
  width: 500px;
  height: 500px;
  background: #4f46e5;
  top: -150px;
  left: -150px;
}
.orb-2 {
  width: 400px;
  height: 400px;
  background: #f59e0b;
  bottom: -120px;
  right: -120px;
  animation-delay: -4s;
}
.orb-3 {
  width: 300px;
  height: 300px;
  background: #7c3aed;
  top: 40%;
  left: 40%;
  animation-delay: -8s;
}

@keyframes meshFloat {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

/* Grid Pattern */
.grid-pattern {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Main Container */
.forgot-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 900px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  box-shadow:
    0 40px 120px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(245, 158, 11, 0.1);
  min-height: 480px;
}

/* Brand Panel */
.forgot-brand {
  background: rgba(255, 255, 255, 0.02);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-content {
  text-align: center;
}
.brand-icon-wrap {
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05));
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 12px 30px rgba(245, 158, 11, 0.15);
}
.brand-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: white;
}
.brand-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
  line-height: 1.5;
}

/* Form Panel */
.forgot-form-wrapper {
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.forgot-form {
  width: 100%;
  max-width: 360px;
}

/* Custom Alert */
.custom-alert {
  border-radius: 12px !important;
  background: rgba(245, 158, 11, 0.08) !important;
  border: 1px solid rgba(245, 158, 11, 0.2) !important;
  color: #fbbf24 !important;
}

/* Field Group */
.field-group {
  margin-bottom: 12px;
}
.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 5px;
}

/* Inputs styling matching SaasLogin */
.custom-input :deep(.v-field) {
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.07) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: white !important;
}
.custom-input :deep(.v-field--focused) {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15) !important;
}
.custom-input :deep(.v-field__input) {
  color: white !important;
}
.custom-input :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.4) !important;
}
.custom-input :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.3) !important;
}

.custom-btn {
  height: 46px !important;
  border-radius: 12px !important;
  font-size: 0.9rem !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.3) !important;
  transition: all 0.25s !important;
}
.custom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.4) !important;
}

.back-link {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}
.back-link:hover {
  color: #f59e0b;
}

.resend-btn {
  text-transform: none !important;
  font-size: 0.8rem !important;
}

.edit-email-btn {
  font-size: 0.78rem !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

/* Success Message */
.success-message {
  text-align: center;
  padding: 20px 0;
}
.success-icon-wrap {
  width: 72px;
  height: 72px;
  background: rgba(46, 213, 115, 0.1);
  border: 1px solid rgba(46, 213, 115, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.animate-scale {
  animation: scaleUp 0.3s ease-out forwards;
}

@keyframes scaleUp {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Responsive Styling */
@media (max-width: 800px) {
  .forgot-container {
    grid-template-columns: 1fr;
    max-width: 480px;
  }
  .forgot-brand {
    display: none;
  }
  .forgot-form-wrapper {
    padding: 36px 24px;
  }
}
</style>
