// اختبارات التجاوب البصري E2E ومطابقة لقطات الشاشة للوضع الفاتح ومقاسات وحالات لوحة التحكم المختلفة
import { test, expect } from '@playwright/test';

test.describe('Dashboard Responsive & Visual E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول والتوجه للوحة التحكم مرة واحدة للتهيئة
    await page.goto('/saas/login', { timeout: 90000, waitUntil: 'domcontentloaded' });
    
    const usernameInput = page.locator('input[placeholder*="بريدك"], input[autocomplete="username"]').first();
    const passwordInput = page.locator('input[placeholder*="مرور"], input[autocomplete="current-password"]').first();
    const loginButton = page.locator('.saas-login-btn, .login-submit-btn').first();

    await usernameInput.waitFor({ state: 'visible', timeout: 30000 });
    await usernameInput.fill('admin@admin.com');
    await passwordInput.fill('12345678');
    await loginButton.click();

    await page.waitForURL('**/app/admin/dashboard', { timeout: 90000 });
    await page.waitForLoadState('networkidle', { timeout: 90000 });
  });

  test('يجب التقاط 14 لقطة شاشة مرجعية لكافة الحالات ومقاسات الشاشات المختلفة للتحقق البصري', async ({ page }) => {
    
    // -------------------------------------------------------------
    // ركيزة 1: الحالة الطبيعية للوحة (Normal States) - 4 لقطات شاشة
    // -------------------------------------------------------------
    const normalViewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const vp of normalViewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(1000);

      const gridStack = page.locator('.grid-stack');
      await expect(gridStack).toBeVisible({ timeout: 20000 });
      
      await page.screenshot({ path: `tests/e2e/screenshots/dashboard-normal-${vp.name}.png` });
    }

    // -------------------------------------------------------------
    // ركيزة 2: وضع التصميم والتحرير (Design Mode) - صورتان
    // -------------------------------------------------------------
    const customizeBtn = page.locator('.tour-dashboard-customize');
    await customizeBtn.click();
    const designAlert = page.locator('v-alert, .v-alert');
    await expect(designAlert).toBeVisible({ timeout: 15000 });

    // تصوير وضع التصميم (Desktop)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-design-Desktop.png' });

    // تصوير وضع التصميم (Mobile)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-design-Mobile.png' });

    // إعادة المقاس لـ Desktop أولاً لضمان استقرار الخروج
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    // إغلاق وضع التصميم بالضغط على زر "حفظ وإغلاق" لإعادة التهيئة
    const saveBtn = page.locator('button:has-text("حفظ وإغلاق")');
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.click({ force: true });
    await page.waitForTimeout(1000);
    await expect(saveBtn).not.toBeVisible({ timeout: 45000 });

    // -------------------------------------------------------------
    // ركيزة 3: بعد تفاعل المكونات وإخفائها (After Interactive Actions) - صورتان
    // -------------------------------------------------------------

    // الدخول في وضع التصميم مجدداً لإخفاء ويدجت
    await expect(customizeBtn).toBeVisible({ timeout: 25000 });
    await customizeBtn.click();
    await page.waitForTimeout(1000);
    
    // استهداف أول ويدجت مخفية أو إخفاء أحد الويدجت المتاحة
    const firstWidget = page.locator('.grid-stack-item').first();
    const overlay = firstWidget.locator('.widget-design-overlay');
    await overlay.hover({ force: true });
    const hideBtn = overlay.locator('button').first();
    await hideBtn.click({ force: true });
    await page.waitForTimeout(1500); // مهلة لتراص الشبكة تلقائياً

    // تصوير التخطيط بعد التغيير (Desktop & Mobile)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-action-Desktop.png' });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-action-Mobile.png' });

    // حفظ التغييرات وإغلاق التعديل
    await saveBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // -------------------------------------------------------------
    // ركيزة 4: أثناء التحميل (Skeleton/Loading State) - صورتان
    // -------------------------------------------------------------
    // نقوم بتجميد طلبات الـ API بالـ background لكي يظل الـ Vue معلقاً بحالة الـ Loading
    await page.route('**/api/v1/dashboard/**', () => {
      // لا نجيب على الطلب مطلقاً لتعليق التحميل
    });
    
    // إعادة التوجيه للوحة لفرض التحميل الجديد المجمّد
    await page.goto('/app/admin/dashboard', { timeout: 90000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // مهلة قصيرة لعرض بطاقات الـ Skeleton

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-loading-Desktop.png' });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-loading-Mobile.png' });

    // إلغاء تجميد الـ API للتحول للخطوات التالية
    await page.unroute('**/api/v1/dashboard/**');

    // -------------------------------------------------------------
    // ركيزة 5: حالة البيانات الفارغة (Empty State) - صورتان
    // -------------------------------------------------------------
    // محاكاة إرجاع بيانات فارغة تماماً من الـ API
    await page.route('**/api/v1/dashboard/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {},
          recentInvoices: [],
          salesTrend: [],
          topProducts: [],
          tasks: [],
          upcomingPayments: [],
          upcomingInstallments: []
        })
      });
    });

    await page.goto('/app/admin/dashboard', { timeout: 90000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-empty-Desktop.png' });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-empty-Mobile.png' });

    await page.unroute('**/api/v1/dashboard/**');

    // -------------------------------------------------------------
    // ركيزة 6: حالة الأعطال والأوفلاين (Error State) - صورتان
    // -------------------------------------------------------------
    // محاكاة تعطل الـ API بالكامل وإرجاع خطأ 500
    await page.route('**/api/v1/dashboard/**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' })
      });
    });

    await page.goto('/app/admin/dashboard', { timeout: 90000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-error-Desktop.png' });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-error-Mobile.png' });

    await page.unroute('**/api/v1/dashboard/**');
  });
});
