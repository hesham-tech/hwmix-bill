// اختبار مكون الروابط والإجراءات السريعة
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import QuickActions from '@/modules/reports/components/QuickActions.vue';

describe('QuickActions Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة مكون الإجراءات السريعة بنجاح', () => {
    const wrapper = mount(QuickActions, {
      props: {
        instanceId: 'quick-actions'
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
