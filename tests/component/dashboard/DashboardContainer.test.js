// اختبارات حاوية التخطيط الشبكي ورندرة المكونات والـ LayoutAdapter في وضع التصميم
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DashboardContainer from '@core/dashboard/components/DashboardContainer.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore';
import widgetRegistry from '@core/dashboard/registry/WidgetRegistry';

// محاكاة LayoutAdapter لتجنب استدعاء مكتبة GridStack الفعلية بالـ Node/DOM البيئة المعزولة
vi.mock('@core/dashboard/adapters/LayoutAdapter', () => {
  return {
    LayoutAdapter: class {
      initGrid() {}
      enableDesignMode() {}
      disableDesignMode() {}
      destroyGrid() {}
    }
  };
});

describe('DashboardContainer Component Tests', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useDashboardStore();

    store.layout = {
      dashboardId: 'test_dashboard',
      companyId: '1',
      version: '2.0.0',
      widgetInstances: [
        { id: 'inst-1', widgetId: 'kpi_total_sales', x: 0, y: 0, w: 3, h: 2, visible: true }
      ]
    };

    // تسجيل Mock widget
    vi.spyOn(widgetRegistry, 'get').mockReturnValue({
      id: 'kpi_total_sales',
      component: { name: 'KpiCardWidget' },
      metadata: { title: 'إجمالي المبيعات' }
    });
  });

  it('يجب رندرة الـ Widgets النشطة بنجاح وتجاهل المخفية أو غير المسجلة', () => {
    const wrapper = mount(DashboardContainer, {
      props: {
        widgetInstances: [
          { id: 'inst-1', widgetId: 'kpi_total_sales', x: 0, y: 0, w: 3, h: 2, visible: true },
          { id: 'inst-2', widgetId: 'kpi_total_sales', x: 3, y: 0, w: 3, h: 2, visible: false } // مخفية
        ],
        designMode: false
      }
    });

    // يجب العثور على wrapper واحد فقط للـ Widget الأول النشط
    const items = wrapper.findAll('.grid-stack-item');
    expect(items).toHaveLength(1);
    expect(items[0].attributes('data-instance-id')).toBe('inst-1');
  });

  it('يجب عرض طبقة التعديل والتحكم البصرية عند تفعيل وضع التصميم', async () => {
    const wrapper = mount(DashboardContainer, {
      props: {
        widgetInstances: [
          { id: 'inst-1', widgetId: 'kpi_total_sales', x: 0, y: 0, w: 3, h: 2, visible: true }
        ],
        designMode: true
      }
    });

    // وضع التصميم يضيف overlay يحتوي على زر الإخفاء والإزالة
    const overlay = wrapper.find('.widget-design-overlay');
    expect(overlay.exists()).toBe(true);
    expect(overlay.text()).toContain('إجمالي المبيعات');
  });
});
