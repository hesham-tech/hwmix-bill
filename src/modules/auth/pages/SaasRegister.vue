<template>
  <div class="saas-register-wrapper" dir="rtl">
    <div class="mesh-bg">
      <div class="mesh-orb orb-1"></div>
      <div class="mesh-orb orb-2"></div>
    </div>
    <div class="grid-pattern"></div>

    <div class="saas-reg-container">
      <!-- Left: Benefits Panel -->
      <div class="saas-benefit-panel">
        <div class="saas-benefit-inner">
          <div class="saas-logo-wrap">
            <div class="saas-logo-icon"><i class="ri-building-2-fill"></i></div>
            <div>
              <div class="saas-logo-name">HWNiX</div>
              <div class="saas-logo-badge">SaaS Platform</div>
            </div>
          </div>

          <h1 class="benefit-headline">
            ابدأ إدارة أعمالك<br />
            <span class="benefit-gold">اليوم — مجاناً</span>
          </h1>
          <p class="benefit-subtext">
            لا تحتاج لبطاقة ائتمان. سجّل شركتك في أقل من 5 دقائق وابدأ الإدارة الذكية فوراً.
          </p>

          <!-- Steps -->
          <div class="setup-steps">
            <div v-for="(step, i) in steps" :key="step.title" class="setup-step">
              <div class="step-num">{{ i + 1 }}</div>
              <div>
                <div class="step-title">{{ step.title }}</div>
                <div class="step-desc">{{ step.desc }}</div>
              </div>
            </div>
          </div>

          <!-- Modules Preview -->
          <div class="modules-grid">
            <div v-for="mod in modules" :key="mod.name" class="module-chip">
              <i :class="mod.icon"></i>
              <span>{{ mod.name }}</span>
            </div>
          </div>

          <div class="trust-strip">
            <i class="ri-shield-keyhole-fill"></i>
            <span>بيانات مشفرة · بدون عقود · ألغِ في أي وقت</span>
          </div>
        </div>
      </div>

      <!-- Right: Form Panel -->
      <div class="saas-reg-form-panel">
        <div class="saas-reg-form-inner">
          <router-link to="/saas" class="saas-back-link">
            <i class="ri-arrow-right-line"></i> العودة للرئيسية
          </router-link>

          <div class="saas-form-header">
            <h2 class="saas-form-title">تسجيل شركة جديدة</h2>
            <p class="saas-form-subtitle">أدخل بيانات شركتك لبدء التجربة المجانية</p>
          </div>

          <v-form ref="formRef" @submit.prevent="handleRegister">
            <!-- Company Section -->
            <div class="form-section">
              <div class="section-header">
                <i class="ri-building-line section-icon"></i>
                <span class="section-title">بيانات الشركة</span>
              </div>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <div class="saas-field-group">
                    <label class="saas-field-label">اسم الشركة *</label>
                    <AppInput v-model="form.company_name" placeholder="مثال: شركة التقوى" :rules="[required]" prepend-inner-icon="ri-building-line" class="saas-input" density="compact" />
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="saas-field-group">
                    <label class="saas-field-label">هاتف الشركة</label>
                    <AppInput v-model="form.company_phone" placeholder="01xxxxxxxxx" prepend-inner-icon="ri-phone-line" class="saas-input" density="compact" />
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="saas-field-group">
                    <label class="saas-field-label">عنوان الشركة</label>
                    <AppInput v-model="form.address" placeholder="المحافظة - المدينة - الشارع" prepend-inner-icon="ri-map-pin-line" class="saas-input" density="compact" />
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- Manager Section -->
            <div class="form-section">
              <div class="section-header">
                <i class="ri-user-star-line section-icon"></i>
                <span class="section-title">بيانات مدير النظام</span>
              </div>
              <v-row dense>
                <v-col cols="12">
                  <div class="saas-field-group">
                    <label class="saas-field-label">الاسم الكامل *</label>
                    <AppInput v-model="form.full_name" placeholder="أدخل الاسم الثلاثي" :rules="[required]" prepend-inner-icon="ri-user-follow-line" class="saas-input" density="compact" />
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="saas-field-group">
                    <label class="saas-field-label">رقم الهاتف *</label>
                    <AppInput v-model="form.phone" placeholder="01xxxxxxxxx" :rules="[required, phoneValidator]" prepend-inner-icon="ri-smartphone-line" class="saas-input" density="compact" />
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="saas-field-group">
                    <label class="saas-field-label">البريد الإلكتروني</label>
                    <AppInput v-model="form.email" placeholder="user@company.com" prepend-inner-icon="ri-mail-line" class="saas-input" density="compact" />
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="saas-field-group">
                    <label class="saas-field-label">كلمة المرور *</label>
                    <AppPasswordInput v-model="form.password" placeholder="8 أحرف على الأقل" :rules="[required, strongPassword]" prepend-inner-icon="ri-lock-password-line" class="saas-input" density="compact" />
                  </div>
                </v-col>
              </v-row>
            </div>

            <v-checkbox v-model="form.agree" color="warning" density="compact" :rules="[v => !!v || 'يجب الموافقة على الشروط']" hide-details class="saas-checkbox mb-1">
              <template #label>
                <span class="terms-text">أوافق على <a href="#" class="terms-link">شروط الخدمة</a> و<a href="#" class="terms-link">سياسة الخصوصية</a></span>
              </template>
            </v-checkbox>

            <AppButton type="submit" color="warning" size="x-large" block active :loading="loading" class="saas-reg-btn">
              <i class="ri-rocket-line me-2"></i>
              تفعيل النظام الآن — مجاناً
            </AppButton>
          </v-form>

          <div class="saas-bottom-hint">
            لديك حساب؟
            <router-link to="/saas/login" class="terms-link">تسجيل الدخول</router-link>
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
const form = ref({
  company_name: '', company_phone: '', address: '',
  full_name: '', phone: '', email: '', password: '',
  agree: false,
});

const steps = [
  { title: 'سجّل شركتك', desc: 'أدخل اسم شركتك وبياناتك الأساسية' },
  { title: 'خصّص نظامك', desc: 'أضف منتجاتك وموظفيك والفروع' },
  { title: 'ابدأ الإدارة', desc: 'أصدر فواتير وتابع تقاريرك فوراً' },
];

const modules = [
  { icon: 'ri-file-list-3-line', name: 'الفواتير' },
  { icon: 'ri-store-2-line', name: 'المخازن' },
  { icon: 'ri-bank-card-line', name: 'التقسيط' },
  { icon: 'ri-bar-chart-line', name: 'التقارير' },
  { icon: 'ri-group-line', name: 'الموظفون' },
  { icon: 'ri-git-branch-line', name: 'الفروع' },
];

const handleRegister = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  loading.value = true;
  try {
    await authService.registerTenant({
      company_name: form.value.company_name,
      company_phone: form.value.company_phone,
      address: form.value.address,
      full_name: form.value.full_name,
      phone: form.value.phone,
      email: form.value.email,
      password: form.value.password,
    });
    router.push('/saas/login?registered=1');
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

.saas-register-wrapper {
  font-family: 'Cairo', sans-serif;
  min-height: 100vh;
  background: #060b18;
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  padding: 10px;
}

.mesh-bg { position: absolute; inset: 0; z-index: 0; }
.mesh-orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.15; }
.orb-1 { width: 700px; height: 700px; background: #4f46e5; top: -250px; left: -250px; }
.orb-2 { width: 500px; height: 500px; background: #f59e0b; bottom: -200px; right: -200px; }

.grid-pattern {
  position: absolute; inset: 0; z-index: 0;
  background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

.saas-reg-container {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1.3fr;
  width: 100%; max-width: 1100px;
  border-radius: 24px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.08);
}

/* Benefit Panel */
.saas-benefit-panel {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255,255,255,0.07);
  padding: 28px 28px;
  display: flex; align-items: flex-start;
}
.saas-benefit-inner { width: 100%; }

.saas-logo-wrap { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.saas-logo-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: white; box-shadow: 0 8px 20px rgba(245,158,11,0.4); }
.saas-logo-name { color: white; font-size: 1.2rem; font-weight: 900; }
.saas-logo-badge { display: inline-block; background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); border-radius: 20px; padding: 1px 10px; font-size: 0.68rem; font-weight: 700; }

.benefit-headline { color: white; font-size: 1.6rem; font-weight: 900; line-height: 1.4; margin-bottom: 10px; }
.benefit-gold { background: linear-gradient(90deg, #f59e0b, #fbbf24); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.benefit-subtext { color: rgba(255,255,255,0.5); font-size: 0.83rem; line-height: 1.65; margin-bottom: 18px; }

/* Steps */
.setup-steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
.setup-step { display: flex; align-items: flex-start; gap: 12px; }
.step-num { width: 28px; height: 28px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.85rem; flex-shrink: 0; margin-top: 2px; }
.step-title { color: white; font-size: 0.9rem; font-weight: 700; }
.step-desc { color: rgba(255,255,255,0.5); font-size: 0.78rem; }

/* Modules */
.modules-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
.module-chip { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 6px 12px; color: rgba(255,255,255,0.7); font-size: 0.78rem; font-weight: 600; }
.module-chip i { color: #f59e0b; }

.trust-strip { display: flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.15); border-radius: 10px; padding: 10px 14px; color: rgba(245,158,11,0.8); font-size: 0.78rem; font-weight: 600; }

/* Form Panel */
.saas-reg-form-panel {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  padding: 14px 24px;
  display: flex; align-items: flex-start; justify-content: center;
  overflow-y: auto; max-height: 100vh;
}
.saas-reg-form-inner { width: 100%; max-width: 480px; padding-top: 6px; padding-bottom: 4px; }

.saas-back-link { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.4); font-size: 0.82rem; font-weight: 600; text-decoration: none; margin-bottom: 8px; transition: color 0.2s; }
.saas-back-link:hover { color: #f59e0b; }

.saas-form-header { text-align: center; margin-bottom: 8px; }
.saas-form-title { color: white; font-size: 1.1rem; font-weight: 900; margin-bottom: 2px; }
.saas-form-subtitle { color: rgba(255,255,255,0.45); font-size: 0.78rem; }

/* Form Sections */
.form-section { margin-bottom: 6px; }
.section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.section-icon { color: #f59e0b; font-size: 1rem; }
.section-title { color: rgba(255,255,255,0.7); font-size: 0.85rem; font-weight: 700; }

.saas-field-group { margin-bottom: 2px; }
.saas-field-label { display: block; font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.55); margin-bottom: 3px; }

.saas-input :deep(.v-field) { border-radius: 10px !important; background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.1) !important; }
.saas-input :deep(.v-field--focused) { border-color: #f59e0b !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important; }
.saas-input :deep(.v-field__input) { color: white !important; }
.saas-input :deep(.v-icon) { color: rgba(255,255,255,0.35) !important; }
.saas-input :deep(input::placeholder) { color: rgba(255,255,255,0.25) !important; }

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

.terms-text { font-size: 0.78rem; color: rgba(255,255,255,0.4); }
.terms-link { color: #f59e0b; font-weight: 700; text-decoration: none; }
.saas-checkbox :deep(.v-label) { color: rgba(255,255,255,0.5); }

.saas-reg-btn { height: 46px !important; border-radius: 12px !important; font-size: 0.95rem !important; font-weight: 800 !important; letter-spacing: 0 !important; text-transform: none !important; box-shadow: 0 6px 18px rgba(245,158,11,0.4) !important; transition: all 0.25s !important; }
.saas-reg-btn:hover { transform: translateY(-2px); }

.saas-divider { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.25); font-size: 0.8rem; margin: 10px 0; }
.saas-divider::before, .saas-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07); }

.saas-bottom-hint {
  text-align: center;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  margin-top: 8px;
}
.saas-bottom-hint .terms-link {
  color: #f59e0b;
  font-weight: 700;
  text-decoration: none;
  margin-right: 3px;
}
.saas-bottom-hint .terms-link:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .saas-reg-container { grid-template-columns: 1fr; }
  .saas-benefit-panel { display: none; }
  .saas-reg-form-panel { padding: 32px 20px; max-height: none; }
}
</style>
