import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axios.config';
import { useUserStore } from './user';

/**
 * مخزن Pinia لإدارة تفضيلات واجهة المستخدم والجداول للشركة والمستخدم الحاليين.
 */
export const useUIPreferencesStore = defineStore('uiPreferences', () => {
  const preferences = ref({});
  const debounceTimers = {};

  // دالة مساعدة لتوليد مفتاح الكاش الفريد في LocalStorage
  const getCacheKey = (userId, companyId, tableKey) => {
    return `ui_pref_${userId}_${companyId}_${tableKey}`;
  };

  /**
   * جلب التفضيلات لجدول أو مجموعة جداول باستخدام Stale-While-Revalidate
   */
  const loadPreferences = async (tableKeys = []) => {
    if (!Array.isArray(tableKeys)) {
      tableKeys = [tableKeys];
    }

    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;
    const companyId = userStore.currentUser?.active_company_id;

    if (!userId || !companyId) return;

    // 1. تحميل التفضيلات من LocalStorage فوراً (Stale) لسرعة العرض
    const keysToFetch = [];
    tableKeys.forEach(key => {
      const cacheKey = getCacheKey(userId, companyId, key);
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          preferences.value = {
            ...preferences.value,
            [key]: JSON.parse(cached)
          };
        } catch (e) {
          console.error(`Failed to parse cached preferences for key: ${key}`, e);
        }
      }

      // سنقوم بجلب أحدث البيانات من السيرفر دائماً للتأكد من المزامنة
      keysToFetch.push(key);
    });

    if (keysToFetch.length === 0) return;

    // 2. جلب البيانات من السيرفر بالخلفية (Revalidate)
    try {
      const response = await apiClient.get('ui-preferences', {
        params: { keys: keysToFetch.join(',') }
      });

      const serverPrefs = response.data?.data || {};

      tableKeys.forEach(key => {
        const serverPref = serverPrefs[key];
        const cacheKey = getCacheKey(userId, companyId, key);

        if (serverPref) {
          const cachedPref = preferences.value[key];

          // مزامنة التفضيلات إذا كانت نسخة السيرفر أحدث أو غير موجودة محلياً
          if (!cachedPref || serverPref.updated_at !== cachedPref.updated_at) {
            preferences.value = {
              ...preferences.value,
              [key]: serverPref
            };
            localStorage.setItem(cacheKey, JSON.stringify(serverPref));
          }
        }
      });
    } catch (error) {
      console.error('Failed to revalidate UI preferences from server:', error);
    }
  };

  /**
   * جلب تفضيلات جدول واحد بشكل متزامن من المخزن الحالي
   */
  const getPreference = (tableKey) => {
    return preferences.value[tableKey] || null;
  };

  /**
   * حفظ أو تحديث تفضيلات جدول محدد فوراً محلياً وبشكل Debounced على السيرفر
   */
  const savePreference = (tableKey, prefData) => {
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;
    const companyId = userStore.currentUser?.active_company_id;

    if (!userId || !companyId) return;

    const cacheKey = getCacheKey(userId, companyId, tableKey);
    const updatedPref = {
      ...prefData,
      updated_at: new Date().toISOString()
    };

    // 1. تحديث Pinia و LocalStorage فوراً لتجربة مستخدم لحظية
    preferences.value = {
      ...preferences.value,
      [tableKey]: updatedPref
    };
    localStorage.setItem(cacheKey, JSON.stringify(updatedPref));

    // 2. تحديث السيرفر بطريقة Debounced لتقليل الضغط
    if (debounceTimers[tableKey]) {
      clearTimeout(debounceTimers[tableKey]);
    }

    debounceTimers[tableKey] = setTimeout(async () => {
      try {
        await apiClient.post('ui-preferences', {
          table_key: tableKey,
          preferences: updatedPref
        });
        delete debounceTimers[tableKey];
      } catch (error) {
        console.error(`Failed to save preferences to server for ${tableKey}:`, error);
      }
    }, 1500);
  };

  /**
   * إعادة ضبط تفضيلات جدول محدد للحالة الافتراضية
   */
  const resetPreference = async (tableKey) => {
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;
    const companyId = userStore.currentUser?.active_company_id;

    if (!userId || !companyId) return;

    const cacheKey = getCacheKey(userId, companyId, tableKey);

    // 1. حذف محلي فوري
    const updated = { ...preferences.value };
    delete updated[tableKey];
    preferences.value = updated;
    localStorage.removeItem(cacheKey);

    // 2. طلب حذف من السيرفر
    try {
      if (debounceTimers[tableKey]) {
        clearTimeout(debounceTimers[tableKey]);
        delete debounceTimers[tableKey];
      }
      await apiClient.delete(`ui-preferences/${tableKey}`);
    } catch (error) {
      console.error(`Failed to reset preferences on server for ${tableKey}:`, error);
    }
  };

  /**
   * إعادة ضبط كافة تفضيلات المستخدم للشركة الحالية
   */
  const resetAllPreferences = async () => {
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;
    const companyId = userStore.currentUser?.active_company_id;

    if (!userId || !companyId) return;

    // 1. مسح جميع تفضيلات الجداول محلياً
    preferences.value = {};

    // البحث عن جميع مفاتيح التفضيلات وحذفها من LocalStorage
    const prefix = `ui_pref_${userId}_${companyId}_`;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 2. إرسال طلب إعادة ضبط كلي للسيرفر
    try {
      // إيقاف أي مؤقتات حفظ جارية
      Object.keys(debounceTimers).forEach(k => {
        clearTimeout(debounceTimers[k]);
        delete debounceTimers[k];
      });

      await apiClient.post('ui-preferences/reset-all');
    } catch (error) {
      console.error('Failed to reset all preferences on server:', error);
    }
  };

  /**
   * دالة المزامنة الفورية عند التغيير السريع للشركات أو تسجيل الخروج (Flush pending saves)
   */
  const flushPendingSaves = async () => {
    const pendingKeys = Object.keys(debounceTimers);
    if (pendingKeys.length === 0) return;

    const promises = pendingKeys.map(async (key) => {
      clearTimeout(debounceTimers[key]);
      const pref = preferences.value[key];
      delete debounceTimers[key];
      if (pref) {
        try {
          await apiClient.post('ui-preferences', {
            table_key: key,
            preferences: pref
          });
        } catch (e) {
          console.error(`Failed to flush preferences for ${key}:`, e);
        }
      }
    });

    await Promise.all(promises);
  };

  return {
    preferences,
    loadPreferences,
    getPreference,
    savePreference,
    resetPreference,
    resetAllPreferences,
    flushPendingSaves
  };
});
