import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import InvoiceCreate from '@/modules/invoices/pages/InvoiceCreate.vue';
import InvoiceForm from '@/modules/invoices/components/InvoiceForm.vue';
import QuickServiceOperation from '@/modules/hwnix-cash/components/QuickServiceOperation.vue';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }), useRoute: () => ({ query: { type: 'sale' } }) }));
vi.mock('@/modules/invoices/components/InvoiceForm.vue', () => ({ default: { name: 'InvoiceForm', emits: ['cash-box-change'], template: '<div />' } }));

describe('invoice quick services cash box', () => {
  it('waits for a selected cash box and passes subsequent changes to quick services', async () => {
    const wrapper = shallowMount(InvoiceCreate, { global: { stubs: { VBtn: { props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' }, VIcon: true } } });
    expect(wrapper.findComponent(QuickServiceOperation).exists()).toBe(false);
    expect(wrapper.find('button').element.disabled).toBe(true);
    const form = wrapper.findComponent(InvoiceForm);
    await form.vm.$emit('cash-box-change', 12);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(QuickServiceOperation).props('cashBoxId')).toBe(12);
    await form.vm.$emit('cash-box-change', 23);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(QuickServiceOperation).props('cashBoxId')).toBe(23);
    await form.vm.$emit('cash-box-change', null);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(QuickServiceOperation).exists()).toBe(false);
    wrapper.unmount();
  });
});
