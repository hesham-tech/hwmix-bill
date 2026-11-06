import { test, expect } from '@playwright/test'
test.use({ actionTimeout: 10000 })

test('mail reply destination can be edited without exposing or resending stored credentials', async ({ page }) => {
  let saved
  const account = { id: 2, title: 'إشعارات هونكس', mail_transport: 'smtp', mail_host: 'smtp.example.test', mail_port: 465,
    mail_username: 'notifications@example.test', mail_encryption: 'ssl', mail_from_address: 'notifications@example.test', mail_from_name: 'فريق هونكس',
    mail_reply_to_address: null, mail_reply_to_name: null, mail_password_configured: true, is_active: true, is_default: true, is_global: true, company_id: 1 }
  await page.addInitScript(() => {
    sessionStorage.setItem('token', 'mail-fixture')
    localStorage.setItem('guidance_enabled', 'false')
  })
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    let data = []
    if (path === '/api/v1/bootstrap') data = { user: { id: 1, full_name: 'مدير الاختبار', is_staff_or_admin: true, permissions: ['admin.super'], roles: [], company_id: 1, active_company_id: 1, companies: [{ id: 1, name: 'المنصة' }], branches: [], subscription: { status: 'active' } } }
    else if (path.endsWith('/mail-settings/2') && route.request().method() === 'PUT') { saved = route.request().postDataJSON(); Object.assign(account, { mail_reply_to_address: saved.mail_reply_to_address, mail_reply_to_name: saved.mail_reply_to_name }); data = account }
    else if (path.endsWith('/mail-settings')) data = [account]
    await route.fulfill({ json: { status: true, data } })
  })
  await page.goto('/app/mail')
  await expect(page.getByRole('row').filter({ hasText: 'إشعارات هونكس' })).toBeVisible()
  const welcome = page.getByRole('button', { name: 'علمت بذلك، موافق', exact: true }); if (await welcome.isVisible()) await welcome.click()
  await page.getByRole('button', { name: 'تعديل حساب البريد', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel('كلمة مرور SMTP', { exact: true })).toBeEmpty()
  await dialog.getByLabel('بريد استقبال الردود (اختياري)', { exact: true }).fill('support@example.test')
  await dialog.getByLabel('اسم جهة استقبال الردود (اختياري)', { exact: true }).fill('دعم هونكس')
  await dialog.getByRole('button', { name: 'حفظ', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  expect(saved.mail_reply_to_address).toBe('support@example.test')
  expect(saved.mail_reply_to_name).toBe('دعم هونكس')
  expect(saved.mail_password).toBe('')
  expect(saved.is_global).toBe(true)
})
