// Warm only the route the user is about to open; never whole modules on timers.
export function canPrefetch(connection = navigator.connection) {
  return !connection?.saveData && !['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
}

// The requested workspace page is critical loading, not speculative page warming.
export function preloadInitialRoute(router, url = location, storage = [sessionStorage, localStorage]) {
  if (!url.pathname.startsWith('/app')) return Promise.resolve();
  try { if (!storage.some(item => item.getItem('token'))) return Promise.resolve(); }
  catch { return Promise.resolve(); }
  const route = router.resolve(url.pathname + (url.search || '') + (url.hash || ''));
  return Promise.all(route.matched.map(record => record.components?.default)
    .filter(component => typeof component === 'function')
    .map(component => Promise.resolve().then(component).catch(() => undefined)));
}

export function setupRoutePrefetching(router) {
  const warmed = new Set();
  const warm = event => {
    if (!canPrefetch()) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.origin !== location.origin || link.target === '_blank') return;
    const route = router.resolve(link.pathname + link.search);
    if (!route.matched.length || route.fullPath === router.currentRoute.value.fullPath) return;
    for (const record of route.matched) {
      const component = record.components?.default;
      if (typeof component !== 'function' || warmed.has(component)) continue;
      warmed.add(component);
      Promise.resolve().then(component).catch(() => warmed.delete(component));
    }
  };
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('focusin', warm);
  return () => {
    document.removeEventListener('pointerover', warm);
    document.removeEventListener('focusin', warm);
  };
}
