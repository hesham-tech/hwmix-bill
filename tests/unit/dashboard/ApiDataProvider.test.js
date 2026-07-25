// اختبار موفر بيانات السيرفر والتأكد من تحديد الروابط المناسبة وتمرير الفلاتر وخرائط الاستجابة والـ Edge Cases
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiDataProvider } from '@core/dashboard/providers/ApiDataProvider.js';
import apiClient from '@/api/axios.config';

describe('ApiDataProvider Unit Tests', () => {
  let provider;

  beforeEach(() => {
    provider = new ApiDataProvider();
    vi.clearAllMocks();
  });

  it('يجب توجيه طلب المهام للـ Endpoint الصحيح واستخراج البيانات', async () => {
    const mockResponse = { data: [{ id: 1, title: 'Task 1' }] };
    apiClient.get.mockResolvedValue(mockResponse);

    const contract = { domain: 'tasks', indicators: ['tasks'] };
    const result = await provider.fetchData('sig-tasks', contract, { period: 'today' });

    expect(apiClient.get).toHaveBeenCalledWith('tasks', expect.any(Object));
    expect(result.data).toEqual([{ id: 1, title: 'Task 1' }]);
  });

  it('يجب توجيه طلب المنتجات الأكثر مبيعاً مع تمرير الـ sortBy المخصص', async () => {
    const mockResponse = { data: [{ id: 101, name: 'Product A' }] };
    apiClient.get.mockResolvedValue(mockResponse);

    const contract = { domain: 'products', indicators: ['topProducts'] };
    const result = await provider.fetchData('sig-products', contract, { sortBy: 'net_profit', period: 'month' });

    expect(apiClient.get).toHaveBeenCalledWith('analytics/top-products', expect.objectContaining({
      params: expect.objectContaining({
        sort_by: 'net_profit',
        limit: 10
      })
    }));
    expect(result.data).toEqual([{ id: 101, name: 'Product A' }]);
  });

  it('يجب توجيه طلب المدفوعات والتحصيلات القادمة (upcomingPayments) وتوجيه الاستعلام للـ invoices مع الفلاتر المحددة', async () => {
    const mockResponse = { data: [{ id: 201, total_amount: 1500 }] };
    apiClient.get.mockResolvedValue(mockResponse);

    const contract = { domain: 'invoices', indicators: ['upcomingPayments'] };
    const result = await provider.fetchData('sig-payments', contract, { period: 'month' });

    expect(apiClient.get).toHaveBeenCalledWith('invoices', expect.objectContaining({
      params: expect.objectContaining({
        payment_status: 'unpaid,partially_paid'
      })
    }));
    expect(result.data).toEqual([{ id: 201, total_amount: 1500 }]);
  });

  it('يجب توجيه طلب المبيعات لـ dashboard/summary وعرض ملخص اللوحة كـ Fallback', async () => {
    const mockResponse = { data: { summary: { total_sales: 5000 } } };
    apiClient.get.mockResolvedValue(mockResponse);

    const contract = { domain: 'invoices', indicators: ['summary'] };
    const result = await provider.fetchData('sig-summary', contract, { period: 'month' });

    expect(apiClient.get).toHaveBeenCalledWith('dashboard/summary', expect.any(Object));
    expect(result.data).toEqual({ summary: { total_sales: 5000 } });
  });

  it('يجب استعلام الأقساط المستحقة القادمة وتوجيه الطلب للـ installments Endpoint مع الفلاتر المخصصة', async () => {
    const mockResponse = { data: [{ id: 10, amount: 250 }] };
    apiClient.get.mockResolvedValue(mockResponse);

    const contract = { domain: 'installments', indicators: ['upcomingInstallments'] };
    const result = await provider.fetchData('sig-installments', contract, { period: 'month', limit: 10 });

    expect(apiClient.get).toHaveBeenCalledWith('installments', expect.objectContaining({
      params: expect.objectContaining({
        status: 'pending,partially_paid',
        limit: 10
      })
    }));
    expect(result.data).toEqual([{ id: 10, amount: 250 }]);
  });

  it('يجب استعلام ملخص الأرباح والخسائر المقارن للفترة الحالية والماضية لفترة اليوم (today)', async () => {
    const mockResponse = { data: { summary: { net_profit: 500, total_revenue: 1000, total_costs: 500 } } };
    apiClient.get.mockResolvedValue(mockResponse);

    const contract = { domain: 'finance', indicators: ['profitSummary'] };
    const result = await provider.fetchData('sig-profit-today', contract, { period: 'today' });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(result.data.netProfit).toBe(500);
    expect(result.data.change).toBe(0); // 0 change check when last period profit is 500
  });

  it('يجب استعلام ملخص الأرباح والخسائر المقارن للفترة الحالية والماضية لفترة الأسبوع (week)', async () => {
    const mockResponse = { data: { summary: { net_profit: 1000, total_revenue: 2000, total_costs: 1000 } } };
    apiClient.get.mockResolvedValue(mockResponse);

    const contract = { domain: 'finance', indicators: ['profitSummary'] };
    const result = await provider.fetchData('sig-profit-week', contract, { period: 'week' });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(result.data.revenue).toBe(2000);
  });

  it('يجب استعلام ملخص الأرباح والخسائر المقارن للفترة الحالية والماضية لفترة الشهر (month) وحساب التغير المئوي', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: { summary: { net_profit: 1500, total_revenue: 3000, total_costs: 1500 } } })
      .mockResolvedValueOnce({ data: { summary: { net_profit: 1000 } } });

    const contract = { domain: 'finance', indicators: ['profitSummary'] };
    const result = await provider.fetchData('sig-profit-month', contract, { period: 'month' });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(result.data.netProfit).toBe(1500);
    expect(result.data.change).toBe(50);
  });

  it('يجب توجيه طلب التحليلات للـ Endpoint المناسب عند الاستعلام عن مؤشرات التحليلات', async () => {
    const mockResponse = { data: { todayRevenue: 1000 } };
    apiClient.get.mockResolvedValue(mockResponse);

    const contract = { domain: 'invoices', indicators: ['todayRevenue'] };
    const result = await provider.fetchData('sig-analytics', contract, { period: 'today' });

    expect(apiClient.get).toHaveBeenCalledWith('analytics/dashboard', expect.any(Object));
    expect(result.data).toEqual({ todayRevenue: 1000 });
  });

  it('يجب إلقاء خطأ واضح وطباعة لوج الفشل عند تعطل طلب السيرفر أو إرجاع خطأ 500', async () => {
    const mockError = new Error('500 Internal Server Error');
    apiClient.get.mockRejectedValue(mockError);

    const contract = { domain: 'tasks', indicators: ['tasks'] };
    await expect(provider.fetchData('sig-error-500', contract, { period: 'today' })).rejects.toThrow('500 Internal Server Error');
  });

  it('يجب إلقاء خطأ غير مصرح به عند إرجاع خطأ 401 من السيرفر الخلفي', async () => {
    const mockError = new Error('401 Unauthorized');
    apiClient.get.mockRejectedValue(mockError);

    const contract = { domain: 'invoices', indicators: ['summary'] };
    await expect(provider.fetchData('sig-error-401', contract)).rejects.toThrow('401 Unauthorized');
  });
});
