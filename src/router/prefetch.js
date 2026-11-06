// Warm only the route the user is about to open; never whole modules on timers.
export function canPrefetch(connection = navigator.connection) {
  return !connection?.saveData && !['slow-2g', '2g', '3g'].includes(connection?.effectiveType);
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
