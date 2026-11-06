// متجر السلة — يحفظ منتجات السلة في localStorage ويوفر دوال الإضافة والحذف والتحديث
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCartStore = defineStore(
  'cart',
  () => {
    // Load from localStorage initially
    let initialItems = []
    try {
      const savedCart = localStorage.getItem('hwnix_store_cart')
      const parsed = savedCart ? JSON.parse(savedCart) : []
      initialItems = Array.isArray(parsed) ? parsed.filter(i => i && Number.isSafeInteger(Number(i.variantId)) && Number(i.variantId) > 0 && Number.isSafeInteger(Number(i.productId)) && Number(i.productId) > 0 && Number.isFinite(Number(i.quantity)) && Number(i.quantity) >= 1).map(i=>({...i,variantId:Number(i.variantId),productId:Number(i.productId),companyId:Number(i.companyId),quantity:Math.min(9999,Math.trunc(Number(i.quantity)))})) : []
    } catch { /* A corrupt saved cart must not prevent browsing the store. */ }
    const items = ref(initialItems)
    // { variantId, productId, companyId, companyName, companyLogo, productName, variantSku, image, unitPrice, quantity, maxStock }
    const isDrawerOpen = ref(false)

    // Sync to localStorage on every change
    watch(items, (newItems) => {
      try { localStorage.setItem('hwnix_store_cart', JSON.stringify(newItems)) } catch { /* The in-memory cart remains usable. */ }
    }, { deep: true })

    const itemCount = computed(() =>
      items.value.reduce((sum, i) => sum + Number(i.quantity), 0)
    )

    const totalAmount = computed(() =>
      items.value.reduce((sum, i) => sum + Number(i.unitPrice) * Number(i.quantity), 0)
    )

    const groupedByVendor = computed(() => {
      const groups = {}
      for (const item of items.value) {
        if (!groups[item.companyId]) {
          groups[item.companyId] = {
            companyId: item.companyId,
            companyName: item.companyName,
            companyLogo: item.companyLogo,
            items: [],
            subtotal: 0,
          }
        }
        groups[item.companyId].items.push(item)
        groups[item.companyId].subtotal +=
          Number(item.unitPrice) * Number(item.quantity)
      }
      return Object.values(groups)
    })

    const isEmpty = computed(() => items.value.length === 0)

    function addItem({
      variantId,
      productId,
      companyId,
      companyName,
      companyLogo,
      productName,
      variantSku,
      image,
      unitPrice,
      quantity = 1,
      maxStock,
    }) {
      quantity = Math.trunc(Number(quantity))
      variantId = Number(variantId); productId = Number(productId)
      const limit = Math.max(0, Math.trunc(Number(maxStock ?? 9999)))
      if (!Number(variantId) || !Number(productId) || !Number.isFinite(quantity) || quantity <= 0 || limit <= 0) return false
      quantity = Math.min(quantity, limit)
      const existing = items.value.find((i) => i.variantId === variantId)
      if (existing) {
        existing.unitPrice = unitPrice
        existing.maxStock = maxStock
        const newQty = existing.quantity + quantity
        existing.quantity = Math.min(newQty, limit)
      } else {
        items.value.push({
          variantId,
          productId,
          companyId,
          companyName,
          companyLogo,
          productName,
          variantSku,
          image,
          unitPrice,
          quantity,
          maxStock,
        })
      }
      isDrawerOpen.value = true
      return true
    }

    function removeItem(variantId) {
      items.value = items.value.filter((i) => i.variantId !== variantId)
    }

    function updateQuantity(variantId, quantity) {
      quantity = Math.trunc(Number(quantity))
      if (!Number.isFinite(quantity)) return
      const item = items.value.find((i) => i.variantId === variantId)
      if (item) {
        if (quantity <= 0) removeItem(variantId)
        else item.quantity = Math.min(quantity, item.maxStock ?? 9999)
      }
    }

    function clearCart() {
      items.value = []
    }

    function toggleDrawer() {
      isDrawerOpen.value = !isDrawerOpen.value
    }

    // بناء payload للإرسال للـ API
    function buildOrderPayload(addressId, notes = '', paymentMethod = 'cod') {
      return {
        shipping_address_id: addressId,
        payment_method: paymentMethod,
        notes,
        items: items.value.map((i) => ({
          product_id: Number(i.productId),
          variant_id: Number(i.variantId),
          quantity: Number(i.quantity),
        })),
      }
    }

    return {
      items,
      isDrawerOpen,
      itemCount,
      totalAmount,
      groupedByVendor,
      isEmpty,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleDrawer,
      buildOrderPayload,
    }
  },
  {
    // Persist cart in localStorage manually since pinia-plugin-persistedstate is not installed
    persist: false,
  }
)
