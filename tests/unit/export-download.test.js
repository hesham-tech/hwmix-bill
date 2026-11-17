import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/api/axios.config';
import { downloadProductExport } from '@/modules/products/services/exportDownload';

vi.mock('@/api/axios.config', () => ({ default: { get: vi.fn() } }));

describe('authenticated product export downloads', () => {
  let click;
  beforeEach(() => {
    vi.useFakeTimers();
    URL.createObjectURL = vi.fn(() => 'blob:export-fixture');
    URL.revokeObjectURL = vi.fn();
    click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });
  it('uses the shared authenticated API client and downloads the returned CSV Blob', async () => {
    const blob = new Blob(['ID,name\n1,fixture'], { type: 'text/csv' });
    apiClient.get.mockResolvedValue({ data: blob });
    await downloadProductExport(42);
    expect(apiClient.get).toHaveBeenCalledWith('export-import/download/42', {
      responseType: 'blob', handleErrorsLocally: true,
    });
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.instances[0].download).toBe('products_export_42.csv');
    expect(document.querySelector('a[download]')).toBeNull();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:export-fixture');
  });
  it.each([401, 403, 404, 500])('never creates a download on HTTP %s', async status => {
    apiClient.get.mockRejectedValue({ response: { status } });
    await expect(downloadProductExport(42)).rejects.toEqual({ response: { status } });
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
  });
  it.each(['https://other.invalid/file', '../42', 0, null])('rejects untrusted job identifiers: %s', async id => {
    await expect(downloadProductExport(id)).rejects.toThrow();
    expect(apiClient.get).not.toHaveBeenCalled();
  });
  it('does not offer empty files', async () => {
    apiClient.get.mockResolvedValue({ data: new Blob([]) });
    await expect(downloadProductExport(42)).rejects.toThrow('Empty export');
    expect(click).not.toHaveBeenCalled();
  });
});
