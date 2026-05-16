<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/api';
import { required, phone as phoneValidator, strongPassword } from '@/utils/validators';
import AppInput from '@/components/common/AppInput.vue';
import AppPasswordInput from '@/components/common/AppPasswordInput.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const loading = ref(false);

const registrationType = computed(() => route.query.type || 'customer');
const isTenant = computed(() => registrationType.value === 'tenant');

const form = ref({
  // User Data
  full_name: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  
  // Company Data (Tenant only)
  company_name: '',
  company_phone: '',
  company_email: '',
  address: '',
  
  agree: false,
});

const handleRegister = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    if (isTenant.value) {
      await authService.registerTenant({
        company_name: form.value.company_name,
        company_phone: form.value.company_phone,
        company_email: form.value.company_email,
        address: form.value.address,
        full_name: form.value.full_name,
        phone: form.value.phone,
        email: form.value.email,
        password: form.value.password,
      });
    } else {
      await authService.registerCustomer({
        full_name: form.value.full_name,
        nickname: form.value.nickname,
        phone: form.value.phone,
        email: form.value.email,
        password: form.value.password,
      });
    }
    router.push('/login?registered=1');
  } catch (error) {
    // Error notification handled in interceptor
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-wrapper">
    <!-- Animated Decorations -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>

    <v-container class="fill-height d-flex align-center justify-center pa-4">
      <div class="glass-container pa-3">
        <v-row class="fill-height justify-center" align="stretch">
          <!-- Left Side: Visual/Branding -->
          <v-col cols="12" md="5" class="d-none d-md-flex">
            <div class="visual-card h-100 w-100 d-flex align-center justify-center" :class="{ 'tenant-visual': isTenant }">
              <div class="visual-content text-center pa-2 pa-md-8">
                <div class="icon-orb mb-2">
                  <v-icon :icon="isTenant ? 'ri-building-2-fill' : 'ri-shield-user-fill'" size="64" color="white" />
                </div>
                <h1 class="text-h4 font-weight-bold text-white mb-4">
                  {{ isTenant ? 'ابدأ مشروعك الآن' : 'انضم إلينا' }}
                </h1>
                <p class="text-body-1 text-white opacity-80 mb-8 font-weight-medium">
                  {{ isTenant 
                    ? 'انضم لمئات الشركات التي تثق في HWNix لإدارة أعمالها بذكاء.' 
                    : 'قم بإنشاء حسابك الآن للوصول إلى كافة الخدمات والميزات بشكل آمن.' 
                  }}
                </p>
                <div class="step-items">
                  <div class="step-item d-flex align-center gap-4 mb-4">
                    <div class="step-num">1</div>
                    <span class="text-body-2 font-weight-bold">إعداد سريع وسهل</span>
                  </div>
                  <div class="step-item d-flex align-center gap-4">
                    <div class="step-num">2</div>
                    <span class="text-body-2 font-weight-bold">تحكم كامل في بياناتك</span>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Right Side: Form -->
          <v-col cols="12" :md="isTenant ? 7 : 6" class="d-flex">
            <div class="form-card h-100 pa-2 pa-md-6 w-100 d-flex flex-column justify-center overflow-y-auto" style="max-height: 85vh">
              <div class="d-flex align-center justify-space-between mb-6">
                <div>
                  <h2 class="text-h5 font-weight-bold text-slate-900 mb-1">
                    {{ isTenant ? 'تسجيل شركة جديدة' : 'تسجيل عميل جديد' }}
                  </h2>
                  <p class="text-body-2 text-slate-500">من فضلك قم بملء البيانات التالية بدقة</p>
                </div>
                <v-btn icon="ri-arrow-left-line" variant="tonal" color="primary" rounded="md" to="/login" />
              </div>

              <v-form ref="formRef" @submit.prevent="handleRegister" class="register-form">
                <v-row dense>
                  <!-- Section: Company Info (Tenant Only) -->
                  <template v-if="isTenant">
                    <v-col cols="12">
                      <div class="section-title mb-2">بيانات المؤسسة</div>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="input-group">
                        <label class="custom-label">اسم الشركة *</label>
                        <AppInput
                          v-model="form.company_name"
                          placeholder="مثال: شركة التقوى للتجارة"
                          :rules="[required]"
                          prepend-inner-icon="ri-building-line"
                          class="premium-input"
                        />
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="input-group">
                        <label class="custom-label">رقم هاتف الشركة</label>
                        <AppInput
                          v-model="form.company_phone"
                          placeholder="01xxxxxxxxx"
                          prepend-inner-icon="ri-phone-line"
                          class="premium-input"
                        />
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="input-group">
                        <label class="custom-label">عنوان الشركة</label>
                        <AppInput
                          v-model="form.address"
                          placeholder="المحافظة - المدينة - الشارع"
                          prepend-inner-icon="ri-map-pin-line"
                          class="premium-input"
                        />
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <v-divider class="my-4" />
                      <div class="section-title mb-2">بيانات مدير النظام</div>
                    </v-col>
                  </template>

                  <!-- Section: User Info -->
                  <v-col cols="12" :sm="isTenant ? 12 : 12">
                    <div class="input-group">
                      <label class="custom-label">{{ isTenant ? 'اسم المدير المسئول *' : 'الاسم بالكامل *' }}</label>
                      <AppInput
                        v-model="form.full_name"
                        placeholder="أدخل الاسم الثلاثي"
                        :rules="[required]"
                        prepend-inner-icon="ri-user-follow-line"
                        class="premium-input"
                      />
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6" v-if="!isTenant">
                    <div class="input-group">
                      <label class="custom-label">اسم الشهرة / اللقب *</label>
                      <AppInput
                        v-model="form.nickname"
                        placeholder="مثال: أبو محمد"
                        :rules="[required]"
                        prepend-inner-icon="ri-medal-2-line"
                        class="premium-input"
                      />
                    </div>
                  </v-col>

                  <v-col cols="12" :sm="isTenant ? 6 : 6">
                    <div class="input-group">
                      <label class="custom-label">رقم الهاتف الشخصي *</label>
                      <AppInput
                        v-model="form.phone"
                        placeholder="01xxxxxxxxx"
                        :rules="[required, phoneValidator]"
                        prepend-inner-icon="ri-smartphone-line"
                        class="premium-input"
                      />
                    </div>
                  </v-col>
                  
                  <v-col cols="12" :sm="isTenant ? 6 : 12">
                    <div class="input-group">
                      <label class="custom-label">البريد الإلكتروني</label>
                      <AppInput
                        v-model="form.email"
                        placeholder="user@example.com"
                        prepend-inner-icon="ri-mail-line"
                        class="premium-input"
                      />
                    </div>
                  </v-col>

                  <v-col cols="12">
                    <div class="input-group">
                      <label class="custom-label">كلمة المرور *</label>
                      <AppPasswordInput
                        v-model="form.password"
                        placeholder="8 أحرف على الأقل"
                        :rules="[required, strongPassword]"
                        prepend-inner-icon="ri-lock-password-line"
                        class="premium-input"
                      />
                    </div>
                  </v-col>

                  <v-col cols="12" class="pt-0">
                    <v-checkbox v-model="form.agree" color="primary" density="compact" :rules="[v => !!v || 'يجب الموافقة على الشروط']" hide-details>
                      <template #label>
                        <span class="text-caption text-slate-600">
                          أوافق على <a href="#" class="text-primary font-weight-bold text-decoration-none">سياسة الخصوصية</a> و
                          <a href="#" class="text-primary font-weight-bold text-decoration-none">شروط الاستخدام</a>
                        </span>
                      </template>
                    </v-checkbox>
                  </v-col>
                </v-row>

                <AppButton type="submit" color="primary" size="large" block active :loading="loading" class="submit-btn mt-4">
                  <v-icon :icon="isTenant ? 'ri-rocket-line' : 'ri-user-add-line'" start />
                  {{ isTenant ? 'تفعيل النظام الآن' : 'إنشاء الحساب' }}
                </AppButton>

                <div class="text-center mt-6">
                  <span class="text-caption text-slate-500">لديك حساب بالفعل؟</span>
                  <router-link to="/login" class="text-caption text-primary font-weight-bold ms-2 text-decoration-none hover-underline">
                    تسجيل الدخول
                  </router-link>
                </div>
              </v-form>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

/* Glass Container */
.glass-container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  height: auto;
  max-height: 95vh;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
}

/* Visual Card */
.visual-card {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  position: relative;
  color: white;
  border-radius: 4px;
  overflow: hidden;
}

.visual-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url('https://www.transparenttextures.com/patterns/cubes.png');
  opacity: 0.1;
}

.icon-orb {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 35% 65% 70% 30% / 30% 30% 70% 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: morph 8s ease-in-out infinite;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes morph {
  0% {
    border-radius: 35% 65% 70% 30% / 30% 30% 70% 70%;
  }
  50% {
    border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
  }
  100% {
    border-radius: 35% 65% 70% 30% / 30% 30% 70% 70%;
  }
}

.step-num {
  width: 28px;
  height: 28px;
  background: white;
  color: #6366f1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.8rem;
}

/* Form Side */
.custom-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
  margin-inline-start: 4px;
}

.premium-input :deep(.v-field) {
  border-radius: 4px !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  transition: all 0.3s ease;
}

.premium-input :deep(.v-field--focused) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
}

.submit-btn {
  height: 64px !important;
  border-radius: 4px !important;
  font-weight: 800 !important;
  font-size: 1.1rem !important;
  letter-spacing: 0;
  box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4) !important;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.5) !important;
}

/* Background Shapes */
.bg-shape {
  position: absolute;
  filter: blur(80px);
  z-index: 1;
  opacity: 0.5;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: #c7d2fe;
  top: -100px;
  right: -100px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: #f5d0fe;
  bottom: -50px;
  left: -50px;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: #e0e7ff;
  top: 40%;
  left: 20%;
}

.text-slate-900 {
  color: #0f172a;
}
.text-slate-500 {
  color: #64748b;
}
.text-slate-600 {
  color: #475569;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .glass-container {
    border-radius: 16px;
    margin: 10px;
  }
}
.visual-card.tenant-visual {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
}

.section-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #312e81;
  border-right: 4px solid #fbbf24;
  padding-right: 12px;
}
</style>
