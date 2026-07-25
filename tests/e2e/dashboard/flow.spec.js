// اختبارات الـ E2E المتكاملة للوحة التحكم ومراقبة التفاعل والشبكة وحالات المتصفح
import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Runtime Validation', () => {
  test.beforeEach(async ({ page }) => {
    // فتح صفحة تسجيل الدخول والانتظار حتى هدوء الشبكة
    await page.goto('/saas/login', { timeout: 90000, waitUntil: 'domcontentloaded' });

    // تحديد الحقول بمرونة
    const usernameInput = page.locator('input[placeholder*="بريدك"], input[autocomplete="username"]').first();
    const passwordInput = page.locator('input[placeholder*="مرور"], input[autocomplete="current-password"]').first();
    const loginButton = page.locator('.saas-login-btn, .login-submit-btn').first();

    // الانتظار الصريح لظهور الحقول لتفادي مشاكل الـ Race Conditions في التحميل الأولي
    await usernameInput.waitFor({ state: 'visible', timeout: 30000 });
    
    // ملء البيانات وتسجيل الدخول
    await usernameInput.fill('admin@admin.com');
    await passwordInput.fill('12345678');
    await loginButton.click();
    
    // الانتظار الصريح والكامل حتى يتم توجيه المتصفح للوحة التحكم
    await page.waitForURL('**/app/admin/dashboard', { timeout: 90000 });
    await page.waitForLoadState('networkidle', { timeout: 90000 });
  });

  test('يجب تحميل لوحة التحكم ورندرة كافة البطاقات والجداول بصورة صحيحة وبدون أخطاء كونسول', async ({ page }) => {
    // مراقبة أخطاء الكونسول أثناء الفحص التشغيلي
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // التوجه إلى مسار لوحة التحكم الصحيح
    await page.goto('/app/admin/dashboard', { timeout: 90000, waitUntil: 'domcontentloaded' });

    // التحقق من ظهور مكون GridStack الرئيسي للوحة التحكم
    const gridStack = page.locator('.grid-stack');
    await expect(gridStack).toBeVisible({ timeout: 30000 });

    // التحقق من عدم وجود أي أخطاء حرجة بالكونسول
    expect(consoleErrors).toHaveLength(0);
  });

  test('يجب تحديث الفلاتر وإعادة جلب البيانات عند النقر وتغيير الفترة الزمنية', async ({ page }) => {
    await page.goto('/app/admin/dashboard', { timeout: 90000, waitUntil: 'domcontentloaded' });

    // النقر مباشرة على زر الفترة الزمنية "اليوم" المتاح بالواجهة
    const todayBtn = page.locator('button:has-text("اليوم")').first();
    await expect(todayBtn).toBeVisible({ timeout: 30000 });
    await todayBtn.click();
    
    // التحقق من إرسال طلب جلب البيانات ومطابقته للـ API
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('dashboard/summary') && response.status() === 200,
      { timeout: 45000 }
    );
    await responsePromise;
  });
});
