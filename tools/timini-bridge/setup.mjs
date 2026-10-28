import { randomBytes, createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { P2_STREAM } from './desktop-config.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const configPath = join(directory, 'config.local.json');
const binaryName = 'TiMini-Print-Command-Line-Windows-x86_64.exe';
const expectedHash = '96208ac2829bee126e511007e8bc5af06b26d3bcb39a6a903dd9f3654acdd4ec';
const args = process.argv.slice(2);
const value = key => { const index = args.indexOf(key); return index >= 0 ? args[index + 1] : undefined; };
let config;
try { config = JSON.parse(await readFile(configPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
config ||= { token: randomBytes(32).toString('hex'), bluetooth: 'P2_3083', allowedOrigins: ['http://localhost:5173', 'http://127.0.0.1:5173'] };
const origin = value('--origin');
if (origin) {
  const url = new URL(origin);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) throw new Error('Use an exact website origin, e.g. https://billing.example.com (no path/trailing slash).');
  if (!config.allowedOrigins.includes(origin)) config.allowedOrigins.push(origin);
}
const cli = value('--cli');
if (cli) { await access(cli); config.cliPath = cli; }
if (!config.cliPath) {
  const bin = join(directory, 'bin');
  await mkdir(bin, { recursive: true });
  const path = join(bin, binaryName);
  let bytes;
  try { bytes = await readFile(path); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log('Downloading official TiMini-Print CLI v0.9...');
    const response = await fetch(`https://github.com/Dejniel/TiMini-Print/releases/download/v0.9/${binaryName}`);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (createHash('sha256').update(bytes).digest('hex') !== expectedHash) throw new Error('CLI checksum mismatch. Do not run this file.');
  await writeFile(path, bytes);
  config.cliPath = path;
}
// Verified P2 streaming: the CLI disconnects after sending and this
// protocol has no reliable mechanical-completion acknowledgement.
const printerConfigPath = join(directory, 'printer-config.local.json');
await promisify(execFile)(config.cliPath, ['--export-printer-config', 'toprint_hprt_esc_zl1', printerConfigPath], {
  windowsHide: true, env: { ...process.env, TIMINIPRINT_NO_UPDATE_CHECK: '1' },
});
const printerConfig = JSON.parse(await readFile(printerConfigPath, 'utf8'));
printerConfig.profile_overrides.stream = { ...P2_STREAM };
await writeFile(printerConfigPath, JSON.stringify(printerConfig, null, 2) + '\n');
config.printerConfigPath = printerConfigPath;
config.logPath = join(directory, 'last-print.local.log');
await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
console.log('Pairing token:', config.token);
console.log('Allowed websites:', config.allowedOrigins.join(', '));
console.log('Start with: npm run printer:bridge');
