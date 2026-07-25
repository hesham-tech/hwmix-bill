// اختبار مطابقة وتخزين تخطيط لوحة التحكم واستعادته بعد تحديث الصفحة وتسجيل الخروج E2E
import { test, expect } from '@playwright/test';

test.describe('Dashboard Layout Persistence E2E Tests', () => {
  test('يجب حفظ التخطيط واستعادته بدقة 100% بعد تحديث المتصفح وتسجيل الخروج والولوج', async ({ page }) => {
    test.setTimeout(180000);
    // 1. تسجيل الدخول والولوج للوحة التحكم
    await page.goto('/saas/login', { timeout: 90000, waitUntil: 'domcontentloaded' });
    
    const usernameInput = page.locator('input[placeholder*="بريدك"], input[autocomplete="username"]').first();
    const passwordInput = page.locator('input[placeholder*="مرور"], input[autocomplete="current-password"]').first();
    const loginButton = page.locator('.saas-login-btn, .login-submit-btn').first();

    await usernameInput.waitFor({ state: 'visible', timeout: 30000 });
    await usernameInput.fill('admin@admin.com');
    await passwordInput.fill('12345678');
    await loginButton.click();
    await page.waitForURL('**/app/admin/dashboard', { timeout: 90000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    // التوجه الصريح للوحة التحكم بدون networkidle لتجنب تعليق الـ polling
    await page.goto('/app/admin/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    // 2. تفعيل وضع التصميم بالنقر على "تخصيص الواجهة"
    const customizeBtn = page.locator('.tour-dashboard-customize');
    await expect(customizeBtn).toBeVisible({ timeout: 30000 });
    await customizeBtn.click();

    // 3. النقر على إضافة ويدجت لفتح مكتبة المكونات وإضافة مكون جديد
    const addWidgetBtn = page.locator('.tour-add-widget-btn');
    await expect(addWidgetBtn).toBeVisible({ timeout: 15000 });
    await addWidgetBtn.click();

    const availableCard = page.locator('.widget-palette-card').first();
    await availableCard.waitFor({ state: 'visible', timeout: 25000 });
    const cardTitle = await availableCard.locator('.text-body-2').textContent();
    await availableCard.click();

    // إغلاق المكتبة أولاً لضمان زوال الطبقة الشفافة والدرج
    const closeBtn = page.locator('.btn-close-library');
    await expect(closeBtn).toBeVisible({ timeout: 15000 });
    await closeBtn.click();
    
    const libraryDrawer = page.locator('.widget-library-drawer');
    await expect(libraryDrawer).not.toHaveClass(/v-navigation-drawer--active/, { timeout: 35000 });
    await page.waitForTimeout(2000); // انتظار إضافي لضمان زوال أي scrim من Vuetify

    // حفظ التغييرات وإغلاق وضع التصميم
    const savePromise = page.waitForResponse(res => res.url().includes('ui-preferences'), { timeout: 15000 }).catch(() => null);
    const saveBtn = page.locator('button:has-text("حفظ وإغلاق")');
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.click({ force: true });
    await savePromise;
    await page.waitForTimeout(1000);

    // التحقق من خروج وضع التصميم عبر اختفاء زر إضافة ويدجت (وليس زر الحفظ لأنه قد يتأخر في الاختفاء)
    const addWidgetBtnCheck = page.locator('.tour-add-widget-btn');
    await expect(addWidgetBtnCheck).not.toBeVisible({ timeout: 45000 });

    // 4. قراءة تفاصيل المكون المضاف بالشبكة
    const addedWidget = page.locator(`.grid-stack-item:has-text("${cardTitle.trim()}")`).first();
    await expect(addedWidget).toBeVisible({ timeout: 15000 });

    // قراءة سمات المخطط (الموقع والأبعاد) بالشبكة
    const initialX = await addedWidget.getAttribute('gs-x');
    const initialY = await addedWidget.getAttribute('gs-y');
    const initialW = await addedWidget.getAttribute('gs-w');
    const initialH = await addedWidget.getAttribute('gs-h');

    // 5. محاكاة تحديث الصفحة (Refresh Page) والتأكد من بقاء التخطيط مطابقاً
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.goto('/app/admin/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    const reloadedWidget = page.locator(`.grid-stack-item:has-text("${cardTitle.trim()}")`).first();
    await expect(reloadedWidget).toBeVisible({ timeout: 15000 });

    expect(await reloadedWidget.getAttribute('gs-x')).toBe(initialX);
    expect(await reloadedWidget.getAttribute('gs-y')).toBe(initialY);
    expect(await reloadedWidget.getAttribute('gs-w')).toBe(initialW);
    expect(await reloadedWidget.getAttribute('gs-h')).toBe(initialH);

    // 6. تسجيل الخروج عبر زر Logout الحقيقي في القائمة الجانبية (.logout-item)
    const logoutBtn = page.locator('.logout-item, [title="تسجيل الخروج"]').first();
    await logoutBtn.scrollIntoViewIfNeeded().catch(() => {});
    await logoutBtn.waitFor({ state: 'visible', timeout: 15000 });
    await logoutBtn.click();

    // التحقق من الانتقال إلى صفحة تسجيل الدخول (سواء عبر waitForURL أو waitForFunction كما وثّقنا في ADR)
    try {
      await page.waitForURL('**/saas/login', { timeout: 15000 });
    } catch {
      await page.waitForFunction(
        () => window.location.href.includes('/saas/login'),
        { timeout: 30000, polling: 500 }
      );
    }
    
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // تسجيل الدخول مجدداً بجلسة جديدة نظيفة
    const usernameInput2 = page.locator('input[placeholder*="بريدك"], input[autocomplete="username"]').first();
    const passwordInput2 = page.locator('input[placeholder*="مرور"], input[autocomplete="current-password"]').first();

    await usernameInput2.waitFor({ state: 'visible', timeout: 30000 });
    await usernameInput2.fill('admin@admin.com');
    await passwordInput2.fill('12345678');
    await passwordInput2.press('Enter');

    // ننتظر حتى تكتمل عملية الدخول ويُكتب التوكن في localStorage بدقة
    await page.waitForFunction(() => !!localStorage.getItem('token'), { timeout: 30000 });
    await page.goto('/app/admin/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('.grid-stack-item').first().waitFor({ state: 'visible', timeout: 30000 });

    const sessionWidget = page.locator(`.grid-stack-item:has-text("${cardTitle.trim()}")`).first();
    await expect(sessionWidget).toBeVisible({ timeout: 15000 });

    expect(await sessionWidget.getAttribute('gs-x')).toBe(initialX);
    expect(await sessionWidget.getAttribute('gs-y')).toBe(initialY);
    expect(await sessionWidget.getAttribute('gs-w')).toBe(initialW);
    expect(await sessionWidget.getAttribute('gs-h')).toBe(initialH);
  });
});
