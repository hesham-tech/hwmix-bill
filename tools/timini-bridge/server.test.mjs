import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createBridge, validateJob, validateConfig, buildArguments, printExecutable } from './server.mjs';

const origin = 'http://localhost:5173';
const token = 'a'.repeat(64);
const config = { cliPath: 'C:\\printer\\TiMini.exe', token, bluetooth: 'P2_3083', allowedOrigins: [origin] };
const payload = (id = '12345678-1234-1234-1234-123456789abc') => ({ id, count: 1, darkness: 3, paper: 'tag_384r', pdf: Buffer.from('%PDF-1.3\nexample test payload\n%%EOF').toString('base64') });

async function fixture(t, runner) {
  const server = createBridge(config, runner);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, options = {}) => fetch(base + path, {
    ...options, headers: { Origin: origin, 'X-Print-Token': token, 'Content-Type': 'application/json', ...options.headers },
  });
  return { request };
}

test('rejects foreign websites, missing tokens and unsafe config', async t => {
  const { request } = await fixture(t, async () => {});
  assert.equal((await request('/health', { headers: { Origin: 'https://evil.example' } })).status, 403);
  assert.equal((await request('/jobs', { method: 'POST', headers: { 'X-Print-Token': '' }, body: JSON.stringify(payload()) })).status, 401);
  assert.throws(() => validateConfig({ ...config, allowedOrigins: ['*'] }));
  assert.throws(() => validateConfig({ ...config, bluetooth: '--scan; command' }));
});

test('preflight permits only configured origin and local network access', async t => {
  const { request } = await fixture(t, async () => {});
  const response = await request('/jobs', { method: 'OPTIONS' });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('access-control-allow-private-network'), 'true');
});

test('rejects malformed jobs and arbitrary command options', () => {
  for (const invalid of [{ count: 0 }, { count: 101 }, { count: 1.5 }, { paper: '--feed' }, { darkness: 9 }, { pdf: 'not a pdf' }]) {
    assert.throws(() => validateJob({ ...payload(), ...invalid }));
  }
  const args = buildArguments(config, validateJob(payload()), 'C:\\temp folder\\labels.pdf');
  assert.equal(args[args.indexOf('--printer-model') + 1], 'toprint_hprt_esc_zl1');
  assert.ok(args.includes('--no-trim-side-margins'));
  assert.ok(args.includes('--no-trim-top-bottom-margins'));
  assert.equal(args.at(-1), 'C:\\temp folder\\labels.pdf');
  const configuredArgs = buildArguments({ ...config, printerConfigPath: 'C:\\printer\\p2.json' }, validateJob(payload()), 'label.pdf');
  assert.ok(configuredArgs.includes('--printer-config'));
  assert.ok(!configuredArgs.includes('--printer-model'));
});

test('deduplicates jobs and serializes printer access', async t => {
  const calls = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const { request } = await fixture(t, async (_config, job) => { calls.push(job.id); if (calls.length === 1) await gate; });
  const first = payload();
  const second = payload('22345678-1234-1234-1234-123456789abc');
  const post = body => request('/jobs', { method: 'POST', body: JSON.stringify(body) });
  assert.equal((await post(first)).status, 202);
  assert.equal((await post(first)).status, 200);
  assert.equal((await post(second)).status, 202);
  assert.deepEqual(calls, [first.id]);
  release();
  for (let i = 0; i < 20; i++) {
    const result = await (await request(`/jobs/${second.id}`)).json();
    if (result.status === 'succeeded') break;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  assert.deepEqual(calls, [first.id, second.id]);
  assert.equal((await (await request(`/jobs/${second.id}`)).json()).status, 'succeeded');
});

test('reports CLI failure instead of a false successful print', async t => {
  const { request } = await fixture(t, async () => { throw new Error('Printer disconnected'); });
  const body = payload();
  await request('/jobs', { method: 'POST', body: JSON.stringify(body) });
  const job = await (await request(`/jobs/${body.id}`)).json();
  assert.equal(job.status, 'failed');
  assert.equal(job.errorCode, 'CONNECTION_FAILED'); assert.equal(job.failureStage, 'printing'); assert.ok(job.error.includes('قد يكون جزء'));
});

test('P2 jobs use the dedicated worker; other models retain the original driver', () => {
  const driver = {cliPath:'original.exe',p2WorkerPath:'worker.exe',modelKey:'toprint_hprt_esc_zl1'};
  assert.equal(printExecutable(driver),'worker.exe');
  assert.equal(printExecutable({...driver,modelKey:'other-model'}),'original.exe');
  assert.equal(printExecutable({...driver,p2WorkerPath:undefined}),'original.exe');
});
