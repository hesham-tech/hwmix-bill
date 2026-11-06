import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import OwnerFundTransactionDialog from '@/modules/financials/components/OwnerFundTransactionDialog.vue'

const { create } = vi.hoisted(() => ({ create: vi.fn() }))
vi.mock('@/composables/useApi', () => ({ useApi: () => ({ create, get: async () => ({ data: [] }) }) }))
vi.mock('@/api', () => ({ userService: { getAll: async () => ({ data: [] }) } }))
vi.mock('@/services/notificationManager', () => ({ default: { success: vi.fn() } }))
vi.mock('@/modules/invoices/components/CustomerSelector.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components', () => ({ AppDialog: { name: 'AppDialog', props: ['modelValue'], emits: ['confirm', 'close', 'update:modelValue'], template: '<div><slot /></div>' } }))

let wrapper
beforeEach(() => { create.mockReset() })
afterEach(() => { wrapper?.unmount(); vi.restoreAllMocks() })
async function openForm() {
  wrapper = mount(OwnerFundTransactionDialog, {
    props: { modelValue: false },
    global: { stubs: {
      VForm: { template: '<div><slot /></div>', methods: { validate: async () => ({ valid: true }), resetValidation() {} } },
      VContainer: { template: '<div><slot /></div>' }, VRow: { template: '<div><slot /></div>' }, VCol: { template: '<div><slot /></div>' },
      VSelect: true, VTextField: { props: ['prefix'], template: '<div />' }, VTextarea: true,
    } },
  })
  await wrapper.setProps({ modelValue: true }); await flushPromises()
  return wrapper.findComponent({ name: 'AppDialog' })
}

it('does not submit a second financial operation while the first is pending', async () => {
  let complete
  create.mockImplementation(() => new Promise(resolve => { complete = resolve }))
  const dialog = await openForm()
  dialog.vm.$emit('confirm'); dialog.vm.$emit('confirm'); await flushPromises()
  expect(create).toHaveBeenCalledTimes(1)
  expect(create.mock.calls[0][0].idempotency_key).toMatch(/^[0-9a-f-]{36}$/)
  complete({ data: { id: 1 } }); await flushPromises()
})

it('keeps the same durable operation key when retrying after a lost response', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  create.mockRejectedValueOnce(new Error('Lost response')).mockResolvedValueOnce({ data: { id: 1 } })
  const dialog = await openForm()
  dialog.vm.$emit('confirm'); await flushPromises()
  dialog.vm.$emit('confirm'); await flushPromises()
  expect(create).toHaveBeenCalledTimes(2)
  expect(create.mock.calls[1][0].idempotency_key).toBe(create.mock.calls[0][0].idempotency_key)
})
