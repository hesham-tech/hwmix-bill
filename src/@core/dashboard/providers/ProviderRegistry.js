import apiDataProvider from './ApiDataProvider';
import cacheDataProvider from './CacheDataProvider';

// سجل استراتيجيات موفري البيانات للوحة التحكم لتطبيق مبدأ المكون المفتوح/المغلق.
export class ProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  /**
   * تسجيل موفر بيانات جديد بالسجل
   * @param {string} name اسم الموفر
   * @param {Object} providerInstance نسخة الموفر الممتثل للواجهة
   */
  register(name, providerInstance) {
    this.providers.set(name, providerInstance);
  }

  /**
   * جلب موفر البيانات بالاسم
   * @param {string} name اسم الموفر
   * @returns {Object}
   */
  get(name) {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`موفر البيانات ذو الاسم '${name}' غير مسجل بالسجل.`);
    }
    return provider;
  }
}

// تصدير نسخة عامة وحيدة للاستخدام على مستوى النظام وتثبيت الاستراتيجيات الأساسية
const providerRegistryInstance = new ProviderRegistry();
providerRegistryInstance.register('api', apiDataProvider);
providerRegistryInstance.register('cache', cacheDataProvider);

export default providerRegistryInstance;
