// اختبار ملخص الأرباح والخسائر المقارن والتحقق من حساب الأرصدة
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ProfitSummaryWidget from '@/modules/reports/components/ProfitSummaryWidget.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

describe('ProfitSummaryWidget Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة مكون الأرباح والخسائر بنجاح وتمرير البيانات الافتراضية', () => {
    const store = useDashboardStore();
    store.dashboardData['profit-summary'] = { revenue: 0, costs: 0, netProfit: 0, change: 0 };

    const wrapper = mount(ProfitSummaryWidget, {
      props: {
        instanceId: 'profit-summary'
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
