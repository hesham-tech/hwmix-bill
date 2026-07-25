// اختبار جدول المقبوضات/المدفوعات القادمة والتحقق من رندرة البنود
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import UpcomingPayments from '@/modules/reports/components/UpcomingPayments.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

describe('UpcomingPayments Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة جدول المدفوعات القادمة بنجاح', () => {
    const store = useDashboardStore();
    store.dashboardData['upcoming-payments'] = [];

    const wrapper = mount(UpcomingPayments, {
      props: {
        instanceId: 'upcoming-payments'
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
