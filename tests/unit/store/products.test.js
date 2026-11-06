import { describe, it, expect, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStoreProductsStore } from '@/stores/storeProducts'
import { storeProductsApi } from '@/modules/store/api/storeProducts.api'
vi.mock('@/modules/store/api/storeProducts.api',()=>({storeProductsApi:{getProducts:vi.fn()}}))
describe('store search results',()=>{
  it('keeps the newest filter result when an older request finishes later',async()=>{
    setActivePinia(createPinia())
    let finishOld,finishNew
    storeProductsApi.getProducts.mockImplementationOnce(()=>new Promise(resolve=>{finishOld=resolve}))
      .mockImplementationOnce(()=>new Promise(resolve=>{finishNew=resolve}))
    const store=useStoreProductsStore()
    const old=store.fetchProducts()
    store.filters.search=''
    const latest=store.fetchProducts()
    finishNew({data:{data:[{id:2}]}});await latest
    finishOld({data:{data:[{id:1}]}});await old
    expect(store.products).toEqual([{id:2}])
    expect(store.loading).toBe(false)
  })
})
