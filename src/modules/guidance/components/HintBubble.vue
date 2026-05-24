<!--
مكون فقاعة التلميحات الذكية (Hint Bubble)
يعرض تلميحات سريعة وهادئة للمستخدم في زاوية الشاشة لتقديم نصائح ذكية دون تشويش بصري، مع دعم الإغلاق التلقائي.
-->
<script setup>
import { watch, onBeforeUnmount, ref } from 'vue';
import { useHint } from '../composables/useHint';

const props = defineProps({
  // مدة بقاء التلميح بالملي ثانية قبل الاختفاء التلقائي (0 يعني تعطيل الاختفاء التلقائي)
  duration: {
    type: Number,
    default: 12000, // 12 ثانية
  },
});

const { currentHint, dismissHint } = useHint();
const visible = ref(false);
let dismissTimer = null;

// مراقبة التلميح النشط وتحديث حالة الظهور والعداد التلقائي
watch(
  currentHint,
  (newHint) => {
    if (newHint) {
      visible.value = true;
      startTimer();
    } else {
      visible.value = false;
      clearTimer();
    }
  },
  { immediate: true }
);

function startTimer() {
  clearTimer();
  if (props.duration > 0) {
    dismissTimer = setTimeout(() => {
      handleDismiss();
    }, props.duration);
  }
}

function clearTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
}

async function handleDismiss() {
  visible.value = false;
  // إعطاء وقت لحركة التلاشي قبل مسح البيانات فعلياً
  setTimeout(async () => {
    await dismissHint();
  }, 400);
}

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<template>
  <transition name="hint-slide">
    <div
      v-if="visible && currentHint"
      class="hint-bubble-card glass-panel"
      role="alert"
      aria-live="polite"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <!-- زر الإغلاق السريع -->
      <v-btn
        icon="ri-close-line"
        variant="text"
        density="compact"
        class="close-btn"
        color="grey-lighten-1"
        @click="handleDismiss"
      />

      <div class="hint-header d-flex align-center gap-2 mb-2">
        <div class="hint-icon-wrapper">
          <v-icon icon="ri-lightbulb-line" color="amber-darken-1" size="20" class="hint-icon-pulse" />
        </div>
        <span class="hint-title font-weight-bold text-subtitle-2 text-white">
          {{ currentHint.title || 'تلميح ذكي' }}
        </span>
      </div>

      <div class="hint-body">
        <p class="hint-content text-caption text-grey-lighten-2 mb-0">
          {{ currentHint.content }}
        </p>
      </div>

      <div class="hint-footer d-flex justify-end mt-3">
        <v-btn
          variant="text"
          density="comfortable"
          size="small"
          color="primary"
          class="dismiss-action-btn font-weight-bold text-caption pa-0"
          @click="handleDismiss"
        >
          فهمت ذلك
        </v-btn>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.hint-bubble-card {
  position: fixed;
  bottom: 24px;
  left: 24px; /* يفضل إظهارها في اليسار لتجنب تعارضها مع أزرار المساعدة العائمة باليمين */
  width: 320px;
  max-width: 90vw;
  padding: 16px;
  border-radius: 16px;
  z-index: 9999; /* يجب أن تكون أعلى من كل المكونات باستثناء الـ dialogs */
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(var(--v-theme-primary), 0.1);
  direction: rtl;
  overflow: hidden;
}

/* تصميم الزجاج الملون الفخم المتناسق مع الهوية */
.glass-panel {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.92), rgba(15, 32, 67, 0.9)) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  transition: color 0.2s ease;
}
.close-btn:hover {
  color: #fff !important;
}

.hint-icon-wrapper {
  background: rgba(255, 179, 0, 0.1);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* نبض أيقونة اللمبة لجذب الانتباه بشكل خفيف */
.hint-icon-pulse {
  animation: pulse-glow 2s infinite ease-in-out;
}

@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
    filter: drop-shadow(0 0 4px rgba(255, 179, 0, 0.6));
  }
}

.hint-title {
  letter-spacing: 0.2px;
}

.hint-content {
  line-height: 1.6 !important;
}

.dismiss-action-btn {
  letter-spacing: 0;
}

/* حركات الدخول والخروج (Transition Animations) */
.hint-slide-enter-active,
.hint-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.hint-slide-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.hint-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
