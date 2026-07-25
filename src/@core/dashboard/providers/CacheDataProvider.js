// موفر الكاش وتخزين الذاكرة المحلي الممتثل لواجهة موفري البيانات الموحدة.
export class CacheDataProvider {
  constructor() {
    this.cache = new Map();
  }

  /**
   * محاولة جلب البيانات المخزنة من كاش الذاكرة
   * @param {string} signature توقيع الطلب الفريد
   * @param {Object} contract عقد متطلبات البيانات
   * @returns {Object|null} البيانات إذا كانت صالحة، أو null إذا انتهت صلاحيتها
   */
  fetchData(signature, contract) {
    const cachedItem = this.cache.get(signature);
    if (!cachedItem) return null;

    const now = Date.now();
    const ttlMs = (contract.cacheTTL || 300) * 1000;

    if (now - cachedItem.timestamp > ttlMs) {
      // انتهت صلاحية الكاش، نقوم بحذفه وإرجاع null
      this.cache.delete(signature);
      return null;
    }

    return {
      source: 'cache',
      signature,
      data: cachedItem.data
    };
  }

  /**
   * حفظ البيانات في الكاش مع تسجيل وقت الإدخال
   * @param {string} signature توقيع الطلب الفريد
   * @param {Object} data البيانات المراد حفظها
   */
  saveToCache(signature, data) {
    this.cache.set(signature, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * إبطال كاش معين بناءً على التوقيع
   * @param {string} signature توقيع الطلب الفريد
   */
  invalidate(signature) {
    this.cache.delete(signature);
  }

  /**
   * تطهير كاش الذاكرة بالكامل
   */
  invalidateAll() {
    this.cache.clear();
  }
}

// تصدير نسخة وحيدة للاستخدام
const cacheDataProviderInstance = new CacheDataProvider();
export default cacheDataProviderInstance;
