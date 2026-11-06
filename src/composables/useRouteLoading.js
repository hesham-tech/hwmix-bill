import { onScopeDispose, ref, shallowRef } from 'vue';

export function useRouteLoading(router) {
  const isLoading = ref(!router.currentRoute.value.matched.length);
  const pendingRoute = shallowRef(null);

  const removeBeforeEach = router.beforeEach(to => {
    pendingRoute.value = to;
    isLoading.value = true;
  });

  const finish = to => {
    // A cancelled older navigation must not hide a newer navigation's loader.
    if (pendingRoute.value && pendingRoute.value !== to) return;
    pendingRoute.value = null;
    isLoading.value = false;
  };

  const removeAfterEach = router.afterEach(to => finish(to));
  const removeOnError = router.onError((_error, to) => finish(to));
  router.isReady().then(() => {
    if (!pendingRoute.value) isLoading.value = false;
  }).catch(() => finish(pendingRoute.value));

  onScopeDispose(() => {
    removeBeforeEach();
    removeAfterEach();
    removeOnError();
  });

  return { isLoading };
}
