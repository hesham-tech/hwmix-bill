// اختبارات خدمة البيانات للداشبورد للتحقق من الكاش ودمج الطلبات ومعالجة المزامنة والـ forceRefresh
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardDataService } from '../../../src/@core/dashboard/services/DashboardDataService';
import providerRegistry from '../../../src/@core/dashboard/providers/ProviderRegistry';
import { ApiDataProvider } from '../../../src/@core/dashboard/providers/ApiDataProvider';
import widgetRegistry from '../../../src/@core/dashboard/registry/WidgetRegistry';

vi.mock('@core/dashboard/providers/ProviderRegistry.js', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('DashboardDataService Unit Tests', () => {
  let service;
  let mockApiProvider;
  let mockCacheProvider;

  beforeEach(() => {
    service = new DashboardDataService();
    vi.clearAllMocks();

    mockApiProvider = Object.create(ApiDataProvider.prototype);
    mockApiProvider.fetchData = vi.fn().mockResolvedValue({ source: 'api', data: { revenue: 500 } });

    mockCacheProvider = {
      fetchData: vi.fn().mockResolvedValue(null),
      saveToCache: vi.fn(),
      invalidate: vi.fn(),
      invalidateAll: vi.fn()
    };

    providerRegistry.get.mockImplementation((name) => {
      if (name === 'api') return mockApiProvider;
      if (name === 'cache') return mockCacheProvider;
    });
  });

  it('يجب حساب توقيع الطلب الفريد بدقة بناءً على المؤشرات والفلاتر لمنع التداخل', () => {
    const indicators = ['revenue'];
    const filters = { period: 'today', branch_id: 2 };

    const signature1 = service.generateRequestSignature(indicators, filters);
    const signature2 = service.generateRequestSignature(indicators, { ...filters });
    const signature3 = service.generateRequestSignature(indicators, { period: 'month' });

    expect(signature1).toBe(signature2);
    expect(signature1).not.toBe(signature3);
  });

  it('يجب دمج الطلبات المتطابقة الصادرة بالتزامن لمنع إرسال طلبات مكررة للسيرفر', async () => {
    vi.spyOn(widgetRegistry, 'get').mockReturnValue({
      id: 'invoice-widget-type',
      metadata: {
        dataContract: { domain: 'invoices', indicators: ['revenue'] }
      }
    });

    const widgets = [
      { id: 'w1', widgetId: 'invoice-widget-type', visible: true },
      { id: 'w2', widgetId: 'invoice-widget-type', visible: true }
    ];

    const results = await service.fetchDashboardData(widgets, { period: 'today' });

    // يجب استدعاء الموفر مرة واحدة فقط للطلب المجمع
    expect(mockApiProvider.fetchData).toHaveBeenCalledTimes(1);
    expect(results['w1']).toEqual({ revenue: 500 });
    expect(results['w2']).toEqual({ revenue: 500 });
  });

  it('يجب قراءة البيانات من الكاش مباشرة عند حدوث Cache Hit دون استدعاء الـ API', async () => {
    vi.spyOn(widgetRegistry, 'get').mockReturnValue({
      id: 'invoice-widget-type',
      metadata: {
        dataContract: { domain: 'invoices', indicators: ['revenue'] }
      }
    });

    const widgets = [{ id: 'w1', widgetId: 'invoice-widget-type', visible: true }];

    // محاكاة وجود بيانات بالكاش
    mockCacheProvider.fetchData.mockResolvedValue({ source: 'cache', signature: 'sig', data: { revenue: 300 } });

    const results = await service.fetchDashboardData(widgets, { period: 'today' });

    expect(mockCacheProvider.fetchData).toHaveBeenCalledTimes(1);
    expect(mockApiProvider.fetchData).not.toHaveBeenCalled();
    expect(results['w1']).toEqual({ revenue: 300 });
  });

  it('يجب استدعاء الـ API وحفظ البيانات بالكاش عند حدوث Cache Miss', async () => {
    vi.spyOn(widgetRegistry, 'get').mockReturnValue({
      id: 'invoice-widget-type',
      metadata: {
        dataContract: { domain: 'invoices', indicators: ['revenue'] }
      }
    });

    const widgets = [{ id: 'w1', widgetId: 'invoice-widget-type', visible: true }];

    // محاكاة غياب الكاش
    mockCacheProvider.fetchData.mockResolvedValue(null);

    const results = await service.fetchDashboardData(widgets, { period: 'today' });

    expect(mockApiProvider.fetchData).toHaveBeenCalledTimes(1);
    expect(mockCacheProvider.saveToCache).toHaveBeenCalledWith(expect.any(String), { revenue: 500 });
    expect(results['w1']).toEqual({ revenue: 500 });
  });

  it('يجب تجاوز الكاش وإرسال طلب للـ API مباشرة عند تمرير خيار forceRefresh بالـ filters', async () => {
    vi.spyOn(widgetRegistry, 'get').mockReturnValue({
      id: 'invoice-widget-type',
      metadata: {
        dataContract: { domain: 'invoices', indicators: ['revenue'] }
      }
    });

    const widgets = [{ id: 'w1', widgetId: 'invoice-widget-type', visible: true }];

    // محاكاة وجود كاش مخزن مسبقاً بالذاكرة
    mockCacheProvider.fetchData.mockResolvedValue({ source: 'cache', signature: 'sig', data: { revenue: 300 } });

    // طلب البيانات مع تمرير فلتر forceRefresh: true
    const results = await service.fetchDashboardData(widgets, { period: 'today', forceRefresh: true });

    // يجب عدم استخدام الكاش المخزن والتوجيه المباشر لخادم الـ API
    expect(mockApiProvider.fetchData).toHaveBeenCalledTimes(1);
    expect(results['w1']).toEqual({ revenue: 500 });
  });

  it('يجب إبطال الكاش المخصص أو الكامل بنجاح عند طلب التطهير', () => {
    service.invalidateCache('sig-1');
    expect(mockCacheProvider.invalidate).toHaveBeenCalledWith('sig-1');

    service.invalidateCache();
    expect(mockCacheProvider.invalidateAll).toHaveBeenCalled();
  });
});
