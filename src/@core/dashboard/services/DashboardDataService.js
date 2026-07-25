import providerRegistry from '../providers/ProviderRegistry';
import widgetRegistry from '../registry/WidgetRegistry';

// خدمة إدارة وجلب وتجميع بيانات لوحة التحكم (Dashboard Data Service).
export class DashboardDataService {
  get apiProvider() {
    return providerRegistry.get('api');
  }

  get cacheProvider() {
    return providerRegistry.get('cache');
  }

  constructor() {
    // جلب الموفرين ديناميكياً لمنع تداخل التهيئة
  }

  /**
   * توليد توقيع الطلب الفريد بناءً على المؤشرات والفلتر الحالي والسياق التشغيلي
   * @param {Array<string>} indicators المؤشرات المطلوبة
   * @param {Object} filters فلاتر التصفية الحالية
   * @returns {string} التوقيع الفريد (Hash-like string)
   */
  generateRequestSignature(indicators, filters) {
    const sortedIndicators = [...indicators].sort().join(',');
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('&');
    return `sig_[${sortedIndicators}]_[${filterString}]`;
  }

  /**
   * جلب البيانات مجمعة وموحدة لكافة المكونات النشطة باللوحة
   * @param {Array<Object>} widgetInstances المكونات الجاري رندرتها بالصفحة
   * @param {Object} filters الفلاتر العامة المطبقة (مثل period)
   * @returns {Promise<Object>} البيانات مقسمة حسب المعرف الفريد لكل نسخة مكون
   */
  async fetchDashboardData(widgetInstances, filters = {}) {
    const results = {};
    const pendingBatches = [];

    // 1. مسح واستخراج عقود البيانات (Data Contracts) للمكونات النشطة
    const contractsMap = new Map();
    
    widgetInstances.forEach(inst => {
      const reg = widgetRegistry.get(inst.widgetId);
      // إذا كان المكون مسجلاً ولديه عقد بيانات صريح بداخل البيانات الوصفية
      if (reg && reg.metadata && reg.metadata.dataContract) {
        contractsMap.set(inst.id, {
          instanceId: inst.id,
          widgetId: inst.widgetId,
          contract: reg.metadata.dataContract,
          // استخلاص المؤشر المحدد المخزن في إعدادات المستخدم إن وجد
          indicator: inst.userConfig?.indicator || reg.metadata.defaultConfig?.indicator
        });
      }
    });

    // 2. تجميع الاحتياجات بناءً على توقيع الطلب الفريد (Deduplication & Request Signature)
    const signatureGroups = new Map();

    contractsMap.forEach((entry, instanceId) => {
      const contract = entry.contract;
      // إذا كان للمكون مؤشر فردي مخصص، نستخدمه، وإلا نستخدم مصفوفة المؤشرات الإجمالية
      const requestedIndicators = entry.indicator ? [entry.indicator] : contract.indicators || [];
      
      const sig = this.generateRequestSignature(requestedIndicators, filters);
      
      if (!signatureGroups.has(sig)) {
        signatureGroups.set(sig, {
          signature: sig,
          contract: {
            ...contract,
            indicators: requestedIndicators
          },
          instances: []
        });
      }
      signatureGroups.get(sig).instances.push(instanceId);
    });

    // 3. جلب البيانات لكل توقيع فريد بشكل ذكي (حسب الكاش أو الـ API)
    for (const [sig, group] of signatureGroups.entries()) {
      // محاولة الجلب من الكاش أولاً (إلا إذا تم إجبار التحديث اليدوي الفوري)
      const forceRefresh = filters.forceRefresh || false;
      const cached = !forceRefresh ? await this.cacheProvider.fetchData(sig, group.contract) : null;
      
      if (cached) {
        // توزيع بيانات الكاش على كافة المكونات المشتركة في هذا التوقيع فوراً
        group.instances.forEach(instId => {
          results[instId] = cached.data;
        });
        continue;
      }

      // في حال حدوث Cache Miss، نقوم بإضافة الطلب لقائمة المهام غير المتزامنة لطلبها من الخادم
      pendingBatches.push({
        signature: sig,
        group
      });
    }

    // 4. إطلاق طلبات الـ API المجمعة المتوازية
    if (pendingBatches.length > 0) {
      try {
        const fetchPromises = pendingBatches.map(async (batch) => {
          const apiResult = await this.apiProvider.fetchData(batch.signature, batch.group.contract, filters);
          
          // حفظ النتيجة في الكاش للاستخدامات اللاحقة
          this.cacheProvider.saveToCache(batch.signature, apiResult.data);

          // توزيع النتيجة على المكونات المشتركة
          batch.group.instances.forEach(instId => {
            results[instId] = apiResult.data;
          });
        });

        await Promise.all(fetchPromises);
      } catch (error) {
        console.error('[DashboardDataService] فشل تحميل حزمة البيانات من السيرفر:', error);
        throw error;
      }
    }

    return results;
  }

  /**
   * إبطال كاش معين أو تطهير الكاش بالكامل
   */
  invalidateCache(signature = null) {
    if (signature) {
      this.cacheProvider.invalidate(signature);
    } else {
      this.cacheProvider.invalidateAll();
    }
  }
}

// تصدير نسخة وحيدة للاستخدام
const dashboardDataServiceInstance = new DashboardDataService();
export default dashboardDataServiceInstance;
