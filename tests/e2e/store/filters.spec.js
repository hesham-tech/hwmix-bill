import { test, expect } from '@playwright/test'

const products = [
  { id: 1, category_id: 7, brand_id: 20, price: 100 },
  { id: 2, category_id: 8, brand_id: 21, price: 200 },
  { id: 3, category_id: 7, brand_id: 22, price: 300 },
  { id: 4, category_id: 9, brand_id: 20, price: 400 },
].map(p => ({ ...p, name: `منتج ${p.id}`, quantity: 5, stock_status: 'in_stock', variants: [], images: [] }))

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => console.error('Catalog page error:', error.message))
  await page.route('https://fonts.googleapis.com/**', route => route.abort())
  await page.route('https://fonts.gstatic.com/**', route => route.abort())
  await page.route('**/api/v1/**', async route => {
    const url = new URL(route.request().url())
    let data = []
    if (url.pathname.endsWith('/categories')) data = [{ id: 7, name: 'هواتف', products_count: 2 }, { id: 8, name: 'لابتوبات', products_count: 1 }, { id: 9, name: 'أثاث', products_count: 1 }]
    else if (url.pathname.endsWith('/brands')) data = [{ id: 20, name: 'Apple' }, { id: 21, name: 'Samsung' }, { id: 22, name: 'Asus' }]
    else if (url.pathname.endsWith('/products')) {
      const ids = key => url.searchParams.getAll(`${key}[]`).map(Number)
      const categories = ids('category_ids'), brands = ids('brand_ids')
      const filtered = products.filter(p => (!categories.length || categories.includes(p.category_id)) && (!brands.length || brands.includes(p.brand_id))
        && (!url.searchParams.has('min_price') || p.price >= Number(url.searchParams.get('min_price')))
        && (!url.searchParams.has('max_price') || p.price <= Number(url.searchParams.get('max_price'))))
      data = { data: filtered, meta: { total: filtered.length, current_page: 1, last_page: 1, per_page: 15 } }
    }
    await route.fulfill({ json: { success: true, data } })
  })
})

for (const width of [360, 390, 768, 959, 960, 1440]) {
  test(`filters apply on selection and support combined choices at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/store', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('catalog-total')).toContainText('4')
    const mobile = width < 960
    const drawer = page.getByRole('navigation', { name: 'تصفية المنتجات', exact: true })
    if (mobile) await page.getByRole('button', { name: 'تصفية المنتجات', exact: true }).click()
    const sidebar = mobile ? drawer.locator('.filters-sidebar') : page.locator('.hidden-sm-and-down .filters-sidebar')
    const phones = sidebar.getByRole('button', { name: /هواتف/ })
    await phones.click()
    await expect(phones).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('catalog-total')).toContainText('2')
    await sidebar.getByRole('button', { name: /لابتوبات/ }).click()
    await expect(phones).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('catalog-total')).toContainText('3')
    await sidebar.getByRole('button', { name: 'Apple', exact: true }).click()
    await expect(page.getByTestId('catalog-total')).toContainText('1')
    await sidebar.getByRole('button', { name: 'Samsung', exact: true }).click()
    await expect(page.getByTestId('catalog-total')).toContainText('2')
    if (mobile) {
      await expect(drawer).toHaveClass(/v-navigation-drawer--active/)
      const show = drawer.getByRole('button', { name: /عرض النتائج/ })
      await expect(show).toBeInViewport()
      await show.click()
    }
    await expect(page.locator('.product-card')).toHaveCount(2)
    await page.reload()
    await expect(page.getByTestId('catalog-total')).toContainText('2')
    await expect(page.getByTestId('category-filter-7')).toBeVisible()
    await expect(page.getByTestId('category-filter-8')).toBeVisible()
    await page.getByTestId('brand-filter-21').locator('.v-chip__close').click()
    await expect(page.getByTestId('catalog-total')).toContainText('1')
    await page.getByRole('button', { name: 'مسح الكل', exact: true }).filter({ visible: true }).first().click()
    await expect(page.getByTestId('catalog-total')).toContainText('4')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('hosting trailing-slash URLs keep the mobile panel open after filtering', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/store/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'تصفية المنتجات', exact: true }).click()
  const drawer = page.getByRole('navigation', { name: 'تصفية المنتجات', exact: true })
  await drawer.getByRole('button', { name: /هواتف/ }).click()
  await expect(page.getByTestId('catalog-total')).toContainText('2')
  await expect(drawer).toHaveClass(/v-navigation-drawer--active/)
  await drawer.getByRole('button', { name: /لابتوبات/ }).click()
  await expect(page.getByTestId('catalog-total')).toContainText('3')
  await expect(drawer).toHaveClass(/v-navigation-drawer--active/)
})

test('price edits update results without a hidden apply button', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/store', { waitUntil: 'networkidle' })
  const sidebar = page.locator('.hidden-sm-and-down .filters-sidebar')
  await sidebar.getByLabel('من (ج.م)').fill('150')
  await sidebar.getByLabel('إلى (ج.م)').fill('250')
  await expect(page.getByTestId('catalog-total')).toContainText('1')
  await sidebar.getByLabel('إلى (ج.م)').fill('100')
  await expect(sidebar.getByRole('alert')).toContainText('الحد الأعلى')
  await expect(page.getByTestId('catalog-total')).toContainText('1')
  await sidebar.getByLabel('إلى (ج.م)').fill('350')
  await expect(page.getByTestId('catalog-total')).toContainText('2')
})
