<template>
  <div class="store-register-wrapper" dir="rtl">
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>

    <div class="register-container">
      <!-- Left Panel -->
      <div class="brand-panel">
        <div class="brand-panel-inner">
          <div class="store-logo-wrap">
            <div class="store-logo-icon"><span>H</span></div>
            <div>
              <div class="store-logo-name">HWNiX</div>
              <div class="store-logo-tagline">الثقة في كل اختيار</div>
            </div>
          </div>
          <h1 class="brand-headline">انضم إلى<br /><span class="brand-accent">مجتمعنا</span></h1>
          <p class="brand-subtext">أنشئ حسابك الآن وتمتع بتجربة تسوق فريدة مع عروض حصرية وأسعار لا تُنسى في كل يوم.</p>

          <div class="perks">
            <div v-for="perk in perks" :key="perk.title" class="perk-item">
              <div class="perk-icon"><i :class="perk.icon"></i></div>
              <div>
                <div class="perk-title">{{ perk.title }}</div>
                <div class="perk-desc">{{ perk.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Form -->
      <div class="form-panel">
        <div class="form-panel-inner">
          <router-link to="/" class="back-link"> <i class="ri-arrow-right-line"></i> العودة للمتجر </router-link>

          <div class="form-header">
            <h2 class="form-title">إنشاء حساب جديد</h2>
            <p class="form-subtitle">أنشئ حسابك في ثوانٍ وابدأ التسوق فوراً</p>
          </div>

          <v-form ref="formRef" @submit.prevent="handleRegister" class="register-form">
            <v-row dense>
              <v-col cols="12" sm="6">
                <div class="field-group">
                  <label class="field-label">الاسم الكامل *</label>
                  <AppInput
                    v-model="form.full_name"
                    placeholder="أدخل اسمك الثلاثي"
                    :rules="[required]"
                    prepend-inner-icon="ri-user-follow-line"
                    class="store-input"
                  />
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="field-group">
                  <label class="field-label">اسم الشهرة / اللقب *</label>
                  <AppInput
                    v-model="form.nickname"
                    placeholder="مثال: أبو محمد"
                    :rules="[required]"
                    prepend-inner-icon="ri-medal-2-line"
                    class="store-input"
                  />
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="field-group">
                  <label class="field-label">رقم الهاتف *</label>
                  <AppInput
                    v-model="form.phone"
                    placeholder="01xxxxxxxxx"
                    :rules="[required, phoneValidator]"
                    prepend-inner-icon="ri-smartphone-line"
                    class="store-input"
                  />
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="field-group">
                  <label class="field-label">البريد الإلكتروني</label>
                  <AppInput v-model="form.email" placeholder="user@example.com" prepend-inner-icon="ri-mail-line" class="store-input" />
                </div>
              </v-col>
              <v-col cols="12">
                <div class="field-group">
                  <label class="field-label">كلمة المرور *</label>
                  <AppPasswordInput
                    v-model="form.password"
                    placeholder="8 أحرف على الأقل"
                    :rules="[required, strongPassword]"
                    prepend-inner-icon="ri-lock-password-line"
                    class="store-input"
                  />
                </div>
              </v-col>
              <v-col cols="12" class="pt-0">
                <v-checkbox v-model="form.agree" color="primary" density="compact" :rules="[v => !!v || 'يجب الموافقة على الشروط']" hide-details>
                  <template #label>
                    <span class="terms-text">
                      أوافق على <a href="#" class="terms-link">سياسة الخصوصية</a> و<a href="#" class="terms-link">شروط الاستخدام</a>
                    </span>
                  </template>
                </v-checkbox>
              </v-col>
            </v-row>

            <AppButton type="submit" color="primary" size="x-large" block active :loading="loading" class="register-btn mt-2">
              <i class="ri-user-add-line me-2"></i>
              إنشاء الحساب مجاناً
            </AppButton>
          </v-form>

          <div class="store-bottom-hint">
            لديك حساب بالفعل؟
            <router-link to="/login" class="terms-link">تسجيل الدخول</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/api';
import { required, phone as phoneValidator, strongPassword } from '@/utils/validators';
import AppInput from '@/components/common/AppInput.vue';
import AppPasswordInput from '@/components/common/AppPasswordInput.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);
const form = ref({ full_name: '', nickname: '', phone: '', email: '', password: '', agree: false });

const perks = [
  { icon: 'ri-gift-2-line', title: 'عروض حصرية', desc: 'وصول أول لأفضل الصفقات والتخفيضات' },
  { icon: 'ri-shield-check-line', title: 'دفع آمن', desc: 'حماية كاملة لبياناتك وعملياتك' },
  { icon: 'ri-refresh-line', title: 'استرجاع مضمون', desc: 'ضمان الاسترجاع خلال 30 يوماً' },
];

const handleRegister = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  loading.value = true;
  try {
    await authService.registerCustomer({
      full_name: form.value.full_name,
      nickname: form.value.nickname,
      phone: form.value.phone,
      email: form.value.email,
      password: form.value.password,
    });
    router.push('/login?registered=1');
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

.store-register-wrapper {
  font-family: 'Cairo', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ede9fe 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  z-index: 0;
}
.blob-1 {
  width: 500px;
  height: 500px;
  background: #818cf8;
  top: -150px;
  left: -150px;
}
.blob-2 {
  width: 400px;
  height: 400px;
  background: #a78bfa;
  bottom: -100px;
  right: -100px;
}

.register-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  width: 100%;
  max-width: 1050px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(99, 102, 241, 0.2);
}

.brand-panel {
  background: linear-gradient(145deg, #1a3d8f 0%, #4f46e5 50%, #7c3aed 100%);
  padding: 28px 28px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
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
  font-size: 1.8rem;
  font-weight: 900;
  line-height: 1.35;
  margin-bottom: 10px;
}
.brand-accent {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.brand-subtext {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
  line-height: 1.6;
  margin-bottom: 18px;
}

.perks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.perk-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.perk-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 2px;
}
.perk-title {
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
}
.perk-desc {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.8rem;
}

/* Form Panel */
.form-panel {
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 28px;
  overflow-y: auto;
}
.form-panel-inner {
  width: 100%;
  max-width: 480px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6366f1;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 14px;
}
.form-header {
  margin-bottom: 16px;
}
.form-title {
  font-size: 1.6rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 6px;
}
.form-subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.field-group {
  margin-bottom: 4px;
}
.field-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}

.store-input :deep(.v-field) {
  border-radius: 10px !important;
  background: #f8fafc !important;
  border: 1.5px solid #e2e8f0 !important;
  transition: all 0.25s;
}
.store-input :deep(.v-field--focused) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

.terms-text {
  font-size: 0.8rem;
  color: #64748b;
}
.terms-link {
  color: #6366f1;
  font-weight: 700;
  text-decoration: none;
}

.register-btn {
  height: 56px !important;
  border-radius: 14px !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35) !important;
}

.store-bottom-hint {
  text-align: center;
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 14px;
}
.store-bottom-hint .terms-link {
  color: #6366f1;
  font-weight: 700;
  text-decoration: none;
  margin-right: 3px;
}
.store-bottom-hint .terms-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-container {
    grid-template-columns: 1fr;
  }
  .brand-panel {
    display: none;
  }
  .form-panel {
    padding: 32px 20px;
  }
}
</style>
