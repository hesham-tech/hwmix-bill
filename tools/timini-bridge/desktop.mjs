import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, mkdir, access, rm } from 'node:fs/promises';
import { join, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBridge } from './server.mjs';
import { newDesktopConfig, parseDevices, runCli, saveConfig, validateSelection, preparePrinter, upgradeLegacyP2Streaming } from './desktop-config.mjs';
import { createDocumentStore, decodeUpload, readLocalDocuments, documentFromBytes, printOptions, printDocuments } from './documents.mjs';
import { normalizeTemplate } from './desktop/editor-schema.mjs';
import { discoverPrinters, checkPrinterReadiness, resolvePrinterSelection, friendlyPrinterError } from './printer-readiness.mjs';
import { printerProfiles, printerId, printerForJob, activatePrinter, rememberPrinter } from './printer-profiles.mjs';

export const APP_VERSION = '1.1.4';
export async function startDesktop(options = {}) {
  const directory = dirname(fileURLToPath(import.meta.url));
  const dataDirectory = options.dataDirectory || process.env.HWNIX_PRINT_DATA_DIR || join(process.env.LOCALAPPDATA || directory, 'HWNiXPrintBridge');
  const cliPath = options.cliPath || process.env.HWNIX_PRINT_CLI || join(directory, '..', 'timini', 'TiMini-Print-Command-Line-Windows-x86_64.exe');
  const port = Number(options.port ?? process.env.HWNIX_PRINT_PORT ?? 19191);
  if (!Number.isInteger(port) || (port < 1024 && !(port === 0 && options.port === 0)) || port > 65535) throw new Error('Invalid local service port.');
  let origin = `http://127.0.0.1:${port}`;
  const adminKey = options.adminKey || process.env.HWNIX_PRINT_ADMIN_KEY || randomBytes(32).toString('hex');
  await mkdir(dataDirectory, { recursive: true }); await access(cliPath);
  const configPath = join(dataDirectory, 'config.local.json');
  let config;
  try { config = JSON.parse(await readFile(configPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  config ||= newDesktopConfig(cliPath);
  config.cliPath = cliPath;
  config.p2WorkerPath = options.p2WorkerPath || process.env.HWNIX_P2_WORKER || (!options.cliPath && !process.env.HWNIX_PRINT_CLI ? join(directory, '..', 'p2-worker', 'HWNiXP2Worker.exe') : undefined);
  config.logPath = join(dataDirectory, 'last-print.log');
  if (config.printerConfigPath) try { await access(config.printerConfigPath); } catch { config.configured = false; }
  const tuned = await upgradeLegacyP2Streaming(config, dataDirectory);
  if (tuned.length) console.log('Applied verified P2 streaming adjustment:', tuned.length, 'profile(s).');
  await saveConfig(configPath, config);
  const catalog = options.catalog || JSON.parse(await readFile(options.catalogPath || join(directory, 'models.json'), 'utf8'));
  const documents = createDocumentStore();
  let busy = false; let server;
  const checkPrinter = options.checkPrinter || checkPrinterReadiness;
  const resolvePrinter = options.resolvePrinter || options.checkPrinter || resolvePrinterSelection;
  const wakeWindow = async target => writeFile(join(dataDirectory, 'window-request.json'), JSON.stringify({ target, nonce: randomUUID() }));
  const send = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
  async function body(req, limit = 32_768) {
    let size = 0; const chunks = [];
    for await (const chunk of req) { size += chunk.length; if (size > limit) throw new Error('حجم الطلب أكبر من المسموح.'); chunks.push(chunk); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }
  const assets = new Map([
    ['/', ['admin.html', 'text/html; charset=utf-8']], ['/admin.js', ['admin.js', 'application/javascript; charset=utf-8']],
    ['/admin.css', ['admin.css', 'text/css; charset=utf-8']], ['/editor.js', ['editor.js', 'application/javascript; charset=utf-8']],
    ['/editor-schema.mjs', ['editor-schema.mjs', 'application/javascript; charset=utf-8']],
    ['/vendor/print-vendor.mjs', ['vendor/print-vendor.mjs', 'application/javascript; charset=utf-8']],
    ['/vendor/pdf.mjs', ['vendor/pdf.mjs', 'application/javascript; charset=utf-8']],
    ['/vendor/pdf.worker.mjs', ['vendor/pdf.worker.mjs', 'application/javascript; charset=utf-8']],
  ]);
  const management = async (req, res, state) => {
    if (req.method === 'POST' && ['/jobs', '/handoff'].includes(req.url) && busy) { send(res, 423, { error: 'يجري إعداد الطابعة. انتظر ثم أعد المحاولة.' }); return true; }
    if (req.method === 'GET' && (assets.has(req.url) || req.url?.startsWith('/vendor/pdf-assets/'))) {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self' blob:; worker-src 'self' blob:; frame-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
      res.setHeader('Referrer-Policy', 'no-referrer');
      if (assets.has(req.url)) {
        const [file, type] = assets.get(req.url);
        try { const bytes = await readFile(join(directory, 'desktop', file)); res.writeHead(200, { 'Content-Type': type }); res.end(bytes); }
        catch { send(res, 404, { error: 'Application asset missing. Reinstall HWNiX.' }); }
        return true;
      }
      const assetRoot = resolve(directory, 'desktop', 'vendor', 'pdf-assets');
      const file = resolve(assetRoot, decodeURIComponent(req.url.slice('/vendor/pdf-assets/'.length)));
      if (!file.startsWith(assetRoot + sep)) { send(res, 403, { error: 'Invalid asset.' }); return true; }
      try { const bytes = await readFile(file); res.writeHead(200, { 'Content-Type': file.endsWith('.wasm') ? 'application/wasm' : /\.m?js$/.test(file) ? 'application/javascript; charset=utf-8' : 'application/octet-stream' }); res.end(bytes); }
      catch { send(res, 404, { error: 'Asset not found.' }); }
      return true;
    }
    if (!req.url?.startsWith('/admin/')) return false;
    const received = Buffer.from(String(req.headers['x-admin-token'] || '')); const expected = Buffer.from(adminKey);
    if ((req.headers.origin && req.headers.origin !== origin) || received.length !== expected.length || !timingSafeEqual(received, expected)) {
      send(res, 403, { error: 'افتح أداة HWNiX من أيقونتها بجوار الساعة أو قائمة ابدأ.' }); return true;
    }
    if (req.method === 'GET') {
      if (req.url === '/admin/state') send(res, 200, { app: 'HWNiX Print Bridge', version: APP_VERSION, configured: config.configured,
        bluetooth: config.configured ? config.bluetooth : '', bluetoothName: config.bluetoothName || '', modelKey: config.modelKey, allowedOrigins: config.allowedOrigins,
        token: config.token, geometry: config.geometry, paperOptions: config.paperOptions || [], catalog, pending: state.pending, documents: documents.list(),
        activePrinterId: config.activePrinterId || printerId(config), printers: printerProfiles(config).map(({ printerConfigPath, ...profile }) => profile) });
      else if (req.url === '/admin/template') {
        let template = null; try { template = normalizeTemplate(JSON.parse(await readFile(join(dataDirectory, 'label-template.json'), 'utf8'))); } catch (error) { if (error.code !== 'ENOENT') throw error; }
        send(res, 200, { template });
      } else if (/^\/admin\/jobs\/[\w-]+$/.test(req.url)) {
        const job = state.getJob(req.url.split('/').at(-1)); send(res, job ? 200 : 404, job || { error: 'المهمة غير موجودة. افحص الطابعة قبل إعادة الإرسال.' });
      } else if (/^\/admin\/documents\/[\w-]+$/.test(req.url)) {
        const document = documents.get(req.url.split('/').at(-1));
        if (!document) send(res, 404, { error: 'انتهت صلاحية الملف أو حُذف. أضفه مجددًا.' });
        else { res.writeHead(200, { 'Content-Type': document.mime, 'Content-Disposition': 'inline' }); res.end(document.bytes); }
      } else send(res, 404, { error: 'Not found.' });
      return true;
    }
    if (req.method !== 'POST') { send(res, 404, { error: 'Not found.' }); return true; }
    const hardwareSetting = ['/admin/scan', '/admin/config', '/admin/select-printer', '/admin/shutdown', '/admin/check-printer'].includes(req.url);
    if ((hardwareSetting && (state.pending || busy)) || (req.url === '/admin/print' && busy)) { send(res, 409, { error: 'انتظر انتهاء الطباعة أو إعداد الطابعة الحالي أولًا.' }); return true; }
    if (req.url === '/admin/shutdown') {
      send(res, 200, { stopped: true }); server.close();
      await Promise.all(['admin.url', 'window-request.json'].map(file => rm(join(dataDirectory, file), { force: true })));
      if (!options.noExit) setTimeout(() => process.exit(0), 200).unref();
      return true;
    }
    if (hardwareSetting) busy = true;
    try {
      if (req.url === '/admin/scan') {
        send(res, 200, await (options.discoverPrinters || discoverPrinters)(cliPath));
      } else if (req.url === '/admin/check-printer') {
        if (!config.configured) throw new Error('احفظ إعداد الطابعة أولًا.');
        const found = await checkPrinter(config);
        send(res, 200, { found: true, ...found, message: 'إعداد عنوان الجهاز صالح وBluetooth متاح عند إمكانية قراءة حالته. يفتح محرك الطباعة الاتصال الفعلي عند إرسال المهمة؛ هذا الفحص لا يؤكد الورق أو البطارية.' });
      } else if (req.url === '/admin/select-printer') {
        const updated = activatePrinter(config, String((await body(req)).printerId));
        await saveConfig(configPath, updated); Object.assign(config, updated);
        send(res, 200, { selected: true, printerId: config.activePrinterId });
      } else if (req.url === '/admin/config') {
        const selection = validateSelection(await body(req), catalog);
        const discovered = await resolvePrinter({ ...config, ...selection });
        Object.assign(selection, { bluetooth: discovered.bluetooth || selection.bluetooth, bluetoothName: discovered.bluetoothName || selection.bluetooth });
        const prepared = await (options.preparePrinter || preparePrinter)(cliPath, dataDirectory, selection);
        const updated = rememberPrinter(config, prepared); await saveConfig(configPath, updated);
        const oldProfile = config.printerConfigPath; Object.assign(config, updated);
        if (oldProfile && !printerProfiles(config).some(printer => printer.printerConfigPath === oldProfile) && dirname(oldProfile) === dataDirectory && /^printer-[a-f0-9-]+\.json$/.test(oldProfile.split(/[\\/]/).at(-1))) await rm(oldProfile, { force: true });
        send(res, 200, { saved: true, geometry: config.geometry });
      } else if (req.url === '/admin/documents') send(res, 200, { documents: documents.add(decodeUpload((await body(req, 60 * 1024 * 1024)).files)) });
      else if (req.url === '/admin/open-files') {
        const imported = documents.add(await readLocalDocuments((await body(req)).paths));
        await wakeWindow('files'); send(res, 200, { documents: imported });
      } else if (req.url === '/admin/remove-document') { documents.remove(String((await body(req)).id)); send(res, 200, { removed: true }); }
      else if (req.url === '/admin/template') {
        const template = normalizeTemplate(await body(req)); await saveConfig(join(dataDirectory, 'label-template.json'), template); send(res, 200, { saved: true });
      } else if (req.url === '/admin/print') {
        const input = await body(req); const selectedPrinter = printerForJob(config, input.printerId); const settings = printOptions(input, selectedPrinter);
        if (!/^[\w-]{16,80}$/.test(input.id || '') || !Array.isArray(input.documentIds) || !input.documentIds.length || input.documentIds.length > 10) throw new Error('اختر الملفات المراد طباعتها.');
        const selected = input.documentIds.map(id => { const document = documents.get(id); if (!document) throw new Error('انتهت صلاحية ملف. أضفه مرة أخرى قبل الطباعة.'); return document; });
        if (selected.length * settings.copies > 100) throw new Error('الحد الأقصى 100 نسخة من الملفات في الطلب الواحد.');
        const job = state.enqueue({ id: input.id, ...settings, count: selected.length * settings.copies, printerId: selectedPrinter.id }, selected, options.documentRunner || printDocuments, selectedPrinter);
        send(res, job.duplicate ? 200 : 202, job);
      } else send(res, 404, { error: 'Not found.' });
    } catch (error) {
      const shown = ['/admin/scan', '/admin/config', '/admin/check-printer'].includes(req.url) && (error.code || /Startup:|No device matches|WinError|Traceback/i.test(error.message)) ? friendlyPrinterError(error) : error;
      send(res, error.status || 400, { error: String(shown.message).slice(-1500), errorCode: shown.code });
    }
    finally { if (hardwareSetting) busy = false; }
    return true;
  };
  const handoff = async (input, sourceOrigin) => {
    if (!documents.get(input.id)) {
      const document = documentFromBytes(`ملصقات من ${new URL(sourceOrigin).hostname}.pdf`, input.pdf, 'website');
      document.id = input.id; documents.add([document]);
    }
    await wakeWindow(input.id);
    return { id: input.id, status: 'awaiting-preview', count: input.count };
  };
  server = createBridge(config, options.runner, management, { handoff, appVersion: APP_VERSION, checkPrinter });
  await new Promise((resolveStart, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolveStart); });
  origin = `http://127.0.0.1:${server.address().port}`;
  await writeFile(join(dataDirectory, 'admin.url'), `${origin}/#key=${adminKey}`, { mode: 0o600 });
  console.log('HWNiX Print Bridge', APP_VERSION, 'listening on', origin);
  return { server, config, adminKey, dataDirectory };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) startDesktop().catch(error => { console.error(error.message); process.exitCode = 1; });
