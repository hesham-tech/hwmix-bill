// اختبارات مكون محرك لوحة التحكم ورندرة الواجهات ووضع التصميم وتفاعل الفلاتر والـ Edge Cases
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DashboardEngine from '@core/dashboard/components/DashboardEngine.vue';
import widgetRegistry from '../../../src/@core/dashboard/registry/WidgetRegistry.js';

vi.mock('@/services/notificationManager', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('DashboardEngine Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn());
  });

  it('يجب رندرة عنوان ومكونات لوحة التحكم الافتراضية بنجاح', () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard',
        title: 'لوحة القيادة التجريبية',
        subtitle: 'تحليل البيانات الفورية'
      }
    });

    expect(wrapper.find('h1').text()).toBe('لوحة القيادة التجريبية');
    expect(wrapper.text()).toContain('تحليل البيانات الفورية');
  });

  it('يجب تفعيل وضع التصميم وإظهار رسالة التنبيه المخصصة', async () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard'
      }
    });

    wrapper.vm.dashboardStore.designMode = true;
    await wrapper.vm.$nextTick();

    const alert = wrapper.find('v-alert');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('وضع تصميم وتخصيص مساحة العمل');
  });

  it('يجب تحديث الفلاتر الزمنية وإطلاق طلب البيانات المقابل بنجاح', async () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard'
      }
    });

    const spy = vi.spyOn(wrapper.vm.dashboardStore, 'fetchAllWidgetsData');
    wrapper.vm.selectedPeriod = 'today';
    
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(spy).toHaveBeenCalledWith({ period: 'today' });
  });

  it('يجب استدعاء دالة تحديث التخطيط التلقائي (onLayoutChange) بدون إيقاف وضع التصميم', async () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard'
      }
    });

    const spy = vi.spyOn(wrapper.vm.dashboardStore, 'saveLayout');
    wrapper.vm.onLayoutChange();

    expect(spy).toHaveBeenCalledWith(false);
  });

  it('يجب محاكاة النقر على زر التحديث اليدوي وتحديث البيانات بالكامل للوحة', async () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard'
      }
    });

    const spy = vi.spyOn(wrapper.vm.dashboardStore, 'fetchAllWidgetsData');
    await wrapper.vm.refreshDashboard();

    expect(spy).toHaveBeenCalledWith({ period: 'month' });
  });

  it('يجب إعادة ضبط اللوحة للوضع الافتراضي عند موافقة المستخدم في نافذة التأكيد (confirm)', async () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard'
      }
    });

    window.confirm.mockReturnValue(true);
    const spy = vi.spyOn(wrapper.vm.dashboardStore, 'resetToDefaultLayout');

    await wrapper.vm.resetToDefault();

    expect(window.confirm).toHaveBeenCalledWith('هل أنت متأكد من رغبتك في إعادة ضبط اللوحة للوضع الافتراضي للباقة؟');
    expect(spy).toHaveBeenCalledWith({ period: 'month' });
  });

  it('يجب عدم إعادة ضبط اللوحة عند رفض المستخدم لنافذة التأكيد (confirm)', async () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard'
      }
    });

    window.confirm.mockReturnValue(false);
    const spy = vi.spyOn(wrapper.vm.dashboardStore, 'resetToDefaultLayout');

    await wrapper.vm.resetToDefault();

    expect(spy).not.toHaveBeenCalled();
  });

  it('يجب استدعاء دالة حفظ التغيرات والخروج (saveAndExit) وإلغاء وضع التصميم برمجياً بنجاح', async () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard'
      }
    });

    const spySave = vi.spyOn(wrapper.vm.dashboardStore, 'saveLayout');
    const spyMode = vi.spyOn(wrapper.vm.dashboardStore, 'setDesignMode');

    await wrapper.vm.saveAndExit();

    expect(spySave).toHaveBeenCalledWith(true);
    expect(spyMode).toHaveBeenCalledWith(false);
  });

  it('يجب استدعاء دالة استعادة وإظهار الويدجت المخفية (restoreWidget) برمجياً', async () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard'
      }
    });

    const spy = vi.spyOn(wrapper.vm.dashboardStore, 'setWidgetVisibility');
    
    await wrapper.vm.restoreWidget('widget-inst-id');

    expect(spy).toHaveBeenCalledWith('widget-inst-id', true, expect.objectContaining({ period: 'month' }));
  });

  it('يجب استدعاء دالة إضافة ويدجت جديدة للمخطط (addWidgetToLayout) وإضافتها للشبكة وجلب بياناتها', async () => {
    const wrapper = mount(DashboardEngine, {
      props: {
        dashboardId: 'test_dashboard'
      }
    });

    // تسجيل ويدجت تجريبية بالـ WidgetRegistry الفعلي
    widgetRegistry.register('kpi-card', {}, {
      id: 'kpi-card',
      version: '1.0.0',
      category: 'financial',
      permissions: [],
      defaultSize: { w: 3, h: 2 },
      minimumSize: { w: 2, h: 1 }
    });

    wrapper.vm.dashboardStore.layout = {
      widgetInstances: []
    };

    const spyFetch = vi.spyOn(wrapper.vm.dashboardStore, 'fetchAllWidgetsData');
    
    await wrapper.vm.addWidgetToLayout('kpi-card');

    expect(wrapper.vm.dashboardStore.layout.widgetInstances.length).toBe(1);
    expect(wrapper.vm.dashboardStore.layout.widgetInstances[0].widgetId).toBe('kpi-card');
    expect(spyFetch).toHaveBeenCalledWith({ period: 'month' });
  });
});
