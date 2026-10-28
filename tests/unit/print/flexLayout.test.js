import { describe, it, expect } from 'vitest';
import { decimalRound, formatPrice } from '@/modules/print/templates-editor/priceFormat';
import { resolveFlexLayout, overlapIssues } from '@/modules/print/templates-editor/flexLayout';
import { createStarterDesign, newElement } from '@/modules/print/templates-editor/templateSchema';
const fixture = () => {
  const row = {
    ...newElement('row'),
    id: 'r',
    x: 2,
    y: 2,
    width: 46,
    height: 15,
    layout: { paddingMm: 1, gapMm: 2, rowGapMm: 1, direction: 'rtl', mode: 'auto', wrap: false, align: 'center' },
  };
  return {
    ...createStarterDesign(),
    schemaVersion: 2,
    elements: [row, ...['a', 'b'].map((id, order) => ({ ...newElement('text'), id, parentId: 'r', order, width: 15, height: 5 }))],
  };
};
describe('decimal price formatting', () => {
  it('rounds decimal ties away from zero without floating point surprises', () => {
    expect(decimalRound('1.005', 2)).toBe('1.01');
    expect(decimalRound('-1.005', 2)).toBe('-1.01');
    expect(decimalRound('1500.75', 0)).toBe('1501');
    expect(decimalRound('9.9999995', 6)).toBe('10.000000');
    expect(decimalRound('1e-7', 6)).toBe('0.000000');
  });
  it('controls currency, grouping and zeros independently', () => {
    expect(formatPrice('1500.5', { decimals: 2, showCurrency: false, groupThousands: true })).toBe('1,500.50');
    expect(formatPrice('75.00', { decimals: 2, trimZeros: true, showCurrency: true, currencySymbol: 'ج.م', currencyPosition: 'before' })).toBe(
      'ج.م 75'
    );
    expect(() => formatPrice('75', { showCurrency: true })).toThrow(/عملة/);
    expect(() => formatPrice(null, { showCurrency: false })).toThrow(/مفقودة/);
  });
});
describe('flex label rows', () => {
  it('measures actual content then positions RTL without overlap or mutating the saved design', async () => {
    const d = fixture(),
      before = JSON.stringify(d);
    const r = await resolveFlexLayout(d, {}, async e => ({ width: e.id === 'a' ? 19 : 20 }));
    const [a, b] = r.design.elements.slice(1);
    expect(a.x).toBeGreaterThan(b.x);
    expect(b.x + b.width + 2).toBeCloseTo(a.x);
    expect(r.issues).toHaveLength(0);
    expect(JSON.stringify(d)).toBe(before);
    expect(overlapIssues(r.design)).toHaveLength(0);
  });
  it('supports equal and ratio columns', async () => {
    const d = fixture();
    d.elements[0].layout.mode = 'ratio';
    d.elements[1].flexWeight = 1;
    d.elements[2].flexWeight = 3;
    const r = await resolveFlexLayout(d, {}, async () => ({ width: 40 }));
    expect(r.design.elements[2].width / r.design.elements[1].width).toBeCloseTo(3);
  });
  it('wraps whole elements only within available height', async () => {
    const d = fixture();
    d.elements[0].layout.wrap = true;
    d.elements[0].height = 8;
    const r = await resolveFlexLayout(d, {}, async () => ({ width: 30 }));
    expect(r.design.elements[2].y).toBeGreaterThan(r.design.elements[1].y);
    expect(r.issues.some(i => i.elementId === 'b')).toBe(true);
  });
  it('expires deliberate overlap approval after an element changes', () => {
    const d = fixture();
    d.elements = d.elements.slice(1).map(e => ({ ...e, parentId: null, x: 2, y: 2 }));
    const issue = overlapIssues(d)[0];
    d.overlapApprovals = [{ key: issue.key, signature: issue.signature }];
    expect(overlapIssues(d)).toHaveLength(0);
    d.elements[0].width++;
    expect(overlapIssues(d)).toHaveLength(1);
  });
});
