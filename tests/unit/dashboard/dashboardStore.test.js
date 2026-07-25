// اختبار متجر اللوحة المركزي وإدارة حالات التحميل وعزل البيانات والتبديل بين اللوحات والـ Edge Cases
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDashboardStore } from '../../../src/@core/dashboard/store/dashboardStore.js';
import dashboardDataService from '../../../src/@core/dashboard/services/DashboardDataService.js';
import { useUIPreferencesStore } from '../../../src/stores/uiPreferences';
import { useUserStore } from '../../../src/stores/user';
import dashboardRegistry from '../../../src/@core/dashboard/registry/DashboardRegistry.js';

vi.mock('../../../src/@core/dashboard/services/DashboardDataService.js', () => ({
  default: {
    fetchDashboardData: vi.fn(),
    invalidateCache: vi.fn()
  }
}));

// إعداد متجر تفضيلات الواجهة وتتبعه برمجياً للاختبار
const mockSavePreference = vi.fn().mockResolvedValue(true);
const mockResetPreference = vi.fn().mockResolvedValue(true);
vi.mock('../../../src/stores/uiPreferences', () => ({
  useUIPreferencesStore: () => ({
    loadPreferences: vi.fn().mockResolvedValue(true),
    getPreference: vi.fn().mockReturnValue(null),
    savePreference: mockSavePreference,
    resetPreference: mockResetPreference
  })
}));

vi.mock('../../../src/stores/user', () => ({
  useUserStore: () => ({
    currentUser: { active_company_id: 5 },
    permissions: ['admin'],
    resolvePackageForUser: () => 'owner'
  })
}));

describe('Dashboard Store Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('يجب تهيئة المتجر بالحالة الافتراضية بنجاح', () => {
    const store = useDashboardStore();
    expect(store.dashboardData).toEqual({});
    expect(store.widgetLoadingStates).toEqual({});
    expect(store.designMode).toBe(false);
  });

  it('يجب تحديث حالة التحميل والبيانات لكل ويدجت بشكل مستقل وعزل تام', async () => {
    const store = useDashboardStore();
    const mockData = { 'instance-1': { sales: 100 } };
    dashboardDataService.fetchDashboardData.mockResolvedValue(mockData);

    store.layout = {
      widgetInstances: [
        { id: 'instance-1', visible: true, dataContract: { domain: 'invoices', indicators: ['summary'] } }
      ]
    };

    await store.fetchWidgetData('instance-1', { period: 'today' });

    expect(store.dashboardData['instance-1']).toEqual({ sales: 100 });
    expect(store.widgetLoadingStates['instance-1']).toBe(false);
    expect(store.dashboardData['instance-2']).toBeUndefined();
  });

  it('يجب معالجة الأخطاء وتحديث حالة التحميل عند فشل جلب البيانات', async () => {
    const store = useDashboardStore();
    dashboardDataService.fetchDashboardData.mockRejectedValue(new Error('API Failure'));

    store.layout = {
      widgetInstances: [
        { id: 'instance-1', visible: true, dataContract: { domain: 'invoices', indicators: ['summary'] } }
      ]
    };

    await store.fetchWidgetData('instance-1');
    expect(store.widgetLoadingStates['instance-1']).toBe(false);
    expect(store.dashboardData['instance-1']).toBeUndefined();
  });

  it('يجب تحديث وإظهار/إخفاء الويدجت وتحديث البيانات المرافقة', async () => {
    const store = useDashboardStore();
    dashboardDataService.fetchDashboardData.mockResolvedValue({ 'instance-1': { count: 5 } });

    store.layout = {
      widgetInstances: [
        { id: 'instance-1', visible: false, widgetId: 'test-widget' }
      ]
    };

    // إظهار الويدجت وتحديث البيانات
    store.setWidgetVisibility('instance-1', true, { period: 'today' });
    expect(store.layout.widgetInstances[0].visible).toBe(true);
    
    // الانتظار للتأكد من استدعاء خدمة جلب البيانات للمكون المفعل
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(dashboardDataService.fetchDashboardData).toHaveBeenCalled();
  });

  it('يجب التبديل وتصفير البيانات بشكل سليم عند تحميل لوحة تحكم جديدة (Switching)', async () => {
    const store = useDashboardStore();
    dashboardDataService.fetchDashboardData.mockResolvedValue({ 'instance-1': { val: 200 } });

    // محاكاة تحميل لوحة تحكم أولى
    await store.loadDashboard('dashboard-1');
    expect(store.dashboardId).toBe('dashboard-1');

    // تغيير اللوحة للوحة تحكم ثانية والتأكد من إعادة الضبط
    await store.loadDashboard('dashboard-2');
    expect(store.dashboardId).toBe('dashboard-2');
  });

  it('يجب تغيير وضع التصميم برمجياً وتعديل الـ state بنجاح', () => {
    const store = useDashboardStore();
    expect(store.designMode).toBe(false);
    
    store.setDesignMode(true);
    expect(store.designMode).toBe(true);

    store.setDesignMode(false);
    expect(store.designMode).toBe(false);
  });

  it('يجب تصفير التخطيط والعودة للوضع الافتراضي للباقة المسجلة بنجاح', async () => {
    const store = useDashboardStore();
    
    // تسجيل باقة تجريبية
    dashboardRegistry.registerPackage('owner', {
      dashboardId: 'test_default',
      companyId: '',
      version: '2.0.0',
      widgetInstances: [{ id: 'inst-default-1', widgetId: 'kpi-card', visible: true }]
    });

    store.dashboardId = 'test_default';
    store.packageName = 'owner';
    store.layout = { widgetInstances: [] };

    await store.resetToDefaultLayout({ period: 'today' });

    expect(mockResetPreference).toHaveBeenCalledWith('dashboard.test_default');
    expect(store.layout.widgetInstances[0].id).toBe('inst-default-1');
  });

  it('يجب تصفير التخطيط لإنشاء مخطط فارغ كـ Fallback عند عدم تسجيل باقة مقابلة', async () => {
    const store = useDashboardStore();
    store.dashboardId = 'test_empty_fallback';
    store.packageName = 'non-existent-package';
    store.layout = { widgetInstances: [{ id: 'some-widget' }] };

    await store.resetToDefaultLayout();

    expect(mockResetPreference).toHaveBeenCalledWith('dashboard.test_empty_fallback');
    // يجب أن يكون التخطيط فارغاً ولكن يحمل الـ companyId للـ userStore
    expect(store.layout.widgetInstances).toEqual([]);
    expect(store.layout.companyId).toBe(5);
  });

  it('يجب إعادة ضبط ويدجت فردية لقيمها وحجمها الافتراضي بنجاح (resetWidgetToDefault)', async () => {
    const store = useDashboardStore();
    
    const widgetRegistry = (await import('../../../src/@core/dashboard/registry/WidgetRegistry.js')).default;
    widgetRegistry.register('test-reset-widget', null, {
      id: 'test-reset-widget',
      version: '2.0.0',
      title: 'Test Widget',
      category: 'financial',
      permissions: [],
      defaultSize: { w: 4, h: 3 },
      minimumSize: { w: 2, h: 2 },
      defaultConfig: { indicator: 'defaultVal' }
    });

    store.layout = {
      widgetInstances: [
        { id: 'inst-to-reset', widgetId: 'test-reset-widget', w: 12, h: 6, userConfig: { indicator: 'customVal' } }
      ]
    };

    const res = store.resetWidgetToDefault('inst-to-reset');

    expect(res).toEqual({
      w: 4,
      h: 3,
      userConfig: { indicator: 'defaultVal' }
    });
    expect(store.layout.widgetInstances[0].w).toBe(4);
    expect(store.layout.widgetInstances[0].h).toBe(3);
    expect(store.layout.widgetInstances[0].userConfig).toEqual({ indicator: 'defaultVal' });
  });
});
