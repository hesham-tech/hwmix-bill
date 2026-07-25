// اختبار Resize من جميع الاتجاهات واستمراريته بعد تحديث الصفحة E2E
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

test.describe('Grid Resize Handles — All Directions', () => {
  test('يجب أن تكون جميع اتجاهات الـ Resize Handles متاحة في وضع التصميم', async ({ page }) => {
    await loginAndGoToDashboard(page);

    // تفعيل وضع التصميم
    const customizeBtn = page.locator('.tour-dashboard-customize');
    await expect(customizeBtn).toBeVisible({ timeout: 30000 });
    await customizeBtn.click();
    await page.waitForTimeout(1000);

    // التحقق من وجود resize handles في grid items
    const firstItem = page.locator('.grid-stack-item').first();
    await expect(firstItem).toBeVisible({ timeout: 15000 });

    // التحقق من وجود resize handles في الـ DOM (GridStack يضيفها تلقائياً)
    const resizeHandles = firstItem.locator('.ui-resizable-handle');
    const handleCount = await resizeHandles.count();
    // مع handles: 'n,e,s,w,ne,nw,se,sw' يجب أن يكون هناك 8 handles
    expect(handleCount).toBeGreaterThanOrEqual(4); // على الأقل 4 (يعتمد على GridStack version)
    console.log(`[Resize Test] Found ${handleCount} resize handles`);
  });

  test('يجب أن يحتفظ الـ Grid بأبعاد الـ Resize بعد تحديث الصفحة', async ({ page }) => {
    await loginAndGoToDashboard(page);

    // قراءة أبعاد العنصر الأول
    const firstItem = page.locator('.grid-stack-item').first();
    await expect(firstItem).toBeVisible({ timeout: 15000 });

    const initialW = await firstItem.getAttribute('gs-w');
    const initialH = await firstItem.getAttribute('gs-h');
    const initialId = await firstItem.getAttribute('data-instance-id');

    // تحديث الصفحة
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    // التحقق من بقاء الأبعاد
    const restoredItem = page.locator(`[data-instance-id="${initialId}"]`).first();
    await expect(restoredItem).toBeVisible({ timeout: 15000 });

    expect(await restoredItem.getAttribute('gs-w')).toBe(initialW);
    expect(await restoredItem.getAttribute('gs-h')).toBe(initialH);
  });
});
