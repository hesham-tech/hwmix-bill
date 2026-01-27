<template>
  <div class="forbidden-wrapper">
    <!-- Animated Background Shapes -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>

    <v-container class="fill-height d-flex align-center justify-center">
      <div class="glass-card pa-8 pa-md-12 text-center elevation-24">
        <!-- Floating Icon Container -->
        <div class="icon-wrapper mb-8">
          <div class="icon-pulse"></div>
          <v-icon icon="ri-shield-keyhole-line" size="84" color="white" class="main-icon" />
        </div>

        <!-- Title & Subtitle -->
        <h1 class="text-h3 font-weight-black text-white mb-4 tracking-tight">دخول <span class="text-gradient">محظور</span></h1>

        <p class="text-h6 text-white opacity-80 mb-10 max-width-600 mx-auto leading-relaxed">
          عذراً، محاولة الوصول إلى هذا المورد مرفوضة. لا تمتلك الصلاحيات الكافية لتنفيذ هذا الإجراء أو عرض هذه الصفحة.
        </p>

        <!-- Dynamic Message from Server (Optional) -->
        <v-slide-y-transition>
          <div v-if="serverMsg" class="server-error-banner mb-8 pa-4 rounded-lg d-flex align-center gap-3">
            <v-icon icon="ri-error-warning-line" color="warning" size="20" />
            <span class="text-body-2 font-weight-medium text-white">{{ serverMsg }}</span>
          </div>
        </v-slide-y-transition>

        <!-- Action Buttons -->
        <div class="d-flex flex-column flex-sm-row align-center justify-center gap-4">
          <v-btn
            color="white"
            variant="flat"
            size="x-large"
            rounded="xl"
            prepend-icon="ri-arrow-right-up-line"
            class="action-btn px-8"
            @click="goBack"
          >
            العودة للسابق
          </v-btn>

          <v-btn
            color="white"
            variant="outlined"
            size="x-large"
            rounded="xl"
            prepend-icon="ri-home-4-line"
            class="action-btn home-btn px-8"
            @click="goHome"
          >
            الرئيسية
          </v-btn>
        </div>

        <!-- Support Info -->
        <div class="mt-12 pt-8 border-top-glass">
          <p class="text-caption text-white opacity-60 mb-0">إذا كنت تعتقد أن هناك خطأ في صلاحياتك، يرجى التواصل مع مدير النظام.</p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Extract server message from query if provided by axios interceptor
const serverMsg = computed(() => route.query.message || null);

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/app');
  }
};

const goHome = () => {
  router.push('/app');
};
</script>

<style scoped>
.forbidden-wrapper {
  min-height: 100vh;
  position: relative;
  background: #0f172a;
  overflow: hidden;
  display: flex;
  align-items: center;
}

/* Glassmorphism Card */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  max-width: 800px;
  width: 90%;
  position: relative;
  z-index: 2;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

/* Icon Animations */
.icon-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.main-icon {
  filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.5));
  animation: float 3s ease-in-out infinite;
}

/* Typography */
.text-gradient {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tracking-tight {
  letter-spacing: -0.02em;
}

.leading-relaxed {
  line-height: 1.8;
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
  transform: translateY(-5px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3);
}

.home-btn {
  border-width: 2px !important;
  color: white !important;
}

/* Server Banner */
.server-error-banner {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

/* Background Shapes */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  opacity: 0.4;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: #4f46e5;
  top: -100px;
  left: -100px;
  animation: move 15s infinite alternate;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: #ef4444;
  bottom: -50px;
  right: -50px;
  animation: move 12s infinite alternate-reverse;
}

.border-top-glass {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
    transform: translateY(-10px);
  }
}

@keyframes move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(100px, 50px);
  }
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .glass-card {
    padding: 32px 16px !important;
    border-radius: 30px;
  }
}
</style>
