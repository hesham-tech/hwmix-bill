<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-brand">
        <div class="brand-content">
          <v-icon icon="ri-building-line" size="64" color="white" />
          <h1 class="brand-title mt-4">إنضم إلينا</h1>
          <p class="brand-subtitle">ابدأ رحلتك في إدارة الفواتير</p>
        </div>
      </div>

      <div class="register-form-wrapper">
        <div class="register-form">
          <h2 class="text-h4 font-weight-bold mb-2">إنشاء حساب جديد</h2>
          <p class="text-body-1 text-grey mb-6">املأ البيانات للبدء</p>

          <v-form ref="formRef" @submit.prevent="handleRegister">
            <v-row>
              <v-col cols="12" sm="6">
                <AppInput v-model="form.first_name" label="الاسم الأول *" :rules="[required]" prepend-inner-icon="ri-user-line" />
              </v-col>

              <v-col cols="12" sm="6">
                <AppInput v-model="form.last_name" label="اسم العائلة *" :rules="[required]" prepend-inner-icon="ri-user-line" />
              </v-col>

              <v-col cols="12">
                <AppInput
                  v-model="form.email"
                  label="البريد الإلكتروني *"
                  type="email"
                  :rules="[required, email]"
                  prepend-inner-icon="ri-mail-line"
                />
              </v-col>

              <v-col cols="12">
                <AppInput v-model="form.phone" label="رقم الهاتف *" :rules="[required, phone]" prepend-inner-icon="ri-phone-line" />
              </v-col>

              <v-col cols="12">
                <AppInput
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  label="كلمة المرور *"
                  :rules="[required, strongPassword]"
                  prepend-inner-icon="ri-lock-line"
                />
              </v-col>

              <v-col cols="12">
                <AppInput
                  v-model="form.password_confirmation"
                  :type="showPassword ? 'text' : 'password'"
                  label="تأكيد كلمة المرور *"
                  :rules="[required, v => v === form.password || 'كلمة المرور غير متطابقة']"
                  prepend-inner-icon="ri-lock-line"
                />
              </v-col>

              <v-col cols="12">
                <v-checkbox v-model="form.agree" :rules="[v => !!v || 'يجب الموافقة على الشروط']" density="compact">
                  <template #label>
                    <span class="text-body-2">
                      أوافق على
                      <a href="#" class="text-primary">الشروط والأحكام</a>
                    </span>
                  </template>
                </v-checkbox>
              </v-col>
            </v-row>

            <AppButton type="submit" color="primary" size="large" block :loading="loading" class="mt-4 shadow-sm"> إنشاء حساب جديد </AppButton>

            <div class="text-center mt-4">
              <span class="text-grey">لديك حساب بالفعل؟</span>
              <a href="/login" class="text-primary text-decoration-none ms-1"> تسجيل الدخول </a>
            </div>
          </v-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/api';
import { required, email, phone, strongPassword } from '@/utils/validators';
import { toast } from 'vue3-toastify';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);
const showPassword = ref(false);

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  agree: false,
});

const handleRegister = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    await authService.register(form.value);
    toast.success('تم إنشاء الحساب بنجاح');
    router.push('/login');
  } catch (error) {
    toast.error('فشل إنشاء الحساب');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  padding: 24px;
}

.register-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-brand {
  flex: 0 0 350px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
  font-size: 2.5rem;
  font-weight: 700;
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.register-form-wrapper {
  flex: 1;
  padding: 48px;
  overflow-y: auto;
}

@media (max-width: 960px) {
  .register-container {
    flex-direction: column;
  }

  .register-brand {
    padding: 24px;
  }
}
</style>
