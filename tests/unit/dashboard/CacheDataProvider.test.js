// اختبار موفر كاش الذاكرة المؤقت والتحقق من حفظ البيانات واحترام فترات الصلاحية TTL والـ Edge Cases
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheDataProvider } from '@core/dashboard/providers/CacheDataProvider.js';

describe('CacheDataProvider Unit Tests', () => {
  let provider;

  beforeEach(() => {
    provider = new CacheDataProvider();
    vi.useFakeTimers();
  });

  it('يجب حفظ وقراءة البيانات بنجاح من الكاش عند توفر توقيع الطلب', async () => {
    const contract = { domain: 'invoices', metric: 'revenue', cacheTTL: 60 };
    await provider.saveToCache('sig-1', { total: 100 }, contract);

    const cachedData = await provider.fetchData('sig-1', contract);
    expect(cachedData.data).toEqual({ total: 100 });
  });

  it('يجب أن يرجع null ويفرغ الكاش عند انتهاء فترة الصلاحية TTL', async () => {
    const contract = { domain: 'invoices', metric: 'revenue', cacheTTL: 10 }; // 10 ثوانٍ
    await provider.saveToCache('sig-1', { total: 100 }, contract);

    // تقديم الوقت بـ 11 ثانية
    vi.advanceTimersByTime(11 * 1000);

    const cachedData = await provider.fetchData('sig-1', contract);
    expect(cachedData).toBeNull();
  });

  it('يجب عزل الكاش بشكل كامل بين الفلاتر الزمنية المختلفة لمنع تداخل البيانات المالية', async () => {
    const contract = { domain: 'invoices', metric: 'revenue', cacheTTL: 60 };
    
    // حفظ كاش لفترة اليوم
    await provider.saveToCache('sig-1-today', { total: 100 }, contract);
    // حفظ كاش لفترة الشهر
    await provider.saveToCache('sig-1-month', { total: 500 }, contract);

    const cachedToday = await provider.fetchData('sig-1-today', contract);
    const cachedMonth = await provider.fetchData('sig-1-month', contract);

    expect(cachedToday.data.total).toBe(100);
    expect(cachedMonth.data.total).toBe(500);
  });

  it('يجب عزل الكاش بين لوحات التحكم المختلفة لمنع الخلط بين بيانات لوحات الساس المتعددة', async () => {
    const contract = { domain: 'finance', metric: 'profit', cacheTTL: 60 };

    await provider.saveToCache('dashboard-A-sig', { profit: 1000 }, contract);
    await provider.saveToCache('dashboard-B-sig', { profit: 2000 }, contract);

    const resA = await provider.fetchData('dashboard-A-sig', contract);
    const resB = await provider.fetchData('dashboard-B-sig', contract);

    expect(resA.data.profit).toBe(1000);
    expect(resB.data.profit).toBe(2000);
  });
});
