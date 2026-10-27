import { describe, it, expect, vi } from 'vitest'

vi.mock('@/modules/store/api/storeProducts.api', () => ({ storeProductsApi: { getCategories: vi.fn() } }))

describe('shared store categories', () => {
  it('shares an in-flight request, retries errors, and caches success', async () => {
    const { storeProductsApi } = await import('@/modules/store/api/storeProducts.api')
    const { useStoreCategories } = await import('@/modules/store/composables/useStoreCategories')
    const first = useStoreCategories()
    const second = useStoreCategories()
    storeProductsApi.getCategories.mockRejectedValueOnce(new Error('offline'))
    const request = first.loadCategories()
    expect(second.loadCategories()).toBe(request)
    await request
    expect(first.error.value).toBe('تعذر تحميل الأقسام')
    expect(first.loading.value).toBe(false)
    storeProductsApi.getCategories.mockResolvedValueOnce({ data: { data: [{ id: 7, name: 'إلكترونيات' }] } })
    await second.loadCategories()
    expect(first.categories.value).toEqual([{ id: 7, name: 'إلكترونيات' }])
    expect(first.error.value).toBe('')
    await first.loadCategories()
    expect(storeProductsApi.getCategories).toHaveBeenCalledTimes(2)
  })
})
