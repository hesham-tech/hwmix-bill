import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { spawn } from 'node:child_process';
import { access, readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPrinterReadiness, friendlyPrinterError } from './printer-readiness.mjs';

export const MAX_BYTES = 12 * 1024 * 1024;
const MAX_JOBS = 5;
const MODEL = 'toprint_hprt_esc_zl1';
const PAPER_TYPES = new Set(['tag_384r', 'plain_384r', 'blacktag_384r']);

function sameToken(actual, expected) {
  if (typeof actual !== 'string') return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function validateConfig(config) {
  if (!config || typeof config.cliPath !== 'string' || !config.cliPath.endsWith('.exe')) throw new Error('Set cliPath in config.local.json.');
  if (!/^[a-f0-9]{64}$/i.test(config.token || '')) throw new Error('Run setup.mjs to create a pairing token.');
  if (!Array.isArray(config.allowedOrigins) || !config.allowedOrigins.length || config.allowedOrigins.some(origin => {
    try { const url = new URL(origin); return url.origin !== origin || !['http:', 'https:'].includes(url.protocol); } catch { return true; }
  })) throw new Error('allowedOrigins must contain exact HTTP(S) origins without a trailing slash.');
  if (typeof config.bluetooth !== 'string' || !config.bluetooth.trim() || config.bluetooth.length > 100 || /^-/.test(config.bluetooth) || /[\x00-\x1f\x7f]/.test(config.bluetooth)) throw new Error('Invalid Bluetooth name/address.');
  if (config.modelKey && !/^[a-zA-Z0-9_.-]{1,100}$/.test(config.modelKey)) throw new Error('Invalid printer model.');
  return config;
}

export function validateJob(body, paperTypes = PAPER_TYPES) {
  if (!body || !/^[\w-]{16,80}$/.test(body.id || '')) throw new Error('Invalid job ID.');
  if (!Number.isInteger(body.count) || body.count < 1 || body.count > 100) throw new Error('Print between 1 and 100 labels per job.');
  if (!paperTypes.has(body.paper)) throw new Error('Invalid paper type.');
  if (!Number.isInteger(body.darkness) || body.darkness < 1 || body.darkness > 5) throw new Error('Invalid darkness.');
  if (typeof body.pdf !== 'string' || body.pdf.length > MAX_BYTES || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.pdf)) throw new Error('Invalid PDF data.');
  const pdf = Buffer.from(body.pdf, 'base64');
  if (pdf.length < 20 || pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('Expected a PDF document.');
  return { id: body.id, count: body.count, paper: body.paper, darkness: body.darkness, pdf };
}

export function buildArguments(config, job, path) {
  const deviceArgs = config.printerConfigPath ? ['--printer-config', config.printerConfigPath] : ['--printer-model', config.modelKey || MODEL];
  const args = ['--bluetooth', config.bluetooth, ...deviceArgs,
    '--paper', job.paper, '--darkness', String(job.darkness), '--image-mode', job.imageMode || 'threshold', '--force-image-mode'];
  if (!job.trimMargins) args.push('--no-trim-side-margins', '--no-trim-top-bottom-margins');
  if (job.pdfPages) args.push('--pdf-pages', job.pdfPages);
  return [...args, '--page-gap', '0', '--verbose', path];
}

export function printExecutable(config) {
  if ((config.modelKey || MODEL) === MODEL && config.p2WorkerPath) return config.p2WorkerPath;
  return config.cliPath;
}

export async function runTiMini(config, job, pdf) {
  const executable = printExecutable(config);
  try { await access(executable); } catch {
    throw new Error('ملف تشغيل الطباعة غير موجود. أعد تثبيت أحدث نسخة من أداة HWNiX.');
  }
  const folder = await mkdtemp(join(tmpdir(), 'hwnix-label-'));
  try {
    const extension = ['pdf', 'png', 'jpg', 'gif', 'bmp'].includes(job.fileType) ? job.fileType : 'pdf';
    const path = join(folder, `document.${extension}`);
    await writeFile(path, pdf);
    await new Promise((resolveRun, reject) => {
      const child = spawn(executable, buildArguments(config, job, path), {
        windowsHide: true, shell: false, env: { ...process.env, TIMINIPRINT_NO_UPDATE_CHECK: '1', PYTHONIOENCODING: 'utf-8' },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let output = '';
      let timedOut = false;
      const collect = chunk => {
        output = (output + chunk.toString()).slice(-5000);
        if (output.includes('HWNIX_P2_DRAIN_WAIT=12')) job.progress = 'تم إرسال البيانات؛ جارٍ إبقاء الاتصال مفتوحًا لاكتمال الطباعة…';
      };
      child.stdout.on('data', collect);
      child.stderr.on('data', collect);
      const timeout = setTimeout(() => { timedOut = true; child.kill(); }, Math.max(10 * 60_000, job.count * 15_000 + 120_000));
      child.once('error', error => { clearTimeout(timeout); reject(error); });
      child.once('close', async code => {
        clearTimeout(timeout);
        if (config.logPath) await writeFile(config.logPath, output).catch(() => {});
        if (timedOut) reject(new Error('TiMini timed out. Some labels may have printed; check the roll before retrying.'));
        else if (code === 0) resolveRun();
        else reject(new Error(output.trim() || `TiMini exited with code ${code}. Check Bluetooth and disconnect the GUI/mobile app.`));
      });
    });
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}

export function createBridge(config, runner = runTiMini, management = null, features = {}) {
  validateConfig(config);
  const jobs = new Map();
  let pending = 0;
  let tail = Promise.resolve();
  const checkPrinter = features.checkPrinter || (runner === runTiMini ? checkPrinterReadiness : null);
  // Keep status compatible with installed website clients; phase distinguishes validation.
  const summary = job => ({ id: job.id, status: job.status === 'checking' ? 'printing' : job.status, phase: job.status, count: job.count, error: job.error, errorCode: job.errorCode, failureStage: job.failureStage, progress: job.progress });
  const enqueue = (input, payload, taskRunner = runner, printerConfig = config) => {
    const existing = jobs.get(input.id);
    if (existing) return { ...summary(existing), duplicate: true };
    if (pending >= MAX_JOBS) throw Object.assign(new Error('طابور الطباعة ممتلئ، انتظر انتهاء الطلب الحالي.'), { status: 429 });
    if (jobs.size >= 500) {
      const old = [...jobs.values()].find(job => ['succeeded', 'failed'].includes(job.status));
      if (old) jobs.delete(old.id);
    }
    const job = { ...input, status: 'queued' };
    const printerSnapshot = { ...printerConfig };
    jobs.set(job.id, job); pending++;
    tail = tail.then(async () => {
      job.status = 'checking';
      try {
        job.progress = 'جارٍ فحص Bluetooth والبحث عن الطابعة قبل إرسال بيانات الطباعة…';
        const discovered = checkPrinter ? await checkPrinter(printerSnapshot) : {};
        job.status = 'printing'; job.progress = 'جارٍ الاتصال بالطابعة وإرسال الطلب…';
        await taskRunner({ ...printerSnapshot, ...discovered }, job, payload); job.status = 'succeeded';
      }
      catch (error) {
        job.failureStage = job.status; const friendly = friendlyPrinterError(error, config, job.status === 'printing');
        job.status = 'failed'; job.error = friendly.message; job.errorCode = friendly.code;
      }
      finally { pending--; }
    });
    return summary(job);
  };
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    };
    // Check Host as well as Origin to reject DNS rebinding and foreign websites.
    if (!/^127\.0\.0\.1:\d+$/.test(req.headers.host || '')) return send(403, { error: 'Invalid host.' });
    if (management) {
      try { if (await management(req, res, { pending, enqueue, getJob: id => jobs.has(id) ? summary(jobs.get(id)) : null })) return; }
      catch (error) { if (!res.headersSent) send(400, { error: error.message }); return; }
    }
    const origin = req.headers.origin;
    if (!config.allowedOrigins.includes(origin)) return send(403, { error: 'Website origin is not allowed in config.local.json.' });
    res.setHeader('Access-Control-Allow-Origin', origin);
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Print-Token');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
      res.writeHead(204); return res.end();
    }
    if (!sameToken(req.headers['x-print-token'], config.token)) return send(401, { error: 'رمز الربط غير صحيح. انسخه من نافذة تشغيل خدمة الطباعة.' });
    if (req.method === 'GET' && req.url === '/health') {
      let cliReady = true;
      try { await access(config.cliPath); } catch { cliReady = false; }
      return send(200, { service: 'hwnix-timini', version: 1, cliReady, configured: config.configured !== false, bluetooth: config.bluetooth, model: config.modelKey || MODEL,
        geometry: config.geometry || { widthDots: 384, dpi: 203 }, paperOptions: config.paperOptions,
        nativePreview: Boolean(features.handoff), appVersion: features.appVersion,
        // This describes the service, not a live Bluetooth/printer connection.
        pending });
    }
    if (req.method === 'GET' && /^\/jobs\/[\w-]+$/.test(req.url || '')) {
      const job = jobs.get(req.url.slice(6));
      return job ? send(200, summary(job)) : send(404, { error: 'Job not found. Do not resend automatically; check the printer.' });
    }
    if (req.method !== 'POST' || !['/jobs', '/handoff'].includes(req.url)) return send(404, { error: 'Not found.' });
    if (config.configured === false) return send(409, { error: 'افتح أداة HWNiX Print Bridge واختر الطابعة أولًا.' });
    if (!(req.headers['content-type'] || '').startsWith('application/json')) return send(415, { error: 'Expected JSON.' });
    try {
      let length = 0;
      const chunks = [];
      for await (const chunk of req) {
        length += chunk.length;
        if (length > MAX_BYTES) { send(413, { error: 'Print job is too large.' }); req.resume(); return; }
        chunks.push(chunk);
      }
      const paperTypes = config.paperOptions?.length ? new Set(config.paperOptions.map(paper => paper.value)) : PAPER_TYPES;
      const input = validateJob(JSON.parse(Buffer.concat(chunks).toString('utf8')), paperTypes);
      if (req.url === '/handoff') {
        if (!features.handoff) return send(409, { error: 'حدّث أداة HWNiX إلى الإصدار 1.1 أو أحدث لدعم المعاينة داخل البرنامج.' });
        return send(202, await features.handoff(input, origin));
      }
      const { pdf, ...details } = input;
      const job = enqueue(details, pdf);
      send(job.duplicate ? 200 : 202, job);
    } catch (error) { if (!res.headersSent) send(error.status || 400, { error: error.message }); }
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = dirname(fileURLToPath(import.meta.url));
  try {
    const config = validateConfig(JSON.parse(await readFile(join(directory, 'config.local.json'), 'utf8')));
    const server = createBridge(config);
    console.log('HWNiX TiMini bridge: http://127.0.0.1:19191');
    console.log('Printer:', config.bluetooth, '| Model:', MODEL);
    console.log('Allowed websites:', config.allowedOrigins.join(', '));
    console.log('Pairing token (paste into label settings):', config.token);
    server.on('error', error => {
      if (error.code === 'EADDRINUSE') console.log('The local port is already in use. If HWNiX bridge is running, use the token above and check it from label settings.');
      else { console.error(error.message); process.exitCode = 1; }
    });
    server.listen(19191, '127.0.0.1', () => {
      console.log('Running. Keep this window open. Close/disconnect TiMini GUI and the mobile app before printing.');
    });
  } catch (error) { console.error('Run node tools/timini-bridge/setup.mjs first.\n' + error.message); process.exitCode = 1; }
}
