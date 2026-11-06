import { chromium, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';

// Isolated browser context against the local production preview, never production.
const baseURL = process.argv[2] || 'http://127.0.0.1:5178';
if (!['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname)) throw new Error('Local preview required');
const workerPath = 'dist/sw.js';
const original = readFileSync(workerPath, 'utf8');
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
if (!original.includes(version)) throw new Error('Worker must contain the frontend release revision');
const saveWorker = source => {
  writeFileSync(workerPath, source);
  writeFileSync(workerPath + '.gz', gzipSync(source));
  writeFileSync(workerPath + '.br', brotliCompressSync(source));
};
const company = { id: 1, name: 'SW fixture', settings: {}, print_settings: {} };
const user = { id: 1, full_name: 'SW fixture', active_company_id: 1, companies: [company], branches: [], is_staff_or_admin: true, permissions: ['admin.super'], roles: [], created_at: '2020-01-01', settings: { acknowledged_updates: JSON.parse(readFileSync('src/config/changelogs.json', 'utf8')).map(release => release.version) } };
const browser = await chromium.launch();
try {
  saveWorker(original);
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  await context.addInitScript(user => {
    // Do not recreate the test session on reload; preservation must be real.
    if (!localStorage.getItem('sw-smoke-initialized')) {
      localStorage.setItem('sw-smoke-initialized', 'yes');
      localStorage.setItem('token', 'sw-fixture-token');
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('guidance_enabled', 'false');
      sessionStorage.setItem('sw-session-marker', 'preserved');
    }
  }, user);
  await context.route('**/api/v1/**', route => route.fulfill({ json: { status: true, data: new URL(route.request().url()).pathname.endsWith('/bootstrap') ? { user, screen_preferences: {} } : [], total: 0 } }));
  const page = await context.newPage();
  await page.goto(baseURL + '/app/customers', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.customers-page')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.customers-page')).toBeVisible();
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  // Simulate a second release by changing only the explicitly versioned revision.
  saveWorker(original.replaceAll(version, version + '-upgrade-fixture'));
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  await expect(page.locator('.app-update-notice')).toBeVisible({ timeout: 30000 });
  expect(await page.evaluate(() => sessionStorage.getItem('sw-session-marker'))).toBe('preserved');
  await Promise.all([
    page.waitForEvent('domcontentloaded'),
    page.locator('.app-update-notice').getByRole('button', { name: 'تحديث الآن' }).click(),
  ]);
  await expect(page.locator('.customers-page')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBe('sw-fixture-token');
  expect(await page.evaluate(() => sessionStorage.getItem('sw-session-marker'))).toBe('preserved');
  console.log('PASS: worker upgrade waits for user action and preserves token and session storage');
} finally {
  saveWorker(original);
  await browser.close();
}
