import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import { useObservedHeight } from '@/composables/useObservedHeight';

describe('table layout measurement', () => {
  it('uses observer sizes without forcing layout and disconnects on replacement/unmount', async () => {
    const instances = [];
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback) { this.callback = callback; this.observe = vi.fn(); this.disconnect = vi.fn(); instances.push(this); }
    });
    const first = document.createElement('div'), second = document.createElement('div');
    for (const element of [first, second]) {
      Object.defineProperty(element, 'offsetHeight', { get() { throw new Error('Forced synchronous layout'); } });
      Object.defineProperty(element, 'offsetWidth', { get() { throw new Error('Forced synchronous layout'); } });
    }
    const target = ref(first);
    let height;
    let wrapper;
    try {
      wrapper = mount({ setup() { height = useObservedHeight(target, { box: 'border-box' }); return () => null; } });
      await nextTick();
      expect(height.value).toBe(0);
      expect(instances[0].observe).toHaveBeenCalledWith(first, { box: 'border-box' });
      instances[0].callback([{ target: first, borderBoxSize: [{ blockSize: 64 }], contentRect: { height: 60 } }]);
      expect(height.value).toBe(64);
      target.value = second;
      await nextTick();
      expect(instances[0].disconnect).toHaveBeenCalled();
      instances[1].callback([{ target: second, contentRect: { height: 32 } }]);
      expect(height.value).toBe(32);
      wrapper.unmount();
      expect(instances[1].disconnect).toHaveBeenCalled();
    } finally { wrapper?.unmount(); vi.unstubAllGlobals(); }
  });
});
