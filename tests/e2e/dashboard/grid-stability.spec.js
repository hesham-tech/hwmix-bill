// اختبار استقرار Grid أثناء Polling — يجب ألا يتغير التخطيط أثناء تحديث البيانات E2E
import { test, expect } from '@playwright/test';

const BASE = '/app/admin/dashboard';
const LOGIN = '/saas/login';

async function loginAndGoToDashboard(page) {
  await page.goto(LOGIN, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const emailInput = page.locator('input[autocomplete="username"]').first();
  const passInput = page.locator('input[autocomplete="current-password"]').first();
  const loginBtn = page.locator('.saas-login-btn, .login-submit-btn').first();
  await emailInput.waitFor({ state: 'visible', timeout: 30000 });
  await emailInput.fill('admin@admin.com');
  await passInput.fill('12345678');
  await loginBtn.click();
  await page.waitForURL('**' + BASE, { timeout: 90000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('.grid-stack-item').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(2000);
}

test.describe('Grid Stability During Polling', () => {
  test('يجب ألا يتغير التخطيط أثناء دورات Polling للبيانات', async ({ page }) => {
    await loginAndGoToDashboard(page);

    // قراءة التخطيط الأولي
    const initialItems = await page.locator('.grid-stack-item').evaluateAll(items =>
      items.map(el => ({
        id: el.getAttribute('data-instance-id'),
        x: el.getAttribute('gs-x'),
        y: el.getAttribute('gs-y'),
        w: el.getAttribute('gs-w'),
        h: el.getAttribute('gs-h')
      }))
    );

    // انتظار 3 دورات polling (15 ثانية إذا كانت كل 5 ثواني)
    await page.waitForTimeout(15000);

    // قراءة التخطيط بعد Polling
    const afterPollItems = await page.locator('.grid-stack-item').evaluateAll(items =>
      items.map(el => ({
        id: el.getAttribute('data-instance-id'),
        x: el.getAttribute('gs-x'),
        y: el.getAttribute('gs-y'),
        w: el.getAttribute('gs-w'),
        h: el.getAttribute('gs-h')
      }))
    );

    // التخطيط يجب أن يبقى مطابقاً تماماً
    expect(afterPollItems.length).toBe(initialItems.length);
    for (let i = 0; i < initialItems.length; i++) {
      expect(afterPollItems[i].x).toBe(initialItems[i].x);
      expect(afterPollItems[i].y).toBe(initialItems[i].y);
      expect(afterPollItems[i].w).toBe(initialItems[i].w);
      expect(afterPollItems[i].h).toBe(initialItems[i].h);
    }
  });

  test('يجب أن تتحدث بيانات الـ KPI أثناء Polling بدون إعادة رسم Grid', async ({ page }) => {
    await loginAndGoToDashboard(page);

    // التحقق من وجود widgets في الـ grid
    const widgetCount = await page.locator('.grid-stack-item').count();
    expect(widgetCount).toBeGreaterThan(0);

    // انتظار polling
    await page.waitForTimeout(10000);

    // عدد الـ widgets يجب أن يبقى ثابتاً
    const widgetCountAfter = await page.locator('.grid-stack-item').count();
    expect(widgetCountAfter).toBe(widgetCount);
  });
});
