import { describe, it, expect } from 'vitest';
import { claimReleaseRecovery } from '@/utils/releaseRecovery';

describe('release recovery', () => {
  it('shares one recovery attempt across handlers and allows the next release', () => {
    const values = new Map();
    const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
    expect(claimReleaseRecovery(storage, '1')).toBe(true);
    expect(claimReleaseRecovery(storage, '1')).toBe(false);
    expect(claimReleaseRecovery(storage, '2')).toBe(true);
    expect(claimReleaseRecovery(storage, '2')).toBe(false);
  });
  it('does not reload repeatedly when storage is blocked', () => {
    expect(claimReleaseRecovery({ getItem() { throw new Error('blocked'); } }, '1')).toBe(false);
  });
});
