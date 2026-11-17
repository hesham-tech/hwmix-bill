import { test, expect } from '@playwright/test';
import changelogs from '../../src/config/changelogs.json' with { type: 'json' };

test.use({ serviceWorkers: 'block' });

async function fixture(page, superAdmin) {
  const calls = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { sessionStorage.setItem('token', 'fixture-backup-session'); localStorage.setItem('guidance_enabled', 'false'); });
  await page.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  await page.route('**/api/**', route => route.abort());
  await page.route('**/api/v1/**', async route => {
    const req = route.request(); const path = new URL(req.url()).pathname;
    let data = [];
    if (path.endsWith('/bootstrap')) data = { user: { id: 7, is_staff_or_admin: true, active_company_id: 1, company_id: 1,
      full_name: 'مستخدم اختبار', subscription: { status: 'active' }, roles: [],
      settings: { acknowledged_updates: changelogs.map(c => c.version) }, permissions: superAdmin ? ['admin.super'] : ['admin.company'],
      companies: [{ id: 1, name: 'شركة اختبار', settings: {} }], branches: [] } };
    else if (path.endsWith('/guidance/setup')) data = { can_manage: false, state: { hidden: true, finished: true }, steps: [], issues: [], data: {} };
    else if (path.includes('/backups')) {
      calls.push({ method: req.method(), path, body: req.postDataJSON(), headers: req.headers() });
      if (path.endsWith('/confirm-password')) {
        const body = req.postDataJSON();
        if (body.password !== 'fixture-password') return route.fulfill({ status: 422, json: { message: 'كلمة المرور غير صحيحة.' } });
        data = { confirmation_token: `fixture-${body.action}-confirmation`, expires_in: 300 };
      } else if (path.endsWith('/1/download')) {
        expect(req.headers()['x-backup-confirmation-token']).toBe('fixture-download-confirmation');
        expect(new URL(req.url()).search).toBe('');
        return route.fulfill({ contentType: 'application/zip', body: 'synthetic-archive' });
      } else if (path.endsWith('/1/restore')) {
        expect(req.headers()['x-backup-confirmation-token']).toBe('fixture-restore-confirmation');
        expect(req.postDataJSON()).toEqual({ token: 'fixture-secondary' });
        return route.fulfill({ status: 403, json: { message: 'رمز الاستعادة غير صحيح.' } });
      } else if (path.endsWith('/backups')) data = [{ id: 1, filename: 'fixture.zip', status: 'success', type: 'manual', size_bytes: 17, completed_at: '2026-01-01' }];
    }
    await route.fulfill({ json: { status: true, data } });
  });
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.goto('/app/backups', { waitUntil: 'domcontentloaded' });
  return { calls, errors };
}

for (const width of [390, 1440]) {
  test(`system admin confirms identity for backup download at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const { calls, errors } = await fixture(page, true);
    await expect(page.getByRole('button', { name: 'تنزيل النسخة', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'تنزيل النسخة', exact: true }).click();
    await page.getByLabel('كلمة المرور الحالية', { exact: true }).fill('wrong');
    const refused = page.waitForResponse(r => r.url().endsWith('/backups/confirm-password') && r.status() === 422);
    await page.getByRole('button', { name: 'تأكيد التنزيل', exact: true }).click(); await refused;
    await expect(page.getByLabel('كلمة المرور الحالية', { exact: true })).toHaveValue('');
    await expect(page.getByText('كلمة المرور غير صحيحة.', { exact: true })).toBeVisible();
    expect(calls.some(c => c.path.endsWith('/download'))).toBe(false);
    await page.getByLabel('كلمة المرور الحالية', { exact: true }).fill('fixture-password');
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'تأكيد التنزيل', exact: true }).click();
    expect((await downloaded).suggestedFilename()).toBe('backup-1.zip');
    await expect(page.getByText('تأكيد تنزيل نسخة النظام', { exact: true })).not.toBeVisible();
    await page.getByRole('button', { name: 'استعادة النسخة', exact: true }).click();
    await page.getByLabel('رمز التأكيد (Secure Token)').fill('fixture-secondary');
    await page.getByLabel('كلمة المرور الحالية', { exact: true }).fill('fixture-password');
    const restoreRefused = page.waitForResponse(r => r.url().endsWith('/backups/1/restore') && r.status() === 403);
    await page.getByRole('button', { name: 'تأكيد الاستعادة الآن', exact: true }).click(); await restoreRefused;
    await expect(page.getByLabel('كلمة المرور الحالية', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('رمز التأكيد (Secure Token)')).toHaveValue('');
    await expect(page.getByText('رمز الاستعادة غير صحيح.', { exact: true })).toBeVisible();
    const stored = await page.evaluate(() => [Object.values(localStorage), Object.values(sessionStorage)].flat().join('|'));
    expect(stored).not.toContain('fixture-password'); expect(stored).not.toContain('fixture-secondary');
    expect(errors).toEqual([]);
  });
}

test('company manager never requests system backup data', async ({ page }) => {
  const { calls, errors } = await fixture(page, false);
  await expect(page.getByRole('button', { name: 'تنزيل النسخة', exact: true })).toHaveCount(0);
  expect(calls).toHaveLength(0);
  expect(errors).toEqual([]);
});
