export function filterIds(value) {
  const entries = Array.isArray(value) ? value : value == null || value === '' ? [] : String(value).split(',')
  return [...new Set(entries.map(Number).filter(id => Number.isSafeInteger(id) && id > 0))]
}

export function defaultCatalogFilters() {
  return { category_ids: [], brand_ids: [], search: '', vendor_id: null, sort: 'newest', min_price: null, max_price: null, in_stock: false }
}

export function normalizeCatalogFilters(filters = {}) {
  const next = { ...defaultCatalogFilters(), ...filters }
  next.category_ids = filterIds(filters.category_ids ?? filters.category_id)
  next.brand_ids = filterIds(filters.brand_ids ?? filters.brand_id)
  delete next.category_id
  delete next.brand_id
  for (const key of ['min_price', 'max_price']) {
    next[key] = next[key] == null || next[key] === '' ? null : Number(next[key])
  }
  return next
}

export function catalogFiltersFromQuery(query) {
  return normalizeCatalogFilters({
    category_ids: query.category_ids ?? query.category_id,
    brand_ids: query.brand_ids ?? query.brand_id,
    search: typeof query.q === 'string' ? query.q : '',
    vendor_id: query.vendor_id || null,
    sort: ['newest', 'price_asc', 'price_desc', 'best_selling'].includes(query.sort) ? query.sort : 'newest',
    min_price: query.min_price,
    max_price: query.max_price,
    in_stock: query.in_stock === '1' || query.in_stock === 'true',
  })
}

export function catalogFiltersToQuery(filters) {
  const f = normalizeCatalogFilters(filters)
  const query = {}
  if (f.search) query.q = f.search
  if (f.vendor_id) query.vendor_id = String(f.vendor_id)
  if (f.category_ids.length) query.category_ids = f.category_ids.map(String)
  if (f.brand_ids.length) query.brand_ids = f.brand_ids.map(String)
  if (f.sort !== 'newest') query.sort = f.sort
  if (f.min_price != null) query.min_price = String(f.min_price)
  if (f.max_price != null) query.max_price = String(f.max_price)
  if (f.in_stock) query.in_stock = '1'
  return query
}
