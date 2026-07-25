// اختبارات دورة حياة لوحة التحكم التفاعلية وإضافة وإخفاء وتعديل تخطيط المكونات E2E
import { test, expect } from '@playwright/test';

test.describe('Dashboard Lifecycle & Widgets E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول والتوجه للوحة التحكم
    await page.goto('/saas/login', { timeout: 90000, waitUntil: 'domcontentloaded' });
    
    const usernameInput = page.locator('input[placeholder*="بريدك"], input[autocomplete="username"]').first();
    const passwordInput = page.locator('input[placeholder*="مرور"], input[autocomplete="current-password"]').first();
    const loginButton = page.locator('.saas-login-btn, .login-submit-btn').first();

    await usernameInput.waitFor({ state: 'visible', timeout: 30000 });
    await usernameInput.fill('admin@admin.com');
    await passwordInput.fill('12345678');
    await loginButton.click();

    await page.waitForURL('**/app/admin/dashboard', { timeout: 90000 });
    // الانتظار حتى استقرار كافة طلبات جلب البيانات لتلافي تعليق الواجهة
    await page.waitForLoadState('networkidle', { timeout: 90000 });
  });

  test('يجب الدخول في وضع التصميم وإضافة وإخفاء ويدجت بنجاح وتراص الشبسة', async ({ page }) => {
    await page.goto('/app/admin/dashboard', { timeout: 90000, waitUntil: 'domcontentloaded' });

    // 1. تفعيل وضع التصميم بالنقر على "تخصيص الواجهة"
    const customizeBtn = page.locator('.tour-dashboard-customize');
    await expect(customizeBtn).toBeVisible({ timeout: 30000 });
    await customizeBtn.click();

    // التحقق من ظهور التنبيه الخاص بوضع التصميم
    const designAlert = page.locator('v-alert, .v-alert');
    await expect(designAlert).toBeVisible({ timeout: 15000 });

    // 2. النقر على إضافة ويدجت لفتح مكتبة المكونات
    const addWidgetBtn = page.locator('.tour-add-widget-btn');
    await expect(addWidgetBtn).toBeVisible({ timeout: 15000 });
    await addWidgetBtn.click();

    // التحقق من فتح الدرج الجانبي لمكتبة المكونات
    const libraryDrawer = page.locator('.widget-library-drawer');
    await expect(libraryDrawer).toBeVisible({ timeout: 15000 });

    // 3. إضافة أول ويدجت متاحة بالضغط عليها (مع الانتظار الصريح للظهور)
    const availableCard = page.locator('.widget-palette-card').first();
    await availableCard.waitFor({ state: 'visible', timeout: 25000 });
    
    const cardTitle = await availableCard.locator('.text-body-2').textContent();
    await availableCard.click();

    // الانتظار القصير لضمان ربط الأحداث وإتمام حركة إدخال المكون بالشبكة
    await page.waitForTimeout(1500);

    // إغلاق المكتبة بالنقر على الزر المخصص المضاف حديثاً بـ force true
    const closeBtn = page.locator('.btn-close-library');
    await expect(closeBtn).toBeVisible({ timeout: 15000 });
    await closeBtn.click({ force: true });
    
    // الانتظار حتى يزول كلاس النشاط للـ drawer من Vuetify لضمان الإغلاق
    await expect(libraryDrawer).not.toHaveClass(/v-navigation-drawer--active/, { timeout: 35000 });

    // التحقق من رندرة المكون الجديد بالشبكة
    const newWidgetInGrid = page.locator(`.grid-stack-item:has-text("${cardTitle.trim()}")`);
    await expect(newWidgetInGrid).toBeVisible({ timeout: 20000 });

    // 4. إخفاء المكون المضاف باستخدام زر الإخفاء بالـ overlay
    const hideBtn = newWidgetInGrid.locator('.widget-design-overlay button:has(.ri-eye-off-line)').first();
    await hideBtn.click();

    // تأكيد اختفاء المكون من الشبكة
    await expect(newWidgetInGrid).not.toBeVisible({ timeout: 15000 });
  });
});
