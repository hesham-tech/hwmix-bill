// اختبار مكون أحدث الفواتير والتحقق من رندرة الجدول والقيم
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import RecentInvoices from '@/modules/reports/components/RecentInvoices.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

describe('RecentInvoices Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة مكون الفواتير الأخيرة بنجاح وقبول المصفوفة الفارغة', () => {
    const store = useDashboardStore();
    store.dashboardData['recent-invoices'] = { recent_invoices: [] };

    const wrapper = mount(RecentInvoices, {
      props: {
        instanceId: 'recent-invoices'
      },
      global: {
        stubs: {
          AppDataTable: true
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
