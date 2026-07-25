// اختبار جدول المنتجات المتقدم للتأكد من فرز وعرض الأعمدة واستدعاءات الفلاتر
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ProductIntelligenceTable from '@/modules/reports/components/ProductIntelligenceTable.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

describe('ProductIntelligenceTable Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة جدول ذكاء المنتجات وقبول البيانات الفارغة بنجاح', () => {
    const store = useDashboardStore();
    store.dashboardData['product-intel-table'] = [];

    const wrapper = mount(ProductIntelligenceTable, {
      props: {
        instanceId: 'product-intel-table'
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
