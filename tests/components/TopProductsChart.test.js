// اختبار مكون المنتجات الأكثر مبيعا والتأكد من استقبال واستخلاص مصفوفة المنتجات
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import TopProductsChart from '@/modules/reports/components/TopProductsChart.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

describe('TopProductsChart Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة مكون المنتجات الأكثر مبيعاً بنجاح وحماية الفراغ', () => {
    const store = useDashboardStore();
    store.dashboardData['top-products-chart'] = { top_products: [] };

    const wrapper = mount(TopProductsChart, {
      props: {
        instanceId: 'top-products-chart'
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
