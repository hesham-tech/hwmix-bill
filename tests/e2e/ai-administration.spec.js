import { test, expect } from '@playwright/test';
import changelogs from '../../src/config/changelogs.json' with { type: 'json' };
test.use({ serviceWorkers: 'block' });
async function fixture(page, permissions) {
  const adminCalls = []; const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { sessionStorage.setItem('token', 'fixture-ai-session'); localStorage.setItem('guidance_enabled', 'false'); });
  // A local browser test must never contact external assets, API endpoints or report telemetry.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return ['localhost', '127.0.0.1'].includes(url.hostname) && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort();
  });
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname; let data = [];
    if (path.endsWith('/bootstrap')) data = { user: { id: 7, is_staff_or_admin: true, active_company_id: 2, company_id: 2, full_name: 'مستخدم اختبار', roles: [], permissions,
      settings: { acknowledged_updates: changelogs.map(c => c.version) }, companies: [{ id: 2, name: 'شركة اختبار', settings: {} }], branches: [] } };
    else if (path.endsWith('/guidance/setup')) data = { can_manage: false, state: { hidden: true, finished: true }, steps: [], issues: [], data: {} };
    else if (path.includes('/ai/admin/')) {
      adminCalls.push(path);
      expect(route.request().headers().authorization).toBe('Bearer fixture-ai-session');
      expect(new URL(route.request().url()).searchParams.has('company_id')).toBe(false);
      if (path.endsWith('/stats')) data = { providers_count: 1, accounts_count: 1, agents_count: 0, prompts_count: 0, capabilities_count: 1, total_usage_cost: 3, total_tokens_used: 10 };
    }
    await route.fulfill({ json: { success: true, status: true, data } });
  });
  return { adminCalls, errors };
}
for (const width of [390, 1440]) {
  test(`company administrator is blocked from every AI page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const { adminCalls, errors } = await fixture(page, ['admin.company']);
    for (const suffix of ['', '/agents', '/prompts', '/usage', '/models', '/accounts']) {
      await page.goto('/ai-platform' + suffix);
      await expect(page).toHaveURL(/forbidden/);
    }
    expect(adminCalls).toEqual([]); expect(errors).toEqual([]);
  });
  test(`system administrator can load AI dashboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const { adminCalls, errors } = await fixture(page, ['admin.super']);
    await page.goto('/ai-platform');
    await expect.poll(() => adminCalls.includes('/api/v1/ai/admin/stats')).toBe(true);
    await expect.poll(() => adminCalls.includes('/api/v1/ai/admin/providers')).toBe(true);
    await expect(page).toHaveURL(/ai-platform/); expect(errors).toEqual([]);
  });
}
