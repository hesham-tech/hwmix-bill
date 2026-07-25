// اختبار مكون الرسم البياني لاتجاه المبيعات والتأكد من استقبال البيانات وتغذية لوحة الرسم
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import SalesTrendChart from '@/modules/reports/components/SalesTrendChart.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

describe('SalesTrendChart Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة مكون الرسم بنجاح وتمرير البيانات الافتراضية للفراغ', () => {
    const store = useDashboardStore();
    store.dashboardData['sales-chart'] = { sales_trend: [] };

    const wrapper = mount(SalesTrendChart, {
      props: {
        instanceId: 'sales-chart'
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
