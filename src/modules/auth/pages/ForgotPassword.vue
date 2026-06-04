<template>
  <div class="forgot-password-page">
    <div class="forgot-container">
      <!-- القسم الترحيبي الجانبي - يتم إخفاؤه في الموبايل لتوفير مساحة العرض وتقليل التمرير -->
      <div class="forgot-brand">
        <div class="brand-content">
          <v-icon icon="ri-lock-password-line" size="64" color="white" />
          <h1 class="brand-title mt-4">استعادة كلمة المرور</h1>
          <p class="brand-subtitle">استرجع حسابك بخطوات بسيطة وآمنة</p>
        </div>
      </div>

      <div class="forgot-form-wrapper">
        <div class="forgot-form">
          <!-- الشعار للأجهزة المحمولة فقط -->
          <div class="mobile-logo text-center mb-4 d-md-none">
            <v-icon icon="ri-lock-password-line" size="48" color="primary" />
            <h2 class="text-h5 font-weight-bold mt-2 text-primary">استعادة كلمة المرور</h2>
          </div>

          <div v-if="!sent">
            <!-- العنوان والتوجيهات -->
            <div class="mb-6">
              <h2 class="text-h4 font-weight-bold mb-2 text-md-right text-center d-none d-md-block">نسيت كلمة المرور؟</h2>
              <p class="text-body-1 text-grey text-md-right text-center" v-if="step === 1">
                أدخل بريدك الإلكتروني لتلقي رمز التحقق (OTP).
              </p>
              <p class="text-body-1 text-grey text-md-right text-center" v-else-if="step === 2">
                أدخل رمز التحقق (OTP) المكون من 6 أرقام وكلمة المرور الجديدة.
              </p>
            </div>

            <!-- الخطوة 1: إدخال البريد الإلكتروني لإرسال الـ OTP -->
            <v-form v-if="step === 1" ref="formRefStep1" @submit.prevent="handleSendOtp">
              <AppInput
                v-model="form.email"
                label="البريد الإلكتروني *"
                type="email"
                :rules="[required, email]"
                prepend-inner-icon="ri-mail-line"
                class="mb-4"
              />

              <AppButton type="submit" color="primary" size="large" block :loading="loading" class="mb-4">
                إرسال رمز التحقق (OTP)
              </AppButton>

              <div class="text-center">
                <router-link :to="loginPath" class="text-primary text-decoration-none font-weight-bold text-body-2">
                  <v-icon icon="ri-arrow-right-line" size="small" class="me-1" />
                  العودة لتسجيل الدخول
                </router-link>
              </div>
            </v-form>

            <!-- الخطوة 2: التحقق من الـ OTP وإدخال كلمة المرور الجديدة -->
            <v-form v-else-if="step === 2" ref="formRefStep2" @submit.prevent="handleResetPassword">
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4 text-body-2"
                border="start"
              >
                تم إرسال رمز التحقق (OTP) إلى:
                <strong class="d-block mt-1 text-primary text-ltr" style="direction: ltr; text-align: right;">{{ form.email }}</strong>
                يرجى مراجعة بريدك الإلكتروني (صندوق الوارد والرسائل غير المرغوب فيها Spam).
              </v-alert>

              <AppInput
                v-model="form.otp"
                label="رمز التحقق (OTP) *"
                type="text"
                :rules="[required, otpRule]"
                prepend-inner-icon="ri-key-line"
                maxlength="6"
                class="mb-4 text-center font-weight-bold"
                style="letter-spacing: 4px;"
              />

              <!-- زر إعادة إرسال الرمز مع التايمر -->
              <div class="d-flex justify-center align-center mb-4">
                <v-btn
                  variant="text"
                  size="small"
                  color="primary"
                  :disabled="timer > 0 || resendLoading"
                  :loading="resendLoading"
                  @click="handleResendOtp"
                  class="font-weight-bold"
                >
                  <v-icon icon="ri-refresh-line" size="small" class="me-1" />
                  {{ timer > 0 ? `إعادة إرسال الرمز خلال (${timer}ث)` : 'إعادة إرسال رمز التحقق' }}
                </v-btn>
              </div>

              <AppInput
                v-model="form.password"
                label="كلمة المرور الجديدة *"
                type="password"
                :rules="[required, minLengthRule(8)]"
                prepend-inner-icon="ri-lock-line"
                class="mb-4"
              />

              <AppInput
                v-model="form.password_confirmation"
                label="تأكيد كلمة المرور الجديدة *"
                type="password"
                :rules="[required, confirmPasswordRule]"
                prepend-inner-icon="ri-lock-check-line"
                class="mb-4"
              />

              <AppButton type="submit" color="primary" size="large" block :loading="loading" class="mb-3">
                تحديث كلمة المرور
              </AppButton>

              <div class="d-flex justify-space-between align-center px-1">
                <v-btn variant="text" size="small" color="secondary" @click="step = 1" class="font-weight-bold">
                  تعديل البريد الإلكتروني
                </v-btn>
                <router-link :to="loginPath" class="text-primary text-decoration-none font-weight-bold text-caption">
                  العودة لتسجيل الدخول
                </router-link>
              </div>
            </v-form>
          </div>

          <!-- رسالة النجاح بعد تحديث كلمة السر بنجاح -->
          <div v-else class="success-message">
            <v-icon icon="ri-checkbox-circle-line" size="64" color="success" class="mb-4 animate-scale" />
            <h3 class="text-h5 font-weight-bold mb-2">تم تحديث كلمة المرور!</h3>
            <p class="text-body-2 text-grey mb-6">لقد تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بحسابك.</p>
            <AppButton color="primary" :to="loginPath" block> تسجيل الدخول </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// تعليق عربي: مكون استعادة كلمة المرور عبر الـ OTP مع دعم التجاوب الكامل للأجهزة المحمولة وتحديث رمز التحقق ومؤقت إعادة الإرسال
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
    // الأخطاء تعالج تلقائياً في axios拦截器 أو نظام التنبيهات العام
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
    // الأخطاء معالجة
  } finally {
    resendLoading.value = false;
  }
};

// إرسال الكود وتحديث كلمة المرور
const handleResetPassword = async () => {
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
    // الأخطاء معالجة
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.forgot-container {
  display: flex;
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-height: 480px;
}

.forgot-brand {
  flex: 0 0 350px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-content {
  text-align: center;
}

.brand-title {
  font-size: 1.8rem;
  font-weight: 700;
}

.brand-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
  margin-top: 8px;
}

.forgot-form-wrapper {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot-form {
  width: 100%;
  max-width: 400px;
}

.success-message {
  text-align: center;
}

.animate-scale {
  animation: scaleUp 0.3s ease-out forwards;
}

@keyframes scaleUp {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* شاشات التابلت والموبايل */
@media (max-width: 960px) {
  .forgot-container {
    flex-direction: column;
    max-width: 500px;
    min-height: auto;
    margin: auto;
  }

  .forgot-brand {
    display: none; /* إخفاء قسم الترحيب لتقليل المساحة التعديلية للموبايل */
  }

  .forgot-form-wrapper {
    padding: 32px 24px;
  }
}

/* شاشات الموبايل الصغيرة جداً */
@media (max-width: 480px) {
  .forgot-password-page {
    padding: 12px;
  }

  .forgot-container {
    border-radius: 6px;
  }

  .forgot-form-wrapper {
    padding: 24px 16px;
  }
}
</style>
