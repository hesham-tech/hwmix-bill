import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useStoreMobileNav, resetStoreMobileNav } from '@/modules/store/composables/useStoreMobileNav'

describe('store mobile navigation', () => {
  let wrappers, state, callbacks, mobile, mediaListener
  const render = () => {
    const wrapper = mount(defineComponent({ setup() { state = useStoreMobileNav(); return () => null } }))
    wrappers.push(wrapper)
    return wrapper
  }
  const scroll = y => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
    window.dispatchEvent(new Event('scroll'))
    const work = callbacks.splice(0)
    work.forEach(fn => fn())
  }
  beforeEach(() => {
    wrappers = []; callbacks = []; mobile = true
    vi.spyOn(window, 'matchMedia').mockImplementation(() => ({ get matches() { return mobile }, addEventListener: vi.fn((_, cb) => { mediaListener = cb }), removeEventListener: vi.fn() }))
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(fn => { callbacks.push(fn); return 1 })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { callbacks = [] })
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5000 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    vi.spyOn(performance, 'now').mockReturnValue(1000)
    render(); resetStoreMobileNav()
    vi.mocked(performance.now).mockReturnValue(2000)
  })
  afterEach(() => { wrappers.forEach(w => w.unmount()); vi.restoreAllMocks() })
  it('accumulates small movements and resets on reversal', () => {
    scroll(21); expect(state.isNavVisible.value).toBe(false)
    scroll(19); expect(state.isNavVisible.value).toBe(true)
    scroll(21); scroll(26); scroll(30); expect(state.isNavVisible.value).toBe(true)
    scroll(33); expect(state.isNavVisible.value).toBe(false)
    scroll(30); expect(state.isNavVisible.value).toBe(false)
    scroll(27); expect(state.isNavVisible.value).toBe(true)
  })
  it('keeps navigation visible at the top, on desktop and during focus', () => {
    scroll(100); expect(state.isNavVisible.value).toBe(false)
    scroll(0); expect(state.isNavVisible.value).toBe(true)
    state.searchFocused.value = true; scroll(100); expect(state.isNavVisible.value).toBe(true)
    state.searchFocused.value = false; mobile = false; mediaListener(); scroll(200)
    expect(state.isNavVisible.value).toBe(true)
  })
  it('shares one scroll listener and cancels queued frames after final unmount', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    render(); render()
    expect(add.mock.calls.filter(([event]) => event === 'scroll')).toHaveLength(0)
    window.dispatchEvent(new Event('scroll'))
    wrappers.pop().unmount(); expect(remove.mock.calls.filter(([event]) => event === 'scroll')).toHaveLength(0)
    wrappers.splice(0).forEach(w => w.unmount())
    expect(remove.mock.calls.filter(([event]) => event === 'scroll')).toHaveLength(1)
    expect(window.cancelAnimationFrame).toHaveBeenCalled()
  })
  it('resets overlays and ignores route-restoration scrolling', () => {
    state.toggleCategoriesDrawer(true); state.isMobileFilterOpen.value = true
    resetStoreMobileNav(); scroll(300)
    expect(state.isMobileCategoriesOpen.value).toBe(false)
    expect(state.isMobileFilterOpen.value).toBe(false)
    expect(state.isNavVisible.value).toBe(true)
    vi.mocked(performance.now).mockReturnValue(3000)
    scroll(312); expect(state.isNavVisible.value).toBe(false)
  })
  it('hides bottom actions while editing and restores them on blur', async () => {
    const input = document.createElement('input'); document.body.append(input)
    input.focus(); await nextTick(); await Promise.resolve()
    expect(state.keyboardOpen.value).toBe(true)
    input.blur(); await nextTick(); await Promise.resolve()
    expect(state.keyboardOpen.value).toBe(false)
    input.remove()
  })
})
