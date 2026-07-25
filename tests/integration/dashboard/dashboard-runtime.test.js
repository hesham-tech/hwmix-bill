// اختبار التكامل لمحرك لوحة التحكم والتأكد من ترابط وتكامل الطبقات والتزامن ومنع Race Conditions
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore';
import providerRegistry from '@core/dashboard/providers/ProviderRegistry';
import { ApiDataProvider } from '@core/dashboard/providers/ApiDataProvider';
import { CacheDataProvider } from '@core/dashboard/providers/CacheDataProvider';
import apiClient from '@/api/axios.config';
import widgetRegistry from '@core/dashboard/registry/WidgetRegistry';
import dashboardDataService from '@core/dashboard/services/DashboardDataService';

describe('Dashboard Runtime Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // تسجيل الموفرين الفعليين بالسجل للاختبار التكاملي
    providerRegistry.providers = new Map();
    providerRegistry.register('api', new ApiDataProvider());
    providerRegistry.register('cache', new CacheDataProvider());
  });

  it('يجب أن تتدفق البيانات بنجاح من الموفر إلى المتجر عند استدعاء fetchWidgetData', async () => {
    vi.spyOn(widgetRegistry, 'get').mockReturnValue({
      id: 'tasks-widget-type',
      metadata: {
        dataContract: { domain: 'tasks', indicators: ['tasks'] }
      }
    });

    const store = useDashboardStore();
    const mockResponse = { data: [{ id: 1, title: 'Tasks list' }] };
    apiClient.get.mockResolvedValue(mockResponse);

    store.layout = {
      widgetInstances: [
        { id: 'tasks-widget', widgetId: 'tasks-widget-type', visible: true }
      ]
    };

    await store.fetchWidgetData('tasks-widget', { period: 'today' });

    // التأكد من استدعاء الشبكة بالـ endpoint الصحيح
    expect(apiClient.get).toHaveBeenCalledWith('tasks', expect.any(Object));

    // التأكد من استقرار البيانات بداخل المتجر
    expect(store.dashboardData['tasks-widget']).toEqual([{ id: 1, title: 'Tasks list' }]);
    expect(store.widgetLoadingStates['tasks-widget']).toBe(false);
  });

  it('يجب إهمال استجابات الفلاتر القديمة المتأخرة ومنع الـ Race Condition عند تبديل الفلاتر بسرعة', async () => {
    vi.spyOn(widgetRegistry, 'get').mockReturnValue({
      id: 'kpi-card',
      metadata: {
        dataContract: { domain: 'invoices', indicators: ['summary'] }
      }
    });

    const store = useDashboardStore();
    store.layout = {
      widgetInstances: [
        { id: 'kpi-instance', widgetId: 'kpi-card', visible: true }
      ]
    };

    // إعداد محاكاة طلبين:
    // الطلب الأول (Today): يتأخر بـ 150ms ويرجع أرباح 100
    // الطلب الثاني (Month): يرجع فوراً ويرجع أرباح 500
    let firstCallResolve;
    const firstCallPromise = new Promise(resolve => {
      firstCallResolve = () => resolve({ data: { summary: { net_profit: 100 } } });
    });

    apiClient.get
      .mockImplementationOnce(() => firstCallPromise) // الطلب الأول المؤجل
      .mockResolvedValueOnce({ data: { summary: { net_profit: 500 } } }); // الطلب الثاني الفوري

    // إطلاق الطلب الأول (Today)
    const p1 = store.fetchAllWidgetsData({ period: 'today' });

    // إطلاق الطلب الثاني الفوري (Month) بعد 10ms مباشرة
    const p2 = store.fetchAllWidgetsData({ period: 'month' });

    // انتظار اكتمال الطلب الثاني أولاً
    await p2;

    // تلبية وحل الطلب الأول المتأخر الآن
    firstCallResolve();
    await p1;

    // التحقق من أن بيانات المتجر تحتوي على قيمة الطلب الأخير (Month = 500)
    // وتم إهمال وإسقاط استجابة الطلب الأول المتأخر (Today = 100) لمنع الـ Race Condition
    expect(store.dashboardData['kpi-instance']).toEqual({ summary: { net_profit: 500 } });
  });
});
