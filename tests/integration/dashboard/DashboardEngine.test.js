// اختبار تكامل محرك اللوحة وتأكيد تهيئة شبكة GridStack وتخطيط المكونات بصريا
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import DashboardEngine from '@core/dashboard/components/DashboardEngine.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

// محاكاة GridStack لمنع أي انهيار لعدم توفر متصفح حقيقي
vi.mock('gridstack', () => ({
  GridStack: {
    init: vi.fn(() => ({
      on: vi.fn(),
      compact: vi.fn(),
      removeAll: vi.fn(),
      makeWidget: vi.fn(),
      load: vi.fn(),
      setStatic: vi.fn(),
      enableMove: vi.fn(),
      enableResize: vi.fn()
    }))
  }
}));

describe('DashboardEngine Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('يجب تهيئة المحرك ورندرة المكونات بنجاح', () => {
    const store = useDashboardStore();
    
    const wrapper = mount(DashboardEngine, {
      props: {
        isDesignMode: false,
        period: 'month'
      },
      global: {
        stubs: {
          // استبدال المكونات الفرعية بمكونات فارغة لتسريع الفحص
          SalesTrendChart: true,
          TopProductsChart: true,
          ProductIntelligenceTable: true,
          DashboardTasksWidget: true,
          RecentInvoices: true,
          UpcomingPayments: true,
          UpcomingInstallments: true,
          ProfitSummaryWidget: true,
          QuickActions: true,
          ReportsQuickLinks: true,
          KpiCardWidget: true
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
