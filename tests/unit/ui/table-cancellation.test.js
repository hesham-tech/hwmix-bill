import { describe, it, expect, vi } from 'vitest';
import { effectScope } from 'vue';
import { useDataTable } from '@/composables/useDataTable';

vi.mock('vue-router', () => ({ useRouter: () => ({}), useRoute: () => ({ query: {} }) }));

describe('table request lifetime', () => {
  it('aborts previous requests and ignores stale results even if transport ignores abort', async () => {
    const calls = [];
    const scope = effectScope();
    const table = scope.run(() => useDataTable((params, options) => new Promise(resolve => calls.push({ resolve, ...options })), { immediate: false, syncWithUrl: false }));
    const first = table.fetchData();
    const second = table.fetchData();
    expect(calls[0].signal.aborted).toBe(true);
    calls[1].resolve({ data: [{ id: 2 }], meta: { total: 21, last_page: 3 } });
    await second;
    calls[0].resolve({ data: [{ id: 1 }] });
    await first;
    expect(table.items.value).toEqual([{ id: 2 }]);
    expect(table.total.value).toBe(21);
    expect(table.lastPage.value).toBe(3);
    expect(table.loading.value).toBe(false);
    const third = table.fetchData();
    scope.stop();
    expect(calls[2].signal.aborted).toBe(true);
    calls[2].resolve({ data: [{ id: 3 }] });
    await third;
    expect(table.items.value).toEqual([{ id: 2 }]);
  });
});
