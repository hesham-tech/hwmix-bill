/**
 * دالة مسح ذاكرة التخزين المؤقت (Cache) والـ Service Workers لضمان تحديث النظام
 * مع الحفاظ على الـ localStorage لضمان بقاء المستخدم مسجلاً للدخول.
 */
export async function clearAppCache() {
  try {
    // 1. مسح Cache Storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // 2. إيقاف الـ Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
    }

    // 3. مسح الـ sessionStorage (بيانات مؤقتة للجلسة الحالية فقط)
    sessionStorage.clear();

    // 4. إعادة التوجه للصفحة الرئيسية وعمل ريلود إجباري
    // التوجه للهوم يضمن أننا نبدأ من نقطة نظيفة تماماً
    window.location.href = '/?clear_cache=true';
  } catch (error) {
    console.error('[Maintenance] Failed to clear cache:', error);
    // في حالة الفشل، نكتفي بعمل ريلود عادي
    window.location.reload();
  }
}
