import { createRequestCache } from '@/api/requestCache';
import { createDesignLoader, getSelectedDesign, saveSelectedDesign } from '@/designs/registry';
import { calculateInvoiceFinancials } from '@/modules/invoices/domain/invoiceFinancials';

const config = (params = {}, headers = {}) => ({ method: 'get', url: 'invoice-types', params, headers: { Authorization: 'user-a', 'X-Company-Id': 1, 'X-Branch-Id': 1, ...headers } });
const response = { status: 200, data: { data: [{ id: 1, name: 'Sale' }] } };

describe('frontend reference request cache', () => {
  it('deduplicates simultaneous reads and isolates returned data', async () => {
    const transport = vi.fn(async () => response);
    const { adapter } = createRequestCache(transport);
    const [first, second] = await Promise.all([adapter(config()), adapter(config())]);
    expect(transport).toHaveBeenCalledTimes(1);
    first.data.data[0].name = 'Changed locally';
    expect(second.data.data[0].name).toBe('Sale');
    expect((await adapter(config())).data.data[0].name).toBe('Sale');
  });

  it('marks cached responses so stale auth balances are not synchronized again', async () => {
    const transport = vi.fn(async () => ({ ...response, data: { ...response.data, auth: { user: { id: 1, balance: 10 } } } }));
    const { adapter } = createRequestCache(transport);
    expect((await adapter(config())).config.referenceCacheHit).toBeUndefined();
    expect((await adapter(config())).config.referenceCacheHit).toBe(true);
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('isolates users, companies, branches, languages and query parameters', async () => {
    const transport = vi.fn(async () => response);
    const { adapter } = createRequestCache(transport);
    await adapter(config());
    for (const headers of [{ Authorization: 'user-b' }, { 'X-Company-Id': 2 }, { 'X-Branch-Id': 2 }, { 'Accept-Language': 'en' }]) await adapter(config({}, headers));
    await adapter(config({ search: 'other' }));
    expect(transport).toHaveBeenCalledTimes(6);
  });

  it('expires reference data and invalidates it on writes', async () => {
    let now = 0;
    const transport = vi.fn(async () => response);
    const { adapter } = createRequestCache(transport, { now: () => now, ttl: 100 });
    await adapter(config());
    now = 101;
    await adapter(config());
    await adapter({ ...config(), method: 'put' });
    await adapter(config());
    expect(transport).toHaveBeenCalledTimes(4);
  });

  it('does not cache balances or share requests with independent cancellation', async () => {
    const transport = vi.fn(async () => response);
    const { adapter } = createRequestCache(transport);
    await adapter({ ...config(), url: 'cash-boxes' });
    await adapter({ ...config(), url: 'cash-boxes' });
    await Promise.all([adapter({ ...config(), signal: new AbortController().signal }), adapter({ ...config(), signal: new AbortController().signal })]);
    expect(transport).toHaveBeenCalledTimes(4);
  });

  it('does not repopulate stale cache when a read completes after invalidation', async () => {
    let finish;
    const transport = vi.fn(() => new Promise(resolve => { finish = resolve; }));
    const { adapter, clear } = createRequestCache(transport);
    const first = adapter(config());
    await Promise.resolve();
    clear();
    finish(response);
    await first;
    const second = adapter(config());
    await Promise.resolve();
    finish(response);
    await second;
    expect(transport).toHaveBeenCalledTimes(2);
  });
});

describe('independent design loading', () => {
  it('loads only the selected design and shares its loading promise', async () => {
    const classic = vi.fn(async () => ({ id: 'classic' }));
    const other = vi.fn(async () => ({ id: 'other' }));
    const load = createDesignLoader({ classic: { load: classic }, other: { load: other } });
    await Promise.all([load('other'), load('other')]);
    expect(other).toHaveBeenCalledTimes(1);
    expect(classic).not.toHaveBeenCalled();
    await load('invalid');
    expect(classic).toHaveBeenCalledTimes(1);
  });

  it('keeps preferences per user and company and rejects arbitrary identifiers', () => {
    localStorage.clear();
    saveSelectedDesign('classic', { id: 1, active_company_id: 2 });
    expect(localStorage.getItem('hwnix:design:1:2')).toBe('classic');
    expect(localStorage.getItem('hwnix:design:1:3')).toBeNull();
    localStorage.setItem('hwnix:design:1:2', '../arbitrary-script');
    expect(getSelectedDesign({ id: 1, active_company_id: 2 })).toBe('classic');
    expect(() => saveSelectedDesign('../arbitrary-script', { id: 1 })).toThrow('Unknown design');
  });
});

describe('invoice domain shared across designs', () => {
  it('preserves discounts, tax, customer balance and payments', () => {
    const result = calculateInvoiceFinancials({ items: [{ quantity: 2, unit_price: 100, discount: 10, profit_margin: 20 }], header_discount: 10, tax_inclusive: true, tax_rate: 10, include_previous_balance: true, paid_amount: 50 }, 'sale', { receivable_balance: -30 });
    expect(result).toMatchObject({ gross_amount: 200, taxable_amount: 180, total_tax: 18, net_amount: 198, total_balance: 228, remaining_amount: 178, total_profit: 40 });
  });
});
