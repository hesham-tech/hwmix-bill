import { chromium } from 'playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const args = process.argv.slice(2);
const argument = name => { const index = args.indexOf(name); if (index < 0 || !args[index + 1]) throw new Error(`Missing ${name}`); return args[index + 1]; };
const directory = resolve(argument('--data-dir'));
const output = resolve(argument('--output-dir'));
await mkdir(output, { recursive: true });
const url = (await readFile(join(directory, 'admin.url'), 'utf8')).trim();
const base = new URL(url).origin;
const adminKey = new URLSearchParams(new URL(url).hash.slice(1)).get('key');
assert.equal(new URL(url).hostname, '127.0.0.1');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1120, height: 1080 }, permissions: ['local-network-access'] });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-tab="settings"]').click();
  await page.getByLabel('تعريف الطابعة', { exact: true }).selectOption('toprint_hprt_esc_zl1');
  await page.getByLabel('اسم Bluetooth أو عنوان الطابعة').fill('P2_3083');
  await page.getByRole('button', { name: 'حفظ الطابعة والموقع' }).click();
  try { await page.getByText('تم حفظ الإعداد.', { exact: false }).waitFor({ timeout: 120_000 }); }
  catch (error) { await page.screenshot({ path: join(output, 'settings-failure.png'), fullPage: true }); throw new Error(`${error.message}; UI: ${await page.locator('#notice').textContent()}`); }
  const token = await page.locator('#token').inputValue();
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(new URL(page.url()).hash, '', 'Session secret must be removed from the address bar.');
  await page.screenshot({ path: join(output, 'desktop-settings.png'), fullPage: true });
  const config = JSON.parse(await readFile(join(directory, 'config.local.json'), 'utf8'));
  assert.deepEqual(config.allowedOrigins, ['https://bill.hwnix.com']);
  assert.deepEqual(config.geometry, { widthDots: 384, dpi: 203 });
  const printer = JSON.parse(await readFile(config.printerConfigPath, 'utf8'));
  assert.deepEqual(printer.profile_overrides.stream, { chunk_size: 96, delay_ms: 20 });
  const models = await page.locator('#model option').count();
  assert.ok(models > 100);

  const cloud = await context.newPage();
  // Intercept the document; no request or token is sent to the live cloud site.
  await cloud.route('https://bill.hwnix.com/__print_bridge_test', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="ar"><title>Cloud origin integration test</title></html>' }));
  await cloud.goto('https://bill.hwnix.com/__print_bridge_test');
  const health = await cloud.evaluate(async ({ base, token }) => {
    const response = await fetch(base + '/health', { headers: { 'X-Print-Token': token } });
    if (!response.ok) throw new Error(`Cloud health failed: ${response.status}`);
    return await response.json();
  }, { base, token });
  assert.equal(health.configured, true);
  assert.equal(health.model, 'toprint_hprt_esc_zl1');
  assert.equal(health.bluetooth, 'P2_3083');
  const blockedAdmin = await fetch(base + '/admin/state', { headers: { Origin: 'https://bill.hwnix.com', 'X-Admin-Token': adminKey } });
  assert.equal(blockedAdmin.status, 403);
  const blockedOtherSite = await fetch(base + '/health', { headers: { Origin: 'https://other.example', 'X-Print-Token': token } });
  assert.equal(blockedOtherSite.status, 403);
  assert.deepEqual(errors, []);
  const report = { application: 'HWNiX Print Bridge 1.1.0', models, settingsUi: 'passed', profileExport: 'passed',
    p2ConservativeStreaming: 'passed', cloudHttpsOriginToLoopback: 'passed', cloudCannotManageLocalSettings: 'passed',
    unauthorizedWebsite: 'blocked', physicalPrintRequested: false, browserErrors: errors };
  await writeFile(join(output, 'package-verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
