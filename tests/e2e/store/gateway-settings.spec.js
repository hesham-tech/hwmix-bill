import { test, expect } from '@playwright/test'

test.use({ actionTimeout: 15000 })

test('gateway accounts switch provider fields, preserve stored secrets and change the default independently', async ({ page }) => {
  const drivers = [
    { id: 'paymob', name: 'Paymob', fields: { api_key: 'secret', hmac_secret: 'secret', integration_id: 'text', iframe_id: 'text' }, required: ['api_key', 'hmac_secret', 'integration_id', 'iframe_id'] },
    { id: 'stripe', name: 'Stripe', fields: { secret_key: 'secret', webhook_secret: 'secret' }, required: ['secret_key', 'webhook_secret'] },
  ]
  const accounts = [{ id: 7, name: 'حساب المنصة الأول', driver: 'paymob', config: { integration_id: '123', iframe_id: '456' }, credentials_configured: { api_key: true, hmac_secret: true }, ready: true, is_active: true, is_test_mode: true, is_default: true }]
  const writes = [], errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => sessionStorage.setItem('token', 'gateway-fixture'))
  await page.route('**/api/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname
    let data = []
    if (path === '/api/v1/bootstrap') data = { user: { id: 1, full_name: 'مدير الاختبار', is_staff_or_admin: true, permissions: ['admin.super'], roles: [], company_id: 1, active_company_id: 1, companies: [{ id: 1, name: 'المنصة' }], branches: [], subscription: { status: 'active' } } }
    else if (path.endsWith('/payment-gateway-drivers')) data = drivers
    else if (path.endsWith('/payment-gateways') && request.method() === 'POST') {
      const body = request.postDataJSON(); writes.push(body)
      expect(body.driver).toBe('stripe')
      expect(body.config).toEqual({ secret_key: 'fixture-key', webhook_secret: 'fixture-signature' })
      accounts.push({ ...body, id: 8, config: {}, credentials_configured: { secret_key: true, webhook_secret: true }, ready: true }); data = accounts[1]
    } else if (path.endsWith('/payment-gateways/7') && request.method() === 'PUT') {
      const body = request.postDataJSON(); writes.push(body)
      expect(body.config).toEqual({ integration_id: '123', iframe_id: '456' })
      accounts[0].name = body.name; data = accounts[0]
    } else if (path.endsWith('/payment-gateways/8/set-default')) {
      expect(request.method()).toBe('PATCH')
      accounts.forEach(account => { account.is_default = account.id === 8 }); data = accounts[1]
    } else if (path.endsWith('/payment-gateways')) data = accounts
    await route.fulfill({ json: { success: true, data } })
  })
  await page.goto('/app/payment-gateways')
  await expect(page.getByRole('heading', { name: 'بوابات الدفع الإلكتروني', exact: true })).toBeVisible()
  const welcome = page.getByRole('button', { name: 'علمت بذلك، موافق', exact: true }); if (await welcome.isVisible()) await welcome.click()
  await page.getByRole('button', { name: 'إضافة حساب', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox', { name: 'اسم الحساب', exact: true }).fill('حساب المنصة الثاني')
  await dialog.getByLabel('مفتاح API', { exact: true }).fill('must-be-discarded')
  await dialog.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Stripe', exact: true }).click()
  await expect(dialog.getByLabel('مفتاح API', { exact: true })).toHaveCount(0)
  await dialog.getByLabel('المفتاح السري', { exact: true }).fill('fixture-key')
  await dialog.getByLabel('سر توقيع Webhook', { exact: true }).fill('fixture-signature')
  await dialog.getByLabel('مفعل لقبول المدفوعات', { exact: true }).check()
  await dialog.getByRole('button', { name: 'حفظ', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await page.locator('tbody tr').filter({ hasText: 'حساب المنصة الثاني' }).getByRole('button', { name: 'تعيين افتراضي', exact: true }).click()
  await expect(page.locator('tbody tr').filter({ hasText: 'حساب المنصة الثاني' }).getByText('الافتراضي', { exact: true })).toBeVisible()
  await page.locator('tbody tr').filter({ hasText: 'حساب المنصة الأول' }).getByRole('button', { name: 'تعديل', exact: true }).click()
  await expect(dialog.getByLabel('مفتاح API', { exact: true })).toBeEmpty()
  await dialog.getByRole('textbox', { name: 'اسم الحساب', exact: true }).fill('حساب محفوظ')
  await dialog.getByRole('button', { name: 'حفظ', exact: true }).click()
  await expect(page.getByText('حساب محفوظ', { exact: true })).toBeVisible()
  expect(writes).toHaveLength(2)
  expect(errors).toEqual([])
})
