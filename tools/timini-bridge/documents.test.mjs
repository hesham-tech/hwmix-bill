import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { join, resolve, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { decodeUpload, printOptions, createDocumentStore } from './documents.mjs';
import { defaultTemplate, normalizeTemplate } from './desktop/editor-schema.mjs';
import { startDesktop } from './desktop.mjs';

const pdf = Buffer.from('%PDF-1.3\nfixture document\n%%EOF').toString('base64');
test('native file imports validate bytes, limits and types rather than accepting executable content', () => {
  const [file] = decodeUpload([{ name: '../../name.pdf', data: pdf }]);
  assert.equal(file.name, 'name.pdf'); assert.equal(file.type, 'pdf');
  assert.throws(() => decodeUpload([{ name: 'image.png', data: Buffer.from('MZ executable').toString('base64') }]));
  assert.throws(() => decodeUpload([]));
  const store = createDocumentStore(); store.add([file]); assert.equal(store.list().length, 1); store.remove(file.id); assert.equal(store.list().length, 0);
});
test('file printing rejects invalid copies, image modes and PDF command injection', () => {
  const config = { configured: true, paperOptions: [{ value: 'tag_384r' }] };
  for (const bad of [{ copies: 0 }, { copies: 21 }, { darkness: 6 }, { pdfPages: '--feed' }, { pdfPages: '0' }, { pdfPages: '5-2' }, { imageMode: 'arbitrary' }]) assert.throws(() => printOptions(bad, config));
  assert.equal(printOptions({ pdfPages: '1,3-5', copies: 2 }, config).copies, 2);
});
test('editor preserves four text rows plus one switchable code row and validates layout inputs', () => {
  const template = defaultTemplate(); assert.equal(normalizeTemplate(template).rows.length, 4);
  assert.throws(() => normalizeTemplate({ ...template, heightMm: -1 }));
  assert.throws(() => normalizeTemplate({ ...template, rows: template.rows.slice(0, 3) }));
  assert.throws(() => normalizeTemplate({ ...template, code: { ...template.code, value: 'قيمة عربية', type: 'barcode' } }));
  assert.equal(normalizeTemplate({ ...template, code: { ...template.code, value: 'قيمة عربية', type: 'qr' } }).code.type, 'qr');
});
test('website handoff opens a preview task without printing; only authenticated native confirmation prints it', async t => {
  const data = await mkdtemp(join(tmpdir(), 'hwnix-native-v2-test-')); const driver = join(data, 'fixture.exe'); await writeFile(driver, 'fixture');
  const printed = [];
  const app = await startDesktop({ dataDirectory: data, cliPath: driver, port: 0, noExit: true, checkPrinter: async () => ({}),
    catalog: [{ key: 'toprint_hprt_esc_zl1', label: 'P2 ToPrint' }],
    preparePrinter: async (_cli, _dir, selection) => ({ ...selection, configured: true, geometry: { widthDots: 384, dpi: 203 }, paperOptions: [{ value: 'tag_384r', title: 'Tag' }] }),
    documentRunner: async (_config, job, documents) => { printed.push({ id: job.id, documents: documents.length }); },
  });
  t.after(async () => { app.server.closeAllConnections(); await new Promise(done => app.server.close(done)); assert.equal(dirname(resolve(data)), resolve(tmpdir())); assert.ok(basename(data).startsWith('hwnix-native-v2-test-')); await rm(data, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const admin = (path, body) => fetch(base + '/admin/' + path, { method: body === undefined ? 'GET' : 'POST', headers: { Origin: base, 'X-Admin-Token': app.adminKey, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  await admin('config', { bluetooth: 'P2_test', modelKey: 'toprint_hprt_esc_zl1', allowedOrigins: ['https://bill.hwnix.com'] });
  const config = JSON.parse(await readFile(join(data, 'config.local.json'), 'utf8'));
  const id = '12345678-1234-1234-1234-123456789abc';
  const handoff = () => fetch(base + '/handoff', { method: 'POST', headers: { Origin: 'https://bill.hwnix.com', 'X-Print-Token': config.token, 'Content-Type': 'application/json' }, body: JSON.stringify({ id, pdf, count: 1, darkness: 3, paper: 'tag_384r' }) });
  assert.equal((await handoff()).status, 202); assert.equal((await handoff()).status, 202); assert.equal(printed.length, 0);
  assert.equal(JSON.parse(await readFile(join(data, 'window-request.json'), 'utf8')).target, id);
  const state = await (await admin('state')).json(); assert.equal(state.documents.length, 1); assert.equal(state.documents[0].source, 'website');
  assert.equal((await fetch(base + '/admin/documents/' + id, { headers: { Origin: 'https://bill.hwnix.com', 'X-Print-Token': config.token } })).status, 403);
  const job = { id: '22345678-1234-1234-1234-123456789abc', documentIds: [id], paper: 'tag_384r', copies: 1, darkness: 3 };
  assert.equal((await admin('print', job)).status, 202); assert.equal((await admin('print', job)).status, 200);
  assert.equal(printed.length, 1);
  await admin('template', defaultTemplate()); assert.equal((await (await admin('template')).json()).template.rows.length, 4);
});
