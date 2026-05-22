import { computed } from 'vue';
import { useGuidanceStore } from '../store/useGuidanceStore';

/**
 * دالة التركيب البرمجية (Composable) الرئيسية لإدارة وفحص حالة إرشاد المستخدم في الواجهات.
 */
export function useGuidance() {
  const store = useGuidanceStore();

  const isEnabled = computed(() => store.guidanceEnabled);
  const loading = computed(() => store.loading);

  /**
   * هل ينبغي عرض هذا الإرشاد/الجولة/التلميح للمستخدم؟
   */
  function shouldShow(key) {
    return store.shouldShow(key);
  }

  /**
   * هل الخطوة مكتملة بالفعل؟
   */
  function isCompleted(key) {
    return store.isCompleted(key);
  }

  /**
   * وسم خطوة إرشادية كمنتهية.
   */
  async function markAsCompleted(key, skipped = false) {
    await store.markStepAsCompleted(key, skipped);
  }

  /**
   * إلغاء وسم خطوة إرشادية كمنتهية.
   */
  async function uncompleteStep(key) {
    await store.uncompleteStep(key);
  }

  /**
   * إعادة ضبط تقدم الإرشادات بالكامل.
   */
  async function resetProgress() {
    await store.resetProgress();
  }

  /**
   * تفعيل أو إيقاف الإرشادات.
   */
  function toggleGuidance(enabled) {
    store.setGuidanceEnabled(enabled);
  }

  return {
    store,
    isEnabled,
    loading,
    shouldShow,
    isCompleted,
    markAsCompleted,
    uncompleteStep,
    resetProgress,
    toggleGuidance,
  };
}
