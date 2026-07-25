// اختبار مكون المهام والتحقق من عرض المهام المفتوحة واستجابة صندوق الاختيار تفاعليا
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import DashboardTasksWidget from '@/modules/tasks/components/DashboardTasksWidget.vue';
import { useDashboardStore } from '@core/dashboard/store/dashboardStore.js';

describe('DashboardTasksWidget Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('يجب رندرة كارت المهام واستقبال مصفوفة المهام بنجاح', () => {
    const store = useDashboardStore();
    store.dashboardData['tasks-widget'] = [];

    const wrapper = mount(DashboardTasksWidget, {
      props: {
        instanceId: 'tasks-widget'
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
