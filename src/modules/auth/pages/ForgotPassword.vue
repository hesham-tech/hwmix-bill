<template>
  <!-- مكون استعادة كلمة المرور بتصميم متجدد وتجربة مستخدم متكاملة -->
  <div class="fp-page" dir="rtl">
    <!-- ═══════════════ خلفية متحركة ═══════════════ -->
    <div class="fp-bg" aria-hidden="true">
      <div class="fp-orb fp-orb--1"></div>
      <div class="fp-orb fp-orb--2"></div>
      <div class="fp-orb fp-orb--3"></div>
      <div class="fp-grid"></div>
      <!-- خطوط ديكورية -->
      <div class="fp-line fp-line--1"></div>
      <div class="fp-line fp-line--2"></div>
    </div>

    <!-- ═══════════════ الكارد الرئيسي ═══════════════ -->
    <div class="fp-card">
      <!-- شريط التقدم العلوي -->
      <div class="fp-progress-bar" v-if="!sent">
        <div class="fp-progress-fill" :style="{ width: step === 1 ? '50%' : '100%' }"></div>
      </div>

      <!-- محتوى الكارد -->
      <div class="fp-card-body">
        <!-- ══ حالة النجاح ══ -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="sent" class="fp-success" key="success">
            <div class="fp-success-icon">
              <div class="fp-success-ring"></div>
              <v-icon icon="ri-shield-check-fill" size="36" color="white" />
            </div>
            <h1 class="fp-success-title">تم تحديث كلمة المرور!</h1>
            <p class="fp-success-sub">تم إعادة تعيين كلمة مرورك بنجاح.<br />يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p>
            <button class="fp-btn fp-btn--primary fp-btn--full mt-6" @click="$router.push(loginPath)">
              <v-icon icon="ri-login-circle-line" size="18" class="me-2" />
              الذهاب لتسجيل الدخول
            </button>
          </div>
        </Transition>

        <!-- ══ خطوات الاستعادة ══ -->
        <div v-if="!sent">
          <!-- ── شعار + عنوان ── -->
          <div class="fp-header">
            <div class="fp-logo-wrap">
              <v-icon icon="ri-lock-password-line" size="22" color="white" />
            </div>
            <div>
              <h1 class="fp-title">
                {{ step === 1 ? 'نسيت كلمة المرور؟' : 'إنشاء كلمة مرور جديدة' }}
              </h1>
              <p class="fp-subtitle">
                <span v-if="step === 1">أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق فوراً</span>
                <span v-else
                  >أدخل الرمز الذي أرسلناه إلى <strong class="text-amber">{{ form.email }}</strong></span
                >
              </p>
            </div>
          </div>

          <!-- ── مؤشر الخطوات ── -->
          <div class="fp-steps">
            <div class="fp-step" :class="{ 'fp-step--done': step >= 1, 'fp-step--active': step === 1 }">
              <div class="fp-step-dot">
                <v-icon v-if="step > 1" icon="ri-check-line" size="12" />
                <span v-else>1</span>
              </div>
              <span class="fp-step-label">البريد الإلكتروني</span>
            </div>
            <div class="fp-step-line" :class="{ 'fp-step-line--done': step >= 2 }"></div>
            <div class="fp-step" :class="{ 'fp-step--done': step >= 2, 'fp-step--active': step === 2 }">
              <div class="fp-step-dot">
                <span>2</span>
              </div>
              <span class="fp-step-label">التحقق والتحديث</span>
            </div>
          </div>

          <!-- ──────────── الخطوة 1: البريد ──────────── -->
          <Transition name="step-slide" mode="out-in">
            <div v-if="step === 1" key="step1">
              <v-form ref="formRefStep1" @submit.prevent="handleSendOtp">
                <div class="fp-field">
                  <label class="fp-label">
                    <v-icon icon="ri-mail-line" size="14" class="me-1" />
                    البريد الإلكتروني
                  </label>
                  <AppInput
                    v-model="form.email"
                    placeholder="example@domain.com"
                    type="email"
                    :rules="[required, email]"
                    prepend-inner-icon="ri-mail-line"
                    class="fp-input"
                  />
                </div>

                <!-- بطاقة المعلومات -->
                <div class="fp-info-card mb-4">
                  <v-icon icon="ri-information-line" size="16" class="me-2 flex-shrink-0" style="color: #60a5fa" />
                  <span>سيتم إرسال رمز التحقق ورابط الاستعادة إلى بريدك الإلكتروني المسجل في النظام.</span>
                </div>

                <button type="submit" class="fp-btn fp-btn--primary fp-btn--full" :disabled="loading">
                  <span v-if="loading" class="fp-spinner me-2"></span>
                  <v-icon v-else icon="ri-send-plane-line" size="18" class="me-2" />
                  {{ loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق' }}
                </button>

                <div class="fp-back-link mt-4">
                  <router-link :to="loginPath" class="fp-link">
                    <v-icon icon="ri-arrow-right-line" size="16" class="me-1" />
                    العودة لتسجيل الدخول
                  </router-link>
                </div>
              </v-form>
            </div>
          </Transition>

          <!-- ──────────── الخطوة 2: OTP + كلمة المرور ──────────── -->
          <Transition name="step-slide" mode="out-in">
            <div v-if="step === 2" key="step2">
              <!-- تنبيه الإرسال (يختفي لو الزيارة من إيميل مباشر) -->
              <div v-if="!cameFromEmail" class="fp-sent-badge mb-4">
                <div class="fp-sent-badge__icon">
                  <v-icon icon="ri-mail-send-line" size="18" color="white" />
                </div>
                <div>
                  <div class="fp-sent-badge__title">تم إرسال الرمز بنجاح!</div>
                  <div class="fp-sent-badge__sub">
                    تحقق من بريدك: <span class="text-amber">{{ form.email }}</span>
                  </div>
                </div>
              </div>

              <v-form ref="formRefStep2" @submit.prevent="handleResetPassword">
                <!-- ── حقل OTP مع مؤشر الحالة ── -->
                <div class="fp-field">
                  <div class="fp-label-row">
                    <label class="fp-label">
                      <v-icon icon="ri-key-2-line" size="14" class="me-1" />
                      رمز التحقق (6 أرقام)
                    </label>
                    <div class="fp-otp-status">
                      <span v-if="otpStatus === 'loading'" class="fp-status fp-status--loading">
                        <span class="fp-spinner fp-spinner--sm me-1"></span> جاري التحقق...
                      </span>
                      <span v-else-if="otpStatus === 'valid'" class="fp-status fp-status--valid">
                        <v-icon icon="ri-checkbox-circle-fill" size="14" class="me-1" /> صحيح
                      </span>
                      <span v-else-if="otpStatus === 'invalid'" class="fp-status fp-status--invalid">
                        <v-icon icon="ri-close-circle-fill" size="14" class="me-1" /> خطأ
                      </span>
                    </div>
                  </div>
                  <!-- صناديق OTP -->
                  <div
                    class="fp-otp-boxes"
                    :class="{
                      'fp-otp-boxes--valid': otpStatus === 'valid',
                      'fp-otp-boxes--invalid': otpStatus === 'invalid',
                    }"
                  >
                    <input
                      v-for="(_, i) in 6"
                      :key="i"
                      :ref="
                        el => {
                          if (el) otpInputs[i] = el;
                        }
                      "
                      v-model="otpDigits[i]"
                      type="text"
                      inputmode="numeric"
                      maxlength="1"
                      class="fp-otp-box"
                      :class="{
                        'fp-otp-box--filled': otpDigits[i],
                        'fp-otp-box--valid': otpStatus === 'valid',
                        'fp-otp-box--invalid': otpStatus === 'invalid',
                      }"
                      @input="onOtpInput(i, $event)"
                      @keydown="onOtpKeydown(i, $event)"
                      @paste="onOtpPaste($event)"
                      @focus="$event.target.select()"
                    />
                  </div>
                  <p v-if="otpStatus === 'invalid' && otpErrorMessage" class="fp-error-text">
                    <v-icon icon="ri-error-warning-line" size="13" class="me-1" />{{ otpErrorMessage }}
                  </p>
                </div>

                <!-- زر إعادة الإرسال -->
                <div class="fp-resend">
                  <span class="fp-resend__label">لم يصلك الرمز؟</span>
                  <button
                    type="button"
                    class="fp-resend__btn"
                    :class="{ 'fp-resend__btn--disabled': timer > 0 || resendLoading }"
                    :disabled="timer > 0 || resendLoading"
                    @click="handleResendOtp"
                  >
                    <span v-if="resendLoading" class="fp-spinner fp-spinner--sm me-1"></span>
                    <v-icon v-else icon="ri-refresh-line" size="13" class="me-1" />
                    <span v-if="timer > 0">إعادة الإرسال خلال ({{ timer }}ث)</span>
                    <span v-else>إعادة إرسال الرمز</span>
                  </button>
                </div>

                <!-- ── كلمة المرور الجديدة ── -->
                <div class="fp-field mt-1">
                  <label class="fp-label">
                    <v-icon icon="ri-lock-line" size="14" class="me-1" />
                    كلمة المرور الجديدة
                  </label>
                  <div class="fp-input-wrap">
                    <AppInput
                      v-model="form.password"
                      placeholder="8 أحرف على الأقل"
                      :type="showPassword ? 'text' : 'password'"
                      :rules="[required, minLengthRule(8)]"
                      prepend-inner-icon="ri-lock-line"
                      :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                      @click:append-inner="showPassword = !showPassword"
                      class="fp-input"
                    />
                  </div>
                  <!-- مؤشر قوة كلمة المرور -->
                  <div class="fp-strength" v-if="form.password.length > 0">
                    <div class="fp-strength-bars">
                      <div
                        v-for="n in 4"
                        :key="n"
                        class="fp-strength-bar"
                        :class="{
                          'fp-strength-bar--active': passwordStrength >= n,
                          [`fp-strength-bar--${passwordStrengthColor}`]: passwordStrength >= n,
                        }"
                      ></div>
                    </div>
                    <span class="fp-strength-label" :class="`text-${passwordStrengthColor}`">{{ passwordStrengthLabel }}</span>
                  </div>
                </div>

                <!-- ── تأكيد كلمة المرور ── -->
                <div class="fp-field">
                  <label class="fp-label">
                    <v-icon icon="ri-lock-check-line" size="14" class="me-1" />
                    تأكيد كلمة المرور
                  </label>
                  <AppInput
                    v-model="form.password_confirmation"
                    placeholder="أعد إدخال كلمة المرور"
                    :type="showPasswordConfirm ? 'text' : 'password'"
                    :rules="[required, confirmPasswordRule]"
                    prepend-inner-icon="ri-lock-check-line"
                    :append-inner-icon="showPasswordConfirm ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
                    class="fp-input"
                  />
                  <!-- علامة التطابق -->
                  <div v-if="form.password_confirmation && form.password" class="fp-match-indicator">
                    <template v-if="form.password === form.password_confirmation">
                      <v-icon icon="ri-checkbox-circle-line" size="14" class="me-1" style="color: #4ade80" />
                      <span style="color: #4ade80; font-size: 0.75rem">كلمتا المرور متطابقتان</span>
                    </template>
                    <template v-else>
                      <v-icon icon="ri-close-circle-line" size="14" class="me-1" style="color: #f87171" />
                      <span style="color: #f87171; font-size: 0.75rem">كلمتا المرور غير متطابقتين</span>
                    </template>
                  </div>
                </div>

                <!-- زر التحديث -->
                <button
                  type="submit"
                  class="fp-btn fp-btn--primary fp-btn--full mt-2"
                  :disabled="loading || otpStatus === 'invalid' || otpStatus === 'loading'"
                >
                  <span v-if="loading" class="fp-spinner me-2"></span>
                  <v-icon v-else icon="ri-shield-keyhole-line" size="18" class="me-2" />
                  {{ loading ? 'جاري التحديث...' : 'تحديث كلمة المرور' }}
                </button>

                <!-- روابط سفلية -->
                <div class="fp-footer-links mt-3">
                  <button type="button" class="fp-link" @click="goBackToEmail">
                    <v-icon icon="ri-edit-line" size="14" class="me-1" />
                    تعديل البريد الإلكتروني
                  </button>
                  <span class="fp-dot-sep">·</span>
                  <router-link :to="loginPath" class="fp-link">
                    <v-icon icon="ri-arrow-right-line" size="14" class="me-1" />
                    تسجيل الدخول
                  </router-link>
                </div>
              </v-form>
            </div>
          </Transition>
        </div>
      </div>
      <!-- / fp-card-body -->
    </div>
    <!-- / fp-card -->
  </div>
</template>

<script setup>
//   مكون استعادة كلمة المرور بتصميم متجدد مع OTP boxes و password strength meter
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { authService } from '@/api';
import { required, email } from '@/utils/validators';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';

const route = useRoute();

// مسار تسجيل الدخول بحسب السياق
const loginPath = computed(() => {
  return route.query.from === 'saas' ? '/saas/login' : '/login';
});

// ═══ حالة الصفحة ═══
const step = ref(1);
const formRefStep1 = ref(null);
const formRefStep2 = ref(null);
const loading = ref(false);
const resendLoading = ref(false);
const sent = ref(false);
const timer = ref(0);
let timerInterval = null;

// ═══ حالة OTP ═══
const otpStatus = ref(null); // null | 'loading' | 'valid' | 'invalid'
const otpErrorMessage = ref('');
const cameFromEmail = ref(false);
const otpDigits = ref(['', '', '', '', '', '']);
const otpInputs = ref([]);

// ═══ إظهار كلمة المرور ═══
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

// ═══ بيانات النموذج ═══
const form = ref({
  email: '',
  otp: '',
  password: '',
  password_confirmation: '',
});

// ═══ مؤشر قوة كلمة المرور ═══
const passwordStrength = computed(() => {
  const p = form.value.password;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) || /[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
  return Math.min(score, 4);
});

const passwordStrengthColor = computed(() => {
  const map = ['', 'error', 'warning', 'blue', 'success'];
  return map[passwordStrength.value] || '';
});

const passwordStrengthLabel = computed(() => {
  const map = ['', 'ضعيفة جداً', 'ضعيفة', 'جيدة', 'قوية جداً'];
  return map[passwordStrength.value] || '';
});

// ═══ دمج أرقام OTP ═══
const syncOtpToForm = () => {
  form.value.otp = otpDigits.value.join('');
};

// ═══ معالجة إدخال صناديق OTP ═══
const onOtpInput = (index, event) => {
  const val = event.target.value.replace(/\D/g, '').slice(-1);
  otpDigits.value[index] = val;
  syncOtpToForm();
  if (val && index < 5) {
    nextTick(() => otpInputs.value[index + 1]?.focus());
  }
};

const onOtpKeydown = (index, event) => {
  if (event.key === 'Backspace') {
    if (!otpDigits.value[index] && index > 0) {
      otpDigits.value[index - 1] = '';
      syncOtpToForm();
      nextTick(() => otpInputs.value[index - 1]?.focus());
    } else {
      otpDigits.value[index] = '';
      syncOtpToForm();
    }
    event.preventDefault();
  }
};

const onOtpPaste = event => {
  event.preventDefault();
  const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
  pasted.split('').forEach((char, i) => {
    otpDigits.value[i] = char;
  });
  syncOtpToForm();
  nextTick(() => {
    const focusIdx = Math.min(pasted.length, 5);
    otpInputs.value[focusIdx]?.focus();
  });
};

// ═══ التحقق من OTP في الخلفية ═══
const checkOtp = async () => {
  const otpVal = form.value.otp;
  if (!otpVal || otpVal.length !== 6) {
    otpStatus.value = null;
    otpErrorMessage.value = '';
    return;
  }
  otpStatus.value = 'loading';
  try {
    await authService.verifyOtp({ email: form.value.email, otp: otpVal });
    otpStatus.value = 'valid';
    otpErrorMessage.value = '';
  } catch (error) {
    otpStatus.value = 'invalid';
    otpErrorMessage.value = error.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية';
  }
};

watch(
  () => form.value.otp,
  newVal => {
    if (newVal && newVal.length === 6) {
      checkOtp();
    } else {
      otpStatus.value = null;
      otpErrorMessage.value = '';
    }
  }
);

// ═══ قراءة بارامترات الرابط تلقائياً ═══
onMounted(() => {
  const emailParam = route.query.email;
  const otpParam = route.query.otp;
  if (emailParam) form.value.email = decodeURIComponent(emailParam);
  if (otpParam) {
    const digits = decodeURIComponent(otpParam).slice(0, 6).split('');
    digits.forEach((d, i) => {
      otpDigits.value[i] = d;
    });
    form.value.otp = digits.join('');
    step.value = 2;
    cameFromEmail.value = true;
    checkOtp();
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// ═══ التايمر ═══
const startTimer = () => {
  timer.value = 60;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.value > 0) timer.value--;
    else clearInterval(timerInterval);
  }, 1000);
};

// ═══ قواعد التحقق ═══
const otpRule = val => (val && val.length === 6 && /^\d+$/.test(val)) || 'يجب إدخال رمز التحقق المكون من 6 أرقام';

const minLengthRule = min => val => (val && val.length >= min) || `يجب ألا تقل كلمة المرور عن ${min} أحرف`;

const confirmPasswordRule = val => val === form.value.password || 'تأكيد كلمة المرور غير متطابق';

// ═══ إرسال OTP ═══
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
    nextTick(() => otpInputs.value[0]?.focus());
  } catch (_) {
  } finally {
    loading.value = false;
  }
};

// ═══ إعادة الإرسال ═══
const handleResendOtp = async () => {
  if (timer.value > 0 || resendLoading.value) return;
  resendLoading.value = true;
  try {
    await authService.forgotPassword({
      email: form.value.email,
      frontend_url: window.location.origin + window.location.pathname,
    });
    otpDigits.value = ['', '', '', '', '', ''];
    form.value.otp = '';
    otpStatus.value = null;
    startTimer();
    nextTick(() => otpInputs.value[0]?.focus());
  } catch (_) {
  } finally {
    resendLoading.value = false;
  }
};

// ═══ تحديث كلمة المرور ═══
const handleResetPassword = async () => {
  if (otpStatus.value === 'invalid' || otpStatus.value === 'loading') return;
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
  } catch (_) {
  } finally {
    loading.value = false;
  }
};

// ═══ العودة للخطوة الأولى ═══
const goBackToEmail = () => {
  step.value = 1;
  otpDigits.value = ['', '', '', '', '', ''];
  form.value.otp = '';
  otpStatus.value = null;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;900&display=swap');

/* ═══════════════════════════════
   متغيرات الألوان
═══════════════════════════════ */
:root {
  --fp-amber: #f59e0b;
  --fp-amber-dark: #d97706;
  --fp-amber-glow: rgba(245, 158, 11, 0.25);
  --fp-bg: #060b18;
  --fp-surface: rgba(255, 255, 255, 0.05);
  --fp-border: rgba(255, 255, 255, 0.1);
  --fp-text: rgba(255, 255, 255, 0.9);
  --fp-text-muted: rgba(255, 255, 255, 0.5);
  --fp-success: #4ade80;
  --fp-error: #f87171;
}

/* ═══════════════════════════════
   الصفحة الرئيسية
═══════════════════════════════ */
.fp-page {
  font-family: 'Cairo', sans-serif;
  min-height: 100vh;
  background: var(--fp-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  position: relative;
  overflow: hidden;
  overflow-x: clip;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* ═══════════════════════════════
   الخلفية المتحركة
═══════════════════════════════ */
.fp-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.fp-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.2;
  animation: fpFloat 14s ease-in-out infinite;
}
.fp-orb--1 {
  width: min(500px, 120vw);
  height: min(500px, 120vw);
  background: radial-gradient(circle, #4f46e5 0%, transparent 70%);
  top: -150px;
  left: -150px;
}
.fp-orb--2 {
  width: min(400px, 100vw);
  height: min(400px, 100vw);
  background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
  bottom: -120px;
  right: -120px;
  animation-delay: -6s;
}
.fp-orb--3 {
  width: min(300px, 80vw);
  height: min(300px, 80vw);
  background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
  top: 40%;
  left: 40%;
  animation-delay: -10s;
  opacity: 0.12;
}

@keyframes fpFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(20px, -25px) scale(1.03);
  }
  66% {
    transform: translate(-15px, 15px) scale(0.97);
  }
}

.fp-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 48px 48px;
}

.fp-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.15), transparent);
  height: 1px;
  width: 100%;
  animation: fpLineScan 8s linear infinite;
}
.fp-line--1 {
  top: 30%;
  animation-delay: 0s;
}
.fp-line--2 {
  top: 70%;
  animation-delay: -4s;
}

@keyframes fpLineScan {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* ═══════════════════════════════
   الكارد الرئيسي
═══════════════════════════════ */
.fp-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  background: rgba(10, 16, 34, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(245, 158, 11, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

/* شريط تقدم علوي */
.fp-progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
}
.fp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
}

.fp-card-body {
  padding: 32px 28px;
}

/* ═══════════════════════════════
   الرأس
═══════════════════════════════ */
.fp-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
}
.fp-logo-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.1));
  border: 1px solid rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
}
.fp-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: white;
  margin: 0 0 4px;
  line-height: 1.3;
}
.fp-subtitle {
  font-size: 0.82rem;
  color: var(--fp-text-muted);
  margin: 0;
  line-height: 1.6;
}
.text-amber {
  color: #fbbf24 !important;
}

/* ═══════════════════════════════
   مؤشر الخطوات
═══════════════════════════════ */
.fp-steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 24px;
}
.fp-step {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.fp-step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.35s ease;
}
.fp-step--active .fp-step-dot {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-color: #f59e0b;
  color: white;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);
}
.fp-step--done .fp-step-dot {
  background: rgba(74, 222, 128, 0.2);
  border-color: #4ade80;
  color: #4ade80;
}
.fp-step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  transition: color 0.3s;
  white-space: nowrap;
}
.fp-step--active .fp-step-label {
  color: #fbbf24;
}
.fp-step--done .fp-step-label {
  color: #4ade80;
}

.fp-step-line {
  flex: 1;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 8px;
  transition: background 0.5s ease;
}
.fp-step-line--done {
  background: linear-gradient(90deg, #4ade80, rgba(74, 222, 128, 0.3));
}

/* ═══════════════════════════════
   الحقول
═══════════════════════════════ */
.fp-field {
  margin-bottom: 16px;
}
.fp-label {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 7px;
}
.fp-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}
.fp-input-wrap {
  position: relative;
}

/* تخصيص AppInput ليتناسب مع التصميم */
.fp-input :deep(.v-field) {
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.1) !important;
  transition:
    border-color 0.2s,
    box-shadow 0.2s !important;
}
.fp-input :deep(.v-field--focused) {
  border-color: rgba(245, 158, 11, 0.7) !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}
.fp-input :deep(.v-field__input) {
  color: white !important;
  font-size: 0.9rem !important;
}
.fp-input :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.35) !important;
}
.fp-input :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.25) !important;
}
.fp-input :deep(.v-messages) {
  color: rgba(255, 100, 100, 0.9) !important;
  font-size: 0.75rem !important;
}

/* ═══════════════════════════════
   صناديق OTP
═══════════════════════════════ */
.fp-otp-boxes {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  direction: ltr;
}
.fp-otp-box {
  width: 100%;
  aspect-ratio: 1;
  max-width: 52px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  color: white;
  font-family: 'Cairo', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: all 0.2s ease;
  caret-color: #f59e0b;
}
.fp-otp-box:focus {
  border-color: rgba(245, 158, 11, 0.8);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
  background: rgba(245, 158, 11, 0.06);
}
.fp-otp-box--filled {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.08);
}
.fp-otp-box--valid {
  border-color: rgba(74, 222, 128, 0.7) !important;
  background: rgba(74, 222, 128, 0.08) !important;
  color: #4ade80 !important;
}
.fp-otp-box--invalid {
  border-color: rgba(248, 113, 113, 0.7) !important;
  background: rgba(248, 113, 113, 0.08) !important;
  color: #f87171 !important;
}

/* مؤشر حالة OTP */
.fp-otp-status {
  display: flex;
  align-items: center;
}
.fp-status {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
}
.fp-status--loading {
  color: rgba(255, 255, 255, 0.5);
}
.fp-status--valid {
  color: #4ade80;
}
.fp-status--invalid {
  color: #f87171;
}

.fp-error-text {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #f87171;
  margin-top: 6px;
}

/* ═══════════════════════════════
   إعادة الإرسال
═══════════════════════════════ */
.fp-resend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}
.fp-resend__label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.4);
}
.fp-resend__btn {
  display: inline-flex;
  align-items: center;
  font-family: 'Cairo', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #f59e0b;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition:
    color 0.2s,
    opacity 0.2s;
}
.fp-resend__btn:hover:not(:disabled) {
  color: #fbbf24;
  text-decoration: underline;
}
.fp-resend__btn--disabled {
  color: rgba(255, 255, 255, 0.3) !important;
  cursor: not-allowed;
}

/* ═══════════════════════════════
   مؤشر قوة كلمة المرور
═══════════════════════════════ */
.fp-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.fp-strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}
.fp-strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.3s ease;
}
.fp-strength-bar--active.fp-strength-bar--error {
  background: #f87171;
}
.fp-strength-bar--active.fp-strength-bar--warning {
  background: #fbbf24;
}
.fp-strength-bar--active.fp-strength-bar--blue {
  background: #60a5fa;
}
.fp-strength-bar--active.fp-strength-bar--success {
  background: #4ade80;
}
.fp-strength-label {
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}
.fp-strength-label.text-error {
  color: #f87171;
}
.fp-strength-label.text-warning {
  color: #fbbf24;
}
.fp-strength-label.text-blue {
  color: #60a5fa;
}
.fp-strength-label.text-success {
  color: #4ade80;
}

/* ═══════════════════════════════
   علامة تطابق كلمتي المرور
═══════════════════════════════ */
.fp-match-indicator {
  display: flex;
  align-items: center;
  margin-top: 6px;
}

/* ═══════════════════════════════
   الأزرار الرئيسية
═══════════════════════════════ */
.fp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cairo', sans-serif;
  font-weight: 800;
  font-size: 0.92rem;
  letter-spacing: 0;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  padding: 12px 24px;
  transition: all 0.25s ease;
  text-decoration: none;
}
.fp-btn--primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #1a0a00;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
}
.fp-btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.45);
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}
.fp-btn--primary:active:not(:disabled) {
  transform: translateY(0);
}
.fp-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.fp-btn--full {
  width: 100%;
}

/* ═══════════════════════════════
   بطاقة المعلومات
═══════════════════════════════ */
.fp-info-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

/* ═══════════════════════════════
   بادج الإرسال
═══════════════════════════════ */
.fp-sent-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(74, 222, 128, 0.06);
  border: 1px solid rgba(74, 222, 128, 0.18);
  border-radius: 12px;
  padding: 12px 14px;
  animation: fpSlideIn 0.3s ease-out;
}
.fp-sent-badge__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(74, 222, 128, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fp-sent-badge__title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #4ade80;
}
.fp-sent-badge__sub {
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

@keyframes fpSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ═══════════════════════════════
   روابط سفلية
═══════════════════════════════ */
.fp-back-link {
  text-align: center;
}
.fp-footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.fp-dot-sep {
  color: rgba(255, 255, 255, 0.25);
  font-size: 0.9rem;
}
.fp-link {
  display: inline-flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Cairo', sans-serif;
  transition: color 0.2s;
  padding: 0;
}
.fp-link:hover {
  color: #f59e0b;
}

/* ═══════════════════════════════
   الـ Spinner
═══════════════════════════════ */
.fp-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: fpSpin 0.7s linear infinite;
  flex-shrink: 0;
}
.fp-spinner--sm {
  width: 12px;
  height: 12px;
  border-width: 1.5px;
}
@keyframes fpSpin {
  to {
    transform: rotate(360deg);
  }
}

/* ═══════════════════════════════
   حالة النجاح
═══════════════════════════════ */
.fp-success {
  text-align: center;
  padding: 10px 0;
}
.fp-success-icon {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: rgba(74, 222, 128, 0.15);
  border: 1.5px solid rgba(74, 222, 128, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  position: relative;
  animation: fpSuccessIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.fp-success-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px solid rgba(74, 222, 128, 0.15);
  animation: fpRingPulse 2s ease-in-out infinite;
}
@keyframes fpSuccessIn {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes fpRingPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.15;
  }
}
.fp-success-title {
  font-size: 1.4rem;
  font-weight: 900;
  color: white;
  margin-bottom: 10px;
}
.fp-success-sub {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.7;
  margin-bottom: 0;
}

/* ═══════════════════════════════
   انيميشن الانتقال بين الخطوات
═══════════════════════════════ */
.step-slide-enter-active,
.step-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.step-slide-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.step-slide-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ═══════════════════════════════
   تجاوب الشاشات الصغيرة
═══════════════════════════════ */
@media (max-width: 480px) {
  .fp-card-body {
    padding: 24px 18px;
  }
  .fp-title {
    font-size: 1.15rem;
  }
  .fp-otp-box {
    font-size: 1.1rem;
    border-radius: 10px;
  }
  .fp-otp-boxes {
    gap: 6px;
  }
  .fp-btn {
    font-size: 0.87rem;
    padding: 11px 20px;
  }
  .fp-step-label {
    font-size: 0.68rem;
  }
}

@media (max-width: 360px) {
  .fp-card-body {
    padding: 20px 14px;
  }
  .fp-otp-boxes {
    gap: 4px;
  }
  .fp-otp-box {
    border-radius: 8px;
    font-size: 1rem;
  }
  .fp-header {
    gap: 10px;
  }
  .fp-logo-wrap {
    width: 38px;
    height: 38px;
  }
  .fp-title {
    font-size: 1.05rem;
  }
}

@media (max-width: 320px) {
  .fp-steps {
    display: none;
  }
}
</style>
