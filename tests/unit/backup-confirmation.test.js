import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/api/axios.config';
import backupService from '@/api/services/backup.service';

vi.mock('@/stores/user', () => ({ useUserStore: () => ({ loadingApi: false }) }));

describe('backup password confirmation contract', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    URL.createObjectURL = vi.fn(() => 'blob:synthetic-backup');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });
  afterEach(() => { vi.runOnlyPendingTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.clearAllMocks(); });

  it('confirms the password first and sends the result only in a download header', async () => {
    apiClient.post.mockResolvedValue({ data: { data: { confirmation_token: 'fixture-confirmation' } } });
    apiClient.get.mockResolvedValue({ data: new Blob(['synthetic-archive']) });
    await backupService.download(7, 'fixture-password');
    expect(apiClient.post).toHaveBeenCalledWith('backups/confirm-password', { backup_id: 7, action: 'download', password: 'fixture-password' }, { handleErrorsLocally: true });
    expect(apiClient.get).toHaveBeenCalledWith('backups/7/download', { responseType: 'blob', headers: { 'X-Backup-Confirmation-Token': 'fixture-confirmation' }, handleErrorsLocally: true });
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download]')).toBeNull();
    vi.advanceTimersByTime(60_000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:synthetic-backup');
  });

  it.each([401, 403, 422, 429])('never requests an archive when confirmation fails with %s', async status => {
    const failure = { response: { status } };
    apiClient.post.mockRejectedValue(failure);
    await expect(backupService.download(7, 'wrong')).rejects.toBe(failure);
    expect(apiClient.get).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('keeps the separate restore secret and binds confirmation to restore', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { data: { confirmation_token: 'fixture-restore-confirmation' } } })
      .mockResolvedValueOnce({ data: { status: true, data: null } });
    await backupService.restore(7, 'fixture-secondary', 'fixture-password');
    expect(apiClient.post).toHaveBeenNthCalledWith(1, 'backups/confirm-password', { backup_id: 7, action: 'restore', password: 'fixture-password' }, { handleErrorsLocally: true });
    expect(apiClient.post).toHaveBeenNthCalledWith(2, 'backups/7/restore', { token: 'fixture-secondary' }, { headers: { 'X-Backup-Confirmation-Token': 'fixture-restore-confirmation' }, handleErrorsLocally: true });
  });
});
