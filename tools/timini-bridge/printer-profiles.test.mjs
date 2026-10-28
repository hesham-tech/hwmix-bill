import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { printerId, printerProfiles, printerForJob, rememberPrinter, activatePrinter } from './printer-profiles.mjs';
import { checkPrinterReadiness } from './printer-readiness.mjs';
import { createBridge } from './server.mjs';
import { startDesktop } from './desktop.mjs';
import { mkdtemp, writeFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, basename } from 'node:path';
import { randomUUID } from 'node:crypto';

const first = { configured: true, bluetooth: '11:22:33:44:55:66', bluetoothName: 'First printer', modelKey: 'toprint_hprt_esc_zl1', geometry: { widthDots: 384, dpi: 203 }, paperOptions: [{ value: 'tag_384r' }], printerConfigPath: 'printer-first.json' };
const second = { ...first, bluetooth: '22:33:44:55:66:77', bluetoothName: 'Second printer', modelKey: 'other-model', geometry: { widthDots: 576, dpi: 300 }, printerConfigPath: 'printer-second.json' };
test('saved printer address does not require repeated advertisement; radio-off still blocks it', async () => {
  let scans = 0;
  const dependencies = { radios: async () => ({ available: true, states: ['On'] }), scan: async () => { scans++; throw new Error('must not scan'); } };
  const ready = await checkPrinterReadiness(first, dependencies);
  assert.equal(ready.bluetooth, first.bluetooth); assert.equal(scans, 0);
  await assert.rejects(checkPrinterReadiness(first, { ...dependencies, radios: async () => ({ available: true, states: ['Off'] }) }), { code: 'BLUETOOTH_OFF' });
});
test('multiple printers preserve their model, geometry and profile while switching the default', () => {
  const config = rememberPrinter(first, second);
  assert.equal(printerProfiles(config).length, 2); assert.equal(config.bluetooth, second.bluetooth);
  const selected = activatePrinter(config, printerId(first));
  assert.equal(selected.bluetooth, first.bluetooth); assert.equal(selected.geometry.widthDots, 384);
  assert.equal(printerForJob(selected, printerId(second)).geometry.widthDots, 576);
  assert.equal(printerForJob(selected, printerId(first)).printerConfigPath, 'printer-first.json');
  assert.throws(() => activatePrinter(config, 'arbitrary-printer'));
  const updated = rememberPrinter(config, { ...second, bluetoothName: 'Renamed second' });
  assert.equal(printerProfiles(updated).length, 2);
});
test('correcting a legacy descriptive target removes the invalid legacy entry', () => {
  const config = rememberPrinter({ ...first, bluetooth: 'ليبول برينت' }, first);
  assert.equal(printerProfiles(config).length, 1); assert.equal(config.activePrinterId, printerId(first));
});
test('queued jobs keep the selected printer even when the application default changes', async t => {
  const config = { ...first, cliPath: 'fixture.exe', token: 'a'.repeat(64), allowedOrigins: ['http://localhost:5173'] };
  let release; const gate = new Promise(done => { release = done; }); const sent = [];
  const server = createBridge(config, async (snapshot, job) => { sent.push({ id: job.id, address: snapshot.bluetooth, width: snapshot.geometry.widthDots }); if (sent.length === 1) await gate; });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(done => { server.closeAllConnections(); server.close(done); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, data) => fetch(base + path, { method: data ? 'POST' : 'GET', headers: { Origin: config.allowedOrigins[0], 'X-Print-Token': config.token, 'Content-Type': 'application/json' }, ...(data ? { body: JSON.stringify(data) } : {}) });
  const job = id => ({ id, pdf: Buffer.from('%PDF-1.3\nfixture content\n%%EOF').toString('base64'), count: 1, darkness: 3, paper: 'tag_384r' });
  await request('/jobs', job('first-printer-snapshot')); await request('/jobs', job('second-printer-snapshot'));
  Object.assign(config, second); await request('/jobs', job('third-printer-snapshot')); release();
  for (let n = 0; n < 30; n++) { const result = await (await request('/jobs/third-printer-snapshot')).json(); if (result.status === 'succeeded') break; await new Promise(done => setTimeout(done, 5)); }
  assert.deepEqual(sent.map(item => item.address), [first.bluetooth, first.bluetooth, second.bluetooth]);
  assert.deepEqual(sent.map(item => item.width), [384, 384, 576]);
});
test('native printer switch persists, keeps other driver profiles, and refuses switching during a print', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'hwnix-profile-switch-')); const cli = join(directory, 'fixture.exe'); await writeFile(cli, 'fixture');
  const exported = []; let release; const gate = new Promise(done => { release = done; }); const sent = [];
  const options = { dataDirectory: directory, cliPath: cli, port: 0, noExit: true,
    catalog: [{ key: first.modelKey, label: 'First model' }, { key: second.modelKey, label: 'Second model' }],
    checkPrinter: async input => ({ bluetooth: input.bluetooth, bluetoothName: input.bluetooth }),
    preparePrinter: async (_cli, _data, selection) => { const path = join(directory, `printer-${randomUUID()}.json`); await writeFile(path, '{}'); exported.push(path); return { ...selection, configured: true, geometry: selection.modelKey === first.modelKey ? first.geometry : second.geometry, paperOptions: first.paperOptions, printerConfigPath: path }; },
    documentRunner: async (config, job) => { sent.push({ address: config.bluetooth, id: job.id }); await gate; },
  };
  let app = await startDesktop(options);
  const close = async () => { app.server.closeAllConnections(); await new Promise(done => app.server.close(done)); };
  t.after(async () => { release(); await close(); assert.equal(dirname(resolve(directory)), resolve(tmpdir())); assert.ok(basename(directory).startsWith('hwnix-profile-switch-')); await rm(directory, { recursive: true, force: true }); });
  const request = (path, data) => { const base = `http://127.0.0.1:${app.server.address().port}`; return fetch(base + '/admin/' + path, { method: data ? 'POST' : 'GET', headers: { Origin: base, 'X-Admin-Token': app.adminKey, 'Content-Type': 'application/json' }, ...(data ? { body: JSON.stringify(data) } : {}) }); };
  const selection = printer => ({ bluetooth: printer.bluetooth, modelKey: printer.modelKey, allowedOrigins: ['https://bill.hwnix.com'] });
  assert.equal((await request('config', selection(first))).status, 200);
  assert.equal((await request('config', selection(second))).status, 200); await access(exported[0]);
  assert.equal((await request('config', selection(second))).status, 200); await access(exported[0]); await assert.rejects(access(exported[1]));
  assert.equal((await request('select-printer', { printerId: printerId(first) })).status, 200);
  const imported = await (await request('documents', { files: [{ name: 'fixture.pdf', data: Buffer.from('%PDF-1.3\nfixture content\n%%EOF').toString('base64') }] })).json();
  const job = { id: 'selected-printer-integration', printerId: printerId(second), documentIds: [imported.documents[0].id], paper: 'tag_384r', darkness: 3, copies: 1 };
  assert.equal((await request('print', { ...job, printerId: 'invalid-printer' })).status, 400);
  assert.equal((await request('print', job)).status, 202);
  assert.equal((await request('select-printer', { printerId: printerId(second) })).status, 409);
  release();
  for (let i = 0; i < 30; i++) { const result = await (await request('jobs/' + job.id)).json(); if (result.status === 'succeeded') break; await new Promise(done => setTimeout(done, 5)); }
  assert.equal(sent[0].address, second.bluetooth);
  await close(); app = await startDesktop(options);
  const state = await (await request('state')).json(); assert.equal(state.printers.length, 2); assert.equal(state.activePrinterId, printerId(first));
});
