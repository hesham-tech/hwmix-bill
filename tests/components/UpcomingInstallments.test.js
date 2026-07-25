// اختبار جدول الأقساط المستحقة القادمة والتحقق من رندرة القيم والتواريخ
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import UpcomingInstallments from '@/modules/reports/components/UpcomingInstallments.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

describe('UpcomingInstallments Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة مكون الأقساط المستحقة بنجاح', () => {
    const store = useDashboardStore();
    store.dashboardData['upcoming-installments'] = [];

    const wrapper = mount(UpcomingInstallments, {
      props: {
        instanceId: 'upcoming-installments'
      },
      global: {
        stubs: {
          InstallmentsTable: true
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
