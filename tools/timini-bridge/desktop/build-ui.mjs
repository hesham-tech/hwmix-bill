import { build } from 'esbuild';
import { mkdir, copyFile, cp, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '../../..');
const output = resolve(process.argv[2] || join(here, 'vendor'));
await mkdir(output, { recursive: true });
const bundled = await build({ stdin: { contents: "import JsBarcode from 'jsbarcode'; import QRCode from 'qrcode'; import { jsPDF } from 'jspdf'; export { JsBarcode, QRCode, jsPDF };", resolveDir: project, sourcefile: 'print-vendor-entry.js' },
  absWorkingDir: project, bundle: true, platform: 'browser', format: 'esm', target: ['chrome120'], minify: true, legalComments: 'external', outfile: join(output, 'print-vendor.mjs'), metafile: true });
const pdf = join(project, 'node_modules/pdfjs-dist');
await copyFile(join(pdf, 'build/pdf.min.mjs'), join(output, 'pdf.mjs'));
await copyFile(join(pdf, 'build/pdf.worker.min.mjs'), join(output, 'pdf.worker.mjs'));
for (const folder of ['cmaps', 'standard_fonts', 'wasm']) await cp(join(pdf, folder), join(output, 'pdf-assets', folder), { recursive: true });
const packageDirectories = new Set([pdf]);
for (const input of Object.keys(bundled.metafile.inputs)) {
  if (!input.includes('node_modules')) continue;
  let directory = dirname(resolve(project, input));
  while (directory !== dirname(directory)) {
    try { await readFile(join(directory, 'package.json')); packageDirectories.add(directory); break; } catch { directory = dirname(directory); }
  }
}
let licenses = 'HWNiX desktop UI — bundled component licenses\n\n';
for (const directory of [...packageDirectories].sort()) {
  const metadata = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
  licenses += `\n${'='.repeat(72)}\n${metadata.name} ${metadata.version}\nLicense declaration: ${JSON.stringify(metadata.license || '')}\n`;
  const files = (await readdir(directory)).filter(file => /^(licen[sc]e|copying|notice)/i.test(file));
  for (const file of files) try { licenses += `\n--- ${file} ---\n${await readFile(join(directory, file), 'utf8')}\n`; } catch { }
}
await writeFile(join(output, 'UI-THIRD-PARTY-LICENSES.txt'), licenses);
console.log('Desktop UI bundled:', packageDirectories.size, 'component packages');
