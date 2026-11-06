import { effectScope, nextTick } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { useRouteLoading } from '@/composables/useRouteLoading';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

async function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/first', '/second', '/blocked', '/broken', '/redirect'].map(path => ({ path, component: { render: () => null } })),
  });
  await router.push('/');
  const scope = effectScope();
  const loading = scope.run(() => useRouteLoading(router));
  await nextTick();
  return { router, scope, ...loading };
}

describe('route loading feedback', () => {
  it('stays visible while a navigation guard waits and clears on success', async () => {
    const { router, scope, isLoading } = await setup();
    const gate = deferred();
    router.beforeResolve(() => gate.promise);
    const navigation = router.push('/first');
    await vi.waitFor(() => expect(isLoading.value).toBe(true));
    gate.resolve();
    await navigation;
    expect(isLoading.value).toBe(false);
    scope.stop();
  });

  it('does not let a cancelled older navigation hide a newer loader', async () => {
    const { router, scope, isLoading } = await setup();
    const first = deferred();
    const second = deferred();
    router.beforeResolve(to => to.path === '/first' ? first.promise : second.promise);
    const firstNavigation = router.push('/first');
    await vi.waitFor(() => expect(isLoading.value).toBe(true));
    const secondNavigation = router.push('/second');
    await nextTick();
    first.resolve();
    await firstNavigation;
    expect(isLoading.value).toBe(true);
    second.resolve();
    await secondNavigation;
    expect(isLoading.value).toBe(false);
    scope.stop();
  });

  it('clears after an aborted navigation, redirect, or error', async () => {
    const { router, scope, isLoading } = await setup();
    router.beforeResolve(to => {
      if (to.path === '/blocked') return false;
      if (to.path === '/broken') throw new Error('Route failed');
      if (to.path === '/redirect') return '/second';
    });
    await router.push('/blocked');
    expect(isLoading.value).toBe(false);
    await router.push('/redirect');
    expect(router.currentRoute.value.path).toBe('/second');
    expect(isLoading.value).toBe(false);
    await expect(router.push('/broken')).rejects.toThrow('Route failed');
    expect(isLoading.value).toBe(false);
    scope.stop();
  });

  it('removes navigation listeners when its scope is disposed', async () => {
    const { router, scope, isLoading } = await setup();
    scope.stop();
    await router.push('/first');
    expect(isLoading.value).toBe(false);
  });
});
