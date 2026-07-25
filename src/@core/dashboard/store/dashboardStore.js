// يدير بيئة تشغيل لوحة التحكم (Dashboard Runtime) ويتحكم بتفصيل التخطيطات المسطحة وتوزيع البيانات وعقود المكونات.
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUIPreferencesStore } from '@/stores/uiPreferences';
import { useUserStore } from '@/stores/user';
import widgetRegistry from '../registry/WidgetRegistry';
import dashboardRegistry from '../registry/DashboardRegistry';
import dashboardDataService from '../services/DashboardDataService';

export const useDashboardStore = defineStore('dashboardEngine', () => {
  const uiPrefsStore = useUIPreferencesStore();
  const userStore = useUserStore();

  const dashboardId = ref('');
  const packageName = ref('');
  const designMode = ref(false);
  const layout = ref(null);
  const loading = ref(false);

  // تخزين البيانات واللودرز مركزيًا على مستوى مساحة العمل (Dashboard Runtime)
  const dashboardData = ref({});
  const widgetLoadingStates = ref({});

  // إرجاع الصلاحيات الحالية النشطة للمستخدم
  const userPermissions = computed(() => {
    return userStore.permissions || [];
  });

  // إرجاع المكونات المتاحة للمستخدم بناءً على صلاحياته والباقة
  const availableWidgets = computed(() => {
    return widgetRegistry.getAvailableWidgets(userPermissions.value, packageName.value);
  });

  let currentRequestId = 0;

  let currentBatchRequestId = 0;
  const instanceRequestIds = ref({});

  /**
   * جلب البيانات مركزياً لكافة المكونات المفعلة باللوحة (Shared Batch Fetch)
   * @param {Object} filters فلاتر التصفية (مثل period)
   */
  const fetchAllWidgetsData = async (filters = {}) => {
    if (!layout.value || !layout.value.widgetInstances) return;

    const requestId = ++currentBatchRequestId;
    const activeInstances = layout.value.widgetInstances.filter(wi => wi.visible !== false);
    
    // تعيين حالة التحميل لكافة المكونات النشطة إلى true
    activeInstances.forEach(inst => {
      widgetLoadingStates.value[inst.id] = true;
    });

    try {
      const dataResults = await dashboardDataService.fetchDashboardData(activeInstances, filters);
      
      if (requestId !== currentBatchRequestId) {
        // إهمال الاستجابة بسبب تداخل وتزامن طلبات الفلاتر الأحدث
        return;
      }

      // دمج وتحديث البيانات المستلمة بالكامل
      if (dataResults) {
        dashboardData.value = {
          ...dashboardData.value,
          ...dataResults
        };
      }
    } catch (error) {
      console.error('[DashboardRuntime] فشل تحديث بيانات المكونات المشتركة:', error);
    } finally {
      if (requestId === currentBatchRequestId) {
        // إغلاق شاشات التحميل للمكونات النشطة فقط للطلب الأخير
        activeInstances.forEach(inst => {
          widgetLoadingStates.value[inst.id] = false;
        });
      }
    }
  };

  /**
   * جلب البيانات لويدجت واحدة بشكل منفصل وعبر الـ Data Service
   * @param {string} instanceId معرف نسخة المكون
   * @param {Object} filters فلاتر التصفية
   */
  const fetchWidgetData = async (instanceId, filters = {}) => {
    if (!layout.value || !layout.value.widgetInstances) return;

    const instance = layout.value.widgetInstances.find(wi => wi.id === instanceId);
    if (!instance) return;

    const instReqId = (instanceRequestIds.value[instanceId] || 0) + 1;
    instanceRequestIds.value[instanceId] = instReqId;
    widgetLoadingStates.value[instanceId] = true;

    try {
      const dataResults = await dashboardDataService.fetchDashboardData([instance], filters);
      
      if (instReqId !== instanceRequestIds.value[instanceId]) {
        return;
      }

      if (dataResults && dataResults[instanceId] !== undefined) {
        dashboardData.value = {
          ...dashboardData.value,
          [instanceId]: dataResults[instanceId]
        };
      }
    } catch (error) {
      console.error(`[DashboardRuntime] فشل تحديث بيانات المكون ${instanceId}:`, error);
    } finally {
      if (instReqId === instanceRequestIds.value[instanceId]) {
        widgetLoadingStates.value[instanceId] = false;
      }
    }
  };

  /**
   * تحميل تخطيط الداشبورد وتفضيلاته
   * @param {string} id معرف لوحة التحكم
   */
  const loadDashboard = async (id, filters = {}) => {
    dashboardId.value = id;
    loading.value = true;

    try {
      packageName.value = dashboardRegistry.resolvePackageForUser(userStore);

      const prefKey = `dashboard.${id}`;
      await uiPrefsStore.loadPreferences(prefKey);
      
      const savedPref = uiPrefsStore.getPreference(prefKey);

      if (savedPref) {
        layout.value = savedPref;
      } else {
        const defaultPack = dashboardRegistry.getPackage(packageName.value);
        if (defaultPack) {
          layout.value = JSON.parse(JSON.stringify(defaultPack));
        } else {
          layout.value = {
            dashboardId: id,
            companyId: userStore.currentUser?.active_company_id || '',
            version: '2.0.0',
            widgetInstances: []
          };
        }
      }

      // جلب البيانات مركزياً للمكونات النشطة فور اكتمال التخطيط
      await fetchAllWidgetsData(filters);
    } catch (error) {
      console.error('فشل تحميل إعدادات لوحة التحكم:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * حفظ التخطيط الحالي للوحة التحكم
   * @param {boolean} immediate الحفظ الفوري بدون debounce
   */
  const saveLayout = async (immediate = false) => {
    if (!dashboardId.value || !layout.value) return;

    try {
      const prefKey = `dashboard.${dashboardId.value}`;
      layout.value.version = '2.0.0';
      
      await uiPrefsStore.savePreference(prefKey, layout.value, immediate);
    } catch (error) {
      console.error('فشل حفظ تفضيلات لوحة التحكم:', error);
    }
  };

  /**
   * تصفير التخصيص والعودة للباقة الافتراضية
   */
  const resetToDefaultLayout = async (filters = {}) => {
    if (!dashboardId.value) return;
    
    loading.value = true;
    try {
      const prefKey = `dashboard.${dashboardId.value}`;
      await uiPrefsStore.resetPreference(prefKey);
      
      const defaultPack = dashboardRegistry.getPackage(packageName.value);
      if (defaultPack) {
        layout.value = JSON.parse(JSON.stringify(defaultPack));
      } else {
        layout.value = {
          dashboardId: dashboardId.value,
          companyId: userStore.currentUser?.active_company_id || '',
          version: '2.0.0',
          widgetInstances: []
        };
      }
      
      await saveLayout(true);
      // جلب البيانات للتخطيط الافتراضي الجديد
      await fetchAllWidgetsData(filters);
    } catch (error) {
      console.error('فشل إعادة ضبط لوحة التحكم:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * تفعيل/تعطيل وضع التصميم
   */
  const setDesignMode = (val) => {
    designMode.value = val;
  };

  /**
   * تحديث موقع وحجم ويدجت بعد السحب أو التكبير — نقطة التعديل الوحيدة لـ SSOT
   * أي تعديل مباشر لـ inst.x/y/w/h خارج هذه الدالة محظور وفقاً للمعمارية
   * @param {string} instanceId معرف نسخة الويدجت
   * @param {{ x: number, y: number, w: number, h: number }} position الإحداثيات والأبعاد الجديدة
   */
  const updateWidgetPosition = (instanceId, position) => {
    if (!layout.value || !layout.value.widgetInstances) return;
    const instance = layout.value.widgetInstances.find(wi => wi.id === instanceId);
    if (!instance) return;
    instance.x = position.x;
    instance.y = position.y;
    instance.w = position.w;
    instance.h = position.h;
  };

  /**
   * إخفاء/إظهار ويدجت محددة في التخطيط المسطح
   * @param {string} instanceId معرف النسخة
   * @param {boolean} visible حالة الظهور
   */
  const setWidgetVisibility = (instanceId, visible, filters = {}) => {
    if (!layout.value || !layout.value.widgetInstances) return;

    const instance = layout.value.widgetInstances.find(w => w.id === instanceId);
    if (instance) {
      instance.visible = visible;
      saveLayout(false);
      
      // إذا تمت إعادة إظهار المكون، نقوم بطلب جلب بياناته مركزياً
      if (visible) {
        fetchAllWidgetsData(filters);
      }
    }
  };

  /**
   * إعادة ضبط ويدجت فردية لقيمها الافتراضية (الحجم والإعدادات)
   * @param {string} instanceId معرف نسخة المكون
   * @param {Object} filters الفلاتر الحالية
   */
  const resetWidgetToDefault = (instanceId, filters = {}) => {
    if (!layout.value || !layout.value.widgetInstances) return null;

    const instance = layout.value.widgetInstances.find(wi => wi.id === instanceId);
    if (!instance) return null;

    const reg = widgetRegistry.get(instance.widgetId);
    if (!reg || !reg.metadata) return null;

    // استعادة الحجم والإعدادات الافتراضية للمكون
    instance.w = reg.metadata.defaultSize?.w || 3;
    instance.h = reg.metadata.defaultSize?.h || 2;
    instance.userConfig = reg.metadata.defaultConfig ? JSON.parse(JSON.stringify(reg.metadata.defaultConfig)) : {};

    saveLayout(false);

    // إعادة جلب بيانات المكون بالإعدادات الافتراضية
    fetchWidgetData(instanceId, filters);

    return {
      w: instance.w,
      h: instance.h,
      userConfig: instance.userConfig
    };
  };

  return {
    dashboardId,
    packageName,
    designMode,
    layout,
    loading,
    dashboardData,
    widgetLoadingStates,
    availableWidgets,
    loadDashboard,
    fetchAllWidgetsData,
    fetchWidgetData,
    saveLayout,
    resetToDefaultLayout,
    resetWidgetToDefault,
    setDesignMode,
    setWidgetVisibility,
    updateWidgetPosition
  };
});
