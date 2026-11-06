import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ actionTimeout: 10000 });

const company = { id: 1, name: 'شركة اختبار التنسيقات', settings: {}, print_settings: {} };
const acknowledgedUpdates = JSON.parse(readFileSync(new URL('../../../src/config/changelogs.json', import.meta.url), 'utf8')).map(release => release.version);
const user = {
  id: 1, full_name: 'مستخدم الاختبار', is_staff_or_admin: true,
  active_company_id: 1, permissions: ['admin.super'], roles: [],
  companies: [company], branches: [], balance: 0, created_at: '2020-01-01',
  settings: { acknowledged_updates: acknowledgedUpdates },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ user }) => {
    localStorage.setItem('token', 'isolated-ui-test-token');
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('theme', 'light');
    localStorage.setItem('guidance_enabled', 'false');
  }, { user });
  // No requests from this UI check reach real application data.
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let data = [];
    if (path.endsWith('/bootstrap')) data = { user, screen_preferences: {} };
    if (path.endsWith('/ui-preferences')) data = {};
    await route.fulfill({ json: { status: true, success: true, data, meta: { total: 0, current_page: 1, per_page: 10 } } });
  });
});

test('customers stay free of unused heavy features after idle and preserve the session on release changes', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('app_version', 'old-release-fixture');
    sessionStorage.setItem('session-preservation-fixture', 'keep');
  });
  const documents = [];
  const assets = [];
  page.on('request', request => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents.push(request.url());
    if (request.url().includes('/assets/')) assets.push(request.url());
  });
  await page.goto('/app/customers', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.customers-page')).toBeVisible();
  await page.waitForTimeout(8000);
  expect(assets.filter(url => /(?:vendor-charts|vendor-print|apexcharts|jspdf|html2canvas|InvoiceTemplate|ProductForm|UserForm|Calculator|InstallmentCalc)/i.test(new URL(url).pathname.split('/').at(-1)))).toEqual([]);
  expect(documents).toHaveLength(1);
  expect(await page.evaluate(() => sessionStorage.getItem('session-preservation-fixture'))).toBe('keep');
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBe('isolated-ui-test-token');
});

for (const [path, selector] of [['/app/products', '.product-list-page'], ['/app/invoices/create?type=sale', '.invoice-create-page']]) {
  test(`${path} does not download print, PDF or chart libraries before use`, async ({ page }) => {
    const assets = [];
    page.on('request', request => { if (request.url().includes('/assets/')) assets.push(request.url()); });
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(selector)).toBeVisible();
    await page.waitForTimeout(8000);
    expect(assets.filter(url => /(?:apexcharts|chart\.js|jspdf|html2canvas|jsbarcode|templateRenderer|labelRenderer)/i.test(new URL(url).pathname.split('/').at(-1)))).toEqual([]);
  });
}

test('customer query state sends search, pagination and the active company and branch', async ({ page }) => {
  const requests = [];
  await page.route('**/api/v1/users/customers*', route => {
    const query = new URL(route.request().url()).searchParams;
    return route.fulfill({ json: { status: true, total: 100, data: [{ id: 50, full_name: 'عميل الترقيم' }], meta: { total: 100, last_page: 4, current_page: Number(query.get('page') || 1), per_page: 25 } } });
  });
  page.on('request', request => {
    if (new URL(request.url()).pathname.endsWith('/users/customers')) requests.push({ url: request.url(), headers: request.headers() });
  });
  await page.goto('/app/customers?search=alpha&page=1&per_page=25');
  await expect(page.locator('.customers-page')).toBeVisible();
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  const initial = new URL(requests[0].url);
  expect(initial.searchParams.get('search')).toBe('alpha');
  expect(initial.searchParams.get('page')).toBe('1');
  expect(initial.searchParams.get('per_page')).toBe('25');
  expect(requests[0].headers['x-company-id']).toBe('1');
  await expect(page.getByText('عميل الترقيم', { exact: true }).first()).toBeVisible();
  await page.evaluate(() => document.querySelector('#app').__vue_app__.config.globalProperties.$router.push('/app/customers?search=alpha&page=2&per_page=25'));
  await expect.poll(() => requests.some(request => new URL(request.url).searchParams.get('page') === '2')).toBe(true);
  await page.evaluate(async () => {
    const globals = document.querySelector('#app').__vue_app__.config.globalProperties;
    globals.$pinia._s.get('branch').setActiveBranch(7);
    globals.$pinia._s.get('user').currentUser.active_company_id = 2;
    await globals.$router.push('/app/customers?search=beta&page=3&per_page=25');
  });
  await expect.poll(() => requests.some(request => new URL(request.url).searchParams.get('search') === 'beta')).toBe(true);
  const changed = requests.find(request => new URL(request.url).searchParams.get('search') === 'beta');
  expect(changed.headers['x-company-id']).toBe('2');
  expect(changed.headers['x-branch-id']).toBe('7');
});

test('customer page remains forbidden without its permission', async ({ page }) => {
  await page.route('**/api/v1/bootstrap', route => route.fulfill({ json: { status: true, data: { user: { ...user, permissions: [], roles: [] }, screen_preferences: {} } } }));
  await page.goto('/app/customers');
  await expect(page).toHaveURL(/\/app\/forbidden/);
  await expect(page.locator('.customers-page')).toHaveCount(0);
});

test('shared surfaces, hover colors and sticky headers stay readable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/app/customers', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.customers-page')).toBeVisible();
  await expect(page.locator('.app-route-loading')).toHaveCount(0);

  const theme = await page.locator('.v-application').evaluate(element => ({
    primary: getComputedStyle(element).getPropertyValue('--v-theme-primary'),
    background: getComputedStyle(element).backgroundColor,
    stylesheetLength: document.getElementById('vuetify-theme-stylesheet').textContent.length,
  }));
  expect(theme.primary.trim()).toBe('0,134,205');
  expect(theme.background).toBe('rgb(255, 255, 255)');
  expect(theme.stylesheetLength).toBeGreaterThan(1000);

  const button = page.locator('.app-navbar .v-btn:visible').first();
  await button.hover();
  await expect(button.locator('.v-btn__overlay')).toHaveCSS('background-color', 'rgb(0, 134, 205)');
  await expect(page.locator('.app-navbar')).toHaveCSS('background-color', 'rgb(255, 255, 255)');

  await page.getByRole('button', { name: 'عميل جديد', exact: true }).click();
  const dialog = page.locator('.v-dialog .app-dialog-card');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.dialog-content')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(dialog.locator('.title-text')).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(dialog.locator('.v-field__overlay').first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const legacyBackground = await dialog.evaluate(element => {
    const probe = document.createElement('div');
    probe.className = 'bg-black';
    element.append(probe);
    const background = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return background;
  });
  expect(legacyBackground).toBe('rgb(224, 242, 254)');
  await expect(page.locator('.v-dialog .v-overlay__scrim')).toHaveCSS('background-color', 'rgba(186, 230, 253, 0.6)');
  await page.screenshot({ path: 'scratch/ui-customer-dialog-after.png', fullPage: true });
  await dialog.locator('.close-btn-hover').click();

  await page.evaluate(() => {
    const space = document.createElement('div');
    space.style.height = '1500px';
    document.querySelector('.main-content').append(space);
    window.scrollTo(0, 400);
  });
  const headerPosition = await page.locator('.sticky-breadcrumbs-container').evaluate(element => ({
    top: element.getBoundingClientRect().top,
    barBottom: document.querySelector('.app-navbar').getBoundingClientRect().bottom,
    background: getComputedStyle(element).backgroundColor,
  }));
  expect(headerPosition.top).toBeGreaterThanOrEqual(headerPosition.barBottom - 1);
  expect(headerPosition.background).toBe('rgb(255, 255, 255)');
  expect(errors).toEqual([]);
});

test('theme CSS updates when selecting a different theme', async ({ page }) => {
  await page.goto('/app/customers', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.customers-page')).toBeVisible();
  await page.getByRole('button', { name: 'تغيير المظهر' }).click();
  await page.getByText('الوضع الدافئ (كوزي)', { exact: true }).click();
  await expect(page.locator('.v-application')).toHaveClass(/v-theme--cozy/);
  await expect(page.locator('.v-application')).toHaveCSS('background-color', 'rgb(249, 246, 240)');
  await page.getByRole('button', { name: 'تغيير المظهر' }).click();
  await page.getByText('الوضع الليلي', { exact: true }).click();
  await expect(page.locator('.v-application')).toHaveCSS('background-color', 'rgb(18, 63, 98)');
});

test('dashboard cards and product and invoice forms use readable surfaces', async ({ page }) => {
  await page.goto('/app/admin/dashboard', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.kpi-card-widget').first();
  await expect(card).toBeVisible();
  await card.hover();
  const overlay = card.locator('.v-card__overlay');
  await expect(overlay).toHaveCSS('background-color', 'rgb(0, 134, 205)');
  await expect.poll(() => overlay.evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThanOrEqual(0.2);
  await page.screenshot({ path: 'scratch/ui-dashboard-after.png', fullPage: true });

  await page.goto('/app/products/create', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.product-type-card').first()).toBeVisible();
  await expect(page.locator('.app-page-header')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.screenshot({ path: 'scratch/ui-product-after.png', fullPage: true });

  await page.goto('/app/invoices/create?type=sale', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.invoice-create-page')).toBeVisible();
  await expect(page.locator('.main-content')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.screenshot({ path: 'scratch/ui-invoice-after.png', fullPage: true });
});

test('mobile dialogs keep the content scrollable and actions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/app/customers', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'أضف عميل جديد', exact: true }).click();
  const dialog = page.locator('.v-dialog .app-dialog-card');
  await expect(dialog).toBeVisible();
  const save = dialog.getByRole('button', { name: 'حفظ العميل', exact: true });
  await expect(save).toBeInViewport();
  await dialog.locator('.dialog-content').evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect(save).toBeInViewport();
  const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  await page.screenshot({ path: 'scratch/ui-customer-mobile-after.png', fullPage: true });
});
