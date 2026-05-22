import vGuide from './directives/v-guide';
import { useGuidanceStore } from './store/useGuidanceStore';

/**
 * نقطة الدخول وتسجيل موديول الإرشادات والتلميحات (Guidance Module) في تطبيق Vue.
 */
export default {
  install(app) {
    // 1. تسجيل الـ directive المخصص v-guide عالمياً
    app.directive('guide', vGuide);

    // 2. تهيئة متجر الإرشادات بعد تحميل التطبيق بالكامل
    // ننتظر حتى تصبح Pinia جاهزة ونقوم بالتهيئة
    setTimeout(async () => {
      try {
        const store = useGuidanceStore();
        await store.initGuidance();
      } catch (e) {
        console.warn('Guidance store initialization deferred:', e);
      }
    }, 1000);
  },
};
