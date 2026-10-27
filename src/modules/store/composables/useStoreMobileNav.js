import { ref, computed, onMounted, onUnmounted } from 'vue'

const isNavVisible = ref(true)
const isMobileCategoriesOpen = ref(false)
const isMobileFilterOpen = ref(false)
const showAccountSheet = ref(false)
const searchFocused = ref(false)
const keyboardOpen = ref(false)
const overlayOpen = ref(false)
const bottomNavHeight = ref(66)
const purchaseHeight = ref(0)
const anyMenuOpen = computed(() => isMobileCategoriesOpen.value || isMobileFilterOpen.value || showAccountSheet.value)
let users = 0
let frame = 0
let media
let lastY = 0
let direction = 0
let distance = 0
let settleUntil = 0
let cleanup

export function resetStoreMobileNav() {
  isNavVisible.value = true
  isMobileCategoriesOpen.value = false
  isMobileFilterOpen.value = false
  showAccountSheet.value = false
  searchFocused.value = false
  lastY = Math.max(0, window.scrollY)
  distance = direction = 0
  settleUntil = performance.now() + 400
}

function update() {
  frame = 0
  const y = Math.max(0, Math.min(window.scrollY, Math.max(0, document.documentElement.scrollHeight - window.innerHeight)))
  if (!media.matches || y <= 20 || searchFocused.value || anyMenuOpen.value || overlayOpen.value || performance.now() < settleUntil) {
    isNavVisible.value = true
    lastY = y
    distance = direction = 0
    return
  }
  const delta = y - lastY
  lastY = y
  if (!delta) return
  const nextDirection = Math.sign(delta)
  if (nextDirection !== direction) distance = 0
  direction = nextDirection
  distance += Math.abs(delta)
  if (direction > 0 && distance >= 12) isNavVisible.value = false
  if (direction < 0 && distance >= 6) isNavVisible.value = true
}

export function useStoreMobileNav() {
  onMounted(() => {
    if (users++ > 0) return
    media = window.matchMedia('(max-width: 959px)')
    lastY = Math.max(0, window.scrollY)
    const scroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    let listening = false
    let disposed = false
    const resize = () => {
      if (media.matches && !listening) {
        window.addEventListener('scroll', scroll, { passive: true })
        listening = true
      } else if (!media.matches && listening) {
        window.removeEventListener('scroll', scroll)
        listening = false
        if (frame) window.cancelAnimationFrame(frame)
        frame = 0
      }
      const editing = document.activeElement?.matches('input:not([type=checkbox]):not([type=radio]), textarea, [contenteditable=true]')
      keyboardOpen.value = media.matches && (!!editing || (!!window.visualViewport && window.innerHeight - window.visualViewport.height > 150))
      isNavVisible.value = true
      lastY = Math.max(0, window.scrollY)
      distance = direction = 0
    }
    const focus = () => queueMicrotask(() => { if (!disposed) resize() })
    document.addEventListener('focusin', focus)
    document.addEventListener('focusout', focus)
    media.addEventListener('change', resize)
    window.visualViewport?.addEventListener('resize', resize)
    resize()
    cleanup = () => {
      disposed = true
      if (listening) window.removeEventListener('scroll', scroll)
      document.removeEventListener('focusin', focus)
      document.removeEventListener('focusout', focus)
      media.removeEventListener('change', resize)
      window.visualViewport?.removeEventListener('resize', resize)
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      keyboardOpen.value = false
      overlayOpen.value = false
      purchaseHeight.value = 0
      resetStoreMobileNav()
    }
  })
  onUnmounted(() => { if (--users === 0) cleanup?.() })
  const toggleCategoriesDrawer = (value) => {
    const open = typeof value === 'boolean' ? value : !isMobileCategoriesOpen.value
    isMobileFilterOpen.value = false
    showAccountSheet.value = false
    isMobileCategoriesOpen.value = open
  }
  return { isNavVisible, isMobileCategoriesOpen, isMobileFilterOpen, showAccountSheet, searchFocused, keyboardOpen, overlayOpen, bottomNavHeight, purchaseHeight, anyMenuOpen, toggleCategoriesDrawer }
}
