<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';
import { useGuidance } from '../composables/useGuidance';

/**
 * مكون التلميحات الذكية التفاعلية (Smart Tooltip)
 * يظهر بشكل هادئ عند التمرير فوق العنصر بـ delay 500ms ويتموضع ديناميكياً.
 */

const props = defineProps({
  // مفتاح فريد للتلميح للتأكد من عدم ظهوره للمستخدم الذي يعرفه بالفعل
  hintKey: {
    type: String,
    required: true,
  },
  // النص المعروض
  text: {
    type: String,
    required: true,
  },
  // اتجاه الظهور الافتراضي
  placement: {
    type: String,
    default: 'top',
  },
  // هل يحتاج لتأكيد القراءة يدوياً أو يختفي بالـ hover؟
  interactive: {
    type: Boolean,
    default: false,
  },
});

const { shouldShow, markAsCompleted } = useGuidance();

const referenceEl = ref(null);
const floatingEl = ref(null);
const arrowEl = ref(null);
const isVisible = ref(false);
let hoverTimeout = null;

// التحقق هل ينبغي عرض هذا التلميح
const canShow = computed(() => shouldShow(props.hintKey));

/**
 * تحديث موضع التلميح بالاعتماد على @floating-ui/dom
 */
async function updatePosition() {
  if (!referenceEl.value || !floatingEl.value) return;

  const { x, y, placement, middlewareData } = await computePosition(
    referenceEl.value,
    floatingEl.value,
    {
      placement: props.placement,
      middleware: [
        offset(8), // مسافة عن العنصر
        flip(),    // قلب الاتجاه إذا لم تتوفر مساحة
        shift({ padding: 5 }), // إزاحة لتجنب الخروج عن حواف الشاشة
        arrow({ element: arrowEl.value }), // سهم التلميح
      ],
    }
  );

  Object.assign(floatingEl.value.style, {
    left: `${x}px`,
    top: `${y}px`,
  });

  // تموضع السهم
  if (middlewareData.arrow && arrowEl.value) {
    const { x: arrowX, y: arrowY } = middlewareData.arrow;
    const staticSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }[placement.split('-')[0]];

    Object.assign(arrowEl.value.style, {
      left: arrowX != null ? `${arrowX}px` : '',
      top: arrowY != null ? `${arrowY}px` : '',
      right: '',
      bottom: '',
      [staticSide]: '-4px', // موضع خارج التلميح
    });
  }
}

function showTooltip() {
  if (!canShow.value) return;
  
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    isVisible.value = true;
    // ننتظر الـ rendering لموضع التلميح
    setTimeout(updatePosition, 0);
  }, 500); // 500ms delay لمنع الإزعاج عند المرور السريع
}

function hideTooltip() {
  clearTimeout(hoverTimeout);
  if (!props.interactive) {
    isVisible.value = false;
  }
}

/**
 * تسجيل التلميح كمقروء عند الضغط عليه أو التفاعل معه لمنع تكراره
 */
async function markRead() {
  isVisible.value = false;
  await markAsCompleted(props.hintKey, false);
}

// مراقبة مرونة التموضع عند تغيير النافذة أو السكرول
onMounted(() => {
  if (referenceEl.value) {
    // ربط الأحداث
    referenceEl.value.addEventListener('mouseenter', showTooltip);
    referenceEl.value.addEventListener('mouseleave', hideTooltip);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
  }
});

onUnmounted(() => {
  clearTimeout(hoverTimeout);
  if (referenceEl.value) {
    referenceEl.value.removeEventListener('mouseenter', showTooltip);
    referenceEl.value.removeEventListener('mouseleave', hideTooltip);
  }
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
});
</script>

<template>
  <div class="smart-tooltip-wrapper">
    <!-- العنصر المرجعي الذي يلتف حوله التلميح -->
    <div ref="referenceEl" class="tooltip-trigger">
      <slot />
    </div>

    <!-- صندوق التلميح الطائر -->
    <div
      v-if="isVisible && canShow"
      ref="floatingEl"
      class="smart-tooltip-box animate-fade-in"
    >
      <div class="tooltip-content">
        <span>{{ text }}</span>
        <button v-if="interactive" class="tooltip-close-btn" @click="markRead">
          ✓ فهمت
        </button>
      </div>
      <div ref="arrowEl" class="tooltip-arrow"></div>
    </div>
  </div>
</template>

<style scoped>
.smart-tooltip-wrapper {
  display: inline-block;
  position: relative;
}

.tooltip-trigger {
  display: inline-block;
}

/* تصميم زجاجي فاخر للتلميحات (Glassmorphism) */
.smart-tooltip-box {
  position: fixed; /* استخدام fixed لتجنب مشاكل overflow الأب */
  z-index: 2000;
  background: rgba(18, 18, 24, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f1f3f9;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  max-width: 250px;
  direction: rtl;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.4;
}

.tooltip-close-btn {
  align-self: flex-end;
  background: var(--v-primary-base, #1867c0);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.tooltip-close-btn:hover {
  opacity: 0.9;
}

.tooltip-arrow {
  position: absolute;
  background: rgba(18, 18, 24, 0.85);
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  border: 1px solid transparent;
}

/* السهم يتبع اتجاه الظهور */
.smart-tooltip-box[style*="top"] .tooltip-arrow {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

/* أنيميشن دخول ناعم */
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
