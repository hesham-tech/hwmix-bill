// Shared by router and global handlers so one failed import cannot trigger two reloads.
export function claimReleaseRecovery(storage = sessionStorage, release = localStorage.getItem('app_version') || 'unknown') {
  try {
    if (storage.getItem('last-chunk-reload') === release) return false;
    storage.setItem('last-chunk-reload', release);
    return true;
  } catch { return false; }
}
