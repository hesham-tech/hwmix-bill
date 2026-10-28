import { test, expect } from '@playwright/test';
const fixture = 'http://127.0.0.1:5176/tests/e2e/fixtures/invoice-phone-harness.html';
test.use({ viewport: { width: 390, height: 844 } });
test('create on phone: search, price, discount and save use the existing payload', async ({ page }) => {
  await page.goto(fixture);
  await page.getByRole('button', { name: 'إضافة صنف', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('سماعة');
  await page.locator('.v-list-item').filter({ hasText: 'سماعة لاسلكية' }).click();
  await dialog.getByRole('spinbutton', { name: /^الكمية/ }).fill('2');
  await dialog.getByRole('spinbutton', { name: /^خصم الصنف/ }).fill('10');
  await dialog.getByRole('button', { name: 'إضافة إلى الفاتورة' }).click();
  await expect(page.locator('.phone-item-card')).toHaveCount(1);
  await expect(page.locator('.phone-item-total')).toContainText('290');
  await page.locator('.invoice-phone-savebar').getByRole('button', { name: 'حفظ الفاتورة' }).click();
  await expect.poll(() => page.evaluate(() => window.invoiceQA.saved.length)).toBe(1);
  const payload = await page.evaluate(() => window.invoiceQA.saved[0]);
  expect(payload.items[0]).toMatchObject({ quantity: 2, unit_id: 1, unit_price: 150, discount: 10, total: 290 });
  expect(payload.net_amount).toBe(290);
  expect(payload.paid_amount).toBe(290);
});
test('edit on phone: quantity, stock cap, units and discount remain available', async ({ page }) => {
  await page.goto(fixture + '?edit=1');
  const card = page.locator('.phone-item-card');
  await expect(card).toHaveCount(1);
  await card.getByRole('button', { name: 'زيادة الكمية', exact: true }).click();
  await expect(card.getByRole('spinbutton', { name: /^الكمية/ })).toHaveValue('2');
  await card.getByRole('spinbutton', { name: /^الكمية/ }).press('Enter');
  expect(await page.evaluate(() => window.invoiceQA.saved.length)).toBe(0);
  await card.getByRole('spinbutton', { name: /^الكمية/ }).fill('999');
  await card.getByRole('spinbutton', { name: /^الكمية/ }).blur();
  await expect(card.getByRole('spinbutton', { name: /^الكمية/ })).toHaveValue('21');
  await card.getByRole('button', { name: 'السعر والوحدة والخصم' }).click();
  await card.getByRole('combobox').click();
  await page.getByRole('option', { name: 'علبة' }).click();
  await expect(card.getByRole('spinbutton', { name: /^سعر الوحدة/ })).toHaveValue('750');
  await card.getByRole('spinbutton', { name: /^الكمية/ }).fill('2');
  await card.getByRole('spinbutton', { name: /^خصم الصنف/ }).fill('25');
  await page.locator('.invoice-phone-savebar').getByRole('button', { name: 'حفظ التعديلات' }).click();
  await expect.poll(() => page.evaluate(() => window.invoiceQA.saved.length)).toBe(1);
  const payload = await page.evaluate(() => window.invoiceQA.saved[0]);
  expect(payload.items[0]).toMatchObject({ unit_id: 2, quantity: 2, unit_price: 750, discount: 25, total: 1475 });
});
for (const width of [320, 390, 480]) {
  test(`phone ${width}px: no horizontal overflow and all controls fit`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(fixture + '?edit=1&type=purchase');
    await expect(page.locator('.phone-item-card')).toHaveCount(1);
    await page.getByRole('button', { name: 'السعر والوحدة والخصم' }).click();
    await page.getByRole('button', { name: 'بيانات الفاتورة' }).click();
    await page.getByRole('button', { name: 'الضريبة والخصم والرصيد والملاحظات' }).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
    expect(await page.locator('.phone-quantity input').evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(48);
    await expect(page.getByLabel('خصم الصنف')).toBeVisible();
    await expect(page.locator('.phone-item-details').getByRole('combobox')).toBeVisible();
  });
}
test('desktop retains inline table and save behavior', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(fixture + '?edit=1');
  await expect(page.locator('.invoice-table-container')).toBeVisible();
  await expect(page.locator('.phone-item-card')).toHaveCount(0);
  await expect(page.locator('.invoice-phone-savebar')).toHaveCount(0);
  await page.getByRole('button', { name: 'حفظ الفاتورة' }).click();
  await expect.poll(() => page.evaluate(() => window.invoiceQA.saved.length)).toBe(1);
  expect((await page.evaluate(() => window.invoiceQA.saved[0])).net_amount).toBe(150);
});

test('adding a repeated product merges its quantity', async ({ page }) => {
  await page.goto(fixture + '?edit=1');
  await page.getByRole('button', { name: 'إضافة صنف', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('سماعة');
  await page.locator('.v-list-item').filter({ hasText: 'سماعة لاسلكية' }).click();
  await dialog.getByRole('button', { name: 'إضافة إلى الفاتورة' }).click();
  await expect(page.locator('.phone-item-card')).toHaveCount(1);
  await expect(page.locator('.phone-item-card').getByRole('spinbutton', { name: /^الكمية/ })).toHaveValue('2');
  await expect(page.locator('.phone-item-total')).toContainText('300');
});
test('phone financial options preserve tax, discount and partial payment', async ({ page }) => {
  await page.goto(fixture + '?edit=1');
  await page.getByRole('button', { name: 'الضريبة والخصم والرصيد والملاحظات' }).click();
  await page.getByRole('spinbutton', { name: /^خصم إضافي/ }).fill('20');
  await page.getByRole('spinbutton', { name: /^نسبة الضريبة/ }).fill('10');
  await page.locator('.two-col-row input[type=checkbox]').check();
  await page.locator('.paid-input input').fill('100');
  await expect(page.locator('.net-value')).toContainText('143');
  await expect(page.locator('.remaining-value')).toContainText('43');
  await page.locator('.invoice-phone-savebar').getByRole('button', { name: 'حفظ التعديلات' }).click();
  await expect.poll(() => page.evaluate(() => window.invoiceQA.saved.length)).toBe(1);
  expect(await page.evaluate(() => window.invoiceQA.saved[0])).toMatchObject({ net_amount: 143, total_tax: 13, paid_amount: '100', remaining_amount: 43 });
});
for (const type of ['sale_return', 'installment_sale']) {
  test(`phone ${type} keeps the existing invoice context`, async ({ page }) => {
    await page.goto(fixture + '?edit=1&type=' + type);
    await expect(page.locator('.phone-item-card')).toHaveCount(1);
    if (type === 'installment_sale') await expect(page.getByText('خطة التقسيط المقترحة')).toBeVisible();
    await page.locator('.invoice-phone-savebar .v-btn').click();
    await expect.poll(() => page.evaluate(() => window.invoiceQA.saved.length)).toBe(1);
    expect(await page.evaluate(() => window.invoiceQA.saved[0].invoice_type_code)).toBe(type);
  });
}
