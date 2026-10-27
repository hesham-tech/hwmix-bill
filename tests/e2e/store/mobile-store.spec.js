import { test, expect } from '@playwright/test'

const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="500" height="500" fill="#dbeafe"/></svg>')
const product = { id: 1, name: 'منتج اختبار', price: 125, quantity: 5, stock_status: 'in_stock', image, images: [{ id: 1, url: image }], description: '<p>وصف المنتج للاختبار</p>'.repeat(35), vendor: { id: 1, name: 'متجر الاختبار' }, variants: [{ id: 11, name: 'الخيار الأول', price: 125, available_stock: 3 }, { id: 12, name: 'الخيار الثاني', price: 200, available_stock: 1 }] }
const products = Array.from({ length: 20 }, (_, i) => ({ ...product, id: i + 1, variants: [] }))

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => console.error('Store page error:', error.stack))
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    let data = []
    if (path.endsWith('/categories')) data = [{ id: 7, name: 'إلكترونيات' }]
    else if (/\/products\/1$/.test(path)) data = product
    else if (path.endsWith('/products')) data = { data: products, meta: { total: 20, current_page: 1, last_page: 1 } }
    else if (/\/vendors\/1$/.test(path)) data = { id: 1, name: 'متجر الاختبار', logo: image }
    await route.fulfill({ json: { data } })
  })
})

test('drawers work on all store pages without duplicate carts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const path of ['/store', '/store/product/1', '/store/cart', '/store/checkout', '/store/wishlist', '/store/my-orders', '/store/order-confirmation/1', '/store/vendor/1']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    const nav = page.locator('.store-mobile-bottom-nav')
    await expect(nav).toBeVisible()
    await nav.getByRole('button', { name: 'الأقسام', exact: true }).click()
    await expect(page.getByRole('navigation', { name: 'أقسام المتجر' })).toHaveClass(/v-navigation-drawer--active/)
    await expect(page).toHaveURL(new RegExp(path.replaceAll('/', '\\/') + '$'))
    await page.getByRole('button', { name: 'إغلاق الأقسام' }).click()
    await nav.getByRole('button', { name: 'السلة', exact: true }).click()
    await expect(page.getByRole('navigation', { name: 'سلة التسوق' })).toHaveClass(/v-navigation-drawer--active/)
    await expect(page.locator('.cart-drawer')).toHaveCount(1)
    await page.getByRole('navigation', { name: 'سلة التسوق' }).getByRole('button', { name: 'إغلاق السلة' }).click()
  }
})

test('search, category selection, scroll direction and home reset', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/store?category_id=7')
  const search = page.locator('.store-mobile-appbar input')
  await search.fill('منتج'); await search.press('Enter')
  await expect(page).toHaveURL(/category_id=7.*q=/)
  await page.locator('.store-mobile-appbar .v-field__clearable').click()
  await expect(page).not.toHaveURL(/q=/)
  await expect(page).toHaveURL(/category_id=7/)
  await search.blur()
  await page.waitForTimeout(500)
  await page.mouse.wheel(0, 500)
  await expect(page.locator('.store-mobile-appbar')).toHaveClass(/nav-hidden/)
  await expect(page.locator('.store-mobile-bottom-nav')).toHaveClass(/nav-hidden/)
  await page.mouse.wheel(0, -50)
  await expect(page.locator('.store-mobile-appbar')).not.toHaveClass(/nav-hidden/)
  await page.locator('.store-mobile-bottom-nav').getByText('الرئيسية', { exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await page.goto('/store/product/1')
  await page.locator('.store-mobile-bottom-nav').getByRole('button', { name: 'الأقسام', exact: true }).click()
  await page.getByText('إلكترونيات', { exact: true }).click()
  await expect(page).toHaveURL(/\/store\?category_id=7/)
})

test('purchase bar uses selected variant and stays above navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/store/product/1')
  const bar = page.locator('.mobile-purchase-bar')
  await expect(bar).toBeVisible()
  await expect(bar).toContainText('125')
  await page.locator('.variant-box').filter({ hasText: 'الخيار الثاني' }).click()
  await expect(bar).toContainText('200')
  await page.waitForTimeout(400)
  await page.mouse.wheel(0, -60)
  await page.waitForTimeout(400)
  const position = await bar.boundingBox()
  const bottom = await page.locator('.store-mobile-bottom-nav').boundingBox()
  expect(position.y + position.height).toBeLessThanOrEqual(bottom.y + 1)
  await bar.getByRole('button', { name: 'أضف للسلة' }).click()
  await expect(page.getByRole('navigation', { name: 'سلة التسوق' })).toHaveClass(/v-navigation-drawer--active/)
  await expect(bar).toHaveCount(0)
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('hwnix_store_cart')))
  expect(cart[0]).toMatchObject({ variantId: 12, unitPrice: 200, quantity: 1, maxStock: 1 })
})

for (const width of [360, 390, 959, 960, 1440]) {
  test(`responsive layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/store')
    await expect(page.locator('.store-mobile-bottom-nav'))[width < 960 ? 'toBeVisible' : 'toBeHidden']()
    await expect(page.locator('.store-desktop-header'))[width < 960 ? 'toBeHidden' : 'toBeVisible']()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    if (width >= 960) {
      await page.mouse.wheel(0, 500)
      await expect.poll(async () => Math.round((await page.locator('.store-desktop-header').boundingBox()).y)).toBe(0)
    }
    await page.screenshot({ path: `.cache/store-${width}.png` })
  })
}

test('mobile filters, keyboard focus, guest login and direct-link back', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/store')
  await page.locator('.store-mobile-appbar input').focus()
  await expect(page.locator('.store-mobile-bottom-nav')).toHaveClass(/nav-hidden/)
  await page.locator('.store-mobile-appbar input').blur()
  await expect(page.locator('.store-mobile-bottom-nav')).not.toHaveClass(/nav-hidden/)
  await page.locator('.store-mobile-appbar button[title="الأقسام والتصفية"]').click()
  const filters = page.locator('.v-navigation-drawer--active').filter({ hasText: 'تطبيق الفلاتر' })
  await expect(filters).toBeVisible()
  await filters.getByRole('button', { name: 'تطبيق الفلاتر' }).click()
  await expect(filters).toHaveCount(0)
  await page.locator('.store-mobile-bottom-nav').getByRole('button', { name: 'دخول', exact: true }).click()
  await expect(page).toHaveURL(/\/login\?redirect=/)
  await page.goto('/store/product/1')
  await page.locator('.store-mobile-appbar button[title="رجوع"]').click()
  await expect(page).toHaveURL(/\/store$/)
})

test('authenticated account sheet closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => localStorage.setItem('token', 'mock-test-token'))
  await page.goto('/store')
  await page.locator('.store-mobile-bottom-nav').getByRole('button', { name: 'حسابي', exact: true }).click()
  await page.getByRole('dialog').getByText('طلباتي ومشترياتي', { exact: true }).click()
  await expect(page).toHaveURL(/\/store\/my-orders$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('category failures can be retried without leaving the product', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  let attempts = 0
  await page.route('**/api/v1/store/public/categories', route => {
    if (++attempts === 1) return route.fulfill({ status: 500, json: { message: 'offline' } })
    return route.fulfill({ json: { data: [{ id: 7, name: 'إلكترونيات' }] } })
  })
  await page.goto('/store/product/1')
  await page.locator('.store-mobile-bottom-nav').getByRole('button', { name: 'الأقسام', exact: true }).click()
  const categories = page.getByRole('navigation', { name: 'أقسام المتجر' })
  await expect(categories).toContainText('تعذر تحميل الأقسام')
  await categories.getByRole('button', { name: 'إعادة المحاولة' }).click()
  await expect(categories).toContainText('إلكترونيات')
  await expect(page).toHaveURL(/\/store\/product\/1$/)
})

test('purchase visibility, reduced motion and inset measurements', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/store/product/1')
  const bar = page.locator('.mobile-purchase-bar')
  await expect(bar).toBeVisible()
  await page.addStyleTag({ content: '.store-mobile-bottom-nav { padding-bottom: 34px !important; }' })
  await expect.poll(async () => {
    const purchase = await bar.boundingBox()
    const nav = await page.locator('.store-mobile-bottom-nav').boundingBox()
    return Math.abs(purchase.y + purchase.height - nav.y)
  }).toBeLessThan(2)
  expect((await bar.getByRole('button').boundingBox()).height).toBeGreaterThanOrEqual(44)
  await page.screenshot({ path: '.cache/store-product-390.png' })
  await page.locator('.main-image-wrapper').click()
  await expect(page.locator('.lightbox-overlay')).toBeVisible()
  await expect(bar).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(bar).toBeVisible()
})

test('unavailable products disable buying and failed products have no purchase bar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('**/api/v1/store/public/products/1', route => route.fulfill({ json: { data: { ...product, quantity: 0, variants: [{ ...product.variants[0], available_stock: 0 }] } } }))
  await page.goto('/store/product/1')
  await expect(page.locator('.mobile-purchase-bar').getByRole('button')).toBeDisabled()
  await page.route('**/api/v1/store/public/products/1', route => route.fulfill({ status: 500, json: { message: 'offline' } }))
  await page.reload()
  await expect(page.getByText('تعذر تحميل بيانات المنتج')).toBeVisible()
  await expect(page.locator('.mobile-purchase-bar')).toHaveCount(0)
})
