// اختبار مكون الروابط السريعة للتقارير
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ReportsQuickLinks from '@/modules/reports/components/ReportsQuickLinks.vue';

describe('ReportsQuickLinks Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة مكون روابط التقارير بنجاح', () => {
    const wrapper = mount(ReportsQuickLinks, {
      props: {
        instanceId: 'reports-links'
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
