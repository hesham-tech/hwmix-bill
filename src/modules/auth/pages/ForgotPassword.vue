<template>
  <div class="forgot-password-page">
    <div class="forgot-container">
      <div class="forgot-brand">
        <div class="brand-content">
          <v-icon icon="ri-lock-password-line" size="64" color="white" />
          <h1 class="brand-title mt-4">استعادة كلمة المرور</h1>
          <p class="brand-subtitle">سنرسل لك رابط إعادة تعيين كلمة المرور</p>
        </div>
      </div>

      <div class="forgot-form-wrapper">
        <div class="forgot-form">
          <h2 class="text-h4 font-weight-bold mb-2">نسيت كلمة المرور؟</h2>
          <p class="text-body-1 text-grey mb-6">أدخل بريدك الإلكتروني</p>

          <v-form v-if="!sent" ref="formRef" @submit.prevent="handleSubmit">
            <AppInput
              v-model="form.email"
              label="البريد الإلكتروني *"
              type="email"
              :rules="[required, email]"
              prepend-inner-icon="ri-mail-line"
              class="mb-4"
            />

            <AppButton type="submit" color="primary" size="large" block :loading="loading" class="mb-4"> إرسال رابط الاستعادة </AppButton>

            <div class="text-center">
              <a href="/login" class="text-primary text-decoration-none">
                <v-icon icon="ri-arrow-right-line" size="small" class="me-1" />
                العودة لتسجيل الدخول
              </a>
            </div>
          </v-form>

          <div v-else class="success-message">
            <v-icon icon="ri-checkbox-circle-line" size="64" color="success" class="mb-4" />
            <h3 class="text-h6 mb-2">تم إرسال الرابط!</h3>
            <p class="text-body-2 text-grey mb-4">تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور</p>
            <AppButton color="primary" variant="outlined" href="/login" block> العودة لتسجيل الدخول </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { authService } from '@/api';
import { required, email } from '@/utils/validators';
import { toast } from 'vue3-toastify';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';

const formRef = ref(null);
const loading = ref(false);
const sent = ref(false);

const form = ref({
  email: '',
});

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    await authService.forgotPassword(form.value);
    sent.value = true;
    toast.success('تم إرسال رابط الاستعادة');
  } catch (error) {
    toast.error('فشل إرسال الرابط');
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
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  font-size: 2rem;
  font-weight: 700;
}

.brand-subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

.forgot-form-wrapper {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
}

.forgot-form {
  width: 100%;
  max-width: 400px;
}

.success-message {
  text-align: center;
}

@media (max-width: 960px) {
  .forgot-container {
    flex-direction: column;
  }

  .forgot-brand {
    padding: 24px;
  }
}
</style>
