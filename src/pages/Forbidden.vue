<template>
  <div class="forbidden-wrapper">
    <!-- Animated Background Shapes -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>

    <v-container class="fill-height d-flex align-center justify-center py-2">
      <div class="glass-card pa-6 pa-md-8 text-center elevation-24">
        <!-- Floating Icon Container -->
        <div class="icon-wrapper mb-4">
          <div class="icon-pulse"></div>
          <v-icon icon="ri-shield-keyhole-line" size="64" color="error" class="main-icon" />
        </div>

        <!-- Title & Subtitle -->
        <h1 class="text-h4 font-weight-bold text-high-emphasis mb-2 tracking-tight">دخول <span class="text-gradient">محظور</span></h1>

        <p class="text-body-1 text-medium-emphasis mb-6 max-width-600 mx-auto leading-relaxed">
          عذراً، محاولة الوصول إلى هذا المورد مرفوضة. لا تمتلك الصلاحيات الكافية لتنفيذ هذا الإجراء أو عرض هذه الصفحة.
        </p>

        <!-- Dynamic Message from Server (Optional) -->
        <v-slide-y-transition>
          <div v-if="serverMsg" class="server-error-banner mb-6 pa-3 rounded-md d-flex align-center gap-3">
            <v-icon icon="ri-error-warning-line" color="warning" size="18" />
            <span class="text-body-2 font-weight-medium text-high-emphasis">{{ serverMsg }}</span>
          </div>
        </v-slide-y-transition>

        <!-- Action Buttons -->
        <div class="d-flex flex-column flex-sm-row align-center justify-center gap-3">
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            rounded="md"
            prepend-icon="ri-arrow-right-up-line"
            class="action-btn px-6 text-white"
            @click="goBack"
          >
            العودة للسابق
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
          <p class="text-caption text-medium-emphasis mb-0">إذا كنت تعتقد أن هناك خطأ في صلاحياتك، يرجى التواصل مع مدير النظام.</p>
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
  min-height: calc(100vh - 120px);
  position: relative;
  background: rgb(var(--v-theme-background));
  overflow: hidden;
  display: flex;
  align-items: center;
  border-radius: 16px;
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
  background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.main-icon {
  filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.4));
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

/* Server Banner */
.server-error-banner {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.15);
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
  background: #4f46e5;
  top: -80px;
  left: -80px;
  animation: move 15s infinite alternate;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #ef4444;
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
