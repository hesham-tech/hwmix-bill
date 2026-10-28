import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeLabels, validateLabelOptions, labelGeometry } from '@/modules/print/thermal/labelData';
import { checkTiMini, submitTiMiniPdf, loadLabelSettings } from '@/modules/print/thermal/timiniClient';

describe('thermal label validation', () => {
  it('uses the selected model and paper dimensions instead of a fixed P2 width', () => {
    const geometry = labelGeometry({ widthDots: 384, dpi: 203, paper: 'label576', paperOptions: [{ value: 'label576', widthDots: 576, dpi: 300 }] });
    expect(geometry.widthDots).toBe(576);
    expect(geometry.dpi).toBe(300);
    expect(() => labelGeometry({ widthDots: -1 })).toThrow();
    expect(() => validateLabelOptions({ heightMm: 60, darkness: 3, paper: 'label576', paperOptions: [{ value: 'label576' }] })).not.toThrow();
  });
  it('preserves barcode leading zeroes, decimal prices, Arabic names and copy counts', () => {
    const labels = normalizeLabels([{ productName: 'منتج عربي', barcode: '001234567890', sku: 'SKU-1', price: '12.75', quantity: 2 }]);
    expect(labels).toHaveLength(2);
    expect(labels[0]).toEqual({ productName: 'منتج عربي', barcode: '001234567890', sku: 'SKU-1', price: 12.75 });
  });
  it('rejects missing/unsupported barcodes instead of inventing a barcode', () => {
    for (const barcode of ['', undefined, 'باركود']) expect(() => normalizeLabels([{ barcode }])).toThrow();
  });
  it('rejects fractional, negative, oversized and empty batches', () => {
    for (const quantity of [-1, 1.5, 101, 'bad', 0]) expect(() => normalizeLabels([{ barcode: '123', quantity }])).toThrow();
    expect(() => normalizeLabels([{ barcode: '123', quantity: 60 }, { barcode: '456', quantity: 60 }])).toThrow();
    expect(normalizeLabels([{ quantity: 0 }, { barcode: '456', quantity: 1 }])).toHaveLength(1);
  });
  it('accepts only supported dimensions and media', () => {
    for (const heightMm of [20, 30, 60]) expect(() => validateLabelOptions({ heightMm, paper: 'tag_384r', darkness: 3 })).not.toThrow();
    expect(() => validateLabelOptions({ heightMm: 25, paper: 'tag_384r', darkness: 3 })).toThrow();
  });
});

describe('local print client', () => {
  beforeEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });
  it('requires a printer to be configured on a newly installed desktop tool', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ service: 'hwnix-timini', version: 1, cliReady: true, configured: false }) }));
    await expect(checkTiMini({ token: 'a'.repeat(64) })).rejects.toThrow('اختر الطابعة');
  });
  it('uses safe defaults when saved settings are corrupt', () => {
    localStorage.setItem('hwnix.timini.settings.v1', '{');
    expect(loadLabelSettings()).toMatchObject({ destination: 'browser', heightMm: 60, token: '' });
  });
  it('does not interpret service health as printer readiness or accept a missing CLI', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ service: 'hwnix-timini', version: 1, cliReady: false }) }));
    await expect(checkTiMini({ token: 'a'.repeat(64) })).rejects.toThrow('TiMini CLI');
  });
  it('reports a failed print job without retrying the POST', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ service: 'hwnix-timini', version: 1, cliReady: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'failed', error: 'disconnected' }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(submitTiMiniPdf('data', 1, { token: 'a'.repeat(64), paper: 'tag_384r', darkness: 3 })).rejects.toThrow('disconnected');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(1);
  });
});
