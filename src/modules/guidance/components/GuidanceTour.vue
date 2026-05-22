<script setup>
/**
 * مكون الجولة التعريفية التفاعلية (Guidance Tour Component)
 * يسلط الضوء على العناصر المستهدفة باستخدام قناع SVG المعتم،
 * ويعرض بطاقة إرشادية ديناميكية بجانب العنصر المستهدف باستخدام @floating-ui/dom.
 */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';
import { useTour } from '../composables/useTour';

const {
  isActive,
  activeStep,
  currentStepIndex,
  activeTourSteps,
  hasNext,
  hasPrev,
  nextStep,
  prevStep,
  endTour,
} = useTour();

const targetEl = ref(null);
const cardEl = ref(null);
const arrowEl = ref(null);
const targetRect = ref(null);
const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

/**
 * البحث عن أول عنصر يطابق المحدد ويكون مرئياً (أبعاد العرض والارتفاع أكبر من صفر)
 * @param {string} selector 
 * @returns {Element|null}
 */
function queryVisibleSelector(selector) {
  if (!selector) return null;
  try {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return el;
      }
    }
    return elements[0] || null;
  } catch (e) {
    console.warn('Error querying visible selector:', selector, e);
    return null;
  }
}

// التحقق من صلاحية وجود المستهدف في الخطوة الحالية
const hasValidTarget = computed(() => {
  if (!activeStep.value || !activeStep.value.target) return false;
  return !!queryVisibleSelector(activeStep.value.target);
});

/**
 * تحديث قياسات النافذة لحسابات الـ SVG Overlay
 */
function handleResize() {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
  updateTargetRect();
  updateCardPosition();
}

/**
 * تحديث موقع وأبعاد العنصر المستهدف
 */
function updateTargetRect() {
  if (!isActive.value || !activeStep.value || !activeStep.value.target) {
    targetRect.value = null;
    targetEl.value = null;
    return;
  }

  try {
    const el = queryVisibleSelector(activeStep.value.target);
    if (el) {
      targetEl.value = el;
      const rect = el.getBoundingClientRect();
      // نأخذ الموضع بالنسبة للـ Viewport
      targetRect.value = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
    } else {
      targetRect.value = null;
      targetEl.value = null;
    }
  } catch (e) {
    console.warn('Invalid CSS selector during target rect update:', activeStep.value.target, e);
    targetRect.value = null;
    targetEl.value = null;
  }
}

/**
 * تحديث موضع بطاقة الجولة التعريفية بجوار العنصر المستهدف
 */
async function updateCardPosition() {
  await nextTick();
  if (!isActive.value || !cardEl.value) return;

  // إذا لم يكن هناك عنصر مستهدف صالح، نضع البطاقة في منتصف الشاشة
  if (!hasValidTarget.value || !targetEl.value) {
    Object.assign(cardEl.value.style, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    });
    if (arrowEl.value) {
      arrowEl.value.style.display = 'none';
    }
    return;
  }

  // استخدام @floating-ui/dom لتموضع دقيق
  if (arrowEl.value) {
    arrowEl.value.style.display = 'block';
  }

  let placement = activeStep.value.placement || 'bottom';

  // في الشاشات الصغيرة، نمنع التموضع الأفقي (يمين/يسار) لتجنب خروج البطاقة عن حدود الشاشة
  if (windowWidth.value < 600) {
    if (placement === 'left' || placement === 'right') {
      const rect = targetEl.value.getBoundingClientRect();
      const targetCenterY = rect.top + rect.height / 2;
      placement = targetCenterY > windowHeight.value / 2 ? 'top' : 'bottom';
    }
  }

  const { x, y, placement: finalPlacement, middlewareData } = await computePosition(
    targetEl.value,
    cardEl.value,
    {
      placement,
      strategy: 'fixed',
      middleware: [
        offset(14), // مسافة كافية عن المربع المضيء
        flip(),
        shift({ padding: 15, crossAxis: true }),
        arrow({ element: arrowEl.value }),
      ],
    }
  );

  Object.assign(cardEl.value.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'none',
  });

  // تحديد موضع السهم
  if (middlewareData.arrow && arrowEl.value) {
    const { x: arrowX, y: arrowY } = middlewareData.arrow;
    const staticSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }[finalPlacement.split('-')[0]];

    Object.assign(arrowEl.value.style, {
      left: arrowX != null ? `${arrowX}px` : '',
      top: arrowY != null ? `${arrowY}px` : '',
      right: '',
      bottom: '',
      [staticSide]: '-4px',
    });
  }
}

/**
 * التمرير إلى العنصر المستهدف وجلب التركيز إليه
 */
function scrollToTarget() {
  if (!isActive.value || !activeStep.value) return;

  updateTargetRect();

  if (targetEl.value) {
    targetEl.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }

  // بعد انتهاء التمرير، نقوم بتحديث الحسابات والموضع
  setTimeout(() => {
    updateTargetRect();
    updateCardPosition();
  }, 350);
}

// مراقبة الخطوة النشطة لإعادة التموضع والتركيز
watch(
  () => currentStepIndex.value,
  () => {
    if (isActive.value) {
      scrollToTarget();
    }
  }
);

// مراقبة تفعيل الجولة
watch(isActive, (val) => {
  if (val) {
    document.body.classList.add('guidance-tour-open');
    scrollToTarget();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
  } else {
    document.body.classList.remove('guidance-tour-open');
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleResize, true);
  }
});

onMounted(() => {
  if (isActive.value) {
    document.body.classList.add('guidance-tour-open');
    scrollToTarget();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
  }
});

onUnmounted(() => {
  document.body.classList.remove('guidance-tour-open');
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleResize, true);
});
</script>

<template>
  <div v-if="isActive && activeStep" class="guidance-tour-wrapper">
    <!-- Spotlight SVG Overlay -->
    <svg class="guidance-tour-svg-overlay" :width="windowWidth" :height="windowHeight">
      <defs>
        <mask id="guidance-spotlight-mask">
          <rect x="0" y="0" :width="windowWidth" :height="windowHeight" fill="white" />
          <rect
            v-if="targetRect"
            :x="targetRect.x - 8"
            :y="targetRect.y - 8"
            :width="targetRect.width + 16"
            :height="targetRect.height + 16"
            rx="8"
            ry="8"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        :width="windowWidth"
        :height="windowHeight"
        fill="rgba(15, 23, 42, 0.65)"
        mask="url(#guidance-spotlight-mask)"
        class="overlay-bg"
      />
    </svg>

    <!-- البطاقة الإرشادية (Tour Card) -->
    <div ref="cardEl" class="guidance-tour-card animate-scale-up border shadow-lg">
      <!-- السهم التوجيهي -->
      <div ref="arrowEl" class="guidance-tour-arrow"></div>

      <!-- محتوى البطاقة -->
      <div class="guidance-card-header">
        <div class="d-flex align-center gap-2">
          <div class="step-indicator">
            {{ currentStepIndex + 1 }} / {{ activeTourSteps.length }}
          </div>
          <h4 class="text-subtitle-1 font-weight-bold text-slate-800 ma-0">
            {{ activeStep.title }}
          </h4>
        </div>
        <button class="close-btn" @click="endTour(true)" title="إغلاق الجولة">
          <v-icon icon="ri-close-line" size="18" />
        </button>
      </div>

      <div class="guidance-card-body text-body-2 text-slate-600" v-html="activeStep.content">
      </div>

      <div class="guidance-card-footer">
        <button class="skip-btn" @click="endTour(true)">تخطي</button>
        <div class="actions-group">
          <button v-if="hasPrev" class="btn-prev" @click="prevStep">
            السابق
          </button>
          <button class="btn-next" @click="nextStep">
            {{ hasNext ? 'التالي' : 'إنهاء' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guidance-tour-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: none;
  direction: rtl;
}

.guidance-tour-svg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: auto;
}

.overlay-bg {
  transition: all 0.3s ease;
}

/* بطاقة الجولة التعريفية الفاخرة */
.guidance-tour-card {
  position: fixed;
  pointer-events: auto;
  z-index: 10000;
  width: 320px;
  max-width: 90vw;
  max-height: 90vh; /* تأكد من عدم خروج البطاقة عن الشاشة */
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guidance-tour-arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.95);
  transform: rotate(45deg);
  border: 1px solid transparent;
  pointer-events: none;
}

/* ربط السهم مع حواف البطاقة */
.guidance-tour-card[style*="top"] .guidance-tour-arrow {
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
  border-right: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.guidance-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
  flex-shrink: 0;
}

.step-indicator {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: monospace;
}

.close-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.guidance-card-body {
  line-height: 1.6;
  min-height: 50px;
  overflow-y: auto; /* إضافة سكرول للبطاقات الطويلة */
  scrollbar-width: thin;
}

.guidance-card-body::-webkit-scrollbar {
  width: 4px;
}
.guidance-card-body::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.guidance-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.skip-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.skip-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.actions-group {
  display: flex;
  gap: 8px;
}

.btn-prev {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-prev:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-next {
  background: rgb(var(--v-theme-primary));
  color: #fff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(var(--v-theme-primary), 0.2);
  transition: all 0.2s;
}

.btn-next:hover {
  opacity: 0.9;
  box-shadow: 0 4px 10px -1px rgba(var(--v-theme-primary), 0.3);
}

/* تأثير دخول ناعم للبطاقة */
.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    scale: 0.9;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}
</style>
