import { describe, it, expect } from 'vitest'
import { filterIds, normalizeCatalogFilters, catalogFiltersFromQuery, catalogFiltersToQuery } from '@/modules/store/utils/catalogFilters'

describe('catalog filter URLs', () => {
  it('normalizes legacy scalar links and multiple IDs without duplicates', () => {
    expect(filterIds(['7', 8, '7', '', -1, 'bad'])).toEqual([7, 8])
    expect(catalogFiltersFromQuery({ category_id: '7', brand_id: '20' })).toMatchObject({ category_ids: [7], brand_ids: [20] })
    expect(catalogFiltersFromQuery({ category_ids: ['7', '8'], brand_ids: '20,21' })).toMatchObject({ category_ids: [7, 8], brand_ids: [20, 21] })
  })

  it('preserves every combined filter across URL serialization and refresh', () => {
    const filters = normalizeCatalogFilters({ category_ids: [7, 8], brand_ids: [20, 21], search: 'هاتف', vendor_id: '2', min_price: 0, max_price: 250, in_stock: true, sort: 'price_asc' })
    expect(catalogFiltersFromQuery(catalogFiltersToQuery(filters))).toEqual(filters)
    expect(catalogFiltersToQuery({ category_ids: [], brand_ids: [], min_price: '', max_price: '' })).toEqual({})
  })

  it('clones selection arrays so drafts cannot change the applied store state', () => {
    const filters = { category_ids: [7], brand_ids: [20] }
    const draft = normalizeCatalogFilters(filters)
    draft.category_ids.push(8)
    expect(filters.category_ids).toEqual([7])
  })
})
