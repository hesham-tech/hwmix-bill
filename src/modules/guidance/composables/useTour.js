import { ref, computed } from 'vue';
import { useGuidance } from './useGuidance';

// الحالات المشتركة بين المكونات للجولة النشطة حالياً
const activeTourKey = ref(null);
const activeTourSteps = ref([]);
const currentStepIndex = ref(-1);
const isActive = ref(false);

/**
 * دالة تركيب برمجية (Composable) لإدارة سير وخطوات الجولات التعريفية التفاعلية النشطة.
 */
export function useTour() {
  const { markAsCompleted, shouldShow } = useGuidance();

  const activeStep = computed(() => {
    if (currentStepIndex.value >= 0 && currentStepIndex.value < activeTourSteps.value.length) {
      return activeTourSteps.value[currentStepIndex.value];
    }
    return null;
  });

  const hasNext = computed(() => {
    return currentStepIndex.value < activeTourSteps.value.length - 1;
  });

  const hasPrev = computed(() => {
    return currentStepIndex.value > 0;
  });

  /**
   * تشغيل جولة تعريفية جديدة.
   * @param {Object} tourConfig - إعدادات الجولة (الخطوات)
   * @param {String} tourKey - المفتاح التعريفي للجولة (مثال: 'tour.dashboard')
   * @param {Boolean} force - تشغيلها إجبارياً حتى لو تم إكمالها مسبقاً (مثلاً من الإعدادات)
   */
  function startTour(tourConfig, tourKey, force = false) {
    if (!force && !shouldShow(tourKey)) {
      return false;
    }

    if (!tourConfig || !tourConfig.steps || tourConfig.steps.length === 0) {
      console.warn(`Tour "${tourKey}" configuration is invalid or empty.`);
      return false;
    }

    activeTourKey.value = tourKey;
    activeTourSteps.value = tourConfig.steps;
    currentStepIndex.value = 0;
    isActive.value = true;
    return true;
  }

  /**
   * الانتقال للخطوة التالية.
   */
  function nextStep() {
    if (hasNext.value) {
      currentStepIndex.value++;
    } else {
      endTour(false);
    }
  }

  /**
   * الانتقال للخطوة السابقة.
   */
  function prevStep() {
    if (hasPrev.value) {
      currentStepIndex.value--;
    }
  }

  /**
   * إنهاء الجولة التعريفية الحالية وحفظ النتيجة.
   * @param {Boolean} skipped - هل تخطاها المستخدم أم أكملها؟
   */
  async function endTour(skipped = false) {
    if (!isActive.value) return;

    const key = activeTourKey.value;
    isActive.value = false;
    currentStepIndex.value = -1;
    activeTourSteps.value = [];
    activeTourKey.value = null;

    if (key) {
      await markAsCompleted(key, skipped);
    }
  }

  return {
    isActive,
    activeTourKey,
    activeTourSteps,
    currentStepIndex,
    activeStep,
    hasNext,
    hasPrev,
    startTour,
    nextStep,
    prevStep,
    endTour,
  };
}
