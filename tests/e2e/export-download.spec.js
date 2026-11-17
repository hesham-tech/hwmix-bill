import { test, expect } from '@playwright/test';
import changelogs from '../../src/config/changelogs.json' with { type: 'json' };

for (const width of [390, 1440]) {
  test(`product export sends bearer headers and downloads CSV at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    const downloadRequests = [];
    let scheduled = 0;
    let rejectDownload = false;
    let downloads = 0;
    page.on('download', () => downloads++);
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      sessionStorage.setItem('token', 'fixture-export-token');
      localStorage.setItem('guidance_enabled', 'false');
    });
    // All API traffic is mocked. No actual server authentication, jobs or file writes.
    await page.route('**/api/v1/**', async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      let data = [];
      if (path.endsWith('/bootstrap')) data = { user: {
        id: 7, is_staff_or_admin: true, active_company_id: 1, company_id: 1,
        full_name: 'مستخدم اختبار', subscription: { status: 'active' },
        settings: { acknowledged_updates: changelogs.map(c => c.version) },
        permissions: ['products.view_all', 'products.export'], roles: [],
        companies: [{ id: 1, name: 'شركة الاختبار', settings: {} }], branches: [],
      } };
      else if (path.endsWith('/guidance/setup')) data = { can_manage: false, state: { hidden: true, finished: true }, steps: [], issues: [], data: {} };
      else if (path.endsWith('/export-import/export')) {
        expect(request.method()).toBe('POST');
        expect(request.postDataJSON()).toEqual({ model_type: 'products' });
        scheduled++;
        data = { id: 42, status: 'pending' };
      } else if (path.endsWith('/export-import/42')) data = {
        id: 42, status: 'completed', progress: 100,
        // Ignore a server-supplied foreign URL instead of forwarding the token to it.
        download_url: 'https://untrusted.invalid/file.csv',
      };
      else if (path.endsWith('/export-import/download/42')) {
        downloadRequests.push({ url: request.url(), authorization: request.headers().authorization });
        if (rejectDownload) return route.fulfill({ status: 403, json: { message: 'Forbidden' } });
        return route.fulfill({ status: 200, contentType: 'text/csv', body: 'ID,name\n1,fixture' });
      } else if (path.endsWith('/products')) data = { data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 15 } };
      await route.fulfill({ json: { success: true, data } });
    });
    let foreignRequests = 0;
    await page.route('https://untrusted.invalid/**', route => { foreignRequests++; return route.abort(); });
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());
    await page.goto('/app/products', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('export-products')).toBeVisible();
    const downloaded = page.waitForEvent('download');
    await page.getByTestId('export-products').click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toBe('products_export_42.csv');
    expect(scheduled).toBe(1);
    expect(downloadRequests).toHaveLength(1);
    expect(downloadRequests[0].authorization).toBe('Bearer fixture-export-token');
    expect(new URL(downloadRequests[0].url).search).toBe('');
    expect(foreignRequests).toBe(0);
    rejectDownload = true;
    const denied = page.waitForResponse(response => response.url().includes('/export-import/download/42') && response.status() === 403);
    await page.getByRole('button', { name: 'تحميل الملف الناتج', exact: true }).click();
    await denied;
    await expect(page.getByText('تعذر تنزيل الملف. تحقق من تسجيل الدخول وصلاحية التصدير، ثم أعد المحاولة.', { exact: true })).toBeVisible();
    expect(downloads).toBe(1);
    expect(errors).toEqual([]);
  });
}
