import { ref, watch, onMounted, onScopeDispose, toValue } from 'vue';

// Read sizes from the browser's completed layout, never synchronously during mount/render.
export function useObservedHeight(target, { initial = 0, box = 'content-box' } = {}) {
  const height = ref(initial);
  const mounted = ref(false);
  let observer;
  onMounted(() => { mounted.value = true; });
  watch(() => {
    if (!mounted.value) return null;
    const value = toValue(target);
    return value?.$el || value;
  }, element => {
    observer?.disconnect();
    if (!element || typeof ResizeObserver === 'undefined') { height.value = initial; return; }
    observer = new ResizeObserver(entries => {
      const entry = entries.find(item => item.target === element);
      if (!entry) return;
      const border = entry.borderBoxSize?.[0] || entry.borderBoxSize;
      height.value = box === 'border-box' && border?.blockSize !== undefined ? border.blockSize : entry.contentRect.height;
    });
    observer.observe(element, { box });
  }, { immediate: true, flush: 'post' });
  onScopeDispose(() => observer?.disconnect());
  return height;
}
