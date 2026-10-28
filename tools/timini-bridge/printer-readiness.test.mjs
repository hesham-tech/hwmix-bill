import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { checkPrinterReadiness, discoverPrinters, selectDiscoveredPrinter, friendlyPrinterError, PrinterValidationError } from './printer-readiness.mjs';
import { createBridge } from './server.mjs';
import { startDesktop } from './desktop.mjs';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, basename } from 'node:path';

const scanText = 'P2_3083 [profile: toprint_hprt_esc_zl1] [model: toprint_hprt_esc_zl1; source: ToPrint] (86:67:7A:50:30:83) [classic+ble]';
const config = { cliPath: 'fixture.exe', bluetooth: 'P2_3083', token: 'a'.repeat(64), allowedOrigins: ['http://localhost:5173'] };
const radio = states => async () => ({ available: true, states });
test('Bluetooth off, disabled or unavailable blocks before discovery or printing', async () => {
  for (const [states, expected] of [[['Off'], 'BLUETOOTH_OFF'], [['Disabled'], 'BLUETOOTH_DISABLED'], [[], 'BLUETOOTH_UNAVAILABLE']]) {
    let scans = 0;
    await assert.rejects(discoverPrinters('fixture.exe', { radios: radio(states), scan: async () => { scans++; } }), { code: expected });
    assert.equal(scans, 0);
  }
});
test('unknown radio API falls back to actual discovery without falsely claiming Bluetooth is off', async () => {
  const found = await checkPrinterReadiness(config, { radios: async () => ({ available: false, states: [] }), scan: async () => ({ stdout: scanText }) });
  assert.equal(found.bluetooth, '86:67:7A:50:30:83'); assert.equal(found.radioKnown, false);
});
test('discovered identity uses address, and an arbitrary friendly label cannot become a printer target', async () => {
  const dependencies = { radios: radio(['On']), scan: async () => ({ stdout: scanText }) };
  const found = await checkPrinterReadiness(config, dependencies);
  assert.equal(found.bluetooth, '86:67:7A:50:30:83'); assert.equal(found.bluetoothName, 'P2_3083');
  await assert.rejects(checkPrinterReadiness({ ...config, bluetooth: 'ليبول برينت' }, dependencies), { code: 'PRINTER_NOT_FOUND' });
  await assert.rejects(checkPrinterReadiness(config, { ...dependencies, scan: async () => ({ stdout: '' }) }), { code: 'PRINTER_NOT_FOUND' });
  assert.throws(() => selectDiscoveredPrinter('P2', [{ name: 'P2', address: 'AA' }, { name: 'P2', address: 'BB' }]), { code: 'PRINTER_AMBIGUOUS' });
});
test('discovery timeout is bounded and reported before sending any print data', async () => {
  await assert.rejects(discoverPrinters('fixture.exe', { radios: radio(['On']), scan: async (_path, _args, timeout) => { assert.equal(timeout, 35000); throw Object.assign(new Error('timeout'), { killed: true }); } }), { code: 'DISCOVERY_TIMEOUT' });
});
test('technical startup/unicode output is replaced with actionable Arabic and partial-send warning', () => {
  const error = friendlyPrinterError(new Error("Startup: timiniprint_version=0.9 Error: No device matches '\\u0644'"));
  assert.equal(error.code, 'PRINTER_NOT_FOUND'); assert.ok(!error.message.includes('Startup:')); assert.ok(!error.message.includes('\\u'));
  assert.equal(friendlyPrinterError(new Error('WinError 10060 timed out')).code, 'CONNECTION_FAILED');
  assert.equal(friendlyPrinterError(new Error('Access denied device in use')).code, 'PRINTER_BUSY');
  assert.ok(friendlyPrinterError(new Error('Disconnected'), {}, true).message.includes('قد يكون جزء'));
});
test('each queued job validates again; failures send nothing, are not retried and do not poison later jobs', async t => {
  let checks = 0; const sends = [];
  const server = createBridge(config, async (effective, job) => sends.push({ bluetooth: effective.bluetooth, id: job.id }), null, {
    checkPrinter: async () => { checks++; if (checks === 1) throw new PrinterValidationError('BLUETOOTH_OFF', 'Bluetooth مغلق'); return { bluetooth: '86:67:7A:50:30:83' }; },
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(done => { server.closeAllConnections(); server.close(done); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, data) => fetch(base + path, { method: data ? 'POST' : 'GET', headers: { Origin: config.allowedOrigins[0], 'X-Print-Token': config.token, 'Content-Type': 'application/json' }, ...(data ? { body: JSON.stringify(data) } : {}) });
  const body = { id: 'first-printer-validation', pdf: Buffer.from('%PDF-1.3\nfixture\n%%EOF').toString('base64'), count: 1, darkness: 3, paper: 'tag_384r' };
  await request('/jobs', body); await request('/jobs', body);
  let first = await (await request('/jobs/' + body.id)).json();
  assert.equal(first.status, 'failed'); assert.equal(first.failureStage, 'checking'); assert.equal(first.errorCode, 'BLUETOOTH_OFF'); assert.equal(sends.length, 0); assert.equal(checks, 1);
  const second = { ...body, id: 'second-printer-validation' }; await request('/jobs', second);
  for (let attempt = 0; attempt < 20; attempt++) { const job = await (await request('/jobs/' + second.id)).json(); if (job.status === 'succeeded') break; await new Promise(done => setTimeout(done, 5)); }
  assert.equal(checks, 2); assert.deepEqual(sends, [{ bluetooth: '86:67:7A:50:30:83', id: second.id }]);
});
test('native settings save canonical address, reject a wrong name without overwriting valid settings, and offer a read-only check', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'hwnix-validation-'));
  const cli = join(directory, 'fixture.exe'); await writeFile(cli, 'fixture');
  const app = await startDesktop({ dataDirectory: directory, cliPath: cli, port: 0, noExit: true,
    catalog: [{ key: 'toprint_hprt_esc_zl1', label: 'ToPrint P2' }],
    checkPrinter: input => checkPrinterReadiness(input, { radios: radio(['On']), scan: async () => ({ stdout: scanText }) }),
    preparePrinter: async (_cli, _directory, selection) => ({ ...selection, configured: true, geometry: { widthDots: 384, dpi: 203 }, paperOptions: [{ value: 'tag_384r', title: 'Tag' }] }),
  });
  t.after(async () => { app.server.closeAllConnections(); await new Promise(done => app.server.close(done)); assert.equal(dirname(resolve(directory)), resolve(tmpdir())); assert.ok(basename(directory).startsWith('hwnix-validation-')); await rm(directory, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const post = (path, data) => fetch(base + '/admin/' + path, { method: 'POST', headers: { Origin: base, 'X-Admin-Token': app.adminKey, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const selection = { bluetooth: 'P2_3083', modelKey: 'toprint_hprt_esc_zl1', allowedOrigins: ['https://bill.hwnix.com'] };
  assert.equal((await post('config', selection)).status, 200);
  const configPath = join(directory, 'config.local.json'); const before = await readFile(configPath, 'utf8');
  assert.equal(JSON.parse(before).bluetooth, '86:67:7A:50:30:83'); assert.equal(JSON.parse(before).bluetoothName, 'P2_3083');
  const bad = await post('config', { ...selection, bluetooth: 'ليبول برينت' });
  assert.equal(bad.status, 400); assert.equal((await bad.json()).errorCode, 'PRINTER_NOT_FOUND');
  assert.equal(await readFile(configPath, 'utf8'), before);
  const check = await post('check-printer', {}); assert.equal(check.status, 200); assert.equal((await check.json()).found, true);
});
