import { describe, it, expect, vi } from 'vitest';
import { canPrefetch, setupRoutePrefetching, preloadInitialRoute } from '@/router/prefetch';

describe('intent based route prefetch', () => {
  it('loads only the explicitly requested route when a session exists', async () => {
    const requested = vi.fn(async () => ({}));
    const other = vi.fn(async () => ({}));
    const router = { resolve: vi.fn(() => ({ matched: [{ components: { default: requested } }] })) };
    const url = { pathname: '/app/customers', search: '?page=2' };
    await preloadInitialRoute(router, url, [{ getItem: () => null }]);
    expect(requested).not.toHaveBeenCalled();
    await preloadInitialRoute(router, url, [{ getItem: () => 'session' }]);
    expect(router.resolve).toHaveBeenCalledWith('/app/customers?page=2');
    expect(requested).toHaveBeenCalledTimes(1);
    expect(other).not.toHaveBeenCalled();
    await preloadInitialRoute(router, { pathname: '/saas/login' }, [{ getItem: () => 'session' }]);
    expect(requested).toHaveBeenCalledTimes(1);
  });
  it('respects slow connections and data saving', () => {
    expect(canPrefetch({ saveData: true, effectiveType: '4g' })).toBe(false);
    for (const effectiveType of ['slow-2g', '2g', '3g']) expect(canPrefetch({ effectiveType })).toBe(false);
    expect(canPrefetch({ effectiveType: '4g' })).toBe(true);
  });

  it('does not load idle routes, warms only the intended link and removes listeners', async () => {
    const selected = vi.fn(async () => ({}));
    const untouched = vi.fn(async () => ({}));
    const router = { currentRoute: { value: { fullPath: '/current' } }, resolve: vi.fn(path => ({ fullPath: path, matched: [{ components: { default: path === '/next' ? selected : untouched } }] })) };
    const cleanup = setupRoutePrefetching(router);
    await Promise.resolve();
    expect(selected).not.toHaveBeenCalled();
    document.body.innerHTML = '<a href="/next"><span>next</span></a>';
    const target = document.querySelector('span');
    target.dispatchEvent(new Event('pointerover', { bubbles: true }));
    target.dispatchEvent(new Event('focusin', { bubbles: true }));
    await Promise.resolve();
    expect(selected).toHaveBeenCalledTimes(1);
    expect(untouched).not.toHaveBeenCalled();
    cleanup();
    document.querySelector('a').href = '/other';
    target.dispatchEvent(new Event('pointerover', { bubbles: true }));
    await Promise.resolve();
    expect(untouched).not.toHaveBeenCalled();
    document.body.innerHTML = '';
  });
});
