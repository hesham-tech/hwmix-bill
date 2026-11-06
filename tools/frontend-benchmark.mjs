import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).map(value => value.replace(/^--/, '').split('=')));
const baseURL = args.url || 'http://127.0.0.1:5178';
const runs = Number(args.runs || 5);
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const user = {
  id: 1, full_name: 'Performance fixture', is_staff_or_admin: true, active_company_id: 1,
  permissions: ['admin.super'], roles: [], branches: [], balance: 0, created_at: '2020-01-01',
  companies: [{ id: 1, name: 'Fixture company', settings: {}, print_settings: {} }],
  settings: { acknowledged_updates: JSON.parse(readFileSync('src/config/changelogs.json', 'utf8')).map(release => release.version) },
};
const screens = [
  ['login', '/saas/login', '.saas-login-btn'],
  ['customers', '/app/customers', '.customers-page'],
  ['dashboard', '/app/admin/dashboard', '.kpi-card-widget'],
  ['invoice', '/app/invoices/create?type=sale', '.invoice-create-page'],
  ['products', '/app/products', '.product-list-page'],
];
const browser = await chromium.launch();
const results = [];
const failures = [];
const output = args.output || 'scratch/frontend-benchmark.json';
mkdirSync('scratch', { recursive: true });
const save = () => writeFileSync(output, JSON.stringify({ baseURL, runs, version, experimental: Boolean(args.contain || args.trace || args.fontPreload), note: 'Mock API, fixed viewport, service workers blocked; repeat uses SPA navigation except login. Font requests retain the application behavior.', results, failures }, null, 2));
try {
  for (const [screen, path, selector] of screens) {
    if (args.screen && args.screen !== screen) continue;
    for (const scenario of ['cold', 'repeat', 'cpu4']) {
      if (args.scenario && args.scenario !== scenario) continue;
      for (let run = 0; run < runs; run++) {
        const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 720 } });
        try {
          await context.addInitScript(({ user, version, screen }) => {
            localStorage.setItem('app_version', version);
            localStorage.setItem('guidance_enabled', 'false');
            localStorage.setItem('theme', 'light');
            if (screen !== 'login') {
              localStorage.setItem('token', 'benchmark-fixture');
              localStorage.setItem('user', JSON.stringify(user));
            }
            window.benchmarkLongTasks = [];
            new PerformanceObserver(list => window.benchmarkLongTasks.push(...list.getEntries().map(entry => entry.duration)))
              .observe({ type: 'longtask', buffered: true });
          }, { user, version, screen });
          if (args.contain) await context.addInitScript(() => {
            const insert = () => { const style = document.createElement('style'); style.textContent = '.v-data-table { contain: layout; }'; document.head.append(style); };
            document.addEventListener('DOMContentLoaded', insert, { once: true });
          });
          if (args.fontPreload) await context.addInitScript(files => {
            document.addEventListener('DOMContentLoaded', () => {
              for (const file of files) {
                const link = document.createElement('link');
                Object.assign(link, { rel: 'preload', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous', href: '/assets/' + file });
                document.head.append(link);
              }
            }, { once: true });
          }, readdirSync('dist/assets').filter(file => /^(?:tajawal-(?:arabic|latin)|inter-latin)-(?:400|700)-normal-.*\.woff2$/.test(file)));
          await context.route('**/api/v1/**', async route => {
            const url = new URL(route.request().url());
            let data = [];
            if (url.pathname.endsWith('/bootstrap')) data = { user, screen_preferences: {} };
            if (url.pathname.endsWith('/ui-preferences')) data = {};
            if (url.pathname.endsWith('/invoice-types')) data = [{ id: 1, code: 'sale', name: 'بيع' }];
            if (url.pathname.endsWith('/warehouses')) data = [{ id: 1, name: 'مخزن الاختبار', is_default: true }];
            if (url.pathname.endsWith('/cash-boxes')) data = [{ id: 1, name: 'خزنة الاختبار', is_default: true }];
            await route.fulfill({ json: { status: true, success: true, data, meta: { total: 0, current_page: 1, per_page: 10 } } });
          });
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
          page.on('requestfailed', request => errors.push(request.url() + ': ' + request.failure()?.errorText));
          const cdp = await context.newCDPSession(page);
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: scenario === 'cpu4' ? 4 : 1 });
          const trace = [];
          if (args.trace) {
            cdp.on('Tracing.dataCollected', event => trace.push(...event.value));
            await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8', options: 'record-as-much-as-possible' });
            await cdp.send('Profiler.enable');
            await cdp.send('Profiler.start');
          }
          if (scenario === 'repeat') {
            await page.goto(baseURL + path, { waitUntil: 'domcontentloaded' });
            await page.locator(selector).first().waitFor();
            if (screen !== 'login') {
              await page.evaluate(() => document.querySelector('#app').__vue_app__.config.globalProperties.$router.push('/app/profile'));
              await page.waitForURL('**/app/profile');
            }
          }
          const started = Date.now();
          if (scenario === 'repeat' && screen !== 'login') {
            await page.evaluate(path => { performance.clearResourceTimings(); window.benchmarkLongTasks = []; window.benchmarkStart = performance.now(); return document.querySelector('#app').__vue_app__.config.globalProperties.$router.push(path); }, path);
          } else {
            await page.goto(baseURL + path, { waitUntil: 'domcontentloaded' });
          }
          await page.locator(selector).first().waitFor({ timeout: 60000 }).catch(async error => {
            const failure = { screen, scenario, run, url: page.url(), errors, body: (await page.locator('body').innerText()).slice(0, 500) };
            failures.push(failure);
            await page.screenshot({ path: `scratch/benchmark-failure-${screen}-${scenario}-${run}.png` });
            save();
            console.error(JSON.stringify(failure));
            throw error;
          });
          await page.locator('.app-route-loading').waitFor({ state: 'detached', timeout: 60000 });
          const readyMs = Date.now() - started;
          if (args.trace) {
            const { profile } = await cdp.send('Profiler.stop');
            writeFileSync('scratch/frontend.cpu-profile.json', JSON.stringify(profile));
            const completed = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
            await cdp.send('Tracing.end');
            await completed;
            writeFileSync('scratch/frontend.trace.json', JSON.stringify({ traceEvents: trace }));
          }
          await page.waitForTimeout(run === 0 && scenario === 'cold' ? 8000 : 1000);
          const metrics = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource').filter(entry => entry.name.includes('/assets/'));
            return {
              assetBytes: resources.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
              decodedBytes: resources.reduce((sum, entry) => sum + entry.decodedBodySize, 0),
              assetRequests: resources.length,
              longTaskMs: Math.round(window.benchmarkLongTasks.reduce((sum, duration) => sum + duration, 0)),
              resources: resources.map(entry => ({ file: entry.name.split('/').at(-1), bytes: entry.encodedBodySize })),
            };
          });
          results.push({ screen, scenario, run, readyMs, ...metrics });
          save();
        } finally { await context.close(); }
      }
      const samples = results.filter(result => result.screen === screen && result.scenario === scenario);
      const median = key => samples.map(result => result[key]).sort((a, b) => a - b)[Math.floor(samples.length / 2)];
      console.log(JSON.stringify({ screen, scenario, readyMs: median('readyMs'), assetBytes: median('assetBytes'), longTaskMs: median('longTaskMs') }));
    }
  }
} finally { await browser.close(); }
save();
