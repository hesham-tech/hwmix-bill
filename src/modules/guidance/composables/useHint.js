import { ref, computed } from 'vue';
import { useGuidance } from './useGuidance';

const activeHint = ref(null);

/**
 * دالة تركيب برمجية (Composable) لإدارة وعرض التلميحات الذكية المخصصة للصفحات.
 */
export function useHint() {
  const { markAsCompleted, shouldShow } = useGuidance();

  const currentHint = computed(() => activeHint.value);

  /**
   * التحقق من شروط إظهار التلميح اليومي.
   */
  function canShowHint(hintKey) {
    // 1. فحص هل الخطوة مكتملة أو معطلة
    if (!shouldShow(hintKey)) return false;

    // 2. فحص الحد اليومي (تلميح واحد بحد أقصى في اليوم)
    const todayStr = new Date().toDateString();
    const lastHintDate = localStorage.getItem('guidance_last_hint_date');
    if (lastHintDate === todayStr) {
      return false; // تم إظهار تلميح بالفعل اليوم
    }

    return true;
  }

  /**
   * إظهار تلميح محدد إذا وافق الشروط.
   * @param {Object} hintData - بيانات التلميح (key, title, content)
   */
  function showHint(hintData) {
    if (!hintData || !hintData.key) return false;

    if (!canShowHint(hintData.key)) {
      return false;
    }

    activeHint.value = hintData;

    // تسجيل إظهار التلميح لليوم الحالي لمنع إزعاج المستخدم بتلميح آخر اليوم
    const todayStr = new Date().toDateString();
    localStorage.setItem('guidance_last_hint_date', todayStr);
    return true;
  }

  /**
   * إغلاق التلميح الحالي وحفظه كمنتهي/مقروء لمنع تكراره.
   */
  async function dismissHint() {
    if (!activeHint.value) return;

    const key = activeHint.value.key;
    activeHint.value = null;

    if (key) {
      await markAsCompleted(key, false);
    }
  }

  return {
    currentHint,
    showHint,
    dismissHint,
    canShowHint,
  };
}
