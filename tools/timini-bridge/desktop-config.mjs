import { randomBytes, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { join, dirname, basename, resolve } from 'node:path';

const exec = promisify(execFile);
export const DEFAULT_ORIGIN = 'https://bill.hwnix.com';
export const DEFAULT_MODEL = 'toprint_hprt_esc_zl1';
// Verified on P2_3083: complete, clear label with smooth movement (2026-10-28).
export const P2_STREAM = Object.freeze({ chunk_size: 96, delay_ms: 20 });

export function normalizeOrigins(origins) {
  if (!Array.isArray(origins) || !origins.length || origins.length > 20) throw new Error('أدخل رابط موقع واحد على الأقل، وبحد أقصى 20 موقعًا.');
  return [...new Set(origins.map(value => {
    const url = new URL(String(value).trim());
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || (url.pathname !== '/' && url.pathname !== '') || (url.protocol !== 'https:' && !(local && url.protocol === 'http:'))) {
      throw new Error('استخدم رابط HTTPS للموقع دون مسار، مثل https://bill.hwnix.com');
    }
    return url.origin;
  }))];
}

export function parseModels(text) {
  return text.split(/\r?\n/).map(line => {
    const match = /^([a-zA-Z0-9_.-]+):\s+(.+)$/.exec(line.trim());
    return match ? { key: match[1], label: match[2].slice(0, 300) } : null;
  }).filter(Boolean);
}

export function parseDevices(text) {
  const devices = new Map();
  for (const line of text.split(/\r?\n/)) {
    const address = /\(([0-9a-f]{2}(?::[0-9a-f]{2}){5})\)/i.exec(line)?.[1]?.toUpperCase();
    if (!address) continue;
    const name = line.split(' [')[0].trim().replace(/\s*\([0-9a-f:]+\).*$/i, '');
    const modelKey = /\[model:\s*([^;\]\s]+)/.exec(line)?.[1];
    const device = devices.get(address) || { address, name, models: [] };
    if (modelKey && !device.models.includes(modelKey)) device.models.push(modelKey);
    devices.set(address, device);
  }
  return [...devices.values()];
}

export function validateSelection(input, catalog) {
  const bluetooth = String(input.bluetooth || '').trim();
  if (!bluetooth || bluetooth.length > 100 || bluetooth.startsWith('-') || /[\x00-\x1f\x7f]/.test(bluetooth)) throw new Error('اختر طابعة أو أدخل اسم Bluetooth أو عنوانها الصحيح.');
  const modelKey = String(input.modelKey || '');
  if (!catalog.some(model => model.key === modelKey)) throw new Error('اختر موديلًا من قائمة الموديلات المدعومة.');
  return { bluetooth, modelKey, allowedOrigins: normalizeOrigins(input.allowedOrigins) };
}

export async function runCli(cliPath, args, timeout = 90_000) {
  return exec(cliPath, args, { windowsHide: true, timeout, maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, TIMINIPRINT_NO_UPDATE_CHECK: '1', PYTHONIOENCODING: 'utf-8' } });
}

export function profileDetails(profile) {
  const value = profile.profile_overrides;
  const presets = value?.paper_presets;
  if (!Array.isArray(presets) || !presets.length || typeof presets[0] !== 'object') throw new Error('لا يحتوي هذا التعريف على مقاسات ورق قابلة للاستخدام في هذه النسخة.');
  const widthDots = Number(presets[0].render_width_px);
  const dpi = Number(value.dev_dpi);
  if (!Number.isInteger(widthDots) || widthDots < 64 || widthDots > 2048 || !Number.isFinite(dpi) || dpi < 100 || dpi > 600) throw new Error('أبعاد تعريف الطابعة غير مدعومة.');
  if (!value.default_image_pipeline?.formats?.includes('bw1')) throw new Error('هذا التعريف لا يدعم وضع الصور الأحادية المستخدم للملصقات في هذه النسخة.');
  return { geometry: { widthDots, dpi }, paperOptions: presets.map(paper => ({ value: paper.key, title: paper.label || paper.key, widthDots: paper.render_width_px, dpi })) };
}

export async function preparePrinter(cliPath, dataDirectory, selection, execute = runCli) {
  const candidate = join(dataDirectory, `profile-${randomUUID()}.json`);
  try {
    await execute(cliPath, ['--export-printer-config', selection.modelKey, candidate], 90_000);
    const profile = JSON.parse(await readFile(candidate, 'utf8'));
    const details = profileDetails(profile);
    // Other models keep their own transport recipes.
    if (selection.modelKey === DEFAULT_MODEL) profile.profile_overrides.stream = { ...P2_STREAM };
    await writeFile(candidate, JSON.stringify(profile, null, 2) + '\n');
    const target = join(dataDirectory, `printer-${randomUUID()}.json`);
    await rename(candidate, target);
    return { ...selection, ...details, printerConfigPath: target, configured: true };
  } finally { await rm(candidate, { force: true }); }
}

export async function upgradeLegacyP2Streaming(config, dataDirectory) {
  const updated = [];
  const profiles = [config, ...(Array.isArray(config.printers) ? config.printers : [])];
  const paths = new Set(profiles.filter(printer => printer.modelKey === DEFAULT_MODEL).map(printer => printer.printerConfigPath).filter(Boolean));
  for (const path of paths) {
    // Only migrate our generated profiles; preserve custom paths and custom tuning.
    if (dirname(resolve(path)) !== resolve(dataDirectory) || !/^printer-[a-f0-9-]+\.json$/i.test(basename(path))) continue;
    try {
      const profile = JSON.parse(await readFile(path, 'utf8'));
      const stream = profile.profile_overrides?.stream;
      if (stream?.chunk_size !== 96 || stream?.delay_ms !== 30) continue;
      profile.profile_overrides.stream = { ...P2_STREAM };
      await saveConfig(path, profile); updated.push(path);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return updated;
}

export async function saveConfig(path, config) {
  const temp = path + '.tmp';
  await writeFile(temp, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
  await rename(temp, path);
}

export function newDesktopConfig(cliPath) {
  return { token: randomBytes(32).toString('hex'), cliPath, bluetooth: 'UNCONFIGURED', modelKey: DEFAULT_MODEL,
    allowedOrigins: [DEFAULT_ORIGIN], configured: false, geometry: { widthDots: 384, dpi: 203 } };
}
