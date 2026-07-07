<!-- صفحة تعرض رسالة تعطل الخادم أو الخدمة غير متوفرة (كود 503) وتوفر إمكانية إعادة المحاولة -->
<template>
  <div class="service-unavailable-wrapper">
    <!-- Animated Background Shapes -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>

    <v-container class="fill-height d-flex align-center justify-center py-2">
      <div class="glass-card pa-6 pa-md-8 text-center elevation-24">
        <!-- Floating Icon Container -->
        <div class="icon-wrapper mb-4">
          <div class="icon-pulse"></div>
          <v-icon icon="ri-server-line" size="64" color="warning" class="main-icon" />
        </div>

        <!-- Title & Subtitle -->
        <h1 class="text-h4 font-weight-bold text-high-emphasis mb-2 tracking-tight">الخدمة <span class="text-gradient">غير متوفرة</span></h1>

        <p class="text-body-1 text-medium-emphasis mb-6 max-width-600 mx-auto leading-relaxed">
          نعتذر عن هذا العطل المؤقت. خادم النظام غير قادر على الاستجابة حالياً، قد يكون ذلك بسبب أعمال الصيانة الجارية أو تحديث النظام.
        </p>

        <!-- Action Buttons -->
        <div class="d-flex flex-column flex-sm-row align-center justify-center gap-3">
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            rounded="md"
            prepend-icon="ri-refresh-line"
            :loading="isChecking"
            class="action-btn px-6 text-white"
            @click="retryConnection"
          >
            إعادة المحاولة
          </v-btn>

          <v-btn
            color="primary"
            variant="outlined"
            size="large"
            rounded="md"
            prepend-icon="ri-home-4-line"
            class="action-btn home-btn px-6"
            @click="goHome"
          >
            الرئيسية
          </v-btn>
        </div>

        <!-- Support Info -->
        <div class="mt-6 pt-4 border-top-glass">
          <p class="text-caption text-medium-emphasis mb-0">
            إذا استمر العطل لفترة طويلة، يرجى التواصل مع الدعم الفني.
          </p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup>
// صفحة عرض تعطل الخدمة المؤقت مع إمكانية التحقق الفوري وإعادة التوجيه
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios.config';
import { toast } from 'vue3-toastify';

const router = useRouter();
const isChecking = ref(false);

const retryConnection = async () => {
  if (isChecking.value) return;
  isChecking.value = true;
  
  try {
    // حاول التحقق من الاتصال باستدعاء نقطة التحقق bootstrap
    await apiClient.get('bootstrap');
    toast.success('تم استعادة الاتصال بالنظام بنجاح!');
    // إعادة التوجيه للوحة التحكم الرئيسية
    router.push('/app');
  } catch (error) {
    // في حال استمرار الفشل
    toast.error('الخدمة لا تزال غير متوفرة حالياً. يرجى المحاولة بعد قليل.');
  } finally {
    isChecking.value = false;
  }
};

const goHome = () => {
  router.push('/app');
};
</script>

<style scoped>
.service-unavailable-wrapper {
  min-height: 100vh;
  position: relative;
  background: rgb(var(--v-theme-background));
  overflow: hidden;
  display: flex;
  align-items: center;
}

/* Glassmorphism Card */
.glass-card {
  background: rgba(var(--v-theme-surface), 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 32px;
  max-width: 800px;
  width: 95%;
  position: relative;
  z-index: 2;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
}

/* Icon Animations */
.icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 180, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.main-icon {
  filter: drop-shadow(0 0 10px rgba(255, 180, 0, 0.4));
  animation: float 3s ease-in-out infinite;
}

/* Typography */
.text-gradient {
  background: linear-gradient(135deg, #ffcc00 0%, #ffb400 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tracking-tight {
  letter-spacing: -0.02em;
}

.leading-relaxed {
  line-height: 1.6;
}

.max-width-600 {
  max-width: 600px;
}

/* Buttons */
.action-btn {
  font-weight: 800;
  letter-spacing: 0;
  transition: all 0.3s ease;
  text-transform: none;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.home-btn {
  border-width: 2px !important;
}

/* Background Shapes */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  opacity: 0.25;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: #0086CD;
  top: -80px;
  left: -80px;
  animation: move 15s infinite alternate;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #ffb400;
  bottom: -40px;
  right: -40px;
  animation: move 12s infinite alternate-reverse;
}

.border-top-glass {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(80px, 40px);
  }
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .glass-card {
    padding: 24px 12px !important;
    border-radius: 24px;
  }
}
</style>
