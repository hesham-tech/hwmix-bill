import { test, expect } from '@playwright/test';
const fixture = 'http://127.0.0.1:5176/tests/e2e/fixtures/invoice-phone-harness.html';
test.use({ viewport: { width: 390, height: 844 } });
const rows = page => page.locator('.phone-items-table tbody tr');
async function openDetails(page, index = 0) {
  const button = rows(page).nth(index).getByRole('button', { name: 'فتح تفاصيل الصنف', exact: true });
  const box = await button.boundingBox();
  if (box && box.y >= 0 && box.y + box.height < page.viewportSize().height) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  else await button.click();
  return page.getByRole('dialog').filter({ hasText: 'تفاصيل الصنف' }).first();
}
async function addProduct(page) {
  await page.getByRole('button', { name: 'إضافة صنف', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('سماعة');
  await page.locator('.v-list-item').filter({ hasText: 'سماعة لاسلكية' }).click();
  return dialog;
}
async function save(page, edit = true) {
  await page
    .locator('.invoice-phone-savebar')
    .getByRole('button', { name: edit ? 'حفظ التعديلات' : 'حفظ الفاتورة', exact: true })
    .click();
  await expect.poll(() => page.evaluate(() => window.invoiceQA.saved.length)).toBe(1);
  return page.evaluate(() => window.invoiceQA.saved[0]);
}
test('create: compact row keeps quantities, price, discount and payload', async ({ page }) => {
  await page.goto(fixture);
  const dialog = await addProduct(page);
  await dialog.getByRole('spinbutton', { name: /^الكمية/ }).fill('2');
  await dialog.getByRole('spinbutton', { name: /^خصم الصنف/ }).fill('10');
  await dialog.getByRole('button', { name: 'إضافة إلى الفاتورة' }).click();
  await expect(rows(page)).toHaveCount(1);
  await expect(page.locator('.phone-row-total')).toContainText('290');
  const payload = await save(page, false);
  expect(payload.items[0]).toMatchObject({ quantity: 2, unit_id: 1, unit_price: 150, discount: 10, total: 290 });
  expect(payload.paid_amount).toBe(290);
});
test('details are isolated until Apply, stock and unit conversion still work', async ({ page }) => {
  await page.goto(fixture + '?edit=1');
  const qty = rows(page).first().getByRole('spinbutton', { name: /كمية/ });
  await qty.fill('999');
  await qty.blur();
  await expect(qty).toHaveValue('21');
  let dialog = await openDetails(page);
  await dialog.getByRole('spinbutton', { name: /^خصم الصنف/ }).fill('99');
  await dialog.getByRole('button', { name: 'إلغاء', exact: true }).click();
  await page.getByRole('button', { name: 'تجاهل', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.phone-row-total')).toContainText('3,150');
  dialog = await openDetails(page);
  await dialog.getByRole('combobox').click();
  await page.getByRole('option', { name: 'علبة', exact: true }).click();
  await expect(dialog.getByRole('spinbutton', { name: /^سعر الوحدة/ })).toHaveValue('750');
  await dialog.getByRole('spinbutton', { name: /^الكمية/ }).fill('2');
  await dialog.getByRole('spinbutton', { name: /^خصم الصنف/ }).fill('25');
  await dialog.getByRole('button', { name: 'تطبيق', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const payload = await save(page);
  expect(payload.items[0]).toMatchObject({ unit_id: 2, quantity: 2, unit_price: 750, discount: 25, total: 1475 });
});
for (const width of [320, 390, 480])
  test(`phone ${width}: scroll stays inside table and detail dialog fits`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(fixture + '?edit=1&type=purchase&count=50');
    await expect(rows(page)).toHaveCount(50);
    const area = page.locator('.phone-table-viewport');
    const metrics = await area.evaluate(e => ({ height: e.clientHeight, scroll: e.scrollHeight, width: e.clientWidth, scrollWidth: e.scrollWidth }));
    expect(metrics.height).toBeLessThanOrEqual(380);
    expect(metrics.scroll).toBeGreaterThan(metrics.height * 5);
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(
      await rows(page)
        .first()
        .getByRole('button', { name: 'فتح تفاصيل الصنف', exact: true })
        .evaluate(e => e.getBoundingClientRect().width)
    ).toBeGreaterThanOrEqual(44);
    await area.evaluate(e => {
      e.scrollTop = 1000;
      e.scrollLeft = -80;
    });
    const before = await area.evaluate(e => ({ top: e.scrollTop, left: e.scrollLeft }));
    const visible = await rows(page).evaluateAll(list => {
      const box = document.querySelector('.phone-table-viewport').getBoundingClientRect();
      return list.findIndex(e => {
        const r = e.getBoundingClientRect();
        return r.top > box.top + 45 && r.bottom < box.bottom;
      });
    });
    const dialog = await openDetails(page, visible);
    expect((await dialog.boundingBox()).width).toBeLessThanOrEqual(width);
    await dialog.getByRole('button', { name: 'إلغاء', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const after = await area.evaluate(e => ({ top: e.scrollTop, left: e.scrollLeft }));
    expect(Math.abs(after.top - before.top)).toBeLessThan(2);
    expect(Math.abs(after.left - before.left)).toBeLessThan(2);
  });
test('payment stays near the table for 3, 20 and 50 items; title never overlays scrolling content', async ({ page }) => {
  const positions = [];
  for (const count of [3, 20, 50]) {
    await page.goto(fixture + `?edit=1&type=purchase&count=${count}`);
    await expect(rows(page)).toHaveCount(count);
    positions.push(await page.locator('.invoice-financial-area').evaluate(e => e.getBoundingClientRect().top + scrollY));
    expect(await page.locator('.sticky-header').evaluate(e => getComputedStyle(e).position)).toBe('relative');
    await page.getByRole('button', { name: 'الدفع والحسابات', exact: true }).click();
    await expect(page.locator('.invoice-financial-area')).toBeFocused();
    await expect(page.locator('.phone-fin-title')).toBeInViewport();
  }
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(200);
});
for (const desktop of [false, true])
  test(`delete and Undo preserve full row and ordering on ${desktop ? 'desktop' : 'phone'}`, async ({ page }) => {
    if (desktop) await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(fixture + '?edit=1&count=4');
    const list = () => (desktop ? page.locator('.items-scroll-area .item-row') : rows(page));
    await expect(list()).toHaveCount(4);
    await list().nth(1).getByRole('button', { name: 'فتح تفاصيل الصنف', exact: true }).click();
    const details = page.getByRole('dialog').filter({ hasText: 'تفاصيل الصنف' }).first();
    await details.getByRole('spinbutton', { name: /^الكمية/ }).fill('2');
    await details.getByRole('spinbutton', { name: /^خصم الصنف/ }).fill('10');
    await details.getByRole('button', { name: 'تطبيق', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const name = await list().nth(1).innerText();
    await list().nth(1).getByRole('button', { name: 'حذف الصنف', exact: true }).click();
    await expect(list()).toHaveCount(3);
    await page.getByRole('button', { name: 'تراجع', exact: true }).click();
    await expect(list()).toHaveCount(4);
    expect(await list().nth(1).innerText()).toBe(name);
    if (desktop) await page.getByRole('button', { name: 'حفظ الفاتورة', exact: true }).click();
    else await page.locator('.invoice-phone-savebar').getByRole('button', { name: 'حفظ التعديلات' }).click();
    await expect.poll(() => page.evaluate(() => window.invoiceQA.saved.length)).toBe(1);
    const payload = await page.evaluate(() => window.invoiceQA.saved[0]);
    expect(payload.items.map(e => e.variant_id)).toEqual([11, 12, 13, 14]);
    expect(payload.net_amount).toBe(740);
    expect(payload.items[1]).toMatchObject({ variant_id: 12, unit_id: 1, quantity: 2, unit_price: 150, discount: 10, total: 290 });
  });
test('repeated deletions can be undone in reverse order without dropping other rows', async ({ page }) => {
  await page.goto(fixture + '?edit=1&count=4');
  await expect(rows(page)).toHaveCount(4);
  await rows(page).nth(1).getByRole('button', { name: 'حذف الصنف' }).click();
  await rows(page).nth(1).getByRole('button', { name: 'حذف الصنف' }).click();
  await expect(rows(page)).toHaveCount(2);
  await page.getByRole('button', { name: 'تراجع', exact: true }).click();
  await page.getByRole('button', { name: 'تراجع', exact: true }).click();
  await expect(rows(page)).toHaveCount(4);
  const payload = await save(page);
  expect(payload.items.map(e => e.variant_id)).toEqual([11, 12, 13, 14]);
});
test('support is available in header and floating button cannot cover payment/save', async ({ page }) => {
  await page.goto(fixture + '?edit=1');
  await expect(page.locator('.global-fab-feedback')).toBeHidden();
  await page.getByRole('button', { name: 'الدعم الفني', exact: true }).click();
  expect(await page.evaluate(() => window.invoiceQA.supportClicks)).toBe(1);
});
test('adding repeated product keeps merge behavior', async ({ page }) => {
  await page.goto(fixture + '?edit=1');
  const dialog = await addProduct(page);
  await dialog.getByRole('button', { name: 'إضافة إلى الفاتورة' }).click();
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first().getByRole('spinbutton', { name: /كمية/ })).toHaveValue('2');
  await expect(page.locator('.phone-row-total')).toContainText('300');
});
test('financial options preserve tax, discount and partial payment', async ({ page }) => {
  await page.goto(fixture + '?edit=1');
  await page.getByRole('button', { name: 'الضريبة والخصم والرصيد والملاحظات' }).click();
  await page.getByRole('spinbutton', { name: /^خصم إضافي/ }).fill('20');
  await page.getByRole('spinbutton', { name: /^نسبة الضريبة/ }).fill('10');
  await page.locator('.two-col-row input[type=checkbox]').check();
  await page.locator('.paid-input input').fill('100');
  await expect(page.locator('.net-value')).toContainText('143');
  const payload = await save(page);
  expect(payload).toMatchObject({ net_amount: 143, total_tax: 13, paid_amount: '100', remaining_amount: 43 });
});
for (const type of ['sale_return', 'installment_sale'])
  test(`${type} keeps its existing context`, async ({ page }) => {
    await page.goto(fixture + '?edit=1&type=' + type);
    await expect(rows(page)).toHaveCount(1);
    if (type === 'installment_sale') await expect(page.getByText('خطة التقسيط المقترحة')).toBeVisible();
    await page.locator('.invoice-phone-savebar .v-btn').click();
    await expect.poll(() => page.evaluate(() => window.invoiceQA.saved.length)).toBe(1);
    expect(await page.evaluate(() => window.invoiceQA.saved[0].invoice_type_code)).toBe(type);
  });

test('empty state is compact and save/payment bar responds to viewport height', async ({ page }) => {
  await page.goto(fixture);
  await expect(page.locator('.phone-empty')).toBeVisible();
  expect((await page.locator('.phone-empty').boundingBox()).height).toBeLessThan(150);
  await expect(page.locator('.global-fab-feedback')).toBeHidden();
  await page.setViewportSize({ width: 390, height: 680 });
  await expect(page.locator('.invoice-phone-savebar')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: 'tools/label-templates/.qa-output/invoice-empty-mobile.png', fullPage: true });
});
