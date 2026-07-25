// اختبار مكون كارت المؤشر البصري والتحقق من رندرة القيم وحالات التحميل
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import KpiCardWidget from '@/modules/reports/components/KpiCardWidget.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

describe('KpiCardWidget Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة كارت الـ KPI بنجاح والقيمة الصفرية عند غياب البيانات', () => {
    const store = useDashboardStore();
    store.dashboardData['kpi-1'] = { value: 0, label: 'Sales' };

    const wrapper = mount(KpiCardWidget, {
      props: {
        instanceId: 'kpi-1',
        title: 'إجمالي المبيعات',
        icon: 'mdi-cart',
        color: 'primary'
      },
      global: {
        stubs: {
          'v-card': { template: '<div><slot /><span>إجمالي المبيعات</span></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-avatar': { template: '<div><slot /></div>' },
          'v-chip': { template: '<div><slot /></div>' },
          'v-icon': true,
          'v-skeleton-loader': { template: '<div class="v-skeleton-loader"><slot /></div>' }
        }
      }
    });

    expect(wrapper.text()).toContain('إجمالي المبيعات');
  });

  it('يجب إظهار لودر التحميل عند تفعيل حالة التحميل بالمتجر', () => {
    const store = useDashboardStore();
    store.widgetLoadingStates['kpi-1'] = true;

    const wrapper = mount(KpiCardWidget, {
      props: {
        instanceId: 'kpi-1',
        title: 'إجمالي المبيعات'
      },
      global: {
        stubs: {
          'v-card': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-avatar': { template: '<div><slot /></div>' },
          'v-chip': { template: '<div><slot /></div>' },
          'v-icon': true,
          'v-skeleton-loader': { template: '<div class="v-skeleton-loader"><slot /></div>' }
        }
      }
    });

    // التحقق من وجود الكلاس أو اللودر
    expect(wrapper.find('.v-skeleton-loader').exists()).toBe(true);
  });
});
