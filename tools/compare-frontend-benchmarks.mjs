import { readFileSync, writeFileSync } from 'node:fs';

const before = JSON.parse(readFileSync(process.argv[2] || 'scratch/frontend-before.json', 'utf8'));
const after = JSON.parse(readFileSync(process.argv[3] || 'scratch/frontend-after.json', 'utf8'));
if ((before.failures?.length || 0) + (after.failures?.length || 0)) throw new Error('Failed samples must be investigated before comparing runs');
if (before.experimental || after.experimental) throw new Error('Diagnostic traces and experimental styles cannot be used for acceptance measurements');
// Font preload reuse can produce two ResourceTiming rows for one immutable URL.
// Keep raw measurements and calculate the unique file payload identically for both builds.
for (const report of [before, after]) for (const sample of report.results) {
  const files = new Map();
  for (const resource of sample.resources) files.set(resource.file, Math.max(files.get(resource.file) || 0, resource.bytes));
  sample.uniqueAssetBytes = [...files.values()].reduce((sum, bytes) => sum + bytes, 0);
}
const median = (samples, key) => samples.map(sample => sample[key]).sort((a, b) => a - b)[Math.floor(samples.length / 2)];
const reduced = (oldValue, newValue) => oldValue ? Math.round((1 - newValue / oldValue) * 1000) / 10 : null;
const rows = [];
for (const screen of ['login', 'customers', 'dashboard', 'invoice', 'products']) {
  for (const scenario of ['cold', 'repeat', 'cpu4']) {
    const select = report => report.results.filter(sample => sample.screen === screen && sample.scenario === scenario);
    const previous = select(before), current = select(after);
    if (previous.length !== 5 || current.length !== 5) throw new Error(`Five samples required: ${screen}/${scenario}`);
    const metrics = samples => Object.fromEntries(['readyMs', 'assetBytes', 'uniqueAssetBytes', 'decodedBytes', 'assetRequests', 'longTaskMs'].map(key => [key, median(samples, key)]));
    const oldMetrics = metrics(previous), newMetrics = metrics(current);
    rows.push({ screen, scenario, before: oldMetrics, after: newMetrics, readyReductionPercent: reduced(oldMetrics.readyMs, newMetrics.readyMs), bytesReductionPercent: reduced(oldMetrics.uniqueAssetBytes, newMetrics.uniqueAssetBytes) });
  }
}
const customerCold = rows.find(row => row.screen === 'customers' && row.scenario === 'cold');
const customerCpu = rows.find(row => row.screen === 'customers' && row.scenario === 'cpu4');
const acceptance = { compressedAssets: customerCold.bytesReductionPercent >= 40, slowCpuReady: customerCpu.readyReductionPercent >= 30 };
const compactSamples = report => report.results.map(({ resources, ...sample }) => sample);
writeFileSync('docs/frontend-performance-results.json', JSON.stringify({ measuredAt: new Date().toISOString(), runs: 5, note: after.note, rows, acceptance, beforeSamples: compactSamples(before), afterSamples: compactSamples(after) }, null, 2));
const names = { login: 'الدخول', customers: 'العملاء', dashboard: 'لوحة التحكم', invoice: 'الفاتورة', products: 'المنتجات' };
const table = ['| الشاشة | الحجم المضغوط قبل ← بعد | زمن بارد قبل ← بعد | زمن CPU×4 قبل ← بعد |', '|---|---:|---:|---:|'];
const seconds = value => `${(value / 1000).toFixed(2)} ث`;
for (const screen of Object.keys(names)) {
  const cold = rows.find(row => row.screen === screen && row.scenario === 'cold');
  const cpu = rows.find(row => row.screen === screen && row.scenario === 'cpu4');
  table.push(`| ${names[screen]} | ${(cold.before.uniqueAssetBytes / 1000).toFixed(0)} ← ${(cold.after.uniqueAssetBytes / 1000).toFixed(0)} KB | ${seconds(cold.before.readyMs)} ← ${seconds(cold.after.readyMs)} | ${seconds(cpu.before.readyMs)} ← ${seconds(cpu.after.readyMs)} |`);
}
const documentPath = 'docs/frontend-performance-and-designs.md';
const document = readFileSync(documentPath, 'utf8');
const marker = '<!-- measured-results -->';
writeFileSync(documentPath, document.split(marker)[0].trimEnd() + `\n\n${marker}\n\n${table.join('\n')}\n\nخفض ملفات العملاء: **${customerCold.bytesReductionPercent}%**. خفض زمن ظهور العملاء مع CPU×4: **${customerCpu.readyReductionPercent}%**. معايير القبول: ${Object.values(acceptance).every(Boolean) ? 'تحققت في الاختبار المحلي' : 'لم تتحقق بالكامل'}، وفق الحدود المذكورة أعلاه. الأرقام التفصيلية والعينات محفوظة في [frontend-performance-results.json](./frontend-performance-results.json).\n`);
console.log(JSON.stringify({ customerCold, customerCpu, acceptance }, null, 2));
if (!Object.values(acceptance).every(Boolean)) process.exitCode = 1;
