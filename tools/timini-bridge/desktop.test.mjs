import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, basename } from 'node:path';
import { startDesktop } from './desktop.mjs';
import { normalizeOrigins, parseDevices, parseModels, validateSelection, profileDetails, newDesktopConfig } from './desktop-config.mjs';

test('cloud origins normalize safely and do not allow arbitrary insecure websites', () => {
  assert.deepEqual(normalizeOrigins(['https://bill.hwnix.com/', 'https://bill.hwnix.com']), ['https://bill.hwnix.com']);
  assert.deepEqual(normalizeOrigins(['http://127.0.0.1:5173']), ['http://127.0.0.1:5173']);
  for (const origin of ['*', 'http://evil.example', 'https://bill.hwnix.com/path', 'https://user:pass@bill.hwnix.com', 'file:///x']) assert.throws(() => normalizeOrigins([origin]));
  assert.notEqual(newDesktopConfig('driver.exe').token, newDesktopConfig('driver.exe').token);
});

test('Bluetooth scan groups the two P2 protocol candidates as one physical device', () => {
  const text = 'P2_3083 [profile: d1] [model: pocket_printer; source: Tiny Print] (86:67:7A:50:30:83) [classic+ble]\nP2_3083 [profile: toprint_hprt_esc_zl1] [model: toprint_hprt_esc_zl1; source: ToPrint] (86:67:7A:50:30:83) [classic+ble]';
  const devices = parseDevices(text);
  assert.equal(devices.length, 1);
  assert.deepEqual(devices[0].models, ['pocket_printer', 'toprint_hprt_esc_zl1']);
});

test('model selection uses the shipped catalog, not caller-supplied command arguments', () => {
  const catalog = parseModels('toprint_hprt_esc_zl1: P11, P2, P5 [source: ToPrint]\npocket_printer: Pocket Printer, P2 [source: Tiny Print]');
  assert.equal(catalog.length, 2);
  const input = { bluetooth: 'P2_9999', modelKey: catalog[0].key, allowedOrigins: ['https://bill.hwnix.com/'] };
  assert.equal(validateSelection(input, catalog).bluetooth, 'P2_9999');
  assert.throws(() => validateSelection({ ...input, modelKey: '--scan' }, catalog));
  assert.throws(() => validateSelection({ ...input, bluetooth: '--feed' }, catalog));
  const details = profileDetails({ profile_overrides: { dev_dpi: 300, paper_presets: [{ key: 'paper_576', label: 'Label', render_width_px: 576 }], default_image_pipeline: { formats: ['bw1'] } } });
  assert.deepEqual(details.geometry, { widthDots: 576, dpi: 300 });
});

test('installed service creates private per-computer configuration and protects local management', async t => {
  const dataDirectory = await mkdtemp(join(tmpdir(), 'hwnix-installer-test-'));
  const cliPath = join(dataDirectory, 'test-driver.exe');
  await writeFile(cliPath, 'fixture');
  const app = await startDesktop({ dataDirectory, cliPath, port: 0, noExit: true, checkPrinter: async () => ({}),
    catalog: [{ key: 'toprint_hprt_esc_zl1', label: 'P2 ToPrint' }],
    preparePrinter: async (_cli, _data, selection) => ({ ...selection, configured: true, geometry: { widthDots: 384, dpi: 203 }, paperOptions: [{ value: 'tag_384r', title: 'Tag' }] }),
  });
  t.after(async () => {
    app.server.closeAllConnections(); await new Promise(resolveClose => app.server.close(resolveClose));
    assert.equal(dirname(resolve(dataDirectory)), resolve(tmpdir())); assert.ok(basename(dataDirectory).startsWith('hwnix-installer-test-'));
    await rm(dataDirectory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const request = (path, options = {}) => fetch(base + path, { ...options, headers: { 'X-Admin-Token': app.adminKey, Origin: base, 'Content-Type': 'application/json', ...options.headers } });
  const config = JSON.parse(await readFile(join(dataDirectory, 'config.local.json'), 'utf8'));
  assert.deepEqual(config.allowedOrigins, ['https://bill.hwnix.com']);
  assert.equal(config.configured, false);
  assert.notEqual(config.token, app.adminKey);
  assert.equal((await request('/admin/state', { headers: { 'X-Admin-Token': '' } })).status, 403);
  assert.equal((await request('/admin/state', { headers: { Origin: 'https://bill.hwnix.com' } })).status, 403);
  assert.equal((await request('/')).headers.get('content-security-policy').includes("frame-ancestors 'none'"), true);
  assert.equal((await request('/admin/config', { method: 'POST', body: JSON.stringify({ bluetooth: 'P2_9999', modelKey: 'toprint_hprt_esc_zl1', allowedOrigins: ['https://bill.hwnix.com/'] }) })).status, 200);
  const health = await (await fetch(base + '/health', { headers: { Origin: 'https://bill.hwnix.com', 'X-Print-Token': config.token } })).json();
  assert.equal(health.configured, true);
  assert.equal(health.bluetooth, 'P2_9999');
  assert.equal((await request('/admin/state')).status, 200);
});
