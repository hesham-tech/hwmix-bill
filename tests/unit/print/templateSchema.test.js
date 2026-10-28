import { describe, it, expect, beforeEach } from 'vitest';
import {
  createStarterDesign,
  validateDesign,
  validateSheet,
  sheetPlacements,
  elementBounds,
  clone,
  newElement,
} from '@/modules/print/templates-editor/templateSchema';
import { saveLabelSettings, loadLabelSettings } from '@/modules/print/thermal/timiniClient';

describe('company label template geometry', () => {
  it('allows empty and overflowing working drafts only when explicitly requested, never for printing', () => {
    const blank = { ...createStarterDesign(), elements: [] };
    expect(() => validateDesign(blank, { allowEmpty: true })).not.toThrow();
    expect(() => validateDesign(blank)).toThrow();
    const smaller = { ...createStarterDesign(), heightMm: 20 };
    expect(() => validateDesign(smaller, { allowOverflow: true })).not.toThrow();
    expect(() => validateDesign(smaller)).toThrow();
  });
  it('keeps the accepted P2 printable area without scaling the nominal 50 mm paper', () => {
    const design = createStarterDesign();
    expect(design.widthMm).toBe(50);
    expect(() => validateDesign(design, { geometry: { widthDots: 384, dpi: 203 } })).not.toThrow();
    design.elements[0].x = 0;
    design.elements[0].width = 50;
    expect(() => validateDesign(design, { geometry: { widthDots: 384, dpi: 203 } })).toThrow(/المساحة/);
  });
  it('accounts for rotated element bounds and refuses clipping', () => {
    const design = createStarterDesign();
    const e = design.elements[0];
    e.x = 1;
    e.y = 1;
    e.width = 20;
    e.height = 3;
    e.rotation = 90;
    expect(elementBounds(e).top).toBeLessThan(0);
    expect(() => validateDesign(design)).toThrow();
  });
  it('rejects duplicate identifiers, invalid dimensions and unsupported symbols', () => {
    const design = createStarterDesign();
    design.elements.push(clone(design.elements[0]));
    expect(() => validateDesign(design)).toThrow();
    const invalid = createStarterDesign();
    invalid.widthMm = NaN;
    expect(() => validateDesign(invalid)).toThrow();
    const rotated = createStarterDesign();
    rotated.elements.find(e => e.type === 'barcode').rotation = 12;
    expect(() => validateDesign(rotated)).toThrow(/90/);
  });
  it('validates A4 margins and gaps rather than squeezing labels onto the page', () => {
    const design = createStarterDesign();
    expect(() => validateSheet(design)).not.toThrow();
    design.sheet.columns = 5;
    expect(() => validateSheet(design)).toThrow(/A4/);
    design.sheet.columns = 3;
    design.sheet.gapX = -1;
    expect(() => validateSheet(design)).toThrow();
  });
  it('starts at a partially used sheet cell and continues at the next page', () => {
    const design = createStarterDesign();
    const positions = sheetPlacements(design, 3, 12);
    expect(positions[0]).toEqual({ page: 0, x: 114, y: 196 });
    expect(positions[1]).toEqual({ page: 1, x: 10, y: 10 });
    expect(positions[2]).toEqual({ page: 1, x: 62, y: 10 });
  });
  it('rejects invalid start cells and fractional or oversized batches', () => {
    const design = createStarterDesign();
    for (const cell of [0, 13, 1.2]) expect(() => sheetPlacements(design, 2, cell)).toThrow();
    for (const count of [0, 1.5, 101]) expect(() => sheetPlacements(design, count)).toThrow();
  });
  it('supports landscape sheets, four margins and right-to-left cell filling', () => {
    const design = createStarterDesign();
    design.sheet = {
      columns: 5,
      rows: 2,
      marginLeft: 5,
      marginRight: 7,
      marginTop: 5,
      marginBottom: 8,
      gapX: 2,
      gapY: 2,
      orientation: 'landscape',
      direction: 'rtl',
    };
    expect(() => validateSheet(design)).not.toThrow();
    expect(sheetPlacements(design, 1, 1)[0]).toEqual({ page: 0, x: 213, y: 5 });
    design.sheet.orientation = 'portrait';
    expect(() => validateSheet(design)).toThrow();
  });
  it('retains old published sheet defaults without altering their documents', () => {
    const design = createStarterDesign();
    delete design.sheet.marginRight;
    delete design.sheet.marginBottom;
    delete design.sheet.orientation;
    delete design.sheet.direction;
    expect(() => validateSheet(design)).not.toThrow();
    expect(sheetPlacements(design, 1, 1)[0]).toEqual({ page: 0, x: 10, y: 10 });
  });
  it('clones independent template state and gives new elements unique identities', () => {
    const original = createStarterDesign(),
      copy = clone(original);
    copy.elements[0].content = 'different';
    expect(original.elements[0].content).toBe('{{company.name}}');
    expect(newElement('text').id).not.toBe(newElement('text').id);
  });
});

describe('device settings must never become company template storage', () => {
  beforeEach(() => localStorage.clear());
  it('persists device pairing but excludes product values, company and selected template', () => {
    saveLabelSettings({
      token: 'a'.repeat(64),
      destination: 'pdf',
      darkness: 3,
      templateId: 9,
      revisionId: 77,
      companyId: 5,
      prepared: { 'variant.purchase_price': 50 },
      templateDesign: createStarterDesign(),
    });
    const stored = JSON.parse(localStorage.getItem('hwnix.timini.settings.v1'));
    expect(stored.token).toBe('a'.repeat(64));
    expect(Object.keys(stored).sort()).toEqual(['darkness', 'destination', 'token']);
    expect(loadLabelSettings().templateId).toBeUndefined();
  });
  it('ignores old foreign company template data when loading existing local storage', () => {
    localStorage.setItem('hwnix.timini.settings.v1', JSON.stringify({ companyId: 123, templateId: 99, token: 'b'.repeat(64) }));
    expect(loadLabelSettings().companyId).toBeUndefined();
    expect(loadLabelSettings().token).toBe('b'.repeat(64));
  });
});
